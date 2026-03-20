---
type: quick
task_number: "001"
task_slug: jsonb-config
created: 2026-02-23T00:00:00Z
files_modified:
  - /Users/webstantly/DEV/templates/web-starter/app/lib/db/schema.ts
  - /Users/webstantly/DEV/templates/web-starter/app/lib/server/config.ts
  - /Users/webstantly/DEV/templates/web-starter/CLAUDE.md
autonomous: true
---

# Quick Task 001: JSONB Config Pattern

> Add a lightweight JSONB config table and typed server utility. No auth, no scoping — just a clean key/value config store with Zod validation for any web project.

## Context

- Project: `/Users/webstantly/DEV/templates/web-starter`
- Stack: React Router 7, Drizzle ORM, Zod 4, Biome — NO auth, NO Supabase
- Current schema: empty placeholder in `app/lib/db/schema.ts`
- No `app/lib/server/` directory exists yet — create it
- Zod is already in package.json but unused
- This template is leaner than saas-starter — no feature flags (no users to target)

## Design Decisions

### Why no feature flags?

- No auth system = no users or orgs to scope flags to
- Feature flags without user scoping are just config toggles — which app_config already handles
- Projects that need real feature flags should use the saas-starter

### Config table: simpler than saas-starter

- No `scope` column — just `key` → `value` (global by default)
- If a project needs scoping, they upgrade to saas-starter or add scope themselves
- Still validates with Zod — same safety, less complexity

## Boundaries

- Do NOT add feature flags — wrong template for that
- Do NOT add auth-related tables or utilities
- Do NOT add scope/cascade — keep it dead simple
- Keep the schema minimal — one table only

## Tasks

<task type="auto">
  <name>Add app_config table to schema</name>
  <files>/Users/webstantly/DEV/templates/web-starter/app/lib/db/schema.ts</files>
  <action>
    Replace the placeholder schema with one table:

    **app_config table:**
    - `id` serial primary key
    - `key` text, not null, unique — config identifier (e.g. "site.title", "theme.mode")
    - `value` jsonb, typed as `unknown`, not null, default `{}`
    - `created_at` timestamp with timezone, not null, default now
    - `updated_at` timestamp with timezone, not null, default now

    Import from `drizzle-orm/pg-core`: pgTable, serial, text, jsonb, timestamp

  </action>
  <verify>
    `npm run typecheck` passes. Schema exports the table.
  </verify>
  <done>Schema has app_config table with JSONB value column</done>
</task>

<task type="auto">
  <name>Create config server utility</name>
  <files>/Users/webstantly/DEV/templates/web-starter/app/lib/server/config.ts</files>
  <action>
    Create `app/lib/server/` directory and `config.ts` with three functions:

    **`getConfig<T>(db, key, zodSchema)`**
    - Query app_config by key
    - Validate value with Zod `safeParse()`
    - Return typed T or null (not found / validation failure)

    **`setConfig(db, key, value)`**
    - Upsert: check existing by key, update if exists, insert if not
    - Set updatedAt on update

    **`deleteConfig(db, key)`**
    - Delete by key

    Type DB as `PostgresJsDatabase<typeof schema>` from drizzle-orm/postgres-js.
    Use `eq()` from drizzle-orm.

    Note: No scope, no cascade — intentionally simple.

  </action>
  <verify>
    `npm run typecheck` passes. File exports all three functions.
  </verify>
  <done>Config utility with getConfig(), setConfig(), deleteConfig()</done>
</task>

<task type="auto">
  <name>Update CLAUDE.md to document config pattern</name>
  <files>/Users/webstantly/DEV/templates/web-starter/CLAUDE.md</files>
  <action>
    Add a section documenting the config pattern:

    ```markdown
    ## Server Utilities

    ### JSONB Config (`app/lib/server/config.ts`)

    - `getConfig(db, key, zodSchema)` — get a typed config value
    - `setConfig(db, key, value)` — upsert a config entry
    - `deleteConfig(db, key)` — remove a config entry
    - All values validated with Zod at runtime
    - For scoped config (per-user, per-org), use the saas-starter template instead
    ```

    Also update the Structure section to include `server/` under `lib/`.

  </action>
  <verify>
    CLAUDE.md contains the new documentation.
  </verify>
  <done>CLAUDE.md documents the config pattern</done>
</task>

<task type="auto">
  <name>Run all checks and commit</name>
  <files>all modified files</files>
  <action>
    1. Run `npm run lint` — must pass
    2. Run `npm run typecheck` — must pass
    3. Run `npm run test` — must pass
    4. Stage specific files:
       - `app/lib/db/schema.ts`
       - `app/lib/server/config.ts`
       - `CLAUDE.md`
    5. Commit: `feat: add JSONB config table and typed server utility`
    6. Push to remote
  </action>
  <verify>
    All checks pass. Commit exists in git log.
  </verify>
  <done>All checks green, committed and pushed</done>
</task>

## Success Criteria

- `app_config` table with JSONB value column and unique key
- `getConfig()` validates with Zod — never returns raw unknown
- `setConfig()` upserts cleanly
- `deleteConfig()` removes by key
- CLAUDE.md documents the pattern
- All lint/typecheck/test checks pass
