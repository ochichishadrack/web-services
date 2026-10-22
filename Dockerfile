# syntax=docker/dockerfile:1

# ===== Dependencies =====
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy only files needed to install dependencies
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Cache the package manager store between builds
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    --mount=type=cache,id=yarn-cache,target=/usr/local/share/.cache/yarn \
    --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  if [ -f yarn.lock ]; then \
    yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm i --frozen-lockfile; \
  else \
    echo "Lockfile not found." && exit 1; \
  fi

# ===== Builder =====
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

ARG API_URL
ENV API_URL=$API_URL

# Cache the Next.js build cache (.next/cache) → huge speedup on rebuilds
RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
  if [ -f yarn.lock ]; then \
    yarn build; \
  elif [ -f package-lock.json ]; then \
    npm run build; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm run build; \
  else \
    echo "Lockfile not found." && exit 1; \
  fi

# ===== Runner =====
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]