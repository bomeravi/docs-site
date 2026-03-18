# Argo CD

This folder contains Argo CD resources for GitOps deployment.

## Branch Model

- `jenkins` branch: Jenkins builds/pushes image and runs `kubectl apply` directly.
- `argocd` branch: Argo CD watches Git and syncs `k8s/kubernetes` automatically.

## Apply Argo Application

```bash
kubectl apply -f k8s/argocd/application.yaml
```

## Important

- Update `repoURL` in `application.yaml` if your Git repository URL is different.
- `targetRevision` is set to `argocd` branch by design.
