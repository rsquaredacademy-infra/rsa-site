// eBook list for the Free resources page. Covers are in public/images/covers/.

export interface Ebook {
  track: string;
  title: string;
  course: string;
  cover: string;
  web: string;
  pdf: string;
  epub: string;
  gh: string;
  out: string;
  levels: string[];
  chapters: number;
  pre: string;
  inside: string[];
}

const gh = 'https://github.com/rsquaredacademy-publications/';

export const ebooks: Ebook[] = [
  {
    track: 'Core 01',
    title: 'Introduction to R',
    course: 'Goes with Course 1',
    cover: '/images/covers/intro-r.svg',
    web: 'https://intro-r.rsquaredacademy.com/',
    pdf: 'https://intro-r.rsquaredacademy.com/Introduction-to-R.pdf',
    epub: 'https://intro-r.rsquaredacademy.com/Introduction-to-R.epub',
    gh: gh + 'intro-r',
    out: 'Install R and RStudio, variables, data types, packages and getting help: from zero to running code.',
    levels: ['Beginner'],
    chapters: 13,
    pre: 'No prerequisites. Start here.',
    inside: ['Introduction to R', 'Install R & RStudio', 'Variables in R', 'Data Types in R', 'Getting Help in R', 'Vectors in R', 'Dataframes in R', 'Factors in R', 'Lists in R', 'Install & Update R Packages', 'RStudio Projects & Data Import', 'Your First Visualization', 'Your First Data Wrangling'],
  },
  {
    track: 'Core 02',
    title: 'Data Wrangling with R',
    course: 'Goes with Course 2',
    cover: '/images/covers/wrangle-r.svg',
    web: 'https://wrangle-r.rsquaredacademy.com/',
    pdf: 'https://wrangle-r.rsquaredacademy.com/Data-Wrangling-with-R.pdf',
    epub: 'https://wrangle-r.rsquaredacademy.com/Data-Wrangling-with-R.epub',
    gh: gh + 'wrangle-r',
    out: 'Import flat files and Excel, reshape with tidyr, clean with dplyr, pipes, tibbles, stringr, lubridate and forcats.',
    levels: ['Beginner', 'Intermediate'],
    chapters: 13,
    pre: 'Before this: Core 01, Introduction to R.',
    inside: ['Import Data: Basics', 'Import Data: Advanced', 'Pipe Operator', 'dplyr Basics', 'Joining Tables using dplyr', 'dplyr Helpers', 'tibbles', 'Tidying Data with tidyr', 'Hacking Strings', 'Date & Time: Parsing and Components', 'Date & Time: Arithmetic and Time Zones', 'Categorical Data Fundamentals', 'Factor Manipulation with forcats'],
  },
  {
    track: 'Core 03',
    title: 'Data Visualization with ggplot2',
    course: 'Goes with Course 3',
    cover: '/images/covers/viz-ggplot2.svg',
    web: 'https://viz-ggplot2.rsquaredacademy.com/',
    pdf: 'https://viz-ggplot2.rsquaredacademy.com/Data-Visualization-with-ggplot2.pdf',
    epub: 'https://viz-ggplot2.rsquaredacademy.com/Data-Visualization-with-ggplot2.epub',
    gh: gh + 'viz-ggplot2',
    out: 'The grammar of graphics: geoms, scales, facets, themes, position and stats tuning, and publication polish.',
    levels: ['Intermediate'],
    chapters: 22,
    pre: 'Before this: Core 01 and Core 02.',
    inside: ['Quick Tour', 'Geoms', 'Aesthetics', 'Labels', 'Text Annotations', 'Scatter Plots', 'Line Graphs', 'Bar Plots', 'Box Plots', 'Histograms', 'Modify Axis', 'Modify Legend', 'Legend: Color and Fill', 'Legend: Shape, Size and Alpha', 'Faceting', 'Themes', 'Position & Stats Tuning', 'Scales, Formatting & Color Accessibility', 'Data Reshaping for ggplot2', 'Label Polishing & Wrapping', 'Finale: Publication Polish with patchwork, ggrepel & ggtext', 'Export & Communicate'],
  },
  {
    track: 'Core 04',
    title: 'R, Databases & SQL',
    course: '',
    cover: '/images/covers/rdbsql.svg',
    web: 'https://rdbsql.rsquaredacademy.com/',
    pdf: 'https://rdbsql.rsquaredacademy.com/databases-and-sql.pdf',
    epub: 'https://rdbsql.rsquaredacademy.com/databases-and-sql.epub',
    gh: gh + 'rdbsql',
    out: 'Connect R to databases with DBI, translate dplyr into SQL, and write joins and production-grade queries.',
    levels: ['Intermediate'],
    chapters: 5,
    pre: 'Before this: Core 02. Already write SQL? Take it straight after Core 02.',
    inside: ['DBI', 'dbplyr', 'SQL Basics', 'SQL Advanced', 'JOINs'],
  },
  {
    track: 'Companion A',
    title: 'Command Line Basics for R Users',
    course: '',
    cover: '/images/covers/bash-intro.svg',
    web: 'https://bash-intro.rsquaredacademy.com/',
    pdf: 'https://bash-intro.rsquaredacademy.com/Command-Line-Basics-for-R-Users.pdf',
    epub: 'https://bash-intro.rsquaredacademy.com/Command-Line-Basics-for-R-Users.epub',
    gh: gh + 'bash-intro',
    out: 'Files, permissions, pipes and scripting: enough shell for R users.',
    levels: ['Beginner'],
    chapters: 12,
    pre: 'No prerequisites. Read it alongside Core 01.',
    inside: ['Introduction', 'Navigating File System', 'File Management', 'Input/Output', 'Search & Regular Expression', 'Data Transfer', 'sudo', 'File Compression', 'System Info', 'R & the Shell', 'Pipes & Redirection', 'Conclusion'],
  },
  {
    track: 'Companion B',
    title: 'Data Visualization with Base R',
    course: '',
    cover: '/images/covers/viz-base.svg',
    web: 'https://viz-base.rsquaredacademy.com/',
    pdf: 'https://viz-base.rsquaredacademy.com/Data-Visualization-with-R.pdf',
    epub: 'https://viz-base.rsquaredacademy.com/Data-Visualization-with-R.epub',
    gh: gh + 'viz-base',
    out: 'The base graphics engine: parameters, multi-panel layouts and production export, with no extra packages.',
    levels: ['Intermediate'],
    chapters: 12,
    pre: 'After Core 03, if you need fine control over the plot. Needs R 4.1 or later.',
    inside: ['Why Base R Graphics in 2026?', 'Introduction', 'Title & Axis Labels', 'Scatter Plots', 'Line Graphs', 'Bar Plots', 'Box Plots', 'Histograms', 'Legends', 'Text Annotations', 'Faceting', 'Production Export & Graphical Devices'],
  },
];
