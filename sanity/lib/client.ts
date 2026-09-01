import { createClient } from 'next-sanity';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://helo-sable-five.vercel.app';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f9ampmu2',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-09-01',
  useCdn: true,
  perspective: 'published',
  stega: {
    studioUrl: `${siteUrl}/studio`,
  },
});
