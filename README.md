# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

This repo supports both GitLab Pages and GitHub Pages.

### GitLab Pages

- Uses `.gitlab-ci.yml`
- Pipeline job name: `pages`
- It auto-detects:
  - `DOCS_URL` from `CI_PAGES_URL` origin
  - `DOCS_BASE_URL` from `CI_PAGES_URL` path

### GitHub Pages

- Uses `.github/workflows/pages.yml`
- Push to the default branch triggers deployment
- It auto-detects:
  - `DOCS_URL=https://<owner>.github.io`
  - `DOCS_BASE_URL=/` for user/org pages (`<owner>.github.io`)
  - `DOCS_BASE_URL=/repo-name/` for project pages

### Manual build with custom host settings

```bash
DOCS_URL=https://example.com DOCS_BASE_URL=/my-docs/ npm run build
```

### Use `.env` for local config

Create a `.env` file in the project root:

```bash
DOCS_URL=https://example.com
DOCS_BASE_URL=/my-docs/
DOCS_GTAG_ID=G-Z7VBSGGJTH
```

Then run:

```bash
npm run start
```
