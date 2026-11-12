# syntax=docker/dockerfile:1

# ---- build: install all dependencies and compile the NestJS app ----
FROM node:24-slim AS build
WORKDIR /app

# The Prisma schema and config must exist before `npm ci`, because the
# `postinstall` script runs `prisma generate`.
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime ----
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000 \
    DATABASE_URL=file:/data/tasks.db

# The Prisma CLI (a dev dependency) is needed to apply migrations on start-up,
# so the full node_modules from the build stage is kept.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts /app/package.json ./

# SQLite lives on a volume so data survives container restarts.
RUN mkdir /data && chown node:node /data
VOLUME /data
USER node

EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://localhost:' + process.env.PORT + '/tasks').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Apply pending migrations, then start the API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
