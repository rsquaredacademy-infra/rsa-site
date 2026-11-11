// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { pricingPublished } from './src/data/payment.ts';

export default defineConfig({
  site: 'https://www.rsquaredacademy.com',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/stay-subscribed/') &&
        (pricingPublished || !page.includes('/pricing/')),
    }),
  ],
});
