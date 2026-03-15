# Kubernetes Basics Lab

## Overview
This lab deploys a simple Node.js HTTP service to Kubernetes using a Deployment
and NodePort Service.

## Architecture
```mermaid
flowchart LR
  user[Client] --> service[NodePortService:30001]
  service --> pods[DeploymentPods x3]
  pods --> app[NodeApp:3000]
```

## Prerequisites
- Docker
- `kubectl`
- Local Kubernetes cluster (`kind` or `minikube`)

## Quick Start
Build image in this folder:
```bash
docker build -t localhost/test-cube:v1 .
```
Apply manifests:
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## How to Verify
1. Check deployment and pods:
   ```bash
   kubectl get deploy,pods,svc
   ```
2. Access app through service NodePort and expect:
   `Hello from Kubernetes!`

## Failure Scenarios to Try
- Delete one pod and observe automatic replacement.
- Scale deployment and observe service routing.

## Trade-offs and Design Notes
- A `Deployment` is Kubernetes saying: "keep this many copies running no matter
  what." That gives you automatic replacement when a pod dies, but it also
  means you need to learn Kubernetes objects, labels, and selectors.
- A `Service` gives your app a stable network address even when pods come and
  go. Without it, every pod restart would break client routing.
- `NodePort` is great for local learning because it is easy to expose, but it
  is not how most production traffic is handled. In real environments, teams
  usually put an Ingress or load balancer in front.

## Observability
- `kubectl logs <pod-name>`
- `kubectl describe deploy test-cube-cluster-deployment`

## Experiments
- **Hypothesis**: deployment self-heals failed pods.
- **Method**: delete running pod manually and observe replacement.
- **Result**: new pod is scheduled automatically.
- **Interpretation**: desired-state reconciliation improves resilience.

## Jargon Explained
- **Declarative configuration**: you describe the end state you want (for
  example, 3 replicas), and Kubernetes keeps working until reality matches it.
- **Desired state reconciliation**: Kubernetes control loops continuously check
  current state vs target state, then fix drift (like recreating deleted pods).
- **Service discovery**: clients call one stable service name/IP; Kubernetes
  forwards to healthy pods behind it.

## Lessons Learned
- After deleting a pod by hand and watching a new one appear automatically, the
  "desired state" idea finally clicked for me: Kubernetes is always trying to
  repair drift toward the target spec.
- I also saw why a Service matters. Pods are intentionally disposable, so
  clients should not talk to pod IPs directly. The Service gives a stable front
  door while pods rotate behind it.
- The biggest beginner insight here was scope control: start with Deployment +
  Service, prove behavior, then add Ingress/probes/autoscaling later.

## Cleanup
```bash
kubectl delete -f service.yaml
kubectl delete -f deployment.yaml
```

## Further Reading
- Kubernetes deployments, services, and probes
