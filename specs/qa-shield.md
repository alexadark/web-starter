# QA Shield - Automated Testing & Validation Framework

## What Is This

A project-agnostic testing and QA framework applied systematically to every project we build. Not a one-off test suite - a reusable system that ships with every new codebase.

The goal: eliminate the need for a dedicated QA team or TPM by baking validation, testing, and quality assurance directly into the build process.

## The Problem It Solves

Traditional approach: build first, hire QA humans later, pay 200 hours/month for someone to click around and write test documents.

Our approach: Claude Code builds features AND their tests simultaneously. Every project gets the same quality guarantees from day one. Zero human QA overhead.

---

## Implementation Status (as of March 2026)

> Assessed against the SignalFinder 2 codebase. Each layer shows what's already built, what's partially done, and what's planned.

| Layer                      | Status          | Coverage |
| -------------------------- | --------------- | -------- |
| 1. Input Validation        | **Implemented** | ~70%     |
| 2. API Integration Testing | **Implemented** | ~60%     |
| 3. E2E Pipeline Testing    | **Implemented** | ~40%     |
| 4. UI Testing              | **Implemented** | ~50%     |
| 5. Prompt Management       | **Implemented** | ~80%     |
| 6. CI/CD Pipeline          | **Partial**     | ~30%     |
| 7. Automated Observability | **Not started** | 0%       |

---

## Layer 1: Input Validation & Error Boundaries — IMPLEMENTED

**Applied to:** Every form, API endpoint, agent input, and data pipeline entry point.

- Strict schema validation at every system boundary (Zod)
- Fail fast with clear, actionable error messages - never let bad data propagate silently
- Timeout protection - if an operation takes longer than expected, abort and report why
- Input sanitization against injection (XSS, SQL injection, prompt injection)

**Rule:** Every function that accepts external input must have a validation schema. No exceptions.

**What's built in SignalFinder:**

- Zod validation on all form parsing and API route inputs
- HTTP client wrapper with built-in Zod response validation
- Type-safe form utilities in `app/lib/server/form.ts`

**Gap:** Not yet enforced at every single boundary - some older routes still need Zod schemas added.

---

## Layer 2: API Integration Testing — IMPLEMENTED

**Applied to:** Every third-party API integration in any project.

- **Health check per API**: Automated connectivity + auth validation on deploy
- **Response contract tests**: Validate that API responses match expected schemas (catch breaking changes from providers)
- **Mock mode (MSW)**: Record real API responses, replay them in dev/CI - build and test without burning credits
- **Rate limit handling**: Graceful degradation, queuing, backoff - built into every API client
- **Cost tracking**: Log every API call with cost estimate, surface totals in a simple dashboard

**Rule:** Every API client must have a corresponding mock fixture and contract test.

**What's built in SignalFinder:**

- MSW mock handlers in `test/mocks/handlers.ts` for all external APIs
- Provider adapter pattern ensures every API client has a testable interface
- Rate limiting built into `app/lib/server/rate-limit.ts`
- Budget system tracks API costs in `app/server/budget/`

**Gap:** No automated health checks on deploy. Contract tests exist but are not systematically enforced for every provider.

---

## Layer 3: End-to-End Pipeline Testing — IMPLEMENTED

**Applied to:** Every multi-step workflow (data pipelines, onboarding flows, agent chains).

- **Golden path tests**: Define the happy path with known inputs -> expected outputs, run on every PR
- **Regression suite**: Capture bugs as test cases - once fixed, they stay fixed
- **Performance benchmarks**: Track execution time per stage, alert on degradation
- **Edge case library**: Maintain a growing set of tricky inputs per project, test against each release

**Rule:** Every pipeline must have at least one golden path test before merging.

**What's built in SignalFinder:**

- Vitest test suite covering route loaders, actions, and services
- Executor agent runs tests automatically after every build phase
- Verifier agent validates acceptance criteria before marking phases complete

**Gap:** Route action/loader test coverage at ~12%, target is 32%+. Performance benchmarks not yet tracked.

---

## Layer 4: UI Testing — IMPLEMENTED

**Applied to:** Every web application with user-facing pages.

- **Playwright E2E tests**: Cover critical user flows (the 5-10 things a real user does every day)
- **Visual regression**: Screenshot comparison for key pages - catch unintended UI changes
- **Error state coverage**: Verify UI handles failures gracefully (API down, empty data, timeouts, permissions)
- **Accessibility**: Basic a11y checks (keyboard nav, screen reader labels, contrast)

**Rule:** Every user-facing feature must have a Playwright test for its primary flow.

**What's built in SignalFinder:**

- Playwright configured for E2E page tests
- Visual regression via Playwright screenshots (stored in `.planning/phases/{phase}/screenshots/`)
- Storybook stories for component-level testing (9 business + 5 UI primitive stories planned)
- Playwright Storybook config for component visual regression (`playwright.storybook.config.ts`)

