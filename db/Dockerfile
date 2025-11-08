# Optimized Dockerfile for a PostgreSQL DB used by the app
# - Based on official small alpine image
# - Do NOT bake secrets here; pass POSTGRES_PASSWORD at runtime (env/secret)
FROM postgres:15-alpine

LABEL org.opencontainers.image.source="https://example.com/StreamlinePay-1" \
    org.opencontainers.image.maintainer="team@streamlinepay.local" \
    org.opencontainers.image.version="1.0"

# Minimal default DB/user; override at runtime if needed
ENV POSTGRES_USER=streamlinepay \
    POSTGRES_DB=streamlinepay \
    PGDATA=/var/lib/postgresql/data/pgdata

# Ensure init directory exists and has correct ownership for the postgres user
RUN mkdir -p /docker-entrypoint-initdb.d && chown -R postgres:postgres /docker-entrypoint-initdb.d

# Copy optional initialization scripts (place SQL/.sh files into db/initdb/ when building)
# If you don't have initialization scripts, the COPY will be a no-op when the directory is empty.
COPY --chown=postgres:postgres initdb/ /docker-entrypoint-initdb.d/

# Document volume and expose port
VOLUME ["/var/lib/postgresql/data"]
EXPOSE 5432

# Lightweight healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" || exit 1

# Use the official image's entrypoint/CMD (runs as postgres user)