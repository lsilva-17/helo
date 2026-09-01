import {createClient} from '@sanity/client';

const token = process.env.SANITY_API_WRITE_TOKEN;

export const mutationClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f9ampmu2',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-09-01',
  useCdn: false,
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

export async function ensureDraftDocument(documentId: string, documentType: string) {
  assertMutationToken();

  const publishedId = documentId.startsWith('drafts.')
    ? documentId.slice('drafts.'.length)
    : documentId;
  const draftId = `drafts.${publishedId}`;

  const existingDraft = await mutationClient.getDocument(draftId);
  if (existingDraft) return draftId;

  const published = await mutationClient.getDocument(publishedId);
  const base = published
    ? stripSystemFields(published as unknown as Record<string, unknown>)
    : {_type: documentType};

  await mutationClient.createIfNotExists({
    ...base,
    _id: draftId,
    _type: documentType,
  });

  return draftId;
}
