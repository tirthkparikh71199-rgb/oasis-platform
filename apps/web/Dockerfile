# syntax=docker/dockerfile:1
FROM node:22-slim AS deps
WORKDIR /repo
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN npm i -g corepack@0.32.0 --silent && corepack enable && corepack prepare pnpm@11.21.0 --activate
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @oasis/web build

FROM node:22-slim AS runner
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=deps /repo /repo
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/tsx packages/db/src/migrate.ts && node_modules/.bin/tsx packages/db/src/seed.ts && pnpm --filter @oasis/web start"]
