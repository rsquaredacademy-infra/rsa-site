// Operator, support and pricing facts shared by the payment-readiness pages.
// Keep legal details and price placeholders here, not in the pages.

import { contactEmail } from './site';

export const operator = {
  legalName: 'Aravind S H',
  knownAs: 'Aravind Hebbali',
  city: 'Bengaluru',
  country: 'India',
  // One sentence reused on About, Contact, Privacy and Terms.
  line: 'Rsquared Academy is run by Aravind S H (Aravind Hebbali), an individual based in Bengaluru, India.',
  // City-level only: no street address on the public site (Aravind 2026-11-11).
  // If a payment gateway needs a full business address, use a business/virtual
  // office address, never the home address.
  address: ['Bengaluru, Karnataka, India'],};

export const support = {
  email: contactEmail,
  responseTime: '2 business days',
};

export const offer = {
  accessMonths: 12,
  foundingSeats: 200,
  renewalWindowDays: 30,
  // Prices are not set yet (PRICE-1..3). Fill them in here, including the
  // currency, e.g. 'INR 9,999'. Every [TBD] on /pricing/ comes from this object.
  planPrice: '[TBD]',
  foundingPrice: '[TBD]',
};

// /pricing/ is built but unlisted and noindex until prices are set.
// To list it, set this to true: the footer link appears and the sitemap starts
// including the page. Header nav is unchanged; add it there separately if wanted.
export const pricingPublished = false;
