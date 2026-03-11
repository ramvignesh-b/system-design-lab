# Learning Roadmap

This roadmap moves from simpler request/response behavior to distributed
coordination and orchestration.

## Phase 1 - Traffic and Caching
1. `nginx-cache-lab`
   - Learn cache MISS/HIT/BYPASS behavior.
   - Measure latency difference between uncached and cached calls.

## Phase 2 - Async Messaging
2. `queue`
   - Understand work queue semantics, durable queues, and ack handling.
3. `kafka`
   - Understand topic logs, offsets, and consumer-group behavior.

## Phase 3 - Observability and Streaming
4. `redis-monitor`
   - Use pub/sub to stream metrics to dashboard and logger subscribers.

## Phase 4 - Resiliency Pattern
5. `distributed-cb-lab`
   - See CLOSED/OPEN/HALF_OPEN circuit breaker transitions.
   - Understand coordination through shared Redis + pub/sub.

## Phase 5 - Data Replication
6. `db-replication-lab`
   - Observe primary/replica topology and read behavior.
7. `logical-replication-lab`
   - Practice publication/subscription and table-level replication.

## Phase 6 - Basic Orchestration
8. `kube`
   - Deploy containerized service to Kubernetes with Service exposure.

## Recommended Learning Loop
For each lab:
1. Run baseline happy path.
2. Trigger one failure mode.
3. Record metrics and behavior.
4. Add one lesson learned to lab README.