**Gap:** Auth E2E fixture needed (programmatic login) to unblock ~20 skipped tests. Visual regression not yet in CI.

---

## Layer 5: Prompt Management & Testing — IMPLEMENTED

**Applied to:** Every project that uses LLM prompts (agents, AI features, content generation).

- **Prompts as code**: Stored in database with version control, editable via admin UI
- **Prompt regression tests**: Fixed inputs -> evaluate outputs against quality criteria (relevance, format, completeness)
- **Side-by-side comparison**: When editing a prompt, run old vs new on same inputs, compare results
- **Prompt changelog**: Every change documented with reason and measured impact

**Rule:** Prompt changes require a regression test run before merge. Results logged in PR.

**What's built in SignalFinder:**

- Prompt registry system with DB-backed overrides (`app/server/services/prompt/`)
- Prompts stored in database, version-controlled, never hardcoded
- Admin UI for prompt management with preview capabilities
- Provider-agnostic prompt system (same prompt works across Perplexity, Exa, Tavily, Linkup)

**Gap:** No automated regression testing for prompt output quality. Side-by-side comparison not yet built.

---

## Layer 6: CI/CD Pipeline — PARTIAL

**Applied to:** Every project, configured on first commit.

```
Pre-commit:     lint + type check + unit tests
PR validation:  integration tests + prompt regression + build check
Staging deploy: full E2E suite + visual regression
Production:     health checks + smoke tests + error rate monitoring
```

- GitHub Actions as default CI
- Vercel preview deploys on every PR
- Test reports auto-generated, linked in PR comments
- Failed tests block merge - no exceptions

**What's built in SignalFinder:**

- GitHub Actions CI configured
- Vercel preview deploys active
- Biome (lint + format) configured and enforced

**Gap:** No pre-commit hooks. PR validation runs basic checks but not full integration suite. No staging-specific test gate. Visual regression not hooked into CI.

---

## Layer 7: Automated Observability — NOT STARTED

**Applied to:** Every deployed application.

- **Error tracking**: Uncaught errors -> auto-create GitHub Issues with stack trace, environment, repro steps
- **Quality dashboard**: Single page per project - test coverage, pass rates, API health, uptime
- **Test documentation**: Generated from test code (describe blocks = docs), not maintained separately
- **Alerts**: Slack/email notifications on test failures, API outages, error rate spikes

**What's built in SignalFinder:**

- Structured logger with errorId (UUID) in `app/lib/server/logger.ts`
- Event emitter for internal tracking in `app/lib/server/events.ts`

**Gap:** No external error tracking (Sentry, etc.). No quality dashboard. No alerting system. Logger exists but data goes nowhere beyond server logs.

---

## Tech Stack

| Tool                | Purpose                   | Status in SignalFinder |
| ------------------- | ------------------------- | ---------------------- |
| TypeScript          | Type safety everywhere    | Active                 |
| Zod                 | Runtime schema validation | Active                 |
| Vitest              | Unit + integration tests  | Active                 |
| Playwright          | E2E + visual regression   | Active                 |
| MSW                 | API mocking               | Active                 |
| Storybook           | Component development     | Active                 |
| Biome               | Lint + format             | Active                 |
| GitHub Actions      | CI/CD                     | Active (basic)         |
| Vercel              | Deploys + previews        | Active                 |
| Sentry (or similar) | Error tracking + alerts   | **Not yet integrated** |

## What This Replaces

| Traditional QA                     | QA Shield                          |
| ---------------------------------- | ---------------------------------- |
| Manual test case documents         | Auto-generated from test code      |
| Human tester clicking through UI   | Playwright runs on every PR        |
| TPM tracking bugs in spreadsheets  | Failed tests -> auto GitHub Issues |
| Separate QA team reviewing prompts | Prompt regression tests in CI      |
| Monthly QA reports                 | Real-time quality dashboard        |
| 200 hours/month human overhead     | 0 hours/month - it's code          |

---

## Roadmap to 100%

| Priority | Action                                                        | Effort   |
| -------- | ------------------------------------------------------------- | -------- |
| 1        | Hook visual regression into CI (Playwright screenshots on PR) | 1-2 days |
| 2        | Add pre-commit hooks (Biome lint + type check)                | 0.5 day  |
| 3        | Expand route loader/action test coverage to 32%+              | 2-3 days |
| 4        | Auth E2E fixture (programmatic login for Playwright)          | 1 day    |
| 5        | Integrate error tracking (Sentry or similar)                  | 1 day    |
| 6        | Build prompt regression test harness                          | 2-3 days |
| 7        | Quality dashboard (test coverage, error rates, API health)    | 3-5 days |
