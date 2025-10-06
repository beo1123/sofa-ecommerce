[![CI](https://github.com/beo1123/sofa-ecommerce.git/actions/workflows/ci.yml/badge.svg)](https://github.com/beo1123/sofa-ecommerce.git/actions/workflows/ci.yml)

Production-ready Ecommerce app for selling sofas, built with **Next.js (App Router)** + **TypeScript**.
Includes modern tooling, CI/CD, and contribution workflows.

## Tech Stack

- Next.js (App Router)
- TypeScript
- pnpm
- Redux Toolkit (planned)
- Tailwind CSS (planned)
- GitHub Actions (CI)

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Lint
pnpm lint

# Build
pnpm build

# Run tests (placeholder)
pnpm test

# Run docker comand
docker compose -f docker-compose.postgres.yml down --remove-orphans
docker compose -f docker-compose.postgres.yml up -d
(turn off postgresql at local window)
# inspract ip for docker
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' sofa-ecommerce-db-1
# Prisma generate
npx prisma generate
    #or
npm run prisma:generate
#initial migration and apply to DB
npx prisma migrate dev --name init --schema=prisma/schema.prisma
# or
npm run prisma:migrate:dev
npx prisma studio #to check db
```
