# Kubernetes (Jenkins Direct Deploy)

This folder is for direct deployment from Jenkins.

## Files

- `namespace.yaml`: Creates namespace `docs`
- `cluster-issuer.yaml`: cert-manager ClusterIssuer for Let's Encrypt
- `deployment.yaml`: Deploys `bomeravi/docs:latest` with `imagePullPolicy: Always`
- `service.yaml`: ClusterIP service on port 80
- `ingress.yaml`: HTTPS ingress for `docs.digi-kube.sajiloapps.com`

## Prerequisites

- NGINX Ingress Controller installed
- cert-manager installed
- DNS `docs.digi-kube.sajiloapps.com` pointing to ingress load balancer IP

## Apply

```bash
kubectl apply -k k8s/kubernetes
```
