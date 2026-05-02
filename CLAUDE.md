# Project: [PROJECT NAME]

## Overview

[Brief description of the project]

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
| Stories   | Storybook 10                             |
| Linting   | Biome                                    |
| CI        | GitHub Actions                           |

## Conventions

- React components are `const` arrow functions, not `function` declarations.
- Server utilities live in `app/lib/server/`. Public API is the barrel (`~/lib/server`); internal files are implementation detail.

## Images

- Use `<Image>` from `~/components/ui/image` for CDN-hosted images (Cloudinary, Supabase Storage, Vercel, Imgix). Unpic auto-selects the optimal format and size.
- For local static assets, use a plain `<img>` with `loading="lazy"` and `decoding="async"`.

## Structure

```
app/
  components/      UI components by feature
    ui/            shadcn/ui + Image wrapper
  lib/
    db/            Drizzle schema + client
    server/        Server-only utilities (config, etc.)
  routes/          Route modules
  styles/          Global CSS + design tokens
test/
  mocks/           MSW handlers
e2e/               Playwright E2E tests
.storybook/
.github/workflows/
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

## Security

- Security headers configured in `vercel.json` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- Env vars validated at boot via Zod (`app/lib/env.server.ts`); app crashes early on misconfiguration.
- DB connection is lazy and pgBouncer-compatible.

## Customization Checklist

After cloning this template:

- [ ] Update this CLAUDE.md (project name, overview)
- [ ] Update `package.json` name field
- [ ] Update design tokens in `app/styles/globals.css` (colors, fonts, radii)
- [ ] Install project-specific fonts (`@fontsource/*`)
- [ ] Add deployment adapter (e.g. `@vercel/react-router`)
- [ ] Set up `.env` from `.env.example`
