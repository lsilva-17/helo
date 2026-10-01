import type {MetadataRoute} from 'next';
import {servicePageFallbacks} from '@/app/lib/servicePages';
import {SITE_URL} from '@/app/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  return [
    {
      url: base + '/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...Object.keys(servicePageFallbacks).map((slug) => ({
      url: base + '/' + slug,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: slug === 'dentista-santana' ? 0.8 : 0.9,
    })),
  ];
}
