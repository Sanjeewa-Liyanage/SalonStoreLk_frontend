import type { MetadataRoute } from 'next';
//todo: update BASE_URL to your actual domain before deployment
const BASE_URL = 'https://yourdomain.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}