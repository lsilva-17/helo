import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { createClient } from 'next-sanity';

const draftClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f9ampmu2',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-09-01',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

export const { GET } = defineEnableDraftMode({
  client: draftClient,
});
