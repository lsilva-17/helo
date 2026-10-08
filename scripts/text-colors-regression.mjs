import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import {alignHomeTextColors, runProductionColorAlignment} from './align-home-text-colors.mjs';

const require = createRequire(import.meta.url);
const palette = JSON.parse(readFileSync(new URL('../app/lib/brandTextColors.json', import.meta.url), 'utf8'));
const source = ts.transpileModule(readFileSync(new URL('../app/lib/brandTextColors.ts', import.meta.url), 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, esModuleInterop: true},
}).outputText;
const module = {exports: {}};
vm.runInThisContext(`(function(require,module,exports){${source}\n})`)(id => id.endsWith('.json') ? palette : require(id), module, module.exports);
const {brandTextColor} = module.exports;
for (const key of Object.keys(palette.colors)) {
  assert.equal(brandTextColor(key), '#6F6058', `${key}: LP copy shade is the default`);
  assert.equal(brandTextColor(key, '#123456'), '#123456', 'Custom CMS color takes precedence');
  assert.equal(brandTextColor(key, '#000000'), '#000000', 'Black remains editable after the migration');
  assert.equal(brandTextColor(key, 'invalid'), '#6F6058', 'Invalid colors fall back to the palette');
}
assert.equal(brandTextColor('heroTitle'), undefined, 'Heading hierarchy unchanged');
assert.equal(brandTextColor('buttonStyle'), undefined, 'Button contrast unchanged');

const id = '143778fa-0f7b-4e2b-9f1b-d34bdce5907d';
const documents = new Map([
  [id, {_id: id, _type: 'siteSettings', _rev: '1', heroDescriptionColor: '#000000', heroTitleColor: '#2F2B2A', heroDescription: 'Published copy'}],
  [`drafts.${id}`, {_id: `drafts.${id}`, _type: 'siteSettings', _rev: '1', heroDescriptionColor: '#000000', heroDescription: 'Unpublished copy'}],
  ['service-test', {_id: 'service-test', _type: 'servicePage', heroDescriptionColor: '#987654'}],
]);
let writes = 0;
let conflict = true;
const client = {
  getDocument: async key => structuredClone(documents.get(key)),
  patch: key => {
    let expectedRevision, values;
    const patch = {
      ifRevisionId: revision => {expectedRevision = revision; return patch;},
      set: next => {values = next; return patch;},
      commit: async () => {
        const document = documents.get(key);
        if (conflict) {
          conflict = false;
          document._rev = '2';
          document.navAboutLabel = 'Concurrent edit';
          throw Object.assign(new Error('Concurrent edit'), {statusCode: 409});
        }
        assert.equal(expectedRevision, document._rev);
        Object.assign(document, values);
        writes++;
        return structuredClone(document);
      },
    };
    return patch;
  },
};
const changed = await alignHomeTextColors(client);
assert.deepEqual(changed, [id, `drafts.${id}`]);
assert.equal(writes, 2);
for (const key of Object.keys(palette.colors)) {
  assert.equal(documents.get(id)[`${key}Color`], '#6F6058');
  assert.equal(documents.get(`drafts.${id}`)[`${key}Color`], '#6F6058');
}
assert.equal(documents.get(id).navAboutLabel, 'Concurrent edit', 'Preserves concurrent content changes');
assert.equal(documents.get(id).heroTitleColor, '#2F2B2A', 'Preserves heading colors');
assert.equal(documents.get(id).heroDescription, 'Published copy', 'Does not publish pending copy');
assert.equal(documents.get(`drafts.${id}`).heroDescription, 'Unpublished copy', 'Keeps draft content separate');
assert.equal(documents.get('service-test').heroDescriptionColor, '#987654', 'Preserves LP overrides');
documents.get(id).heroDescriptionColor = '#000000';
assert.deepEqual(await alignHomeTextColors(client), [], 'One-time migration does not reset later CMS customization');
assert.equal(documents.get(id).heroDescriptionColor, '#000000');
assert.equal(writes, 2);
await runProductionColorAlignment({VERCEL_ENV: 'preview'});
await runProductionColorAlignment({VERCEL_ENV: 'development'});
await assert.rejects(runProductionColorAlignment({VERCEL_ENV: 'production'}), /SANITY_API_WRITE_TOKEN/);
console.log('Text color regression passed: shared defaults, editable colors, scoped one-time alignment, draft preservation and conflict retry.');
