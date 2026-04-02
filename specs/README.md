# Equilibria Platform - Specs & Integration Docs

> Temporary home for Equilibria project documentation until the dedicated repository is created.
> Bill reviews everything from here.

---

## Project Overview

**Goal:** Capital orchestration platform for regulated fundraising (Reg A+, Reg D 506c, Reg S).
**First offering:** Building Modular (BM) real estate, target raise $100M.

**Architecture:** Two separate applications on the same domain.

| App               | URL                  | Stack                | Purpose                              |
| ----------------- | -------------------- | -------------------- | ------------------------------------ |
| Marketing site    | `equilibria.com`     | Next.js (existing)   | Static showcase                      |
| Investor platform | `app.equilibria.com` | React Router 7 (new) | Onboarding, KYC, payments, portfolio |

**Connection:** "Invest Now" button on marketing site redirects to investor platform.

---

## Vendor Stack

| Vendor         | Function                               |
| -------------- | -------------------------------------- |
| DigiShares     | Issuance, cap table, compliance engine |
| DocuSign       | E-signatures                           |
| SumSub         | KYC/AML verification                   |
| Stripe         | Fiat payments (card, ACH, wire)        |
| Fortress Trust | Crypto payments (USDC, BTC, ETH)       |
| GoHighLevel    | CRM, marketing automation              |
| SignalFinder   | AI investor discovery                  |

---

## Documents

### DigiShares Integration

| Document                                             | Description                                               |
| ---------------------------------------------------- | --------------------------------------------------------- |
| [API Assessment](./digishares-api-assessment.md)     | High-level assessment for Bill - what's possible          |
| [Integration Spec](./digishares-integration-spec.md) | Technical spec - only the endpoints SignalFinder needs    |
| [Full API Report](./digishares-api-report.md)        | Complete technical reference (273 queries, 300 mutations) |

### PitchBook Integration (in parent specs/)

| Document                                                     | Description                                            |
| ------------------------------------------------------------ | ------------------------------------------------------ |
| [API Docs](../pitchbook-api-docs.md)                         | Full PitchBook REST API documentation (95 endpoints)   |
| [Integration Strategy](../pitchbook-integration-strategy.md) | How PitchBook complements AI providers in SignalFinder |

### Quality & Process

| Document                    | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| [QA Shield](./qa-shield.md) | Automated testing framework - replaces human QA team |

---

## Timeline (Revised)

| Month    | Build                                             | Verify                                | Guide                                |
| -------- | ------------------------------------------------- | ------------------------------------- | ------------------------------------ |
| M0 (Mar) | Local build + Vercel previews, DigiShares sandbox | Review setup, first tests             | Architecture specs, vendor contracts |
| M1 (Apr) | SumSub + DocuSign + Stripe integrations           | Test M0 integrations, security review | Compliance specs                     |
| M2 (May) | Fortress Trust (crypto) + GHL + SignalFinder      | Pentest M0-M1, audit                  | Regulatory validation                |
| M3 (Jun) | Investor portal, soft launch                      | E2E tests, load testing               | Investor onboarding                  |
| M4 (Jul) | Fixes, optimizations, v2 features                 | Monitoring, production QA             | Scale planning                       |
| M5 (Aug) | Scale features, Phase 2 prep                      | Production hardening                  | Phase 2 planning                     |

---

## Key Metrics (Phase 1 Targets)

- Cost per investor: $130 (vs $800 manual = 84% reduction)
- Time to funding: 2-7 days (vs 9-15 days = 50-75% faster)
- Auto-approval rate: 70-80%
- Target: 500+ investors onboarded by Month 6
