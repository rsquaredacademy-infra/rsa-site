// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { pricingPublished } from './src/data/payment.ts';

// The public pricing page source lives in src/routes/pricing.astro.
/** @type {import('astro').AstroIntegration} */
const pricingRoute = {
  name: 'pricing-route',
  hooks: {
    'astro:config:setup': ({ injectRoute }) => {
      if (pricingPublished) {
        injectRoute({ pattern: '/pricing', entrypoint: './src/routes/pricing.astro' });
      }
    },
  },
};

export default defineConfig({
  site: 'https://www.rsquaredacademy.com',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    pricingRoute,
    sitemap({
      filter: (page) =>
        !page.includes('/stay-subscribed/') &&
        (pricingPublished || !page.includes('/pricing/')),
    }),
  ],
});
