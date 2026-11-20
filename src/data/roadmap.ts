// Outcomes adapted from course.yml; counts verified on the live course homes.
export const roadmapCourses = [
  { id: 'intro-r', title: 'Intro to R', lessons: 12, answer: 'Report a store’s average revenue and best day, then plot its sales.', alt: 'Production R course preview: average daily customers, best day and quietest day for one café.' },
  { id: 'dplyr', title: 'dplyr', lessons: 15, answer: 'Turn sales and store data into four tables for a Monday board report.', alt: 'Production dplyr report preview: country revenue totals with bars for comparison.' },
  { id: 'ggplot2', title: 'ggplot2', lessons: 13, answer: 'Build a board page with revenue bars, wait boxplots and daily sales lines.', alt: 'Production ggplot2 report preview: country revenue compared with bars on a shared scale.' },
  { id: 'intro-sql', title: 'Intro to SQL', lessons: 13, answer: 'Ask a shop’s database a question and get a table back as the answer.', alt: 'Production SQL report preview: completed orders, revenue and average order value.' },
];
export const plannedTopics = [
  { title: 'Analysis', items: [
    { title: 'Excel', icon: 'table' },
    { title: 'Statistics for Analysts', icon: 'chart' },
    { title: 'Domain tracks', icon: 'layers' },
  ] },
  { title: 'Machine learning', items: [
    { title: 'AI for Data Analysts', icon: 'spark' },
    { title: 'Data Science & Machine Learning', note: 'Exploring', icon: 'nodes' },
  ] },
  { title: 'Engineering & BI', items: [{ title: 'BI dashboards', icon: 'dashboard' }] },
];
export const roadmapFeatures = [
  { image: 'plan', title: 'Plan it', line: 'Break down the question before you write the SQL.', href: 'intro-sql/first-visits', alt: 'The live Plan it card asks about the result row, columns, tables, included rows and order.' },
  { image: 'recap', title: 'What did I just do?', line: 'After a correct answer, see what each SQL clause did.', href: 'intro-sql/first-visits', alt: 'A correct SQL answer reveals a recap explaining SELECT, FROM and LIMIT.' },
  { image: 'stepthrough', title: 'Step-through examples', line: 'Move one step at a time and watch the table change.', href: 'dplyr/filter-predict', alt: 'The production step-through highlights Large sales as filter() keeps the matching rows.' },
  { image: 'hints', title: 'Hints when you need them', line: 'Get a nudge, try again and check your understanding.', href: 'intro-sql/first-visits', alt: 'Two real exercise hints suggest using Plan it and choosing the requested columns.' },
  { image: 'datasets', title: 'Datasets beside your code', line: 'Inspect the columns and first rows without leaving the lesson.', href: 'dplyr/filter-predict', alt: 'The live Datasets panel shows sales.csv, its row and column counts, and a preview of its first rows.' },
  { image: 'run', title: 'Run it in your browser', line: 'Write code and inspect its output, with nothing to install.', href: 'intro-sql/first-visits', alt: 'Real SQL editor, Run button and result table: SELECT 2 + 3 AS total returns 5.' },
];
