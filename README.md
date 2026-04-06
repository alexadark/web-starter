# Web Starter

Production-ready web project template: React Router 7 + TypeScript + Tailwind CSS 4 + Drizzle ORM + Vitest + MSW + Storybook + Playwright + GitHub Actions CI.

## Stack

| Layer     | Technology                               |
| --------- | ---------------------------------------- |
| Framework | React Router 7 (framework mode, SSR)     |
| Language  | TypeScript 5.9 (strict)                  |
| Styling   | Tailwind CSS 4 + shadcn/ui (Radix + CVA) |
| Images    | Unpic (`@unpic/react`)                   |
| Database  | Drizzle ORM + postgres.js                |
| Testing   | Vitest + Testing Library + MSW           |
| E2E       | Playwright                               |
| Stories   | Storybook 10 (vitest + a11y addons)      |
| Linting   | Biome (lint + format)                    |
| CI        | GitHub Actions                           |

## Quick Start

```bash
git clone git@github.com:YOUR_USER/web-starter.git my-project
cd my-project
rm -rf .git && git init
cp .env.example .env   # fill in DATABASE_URL
npm install
npm run dev
```

## Environment

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
```

## Commands

```bash
# Dev
npm run dev          # Dev server
npm run build        # Production build
npm run start        # Serve production build

# Quality
npm run lint         # Biome check
npm run format       # Biome format (auto-fix)
npm run typecheck    # TypeScript check

# Testing
npm run test         # Vitest (unit)
npm run test:watch   # Vitest watch mode
npm run test:e2e     # Playwright E2E
npm run test:e2e:ui  # Playwright with UI

# Storybook
npm run storybook    # Component explorer on :6006

# Database
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Apply pending migrations
npm run db:push      # Push schema directly (no migration files)
npm run db:studio    # Open Drizzle Studio
```

## Project Structure

```
app/
  components/
    ui/              shadcn/ui components + Image wrapper
  lib/
    db/
      index.ts       Drizzle client (exports `db`)
      schema.ts      Database schema
    server/
      config.ts      JSONB config utility
    utils.ts         cn() helper
  routes/            React Router 7 route modules
  styles/            Global CSS + design tokens
test/
  mocks/             MSW mock handlers
e2e/                 Playwright E2E tests
.storybook/          Storybook configuration
.github/workflows/   CI pipeline
```

## Environment Validation

Server env vars are validated at startup via Zod (`app/lib/env.server.ts`). Missing or invalid vars crash the app immediately with a clear error - no silent failures in production.

Add new server env vars to both `env.server.ts` and `.env.example`.

## Database

Schema lives in `app/lib/db/schema.ts`. The Drizzle client is exported from `app/lib/db/index.ts`:

```ts
import { db } from "~/lib/db";
```

The database connection is **lazy** (Proxy pattern) - no connection is created at import time, making it safe during typecheck and tests. Configured for pgBouncer compatibility (`max: 1, prepare: false`).

### app_config table

A global key/value config store with JSONB values. Use it for site-wide settings, feature toggles, or any structured runtime config.

| Column     | Type        | Notes                                   |
| ---------- | ----------- | --------------------------------------- |
| id         | serial      | Primary key                             |
| key        | text        | Unique identifier (e.g. `"site.title"`) |
| value      | jsonb       | Zod-validated at read time              |
| created_at | timestamptz | Auto-set on insert                      |
| updated_at | timestamptz | Manual update on write                  |

## Server Utilities

### JSONB Config (`app/lib/server/config.ts`)

```ts
import { db } from "~/lib/db";
import { getConfig, setConfig, deleteConfig } from "~/lib/server/config";
import { z } from "zod";

// Read — returns typed value or null
const title = await getConfig(db, "site.title", z.string());

// Write — upsert
await setConfig(db, "site.title", "My App");

// Delete
await deleteConfig(db, "site.title");
```

All values are Zod-validated on read. `getConfig` returns `null` if the key doesn't exist or the value fails validation.

> For scoped config (per-user, per-org), use the saas-starter template instead.

## Testing

Every component ships with three files:

```
Button.tsx
Button.stories.tsx
Button.test.tsx
```

Use the `/component` Claude Code command to scaffold all three at once.

- Tests use Vitest + Testing Library + MSW
- MSW handlers live in `test/mocks/handlers.ts`
- Stories include `Default` + `DarkMode` variants

## Security

- Security headers configured in `vercel.json` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Environment variables validated at boot via Zod - crashes early on misconfiguration
- Database connection is lazy and pgBouncer-compatible
- 404 catch-all route prevents information leakage

## Customization Checklist

After cloning:

- [ ] Update `package.json` → `name` field
- [ ] Update `README.md` (project name, description)
- [ ] Update `CLAUDE.md` (project name, overview)
- [ ] Update design tokens in `app/styles/globals.css`
- [ ] Install fonts (`@fontsource/*`) if needed
- [ ] Add deployment adapter (e.g. `@vercel/react-router`)
- [ ] Fill in `.env` from `.env.example`
- [ ] Start building
