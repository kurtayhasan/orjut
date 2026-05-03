import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://orjut.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/'], // Strictly protect private SaaS routes
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
