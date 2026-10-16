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

export const links = {
  github: 'https://github.com/rsquaredacademy',
  youtube: '#',
  linkedin: '#',
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

export type BadgeTone = 'free' | 'soon' | 'neutral';

export const foundationsBadges: { text: string; tone: BadgeTone }[] = [
  { text: 'Free', tone: 'free' },
  { text: 'Launching Dec 2026', tone: 'soon' },
];

// `short` is used on Home and For educators; `long` on Courses.
export const courses = [
  { id: 'intro', eyebrow: 'Course 1', title: 'Introduction to R',
    short: 'Write your first R code: values, vectors, data frames and functions.',
    long: 'Write your first R code: values, vectors, data frames and functions. No experience needed.' },
  { id: 'dplyr', eyebrow: 'Course 2', title: 'Data Wrangling with dplyr',
    short: 'Filter, sort, summarise and join data with the dplyr verbs and the pipe.',
    long: 'Filter, sort, summarise and join data with the dplyr verbs and the pipe.' },
  { id: 'ggplot2', eyebrow: 'Course 3', title: 'Data Visualization with ggplot2',
    short: 'Build clear charts layer by layer with ggplot2.',
    long: 'Build clear charts layer by layer with ggplot2, from a first scatter plot to a finished figure.' },
];
