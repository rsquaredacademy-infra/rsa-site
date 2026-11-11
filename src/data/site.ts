// Shared site data. Edit here, not in pages.

export const nav = [
  { label: 'Courses', href: '/courses/' },
  { label: 'Free resources', href: '/resources/' },
  { label: 'Open source', href: '/open-source/' },
  { label: 'For educators', href: '/educators/' },
  { label: 'About', href: '/about/' },
];

// Main call to action.
export const cta = { label: 'Get updates', href: '/#signup' };

export const contactEmail = 'support@rsquaredacademy.com';

export const MONTHLY_PRICE_INR = 329;
export const MONTHLY_PRICE_USD = 7; // final price set before launch

export const links = {
  github: 'https://github.com/rsquaredacademy',
  youtube: 'https://www.youtube.com/user/rsquaredin',
  linkedin: 'https://in.linkedin.com/company/rsquared-academy',
  x: 'https://x.com/rsquaredacademy',
  ebooks: 'https://ebooks.rsquaredacademy.com',
  openCourses: 'https://courses.rsquaredacademy.com/',
  openCoursesRepo: 'https://github.com/rsquaredacademy-infra/open-courses',
  blog: 'https://blog.rsquaredacademy.com',
  thinkific: 'https://rsquared-academy.thinkific.com/',
};

export const footerColumns = [
  { title: 'Learn', links: [
    { label: 'Courses', href: '/courses/' },
    { label: 'Free resources', href: '/resources/' },
    { label: 'For educators', href: '/educators/' },
  ] },
  { title: 'Academy', links: [
    { label: 'About', href: '/about/' },
    { label: 'Open source', href: '/open-source/' },
    { label: 'GitHub', href: links.github },
  ] },
  { title: 'Follow', links: [
    { label: 'YouTube', href: links.youtube },
    { label: 'LinkedIn', href: links.linkedin },
    { label: 'X @rsquaredacademy', href: links.x },
  ] },
];

export const footerLegalLinks = [
  { label: 'Contact', href: '/contact/' },
  { label: 'Support', href: '/support/' },
  { label: 'Refund', href: '/refund/' },
  { label: 'Delivery', href: '/delivery/' },
  { label: 'Privacy', href: '/privacy/' },
  { label: 'Terms', href: '/terms/' },
];

export type BadgeTone = 'free' | 'soon' | 'neutral';

export const foundationsBadges: { text: string; tone: BadgeTone }[] = [
  { text: 'Free', tone: 'free' },
  { text: 'Launching soon', tone: 'soon' },
];

// `short` is used on Home and For educators; `long` on Courses.
export const courses = [
  { id: 'intro', eyebrow: 'Course 1', title: 'Introduction to R',
    href: 'https://app.rsquaredacademy.com/intro-r',
    short: 'Write your first R code: values, vectors, data frames and functions.',
    long: 'Write your first R code: values, vectors, data frames and functions. No experience needed.' },
  { id: 'dplyr', eyebrow: 'Course 2', title: 'Data Wrangling with dplyr',
    href: 'https://app.rsquaredacademy.com/dplyr',
    short: 'Filter, sort, summarise and join data with the dplyr verbs and the pipe.',
    long: 'Filter, sort, summarise and join data with the dplyr verbs and the pipe.' },
  { id: 'ggplot2', eyebrow: 'Course 3', title: 'Data Viz with ggplot2',
    href: 'https://app.rsquaredacademy.com/ggplot2',
    short: 'Build clear charts layer by layer with ggplot2.',
    long: 'Build clear charts layer by layer with ggplot2, from a first scatter plot to a finished figure.' },
];

// Paid tracks. One business dataset (ShopVibe) runs through every course.
// `curriculum` is one course per bullet on the pricing and courses cards.
export const paidTracks = [
  {
    id: 'data-analyst-with-r',
    title: 'Data Analyst with R',
    summary: 'Start with R, then work through analyst tasks on a real online shop.',
    curriculum: [
      'RFM and customer segmentation',
      'SQL in R',
      'Market basket analysis',
      'A/B testing',
      'Capstone',
    ],
    note: 'Builds on the free Introduction to R, dplyr and ggplot2 courses.',
  },
  {
    id: 'data-analyst-with-python',
    title: 'Data Analyst with Python',
    summary: 'The same analyst projects as the R track, written in Python.',
    curriculum: [
      'Data cleaning',
      'Customer analysis',
      'A/B testing',
      'Regression',
      'Capstone',
    ],
    note: 'The same modules as the R track, written in Python.',
  },
  {
    id: 'sql-for-data-analysts',
    title: 'SQL for Data Analysts',
    summary: 'Query the ShopVibe database and build the customer analysis analysts use.',
    curriculum: [
      'Querying, joins and aggregation',
      'Text, dates and CASE',
      'Window functions and CTEs',
      'RFM, cohorts and retention',
      'Capstone',
    ],
    note: 'Uses the ShopVibe dataset from the other tracks.',
  },
];
