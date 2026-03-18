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

## Pull Docs

pull updated docs
```bash
git submodule update --remote --merge
```

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

## Jenkins + Kubernetes + Argo CD Deployment

This repository now includes:

- `Jenkinsfile` for CI/CD
- `k8s/kubernetes/` for direct `kubectl` deployment
- `k8s/argocd/` for GitOps deployment via Argo CD

### Docker Hub Image

Always push and deploy the same tag:

```bash
docker push bomeravi/docs:latest
```

### Jenkins Direct Deploy Flow

The `Jenkinsfile` does:

1. Pull repository (`checkout scm`)
2. Build docs
3. Build Docker image `bomeravi/docs:latest`
4. Push image to Docker Hub
5. Deploy manifests from `k8s/kubernetes`
6. Restart rollout so `latest` is pulled

Ingress host is configured as:

- `https://docs.digi-kube.sajiloapps.com`

TLS is handled using cert-manager with `ClusterIssuer` (`letsencrypt-prod`).

### Branch Strategy

Use two branches:

- `jenkins`: Jenkins builds/pushes and runs `kubectl apply` directly
- `argocd`: Argo CD watches this branch and syncs `k8s/kubernetes`

Create them:

```bash
git checkout master
git checkout -b jenkins
git checkout master
git checkout -b argocd
```
