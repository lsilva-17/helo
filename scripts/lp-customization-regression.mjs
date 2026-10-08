import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

// Execute the real renderer, draft helpers and API handlers with an in-memory
// Sanity transport. This suite never reads credentials or writes CMS content.
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const documents = new Map();
let draftEnabled = true;
let pagePayload = {page: null, settings: {heroTitleColor: '#123456', heroTitleSize: 65}};
process.env.SANITY_API_WRITE_TOKEN = 'offline-test-token';
process.env.SANITY_API_READ_TOKEN = 'offline-test-token';
const copy = value => value == null ? value : structuredClone(value);
function setPath(document, key, value) {
  const parts = key.replace(/\[(\d+)\]/g, '.$1').split('.');
  let target = document;
  for (const part of parts.slice(0, -1)) target = target[part];
  assert.ok(target, `Path ${key} must exist in the seeded draft`);
  target[parts.at(-1)] = copy(value);
}
const client = {
  getDocument: async id => copy(documents.get(id)),
  fetch: async (_query, {id}) => copy(documents.get(id)) || null,
  createIfNotExists: async document => {
    if (!documents.has(document._id)) documents.set(document._id, copy(document));
    return copy(documents.get(document._id));
  },
  patch: id => {
    const missing = {}, values = {};
    const patch = {
      setIfMissing: next => {Object.assign(missing, next); return patch;},
      set: next => {Object.assign(values, next); return patch;},
      commit: async () => {
        const document = documents.get(id);
        assert.ok(document, `Draft ${id} must exist`);
        for (const [key, value] of Object.entries(missing)) if (document[key] === undefined) document[key] = copy(value);
        for (const [key, value] of Object.entries(values)) setPath(document, key, value);
        return copy(document);
      },
    };
    return patch;
  },
  assets: {upload: async () => ({_id: 'image-test', url: 'https://cdn.sanity.io/test.webp'})},
};
const stubs = {
  '@sanity/client': {createClient: () => client},
  'next-sanity': {createClient: () => client, stegaClean: value => value},
  'next/headers': {draftMode: async () => ({isEnabled: draftEnabled})},
  'next/navigation': {notFound: () => {throw new Error('Not found');}},
  'next/image': {__esModule: true, default: ({priority, sizes, ...props}) => React.createElement('img', props)},
  '@/sanity/lib/live': {sanityFetch: async () => ({data: pagePayload}), SanityLive: () => null},
  '@/app/components/SiteHeader': {SiteHeader: () => null},
  sanity: {defineType: value => value, defineField: value => value, defineArrayMember: value => value},
};
const modules = new Map();
function load(filename) {
  if (filename.endsWith('.json')) return JSON.parse(readFileSync(filename, 'utf8'));
  if (modules.has(filename)) return modules.get(filename).exports;
  const module = {exports: {}};
  modules.set(filename, module);
  const source = ts.transpileModule(readFileSync(filename, 'utf8'), {compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  }}).outputText;
  const localRequire = id => {
    if (stubs[id]) return stubs[id];
    if (id.startsWith('@/') || id.startsWith('.')) {
      const base = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(path.dirname(filename), id);
      const resolved = [base, `${base}.ts`, `${base}.tsx`].find(existsSync);
      assert.ok(resolved, `Cannot resolve ${id}`);
      return load(resolved);
    }
    return require(id);
  };
  vm.runInThisContext(`(function(require,module,exports){${source}\n})`, {filename})(localRequire, module, module.exports);
  return module.exports;
}
const {NextRequest} = require('next/server');
const fromRoot = filename => load(path.join(root, filename));
const {servicePageFallbacks} = fromRoot('app/lib/servicePages.ts');
const {servicePageDefaults, serviceSectionOrder, isServiceEditableField, serviceStyleFields, serviceLayoutFields} = fromRoot('app/lib/servicePageCustomization.ts');
const {ensureDraftDocument} = fromRoot('sanity/lib/mutations.ts');
const {default: ServicePage} = fromRoot('app/[slug]/page.tsx');
const builder = fromRoot('app/api/visual-builder/route.ts');
const images = fromRoot('app/api/visual-builder/image/route.ts');
const customization = fromRoot('app/api/visual-customization/route.ts');
const {servicePage: schema} = fromRoot('sanity/schemaTypes/servicePage.ts');
const fields = new Set(schema.fields.map(field => field.name));
for (const field of [...serviceStyleFields, ...serviceLayoutFields, 'buttonCustomStyles', 'textBoxWidths']) assert.ok(fields.has(field), `Studio declares ${field}`);
assert.equal(fields.size, schema.fields.length, 'No duplicate schema fields');

