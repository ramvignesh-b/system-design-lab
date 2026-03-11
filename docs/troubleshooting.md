# Troubleshooting

## Common Startup Issues

## Podman / Compose
- Symptom: Docker commands require `sudo` or fail on `/var/run/docker.sock`
  - Cause: Docker daemon socket is root-owned and your user is not configured
    for daemon access.
  - Fix: prefer rootless Podman for this repo to avoid socket permission
    management and `sudo`-based workflows.
- Symptom: port binding errors (`port is already allocated`)
  - Fix: stop conflicting services or update host ports.
- Symptom: container starts then exits
  - Fix: inspect logs with `podman compose logs <service>` (or docker-compose).
- Symptom: bind-mounted files are unreadable in container on SELinux systems
  - Cause: missing SELinux relabel on bind mount.
  - Fix: add `:z` to bind mounts in compose files (already used in this repo).
- Symptom: using `podman compose` fails with command not found
  - Fix: install compose support (`podman compose` plugin or `podman-compose`).

## PostgreSQL Labs
- Symptom: cannot connect with `psql`
  - Fix: ensure compose stack is healthy and use the expected ports.
- Symptom: logical replication subscription creation fails
  - Fix: verify publisher service name, credentials, and publication exists.

## Kafka Lab
- Symptom: producer cannot connect to broker
  - Fix: ensure broker is available on `localhost:9092`.
- Symptom: consumer does not print messages
  - Fix: check topic name and consumer group offsets.

## Queue Lab (RabbitMQ)
- Symptom: consumer receives but queue keeps growing
  - Cause: no acknowledgment in consumer (`channel.ack` is commented).
  - Fix: uncomment `channel.ack(msg)` once ready to model completion.

## Redis Monitor
- Symptom: dashboard loads but no live metrics
  - Fix: ensure Redis is running and `producer.js` is publishing.
- Symptom: logger writes no entries
  - Fix: verify `system-stats` subscription and file permissions.

## Kubernetes Lab
- Symptom: pods not ready
  - Fix: run `kubectl describe pod <pod-name>` and inspect image pull policy.
- Symptom: NodePort not reachable
  - Fix: confirm cluster networking and service NodePort exposure.

## Debugging Checklist
1. Check container/service logs.
2. Verify ports and hostnames.
3. Confirm dependent infra is running.
4. Validate credentials and env values.
5. Re-run minimal happy-path command before failure scenarios.
6. On Linux with SELinux, confirm bind mounts include `:z` where needed.
