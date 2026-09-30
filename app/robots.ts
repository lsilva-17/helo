import type {MetadataRoute} from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/'],
    },
    sitemap: 'https://draheloisaveiga.vercel.app/sitemap.xml',
    host: 'https://draheloisaveiga.vercel.app',
  };
}
