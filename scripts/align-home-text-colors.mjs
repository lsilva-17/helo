import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const palette = JSON.parse(readFileSync(new URL('../app/lib/brandTextColors.json', import.meta.url), 'utf8'));
const SETTINGS_ID = '143778fa-0f7b-4e2b-9f1b-d34bdce5907d';

// Update only the requested text colors, once per document. Keep unrelated
// content, publication state and subsequent manual color edits intact.
export async function alignHomeTextColors(client) {
  const changed = [];
  for (const id of [SETTINGS_ID, `drafts.${SETTINGS_ID}`]) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const document = await client.getDocument(id);
      if (!document || document.copyColorPaletteVersion >= palette.version) break;
      if (document._type !== 'siteSettings') throw new Error('Unexpected site settings document type');
      const values = Object.fromEntries(Object.entries(palette.colors).map(([key, value]) => [`${key}Color`, value]));
      try {
        await client.patch(id).ifRevisionId(document._rev)
          .set({...values, copyColorPaletteVersion: palette.version}).commit();
        changed.push(id);
        break;
      } catch (error) {
        if (error.statusCode !== 409 || attempt === 2) throw error;
        // A concurrent editor changed the document; re-read its revision.
      }
    }
  }
  return changed;
}

export async function runProductionColorAlignment(env = process.env) {
  // Preview deployments never mutate the shared dataset during a build.
  if (env.VERCEL_ENV !== 'production') return;
  if (!env.SANITY_API_WRITE_TOKEN) throw new Error('SANITY_API_WRITE_TOKEN is required for the approved production color alignment');
  const {createClient} = await import('@sanity/client');
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f9ampmu2',
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-09-01', useCdn: false, perspective: 'raw',
    token: env.SANITY_API_WRITE_TOKEN,
  });
  const changed = await alignHomeTextColors(client);
  console.log(`Home copy palette: ${changed.length ? changed.length + ' document(s) aligned' : 'already aligned'}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runProductionColorAlignment();
}
