import {createClient} from '@sanity/client';
import {servicePageDefaults} from '@/app/lib/servicePageCustomization';

const token = process.env.SANITY_API_WRITE_TOKEN;

export const mutationClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f9ampmu2',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-09-01',
  useCdn: false,
  perspective: 'raw',
  token,
});

export function assertMutationToken() {
  if (!token) {
    throw new Error('SANITY_API_WRITE_TOKEN is not configured');
  }
}

function stripSystemFields(document: Record<string, unknown>) {
  const {
    _id: _ignoredId,
    _rev: _ignoredRev,
    _createdAt: _ignoredCreatedAt,
    _updatedAt: _ignoredUpdatedAt,
    ...content
  } = document;
  return content;
}

async function seedServiceDraft(draftId: string, publishedId: string, document?: Record<string, unknown> | null) {
  const defaults = servicePageDefaults(publishedId, document);
  if (!defaults) return;
  // The renderer displays fallback lists for missing or empty collections.
  // Materialize those same lists so indexed text edits target real items.
  const collections = Object.fromEntries(Object.entries(defaults).filter(([field, value]) =>
    Array.isArray(value) && value.length && (!Array.isArray(document?.[field]) || !document[field].length),
  ));
  await mutationClient.patch(draftId).setIfMissing(defaults).set(collections).commit();
}

export async function ensureDraftDocument(documentId: string, documentType: string) {
  assertMutationToken();

  const publishedId = documentId.startsWith('drafts.')
    ? documentId.slice('drafts.'.length)
    : documentId;
  const draftId = `drafts.${publishedId}`;

  const existingDraft = await mutationClient.getDocument(draftId);
  if (existingDraft) {
    if (existingDraft._type !== documentType) throw new Error('Document type does not match');
    if (documentType === 'servicePage') {
      await seedServiceDraft(draftId, publishedId, existingDraft);
    }
    return draftId;
  }

  const published = await mutationClient.getDocument(publishedId);
  if (published && published._type !== documentType) throw new Error('Document type does not match');
  if (documentType === 'servicePage' && !published && !servicePageDefaults(publishedId)) {
    throw new Error('Unknown service page');
  }
  const base = published
    ? stripSystemFields(published as unknown as Record<string, unknown>)
    : (documentType === 'servicePage' ? servicePageDefaults(publishedId) : null) || {_type: documentType};

  const createdDraft = await mutationClient.createIfNotExists({
    ...base,
    _id: draftId,
    _type: documentType,
  });

  if (documentType === 'servicePage') {
    await seedServiceDraft(draftId, publishedId, createdDraft);
  }
  return draftId;
}
