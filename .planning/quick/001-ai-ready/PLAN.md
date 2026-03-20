---
type: quick
task_number: "001"
task_slug: ai-ready
created: 2026-03-08T00:00:00Z
files_modified:
  - app/lib/server/index.ts
  - app/lib/server/__tests__/config.test.ts
  - CLAUDE.md
autonomous: true
---

# Quick Task 001: Make Web Starter AI-Ready (Deep Modules)

> Apply Matt Pocock's "deep modules" philosophy: barrel export, unit tests for server utility, and documented deep module pattern. Same approach as saas-starter quick-008.

## Context

- Project: `/Users/webstantly/DEV/templates/web-starter`
- Stack: React Router 7, Drizzle ORM, Tailwind CSS 4, shadcn/ui, Vitest, Biome
- Only 1 server utility: `config.ts` (getConfig, setConfig, deleteConfig)
- Simpler than saas-starter: no auth, no feature flags, no event bus, no rate limiter
- Zero unit tests currently — only e2e via Playwright
- No `.planning/` directory existed before this task

## Phase 1: Barrel Export + Config Test (Wave 1-2)

### Wave 1: Barrel export

<task type="auto">
  <name>Create server barrel export</name>
  <files>app/lib/server/index.ts</files>
  <action>
    Create barrel export re-exporting all public APIs from config.ts:
    - getConfig, setConfig, deleteConfig
    This is the single import point for all server utilities.
  </action>
  <verify>npm run typecheck passes</verify>
</task>

### Wave 2: Config test

<task type="auto">
  <name>Test config.ts</name>
  <files>app/lib/server/__tests__/config.test.ts</files>
  <action>
    Test with mocked Drizzle DB:
    - getConfig returns typed value when found
    - getConfig returns null when key not found
    - getConfig returns null when Zod validation fails
    - setConfig inserts new entry
    - setConfig updates existing entry
    - deleteConfig removes entry
    Mock the DB chain (select/from/where/limit, insert/values, update/set/where, delete/where).
  </action>
  <verify>npm run test -- config.test passes</verify>
</task>

## Phase 2: Documentation (Wave 3)

### Wave 3: Update CLAUDE.md

<task type="auto">
  <name>Document deep module pattern + barrel import in CLAUDE.md</name>
  <files>CLAUDE.md</files>
  <action>
    1. Add barrel import documentation to Server Utilities section:
       ```ts
       import { getConfig, setConfig, deleteConfig } from "~/lib/server";
       ```
    2. Add "## Building Features (Deep Module Pattern)" section showing:
       - How to organize a new feature as a deep module (folder with index.ts)
       - Example structure (e.g., a "payments" service)
       - Conventions: tests lock behavior, barrel exports are public API, mock DB not module
    Mirror the same pattern as saas-starter CLAUDE.md for consistency between templates.
  </action>
  <verify>CLAUDE.md contains the new sections</verify>
</task>

## Success Criteria

- `app/lib/server/index.ts` barrel export exists and typechecks
- `config.ts` has unit tests that pass
- `npm run test` passes
- `npm run typecheck` passes
- `npm run lint` passes
- CLAUDE.md documents barrel import + deep module pattern
- Zero changes to existing source code
