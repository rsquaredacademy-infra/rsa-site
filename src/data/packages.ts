// R packages and Shiny apps for the Open source page. Hex stickers are in public/images/hex/.

export interface RPackage {
  name: string;
  out: string;
  desc: string;
  inside: string[];
  docs: string;
  cran: string;
  gh: string;
  hex: string;
}

export interface PackageGroup {
  title: string;
  pkgs: RPackage[];
}

export interface ShinyApp {
  what: string;
  fn: string;
}

export interface ConsoleLine {
  input: string;
}

function pk(name: string, out: string, desc: string, inside: string[] = []): RPackage {
  return {
    name,
    out,
    desc,
    inside,
    docs: `https://${name}.rsquaredacademy.com/`,
    gh: `https://github.com/rsquaredacademy/${name}`,
    cran: `https://cran.r-project.org/package=${name}`,
    hex: `/images/hex/hex-${name}.webp`,
  };
}

export const packageGroups: PackageGroup[] = [
  {
    title: 'Regression and modelling',
    pkgs: [
      pk('olsrr', 'Tools for building linear regression models.', 'Diagnostics, variable selection and influence measures for a fitted lm model.',
        ['Comprehensive Regression Output', 'Variable Selection Procedures', 'Heteroskedasticity Tests', 'Collinearity Diagnostics', 'Model Fit Assessment', 'Measures of Influence', 'Residual Diagnostics']),
      pk('blorr', 'Tools for building binary logistic regression models.', 'Model fit, validation and collinearity for a fitted glm with a binary outcome.',
        ['Bivariate Analysis', 'Model Fit Statistics', 'Model Validation', 'Variable Selection', 'Residual Diagnostics', 'Collinearity Diagnostics', 'Visualization']),
    ],
  },
  {
    title: 'Statistics',
    pkgs: [
      pk('descriptr', 'Tools for generating descriptive and summary statistics.', 'A quick way to screen a data frame before you model it.',
        ['Data Screening', 'Summary Statistics', 'Frequency Tables', 'Cross Tables', 'Data Visualization']),
      pk('inferr', 'Tools for inferential statistics.', 'Hypothesis tests with plain R syntax, with no formulas to memorise.',
        ['Binomial Test', 'Test of Proportion', 't Test', 'Chi Square Test', 'Levene’s Test', 'Test of Variance', 'McNemar Test', 'Cochran Q Test', 'Runs Test']),
      pk('vistributions', 'Tools for visualizing probability distributions.', 'Plot the binomial, chi square, normal, F and t distributions.',
        ['Binomial Distribution', 'Chi Square Distribution', 'Normal Distribution', 'F Distribution', 't Distribution', 'Includes a Shiny app']),
      pk('rbin', 'Tools for binning data.', 'Turn continuous variables into factors, and create dummy variables from them.',
        ['Manual Binning', 'Quantile Binning', 'Winsorized Binning', 'Equal Length Binning', 'Equal Width Binning', 'Factor Binning', 'Generate Dummy Variables', 'Includes RStudio add-ins']),
    ],
  },
  {
    title: 'Analytics',
    pkgs: [
      pk('rfm', 'Tools for RFM analysis.', 'Score and segment customers from transaction-level data.',
        ['Generate RFM Scores', 'Handles Transaction or Customer Level Data', 'Visualization Tools', 'Segment Customers', 'Includes a Shiny app']),
      pk('xplorerr', 'Tools for interactive data analysis.', 'Descriptive, inferential and visual analysis behind a Shiny interface.',
        ['Descriptive Statistics', 'Inferential Statistics', 'Visualize Probability Distributions', 'Data Visualization', 'RFM Analysis', 'Linear Regression', 'Logistic Regression']),
    ],
  },
  {
    title: 'Utilities',
    pkgs: [
      pk('yahoofinancer', 'Fetch data from the Yahoo Finance API.', 'Historical and near real-time data on stocks, indices and currencies.',
        ['Historical Prices', 'Real-time Quotes', 'Financial Statements', 'Valuation Metrics', 'Currency Conversion', 'Market Indices', 'Market Summary', 'Trending Tickers', 'Multi-ticker Queries']),
      pk('standby', 'Alerts, notifications and loading screens in Shiny.', 'Add alerts, notifications, modals, info tips and loading screens to Shiny apps.',
        ['Loading Screens for Shiny Outputs', 'Spinners and Loaders', 'Alerts and Modals', 'Notifications and Toasts', 'Tooltips', 'Preview Alerts and Spinners']),
    ],
  },
];

export const shinyApps: ShinyApp[] = [
  { what: 'Descriptive statistics', fn: 'xplorerr::app_descriptive()' },
  { what: 'Probability distributions', fn: 'xplorerr::app_vistributions()' },
  { what: 'Hypothesis testing', fn: 'xplorerr::app_inference()' },
  { what: 'Linear regression', fn: 'xplorerr::app_linear_regression()' },
  { what: 'Logistic regression', fn: 'xplorerr::app_logistic_regression()' },
  { what: 'RFM analysis', fn: 'xplorerr::app_rfm_analysis()' },
  { what: 'Data visualizer', fn: 'xplorerr::app_visualizer()' },
];

export const appCode: ConsoleLine[] = [
  { input: 'install.packages("xplorerr")' },
  { input: 'xplorerr::app_linear_regression()' },
];
