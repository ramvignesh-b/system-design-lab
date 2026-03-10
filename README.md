# System Design and Distributed Systems Labs

Practical, hands-on labs to learn distributed system and system design concepts
by running real services, testing failures, and documenting trade-offs.

## Skills Covered
- Database replication (physical and logical)
- Queueing and stream processing (RabbitMQ, Kafka)
- Caching and proxy behavior (Nginx cache)
- Resiliency patterns (distributed circuit breaker)
- Observability basics (Redis pub/sub metrics stream)
- Kubernetes deployment fundamentals

## Repository Structure
- `db-replication-lab/` - PostgreSQL primary/replica setup
- `logical-replication-lab/` - PostgreSQL publication/subscription flow
- `distributed-cb-lab/` - Redis-backed distributed circuit breaker
- `nginx-cache-lab/` - Nginx reverse proxy cache behavior
- `kafka/` - Kafka producer and consumer-group demo
- `queue/` - RabbitMQ work queue producer/consumer demo
- `redis-monitor/` - Redis pub/sub metrics + WebSocket dashboard
- `kube/` - Kubernetes deployment and NodePort service basics
- `docs/` - Roadmap, architecture, runbook, troubleshooting, experiments

## Start Here (Recommended Order)
1. `nginx-cache-lab`
2. `queue`
3. `kafka`
4. `redis-monitor`
5. `distributed-cb-lab`
6. `db-replication-lab`
7. `logical-replication-lab`
8. `kube`

## Unified Prerequisites
- Podman (recommended on Linux) or Docker
- Node.js 18+ and npm
- `psql` client for PostgreSQL labs
- Optional: local Kubernetes (`kind` or `minikube`) for `kube/`

## Why Podman on Linux (Recommended)
These labs were built and validated with a Podman-first workflow.

- **Rootless by default**: safer local development because containers do not
  require a privileged daemon.
- **No `docker.sock` permission friction**: avoids the common Linux flow of
  running Docker commands with `sudo` or adding your user to the `docker`
  group (which effectively grants root-equivalent daemon access).
- **Daemonless model**: fewer background moving parts and easier process-level
  visibility.
- **Systemd-friendly**: better integration with Linux service tooling.
- **SELinux-aware workflow**: volume relabeling options like `:z` are explicit
  and important for bind mounts.

If you already use Docker, most commands remain conceptually identical.
On Linux, Podman is often a cleaner default for local learning environments.

## Learning Experience (What I Learned Using Podman)
- Running labs without `sudo` removed a lot of day-to-day friction and made
  command behavior more predictable in a normal user shell.
- Rootless containers made local experimentation feel safer when testing
  networking, replication, and message broker setups.
- SELinux mount labeling (`:z`) is not optional on many Linux hosts; adding it
  early avoided confusing permission errors while bind-mounting project files.
- Podman command parity (`podman compose`, `podman build`, `podman ps`) made it
  easy to transfer Docker knowledge while keeping a Linux-native workflow.

## Running Labs
Use per-lab README files for exact steps. A cross-lab runbook is in:
- `docs/running-labs.md`

## Kafka UI Gotcha (Worth Knowing Early)
- RabbitMQ includes a built-in management UI, but Kafka does not expose a UI on
  the broker port by default.
- If you open the Kafka broker port in a browser and send an HTTP `GET`, Kafka
  treats it as an invalid protocol request, so logs can look noisy/confusing
  (yes, this one can be hair-pulling at first).
- Use a dedicated UI container/tool for inspection instead, for example
  [`kafka-ui`](https://github.com/provectus/kafka-ui).

## Documentation Index
- Learning path: `docs/learning-roadmap.md`
- Architecture map: `docs/architecture-overview.md`
- Troubleshooting: `docs/troubleshooting.md`
- Experiments index: `docs/experiments/README.md`

## Reproducibility and Safety Notes
- Demo credentials are intentionally simple and non-production.
- Keep lockfiles committed where present.
- Do not commit generated artifacts (`node_modules`, logs, large tar files).
- Many compose files use bind mounts with `:z`; this is intentional for
  SELinux-enabled systems to avoid permission-denied mount issues.

## Podman Starter Workflow
Use this baseline flow if you are new to Podman:

1. Check tooling:
   - `podman --version`
   - `podman compose version` (or install `podman-compose`)
2. Build and run a lab:
   - `podman compose up --build`
3. Inspect running containers:
   - `podman ps`
   - `podman compose logs -f <service>`
4. Stop and clean:
   - `podman compose down`

For SELinux-enabled hosts, keep `:z` on bind mounts so container processes can
access mounted directories correctly.

## Suggested Contribution Scope
Start with one lab improvement at a time:
- Clarify one architecture section
- Add one failure scenario
- Add one experiment result