for (const slug of Object.keys(servicePageFallbacks)) {
  const html = renderToStaticMarkup(await ServicePage({params: Promise.resolve({slug})}));
  assert.ok(html.includes(`data-vb-page-document-id="service-${slug}"`), `${slug}: stable fallback document ID`);
  assert.ok(html.includes('data-vb-field="title"'), `${slug}: title editing`);
  assert.ok(html.includes('data-vb-field="sections[0].body"'), `${slug}: block text editing`);
  assert.ok(html.includes('data-vb-field="faqs[0].answer"'), `${slug}: FAQ editing`);
  assert.ok(html.includes('data-vb-background-field="heroBackground"'), `${slug}: layout editing`);
  assert.ok(html.includes('color:#123456'), `${slug}: inherited home color`);
  assert.ok(!html.includes('Imagem ilustrativa gerada por IA'), `${slug}: no visible caption`);
  for (const match of html.matchAll(/data-vb-(?:field|font-field|size-field|align-field|width-field|x-field|y-field|padding-field|block-height-field|background-field|height-field|position-x-field|position-y-field)="([^"]+)"/g)) {
    assert.ok(isServiceEditableField(match[1]), `${slug}: API accepts rendered binding ${match[1]}`);
  }
  if (slug === 'dentista-santana') {
    assert.ok(html.includes('data-vb-field="hours[0]"'), 'Location hours editable');
    assert.ok(!html.includes('data-vb-image-field'), 'Location keeps map layout');
  } else assert.ok(html.includes('data-vb-image-field="heroImage"'), `${slug}: image editing`);
}

const patchRequest = (body, origin = 'https://preview.test') => new NextRequest('https://preview.test/api/visual-builder', {
  method: 'PATCH', headers: {'content-type': 'application/json', origin}, body: JSON.stringify(body),
});
const serviceId = 'service-facetas-em-resina';
const edit = (field, value) => builder.PATCH(patchRequest({documentId: serviceId, documentType: 'servicePage', field, value}));
assert.equal((await edit('heroTitleColor', '#abcdef')).status, 200);
let draft = documents.get(`drafts.${serviceId}`);
assert.equal(draft.slug.current, 'facetas-em-resina');
assert.equal(draft.title, servicePageFallbacks['facetas-em-resina'].title);
assert.ok(draft.sections.every(item => item._key), 'Seeded array items have stable keys');
assert.ok(draft.faqs.every(item => item._key), 'Seeded FAQ items have stable keys');
assert.equal(draft.heroTitleColor, '#abcdef');
assert.equal((await edit('sections[0].body', 'Texto revisado')).status, 200);
assert.equal(documents.get(`drafts.${serviceId}`).sections[0].body, 'Texto revisado');
assert.equal((await edit('faqs[0].answer', 'Resposta revisada')).status, 200);
assert.equal((await edit('sectionOrder', ['faq', 'hero', 'content', 'review'])).status, 200);
assert.deepEqual(documents.get(`drafts.${serviceId}`).sectionOrder, ['faq', 'hero', 'content', 'review', 'location']);
assert.equal((await edit('heroWidth', 80)).status, 200);
assert.equal((await edit('seoTitle', 'blocked')).status, 400);
assert.equal((await builder.PATCH(patchRequest({documentId: serviceId, documentType: 'servicePage', field: 'title', value: 'blocked'}, 'https://other.test'))).status, 403);
draftEnabled = false;
assert.equal((await edit('title', 'blocked')).status, 403);
draftEnabled = true;
assert.equal(documents.has(serviceId), false, 'Visual changes never publish automatically');

pagePayload.page = {...copy(documents.get(`drafts.${serviceId}`)), slug: 'facetas-em-resina'};
let html = renderToStaticMarkup(await ServicePage({params: Promise.resolve({slug: 'facetas-em-resina'})}));
assert.ok(html.includes('Texto revisado') && html.includes('Resposta revisada'), 'Content survives a reload');
assert.ok(html.includes('color:#abcdef') && html.includes('width:80%'), 'Per-LP style survives a reload');
const faqOrder = html.match(/class="service-section faq-section"[^>]*style="order:(\d+)"/);
assert.equal(faqOrder?.[1], '0', 'Saved section order rendered');
assert.deepEqual(serviceSectionOrder(undefined, true)[0], 'location');

