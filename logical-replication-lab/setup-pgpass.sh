#!/bin/bash
set -e

# Create subscriber-side pgpass file for non-interactive auth to publisher.
# Format: hostname:port:database:username:password
echo "publisher:5432:*:admin:${PUBLISHER_PASSWORD}" > /tmp/.pgpass

# Gotcha: PostgreSQL ignores pgpass if file permissions are too open.
chmod 0600 /tmp/.pgpass
chown postgres:postgres /tmp/.pgpass

echo "Created /tmp/.pgpass for logical replication bootstrap."
