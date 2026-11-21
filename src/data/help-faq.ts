// Help centre questions. The copy is approved (2026-11-14) and is the single
// source for /help/ and its FAQPage structured data. Keep the wording as is.

export interface HelpQuestion {
  /** Stable anchor: the slug of the question. */
  id: string;
  question: string;
  answer: string;
}

export interface HelpSection {
  id: string;
  title: string;
  questions: HelpQuestion[];
}

/** Slug used for the question anchors, e.g. `can-i-get-a-refund`. */
export function helpId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const q = (question: string, answer: string): HelpQuestion => ({
  id: helpId(question),
  question,
  answer,
});

export const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    questions: [
      q(
        'Do I need an account to learn?',
        'No. The free courses (Introduction to R, Data Wrangling with dplyr, Data Visualization with ggplot2) and the first three lessons (0–2) of every paid course work without an account. You need an account only to buy a pass.',
      ),
      q(
        'Do I need to install anything?',
        'No. You write and run code in your browser. The courses work in any modern browser and work best on a tablet, laptop or desktop.',
      ),
      q(
        'Is my progress saved?',
        'Yes, in your browser on that device. If you clear your browser data or switch devices, it starts fresh. Pass holders get their progress synced to their account across devices.',
      ),
    ],
  },
  {
    id: 'passes-and-prices',
    title: 'Passes and prices',
    questions: [
      q(
        'What can I buy?',
        'A prepaid pass that unlocks all paid courses: 1 month (30 days), 3 months (90 days) or 12 months (365 days). Paid tracks open on 26 January 2027.',
      ),
      q(
        'How much does it cost?',
        'India: ₹299 / ₹629 / ₹1,299. Outside India: US$12 / US$29 / US$79. These are launch prices, offered one time only; prices go up when the full paid track is live, with 30 days\' notice.',
      ),
      q(
        'Does my pass renew automatically?',
        'No. Passes are prepaid and never renew on their own. We email you before your pass ends: 5 and 1 days before for a 1-month pass; 14 and 3 days before for a 3-month pass; 30 and 7 days before for a 12-month pass.',
      ),
      q(
        'Can I buy again before my pass ends?',
        'Yes. The new period starts after your current end date, so no days are lost, up to 24 months of future access.',
      ),
      q(
        'Who can buy a pass?',
        'Accounts and purchases are for people aged 18 or older. Learners under 18 can use the free courses, or a parent can buy a pass in their own name.',
      ),
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    questions: [
      q(
        'How do I pay?',
        'In India, payments go through Razorpay. Outside India, payments are handled by our merchant of record, whose terms also apply and who issues your receipt.',
      ),
      q(
        'My payment failed or I was charged twice.',
        'Write to support@rsquaredacademy.com with the date, amount and the email you used. A duplicate charge is always refunded.',
      ),
    ],
  },
  {
    id: 'refunds',
    title: 'Refunds',
    questions: [
      q(
        'Can I get a refund?',
        "3-month and 12-month passes: a full refund within 14 days of purchase if you have completed less than 20% of the paid lessons. 1-month passes are not refundable, except for a duplicate charge or a fault we can't fix. Write to support@rsquaredacademy.com to ask.",
      ),
    ],
  },
  {
    id: 'help-and-problems',
    title: 'Help and problems',
    questions: [
      q(
        'Something in a lesson looks wrong or confusing.',
        'Use "Report a problem" at the bottom of the lesson page. It takes a minute and tells us exactly which page you were on.',
      ),
      q(
        "The app won't load or R won't start.",
        'Check Service status (status.rsquaredacademy.com). If everything is up, try a recent version of Chrome, Edge, Firefox or Safari, then write to support@ with your browser and device.',
      ),
      q(
        'How do I contact you?',
        'support@rsquaredacademy.com, or +91 63617 50386 (WhatsApp). We usually reply within 2 working days.',
      ),
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    questions: [
      q(
        'What do you collect?',
        'Without an account: lesson progress stored in your browser, and analytics only if you accept cookies. With an account: your email, purchases and (for pass holders) synced progress. Full details: rsquaredacademy.com/privacy/.',
      ),
    ],
  },
];

/** Anchor of the refund question, linked from Pricing. */
export const refundQuestionId = helpId('Can I get a refund?');
