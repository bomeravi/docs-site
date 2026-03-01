import type { Config } from '@docusaurus/types';

function normalizeBaseUrl(value: string): string {
  if (!value || value === '/') return '/';
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

const siteUrl = process.env.DOCS_URL ?? 'https://your-domain.com';
const siteBaseUrl = normalizeBaseUrl(process.env.DOCS_BASE_URL ?? '/');

const config: Config = {
  title: 'My Docs',
  tagline: 'Documentation',
  favicon: 'img/favicon.ico',

  // Use env vars so the same repo can deploy to GitLab Pages and GitHub Pages.
  // Example:
  // DOCS_URL=https://<user>.github.io DOCS_BASE_URL=/repo-name/
  url: siteUrl,
  baseUrl: siteBaseUrl,

  organizationName: 'your-org',
  projectName: 'docs',

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/', // serve docs at root
          sidebarPath: './sidebars.ts',
          includeCurrentVersion: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        // Docs are served at routeBasePath "/", so search must index root routes.
        docsRouteBasePath: '/',
        indexBlog: false,
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Docs',
      items: [
        {
          to: '/',
          label: 'Home',
          position: 'left',
          activeBaseRegex: '^/$',
        },
        {
          to: '/git/git-setup',
          label: 'Git',
          position: 'left',
        },
        {
          to: '/docker/',
          label: 'Docker',
          position: 'left',
        },
        {
          to: '/jenkins/',
          label: 'Jenkins',
          position: 'left',
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Developed with Docusaurus`,
    },

    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  },
};

export default config;