documents.set('existing-page', {_id: 'existing-page', _type: 'servicePage', slug: {_type: 'slug', current: 'botox'}, title: 'Título existente', heroTitleSize: 45});
await ensureDraftDocument('existing-page', 'servicePage');
assert.equal(documents.get('drafts.existing-page').title, 'Título existente');
assert.equal(documents.get('drafts.existing-page').heroTitleSize, 45);
assert.ok(documents.get('drafts.existing-page').sections.length, 'Partial CMS documents retain fallback text when edited');
documents.set('empty-page', {_id: 'empty-page', _type: 'servicePage', slug: {_type: 'slug', current: 'clareamento-dental'}, sections: [], faqs: []});
await ensureDraftDocument('empty-page', 'servicePage');
assert.ok(documents.get('drafts.empty-page').sections.length, 'Empty arrays materialize the displayed fallback blocks');
assert.ok(documents.get('drafts.empty-page').faqs.length, 'Empty arrays materialize the displayed fallback questions');
const previousPayload = pagePayload;
pagePayload = {heroBackground: '#abcdef', heroTitleColor: '#123456'};
const {SiteStyleBridge} = fromRoot('app/components/SiteStyleBridge.tsx');
const css = renderToStaticMarkup(await SiteStyleBridge());
assert.ok(css.includes(':not([data-vb-style-doc-type="servicePage"])'), 'Global important color and background overrides exclude LP styles');
pagePayload = previousPayload;

await assert.rejects(ensureDraftDocument('unknown-page', 'servicePage'), /Unknown service page/);
await assert.rejects(ensureDraftDocument('existing-page', 'siteSettings'), /does not match/);

const form = new FormData();
form.set('file', new File(['test image bytes'], 'test.webp', {type: 'image/webp'}));
form.set('documentId', serviceId); form.set('documentType', 'servicePage'); form.set('field', 'heroImage');
assert.equal((await images.POST(new NextRequest('https://preview.test/api/visual-builder/image', {method: 'POST', body: form}))).status, 200);
assert.equal(documents.get(`drafts.${serviceId}`).heroImage.asset._ref, 'image-test');
pagePayload.page.heroImageUrl = 'https://cdn.sanity.io/test.webp';
html = renderToStaticMarkup(await ServicePage({params: Promise.resolve({slug: 'facetas-em-resina'})}));
assert.ok(html.includes('https://cdn.sanity.io/test.webp'), 'CMS image takes precedence over local illustration');
assert.ok(!html.includes('/images/procedures/facetas-em-resina.webp'), 'Only the CMS image renders after replacement');

const settingsId = '143778fa-0f7b-4e2b-9f1b-d34bdce5907d';
documents.set(settingsId, {_id: settingsId, _type: 'siteSettings', buttonCustomStyles: [{key: 'global:cta', background: '#ffffff', text: '#000000'}]});
const settingsSnapshot = copy(documents.get(settingsId));
const customRequest = body => new Request('https://preview.test/api/visual-customization', {method: 'PATCH', headers: {'content-type': 'application/json'}, body: JSON.stringify(body)});
assert.equal((await customization.PATCH(customRequest({kind: 'button', key: `${serviceId}:ctaLabel`, background: '#aabbcc', text: '#112233'}))).status, 200);
assert.equal((await customization.PATCH(customRequest({kind: 'textWidth', key: `${serviceId}:intro`, width: 75}))).status, 200);
assert.equal(documents.get(`drafts.${serviceId}`).textBoxWidths[0].width, 75);
assert.ok(documents.get(`drafts.${serviceId}`).buttonCustomStyles[0]._key);
assert.equal(documents.has(`drafts.${settingsId}`), false, 'LP button/width edits do not create a global draft');
assert.deepEqual(documents.get(settingsId), settingsSnapshot, 'Global settings remain unchanged');
const preview = await (await customization.GET(new Request(`https://preview.test/api/visual-customization?documentId=${serviceId}`))).json();
assert.equal(preview.buttonStyles.length, 2, 'Preview combines global styles and selected LP draft');
assert.equal(preview.textWidths[0].width, 75);
draftEnabled = false;
const publicPayload = await (await customization.GET(new Request(`https://preview.test/api/visual-customization?documentId=${serviceId}`))).json();
assert.equal(publicPayload.buttonStyles.length, 1, 'Public visitors cannot see LP draft styles');
assert.equal(publicPayload.textWidths.length, 0);
// Model a standard Sanity publish: copy the complete service document, then remove its draft.
documents.set(serviceId, {...copy(documents.get(`drafts.${serviceId}`)), _id: serviceId});
documents.delete(`drafts.${serviceId}`);
const publishedPayload = await (await customization.GET(new Request(`https://preview.test/api/visual-customization?documentId=${serviceId}`))).json();
assert.equal(publishedPayload.textWidths[0].width, 75, 'Published per-page styles are served to public visitors');
assert.deepEqual(documents.get(settingsId), settingsSnapshot);
console.log('LP customization regression passed: 7 pages, content/style/layout reload, image replacement, draft isolation, public/published customizations and access guards.');
