# Running Labs

This runbook provides a quick command reference. Detailed steps are in each
lab's README.

## Global Prerequisites
- Podman (recommended on Linux) or Docker
- Node.js 18+ and npm
- `psql` client (for PostgreSQL labs)
- Optional: `kubectl` + `kind` or `minikube` (for Kubernetes lab)

## Container Runtime Choice (Linux)
- Preferred runtime for this repo: **Podman**.
- Compose command:
  - Preferred: `podman compose ...`
  - Alternative: `podman-compose ...` (if your distro provides that tool)
  - Existing docs may show `docker-compose ...`; treat those as equivalent.
- Why this preference:
  - Rootless containers by default
  - No central daemon requirement
  - Better Linux + SELinux ergonomics for local development

## Lab Command Reference

### `nginx-cache-lab`
- `podman compose up --build` (or `docker-compose up --build`)
- Test:
  - `curl -i http://localhost:8080/api/data`
  - `curl -i http://localhost:8080/api/data`
  - `curl -i http://localhost:8080/api/nocache`

### `distributed-cb-lab`
- `podman compose up --build` (or `docker-compose up --build`)
- Test:
  - `curl -i http://localhost:3001/api/feed`
  - `curl -X POST http://localhost:4001/admin/crash`
  - `curl -i http://localhost:3001/api/feed`

### `db-replication-lab`
- `podman compose up -d` (or `docker-compose up -d`)
- Check:
  - Primary: `psql -h localhost -p 5432 -U admin -d app_db`
  - Replica: `psql -h localhost -p 5433 -U admin -d app_db`

### `logical-replication-lab`
- `podman compose up -d` (or `docker-compose up -d`)
- Manual replication setup via SQL (`PUBLICATION`/`SUBSCRIPTION`) in README.

### `kafka`
- Requires Kafka broker on `localhost:9092`
- Run:
  - `npm install`
  - `node consumer.js billing-service`
  - `node producer.js`

### `queue`
- Requires RabbitMQ on `localhost` (AMQP 5672)
- Run:
  - `npm install`
  - `node consumer.js`
  - `node producer.js`

### `redis-monitor`
- Requires Redis on `127.0.0.1:6379`
- Run:
  - `npm install`
  - `npm run server`
  - `npm run producer`
  - Optional logger: `npm run logger`

### `kube`
- Build image, then deploy manifests:
  - `podman build -t localhost/test-cube:v1 .` (or `docker build ...`)
  - `kubectl apply -f deployment.yaml`
  - `kubectl apply -f service.yaml`

## Cleanup Reference
- Compose labs: `podman compose down` (or `docker-compose down`)
- Kubernetes lab: `kubectl delete -f service.yaml && kubectl delete -f deployment.yaml`

## Validation Snapshot (2026-03-27)
- `docker-compose config` succeeded for:
  - `nginx-cache-lab`
  - `distributed-cb-lab`
  - `db-replication-lab`
  - `logical-replication-lab`
- Node syntax checks (`node --check`) succeeded for JS files in all labs.
- Runtime smoke checks without local infra showed expected connection failures:
  - `kafka/producer.js` -> refused `localhost:9092`
  - `queue/producer.js` -> refused `localhost:5672`
  - `redis-monitor/server.js` and `producer.js` -> refused `127.0.0.1:6379`
- Kubernetes manifest dry-run requires an active cluster API server.
