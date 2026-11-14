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
  address: ['Bengaluru, Karnataka, India'],
};

export const support = {
  email: contactEmail,
  responseTime: '2 business days',
};

// Launch prices, effective 26 January 2027: INR in India, one USD price for every
// country outside India (Aravind, 2026-11-14). Pass lengths are exact.
export const passes = {
  monthly: { name: '1-month pass', exact: '1-month pass (30 days)', months: 1, days: 30, priceINR: 299, priceUSD: 12 },
  quarterly: { name: '3-month pass', exact: '3-month pass (90 days)', months: 3, days: 90, priceINR: 629, priceUSD: 29 },
  annual: { name: '12-month pass', exact: '12-month pass (365 days)', months: 12, days: 365, priceINR: 1299, priceUSD: 79 },
};

export const passChoiceNote = `Choose a ${passes.monthly.exact}, a ${passes.quarterly.exact} or a ${passes.annual.exact}.`;
export const passLengthNote = 'Your first pass starts when payment is confirmed, as shown on your receipt.';
export const stackingNote = 'Buying again before your pass ends adds the new period after the current end date, up to a maximum of 24 months of future access. No days are lost. There is no upgrade credit.';
export const priceRiseNote = "Launch pricing, one time only: you get the courses as they are released, at a lower price. Prices go up when the full paid track is live, with 30 days' notice.";
export const launchPricingNote = `${priceRiseNote} Passes already bought run to their end date; your next purchase is at the then-current price. We announce any price rise by email and on this website.`;
export const reminderNote = 'We email before your pass ends: 5 and 1 days before for a 1-month pass; 14 and 3 days before for a 3-month pass; 30 and 7 days before for a 12-month pass. We also email when your pass expires.';
export const morTermsNote = 'Outside India, payments are processed by our merchant of record, whose terms also apply.';

// International prices: one USD price for every country outside India. Single source: priceUSD above.
export const internationalPrice = (pass: { priceUSD: number }) => `US$${pass.priceUSD}`;

// Controls the pricing route, sitemap inclusion and footer link.
export const pricingPublished = true;
