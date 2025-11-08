# syntax=docker/dockerfile:1
ARG NODE_VERSION=20-alpine

############################################
# Builder: install deps & build the app
############################################
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# system deps for native builds (small and only in builder)
RUN apk add --no-cache python3 make g++ git

# copy lockfiles first for better layer caching
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY yarn.lock ./

# install dependencies: support pnpm, yarn or npm (respects locks)
RUN set -eux; \
    if [ -f pnpm-lock.yaml ]; then \
      npm i -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
      corepack enable && corepack prepare yarn@stable --activate && yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# copy source & build (build step is no-op if no script)
COPY . .
RUN npm run build --if-present

# remove dev deps if npm was used (pnpm/yarn already respect production installs when used)
RUN if [ -f package-lock.json ]; then npm prune --production; fi

############################################
# Runner: small, non-root, runtime image
############################################
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

# copy app from builder
COPY --from=builder /app /app

# create unprivileged user and fix permissions
RUN addgroup -S app && adduser -S -G app app && chown -R app:app /app

USER app
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE ${PORT}

# default CMD — override at runtime if needed
# adjust ENTRYPOINT/CMD to your project's start command if different
CMD ["node", "dist/index.js"]