# Base
FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Development
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["sh", "-c", "pnpm --filter backend exec prisma generate && pnpm --filter backend exec prisma db push && pnpm --filter backend dev"]

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter backend build
RUN pnpm prune --prod

# Production
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./
EXPOSE 3001
CMD ["node", "dist/main.js"]
