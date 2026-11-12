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
};

export const footerColumns = [
  { title: 'Learn', links: [
    { label: 'Courses', href: '/courses/' },
    { label: 'How we teach', href: '/how-we-teach/' },
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
// `visual` is the course picture from the app home (Courses page cards).
export const courses = [
  { id: 'intro', eyebrow: 'Course 1', title: 'Introduction to R', visual: 1,
    href: 'https://app.rsquaredacademy.com/intro-r',
    short: 'Write your first R code: values, vectors, data frames and functions.',
    long: 'Write your first R code: values, vectors, data frames and functions. No experience needed.' },
  { id: 'dplyr', eyebrow: 'Course 2', title: 'Data Wrangling with dplyr', visual: 2,
    href: 'https://app.rsquaredacademy.com/dplyr',
    short: 'Filter, sort, summarise and join data with the dplyr verbs and the pipe.',
    long: 'Filter, sort, summarise and join data with the dplyr verbs and the pipe.' },
  { id: 'ggplot2', eyebrow: 'Course 3', title: 'Data Viz with ggplot2', visual: 3,
    href: 'https://app.rsquaredacademy.com/ggplot2',
    short: 'Build clear charts layer by layer with ggplot2.',
    long: 'Build clear charts layer by layer with ggplot2, from a first scatter plot to a finished figure.' },
];

// "See how a lesson works": real screenshots of the live lesson player.
// `image` is the file stem under public/images/lessons/ (WebP + PNG fallback).
export const lessonTiles = [
  {
    image: 'lesson-run',
    title: 'Run R in place',
    line: 'Type into the editor and press Run. R runs in the page, with nothing to install.',
    alt: "Illustration: three lines of R code, a Run button and a bar chart appearing below",
  },
  {
    image: 'lesson-practice',
    title: 'Fill the gaps',
    line: 'Every lesson moves from a worked example to code you complete yourself.',
    alt: 'Illustration: a line of ggplot2 code with a highlighted blank and geom_col() filling it, above a bar chart',
  },
  {
    image: 'lesson-feedback',
    title: 'Instant feedback',
    line: 'A correct answer turns green and explains the result in plain words.',
    alt: 'Illustration: R code that computes an average, with a green Correct banner explaining the result',
  },
  {
    image: 'lesson-hints',
    title: 'Hints when stuck',
    line: 'A wrong answer says what to check, and a hint is one click away.',
    alt: 'Illustration: a filter() call with a mistake, a Not yet message and a hint saying to use == to compare',
  },
  {
    image: 'lesson-diagram',
    title: 'Step-through diagrams',
    line: 'Watch each dplyr step change the table, one row group at a time.',
    alt: 'Illustration: a small table grouped by store with group_by(), then summarised into one row per store',
  },
  {
    image: 'lesson-datasets',
    title: 'Datasets beside code',
    line: 'Open both course datasets, with their columns and first rows, beside your code.',
    alt: 'Illustration: a Datasets panel listing four columns and their types, beside a code card',
  },
];

// Paid tracks. One business dataset (ShopVibe) runs through every course.
// `curriculum` is one course per bullet on the pricing and courses cards.
export const paidTracks = [
  {
    id: 'data-analyst-with-r',
    title: 'Data Analyst with R',
    summary: 'Start with R, then work through analyst tasks on a realistic online shop dataset.',
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
      'RFM and customer segmentation',
      'SQL in Python',
      'Market basket analysis',
      'A/B testing',
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
