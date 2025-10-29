import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://efrat-landing.vercel.app/sitemap.xml',
    host: 'https://efrat-landing.vercel.app',
  };
}