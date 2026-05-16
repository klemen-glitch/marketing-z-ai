// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.marketingzai.eu',
  integrations: [
    sitemap({
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: new Date(),
      customPages: [
        'https://www.marketingzai.eu/',
        'https://www.marketingzai.eu/privacy-policy/',
        'https://www.marketingzai.eu/terms-of-service/',
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
