# DigiShares API Assessment - Equilibria Platform

**Prepared by:** Alexandra Spalato
**Date:** March 25, 2026
**For:** Bill Andreozzi (CTO)

---

## Executive Summary

I explored the DigiShares GraphQL API sandbox that Veronica set up for us and mapped the full schema. All integration paths you asked about are confirmed and supported. The API is comprehensive - 273 queries, 300 mutations, 160+ object types.

I'm requesting admin/API access so I can start building the integration layer.

---

## Your Questions - Answered

### 1. SDK or API available?

No SDK. They provide a full **GraphQL API** (Apollo Server), which is better - we query exactly what we need, no SDK version lock-in.

- **Endpoint:** `https://api-equilibria-dev.digishares.tech/gql`
- **Auth:** JWT Bearer tokens via `adminSignIn` mutation
- **Long-lived tokens:** `generateAPIToken` mutation for server-to-server access (no session expiry)

### 2. Pull investors from DigiShares into Signal Finder?

**YES.** Multiple queries available:

- `findAllInvestors` - List all investors
- `findInvestor(email)` - Find by email, ID, tax ID, passport, or gov ID
- `findInvestors` - Batch lookup by email array

Returns full profile: name, email, phone, company, KYC status, investment history, custom meta fields.

### 3. Push investors into DigiShares (onboard known investors)?

**YES.** Two paths:

- `adminCreateInvestor()` - Creates investor record directly, with optional `autoAcceptKyc` flag to skip KYC for pre-verified investors
- `signUp()` - Self-registration flow (for investor-facing portal)
- `basicCsvBulkUploadInvestments()` - Bulk upload via CSV

### 4. Upload existing investors with shares (cap table accuracy)?

**YES.**

- `adminCreateInvestor` to create the investor record
- `investorTransferShares` to assign shares (company to investor transfer)
- `basicCsvBulkUploadInvestments` for bulk operations
- `copyInvestorsToOtherProjects` to share investors across offerings

### 5. Real-time sync between systems?

**YES.** Webhook system built in:

- `adminUpsertWebhookTarget` - Configure webhook URLs
- `adminGetWebhookCalls` - View webhook history
- We get notified when investors register, complete KYC, or purchase shares

---

## Full API Capabilities (Summary)

| Domain                   | Key Operations                                                                  |
| ------------------------ | ------------------------------------------------------------------------------- |
| **Investors**            | CRUD, search, bulk upload, copy between projects, KYC management                |
| **Offerings (STOs)**     | Create, update, manage visibility, meta data                                    |
| **Share Types (Tokens)** | Create token classes, set pricing, configure blockchain                         |
| **Share Transfers**      | Issue shares, buybacks, investor-to-investor, convert types, on-chain/off-chain |
| **KYC**                  | SumSub and BlockPass integration, admin override, status tracking               |
| **Payments**             | Stripe, MetaMask, manual bank transfers, invoicing, refunds                     |
| **Documents**            | DocuSign integration, contract generation, e-signatures                         |
| **Dividends**            | Create campaigns, trigger payments, individual payouts                          |
| **Exchange**             | Buy/sell orders, atomic swaps, secondary market                                 |
| **Blockchain**           | Wallet whitelisting, on-chain transfers, TX verification                        |
| **Webhooks**             | Event notifications for real-time sync                                          |
| **Admin**                | 70+ granular permissions, SMTP config, platform settings                        |

---

## Architecture Recommendation: Separate Application

I recommend building the investor platform as a **separate application** from the Equilibria marketing site.

**Current state:**

- `equilibria.com` - Marketing/showcase site (Next.js, already built)

**Proposed:**

- `equilibria.com` - Marketing site (unchanged)
- `app.equilibria.com` - Investor platform (new, React Router 7)

**Why separate:**

1. **Different lifecycles** - The marketing site is mostly static. The investor platform will evolve constantly with new features, integrations, and compliance requirements.

2. **Different tech needs** - The investor platform needs auth, real-time data, payment processing, KYC flows, wallet connections. The marketing site needs none of that.

3. **Independent deployment** - We can ship investor platform updates without touching the marketing site, and vice versa. No risk of breaking one when updating the other.

4. **Security isolation** - The investor platform handles PII, financial data, and payment credentials. Keeping it separate reduces the attack surface on the marketing site.

5. **Team independence** - Multiple people can work on different parts without conflicts.

**Connection:** The marketing site has an "Invest Now" button that redirects to `app.equilibria.com`. Same domain (subdomain), professional appearance, completely independent codebases.

---

## Integration Architecture (High Level)

```
equilibria.com (Marketing Site - Next.js)
    |
    | "Invest Now" button
    v
app.equilibria.com (Investor Platform - React Router 7)
    |
    |--- DigiShares GraphQL API (tokenization, cap table, compliance)
    |--- SumSub API (KYC/AML verification)
    |--- DocuSign API (document signing)
    |--- Stripe API (fiat payments)
    |--- Fortress Trust (crypto payments)
    |
    | Webhooks (real-time events)
    v
Signal Finder (Investor Discovery - React Router 7)
    |
    |--- Pull investors from DigiShares for analysis
    |--- Push qualified investors into DigiShares for onboarding
    |--- GoHighLevel CRM sync
```

---

## What I Need to Start

1. **DigiShares admin access** - I need credentials for the production/staging environment (not just the sandbox Veronica set up). Specifically:
   - Platform Admin login
   - Project Admin login
   - API token generation access

2. **Confirmation on providers:**
   - KYC: SumSub or BlockPass? (DigiShares supports both)
   - Document signing: DocuSign or Dropbox Sign?
   - Fiat payments: Stripe confirmed?
   - Crypto payments: Fortress Trust, or use DigiShares built-in MetaMask?

3. **Subdomain setup** - `app.equilibria.com` pointing to Vercel

---

## Detailed API Report

A complete technical reference documenting every query, mutation, and type is available in the project folder: `digishares-api-report.md`

This covers authentication flows, investor management, offerings, share types, transfers, KYC, payments, documents, dividends, exchange, blockchain operations, webhooks, and admin configuration.
