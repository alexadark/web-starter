# Project: [PROJECT NAME]

## Overview

[Brief description of the project]

## Stack

- **Framework**: React Router 7 (framework mode, SSR)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS 4 + shadcn/ui (Radix + CVA)
- **Images**: Unpic (`app/components/ui/image.tsx`) for CDN images
- **Database**: Drizzle ORM + postgres.js (schema in `app/lib/db/schema.ts`)
- **Testing**: Vitest + Testing Library + MSW + Playwright
- **Stories**: Storybook 10 (vitest addon + a11y addon)
- **Linting**: Biome (tabs, double quotes, semicolons)
- **CI**: GitHub Actions (lint → typecheck → test → build)

## Conventions

- All code, comments, and documentation in English
- TypeScript strict mode — no `any`
- Biome handles formatting and linting (not ESLint/Prettier)
- React components use `const` arrow functions (not `function` declarations)

## React Router 7 Patterns

**Always follow RR7 idioms** — see `.claude/references/react-router.md` for the full guide.

Key rules:

- Data loading → `loader` + `loaderData`, never `useEffect` + `fetch`
- Mutations → `<Form>` + `action`, never manual fetch in event handlers
- Pending UI → `useNavigation().state`, never manual loading state
- Redirects → only from `loader`/`action`, never `useNavigate()` in effects
- Auth guard → check session in `loader`, redirect if not authed

## Images

Use `<Image>` from `~/components/ui/image` for CDN-hosted images (Cloudinary, Supabase Storage, Vercel, Imgix, etc.). Unpic auto-selects the optimal format and size.

For local static assets, use a plain `<img>` with `loading="lazy"` and `decoding="async"`.

## Testing Conventions

- **Every component gets three files**: `{name}.tsx` + `{name}.stories.tsx` + `{name}.test.tsx`
- Tests use Vitest + Testing Library + MSW
- Stories always include `Default` + `DarkMode` variants with `MemoryRouter` decorator
- MSW mocks live in `test/mocks/handlers.ts` (shared) or inline in test files (specific)
- Test user behavior, not implementation: `screen.getByRole()` over `container.querySelector()`
- Run `npm run test` before committing — CI will catch failures on push

## Server Utilities

Import all server utilities from the barrel:

```ts
import { getConfig, setConfig, deleteConfig } from "~/lib/server";
```

### JSONB Config (`app/lib/server/config.ts`)

- `getConfig(db, key, zodSchema)` — get a typed config value
- `setConfig(db, key, value)` — upsert a config entry
- `deleteConfig(db, key)` — remove a config entry
- All values validated with Zod at runtime
- For scoped config (per-user, per-org), use the saas-starter template instead

## Building Features (Deep Module Pattern)

Each server feature lives in its own folder under `app/lib/server/` and follows the **deep module** pattern:

1. **Folder per feature** with an `index.ts` barrel export
2. **Internal files** are implementation details - only the barrel is public API
3. **Tests mock the DB**, not the module - test the real function with a fake database
4. **The top-level barrel** (`app/lib/server/index.ts`) re-exports from all feature barrels

### Example: Adding a "payments" service

```
app/lib/server/
  payments/
    index.ts           # barrel: export { createCharge, getInvoice } from "./stripe"
    stripe.ts           # implementation
  __tests__/
    payments.test.ts    # tests with mocked DB
  config.ts             # existing feature (flat file, no subfolder needed for simple modules)
  index.ts              # top-level barrel: re-exports from config, payments, etc.
```

### Conventions

- **Barrel exports are the public API** - consumers import from `~/lib/server` or `~/lib/server/payments`
- **Tests lock behavior** - write tests before refactoring, test the function not the internals
- **Mock the DB, not the module** - use chainable mock objects that mirror Drizzle's query builder
- **Simple modules stay flat** - a single file like `config.ts` doesn't need its own folder

## Structure

```
app/
  components/      UI components organized by feature
    ui/            shadcn/ui + Image wrapper
  lib/             Utilities
    db/            Drizzle schema and client
    server/        Server-only utilities (config, etc.)
  routes/          Route modules (RR7 loaders/actions)
  styles/          Global CSS + design tokens
test/
  mocks/           MSW mock handlers
e2e/               Playwright E2E tests
.claude/
  references/      Reference docs (React Router patterns)
.storybook/        Storybook configuration
.github/
  workflows/       CI pipeline
```

## Getting Started

```bash
npm install
npm run dev          # Dev server
npm run test         # Vitest
npm run storybook    # Storybook on :6006
npm run lint         # Biome check
npm run typecheck    # TypeScript check
npm run db:generate  # Generate migrations from schema
npm run db:push      # Push schema directly (no migration files)
npm run db:studio    # Open Drizzle Studio
```

## Workflow

This project is designed to work with [Get Shit Done (GSD)](https://github.com/gsd-build/get-shit-done) — a spec-driven development system for Claude Code.

### Install GSD

```bash
npx get-shit-done-cc@latest
```

### Core Commands

```
/gsd:new-project     → Questions → research → requirements → roadmap
/gsd:discuss-phase N → Shape implementation decisions before planning
/gsd:plan-phase N    → Research → atomic task plans → verification
/gsd:execute-phase N → Wave-based parallel execution with atomic commits
/gsd:verify-work N   → Goal-backward verification of built work
```

See the [GSD documentation](https://github.com/gsd-build/get-shit-done) for the full command list and user guide.

## Customization Checklist

After cloning this template:

- [ ] Update this CLAUDE.md (project name, overview, structure)
- [ ] Update `package.json` name field
- [ ] Update design tokens in `app/styles/globals.css` (colors, fonts, radii)
- [ ] Install project-specific fonts (`@fontsource/*`)
- [ ] Add deployment adapter (e.g. `@vercel/react-router`)
- [ ] Set up `.env` from `.env.example`
- [ ] Install GSD: `npx get-shit-done-cc@latest`
- [ ] Run `/gsd:new-project` to begin
