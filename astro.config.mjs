// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { pricingPublished } from './src/data/payment.ts';

// /pricing/ is registered only once prices are approved. The page source lives
// in src/routes/pricing.astro; until then the build emits no /pricing/ at all.
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
