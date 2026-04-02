# DigiShares Integration Spec for SignalFinder

> Filtered from the full API report (273 queries, 300 mutations).
> Only the endpoints SignalFinder actually needs.
>
> Full report: `specs/digishares-api-assessment.md`
> Source: `~/DEV/Life-OS/projects/active/equilibria/digishares-api-report.md`

---

## Connection Details

- **Type:** GraphQL (Apollo Server)
- **Endpoint:** `https://api-equilibria-dev.digishares.tech/gql` (dev sandbox)
- **Auth:** `Authorization: Bearer <token>` header
- **Server-to-server:** Use `generateAPIToken` mutation for long-lived tokens (no session expiry)

---

## Integration Scope

SignalFinder needs 3 capabilities from DigiShares:

1. **Pull investors** - Import existing DigiShares investors into SignalFinder for analysis/enrichment
2. **Push investors** - Export qualified investors from SignalFinder into DigiShares for onboarding
3. **Webhook sync** - Get notified when DigiShares investor state changes (registration, KYC, purchase)

---

## 1. Authentication

### Server-to-server token (recommended)

```graphql
mutation {
  generateAPIToken
}
```

Returns a long-lived token. Store as `DIGISHARES_API_TOKEN` env var.

### Session-based (fallback)

```graphql
mutation {
  adminSignIn(username: "equilibria", password: "123") {
    accessToken
  }
}
```

Returns short-lived JWT. Needs refresh via `refreshAccess`.

---

## 2. Pull Investors (DigiShares -> SignalFinder)

### List all investors

```graphql
query {
  findAllInvestors {
    investorID
    firstName
    lastName
    email
    phone
    companyName
    titleWithinCompany
    investorType
    country
    isKYC
    isActive
    lastLogin
    meta {
      key
      value
    }
  }
}
```

### Find specific investor

```graphql
query {
  findInvestor(email: "investor@example.com") {
    # same fields as above
  }
}
```

Also supports lookup by: `investorID`, `taxID`, `govtID`, `passportNumber`.

### Batch lookup by email

```graphql
query {
  findInvestors(emails: ["a@example.com", "b@example.com"]) {
    # same fields
  }
}
```

### Relevant investor fields for SignalFinder mapping

| DigiShares Field      | SignalFinder Use                         |
| --------------------- | ---------------------------------------- |
| `firstName, lastName` | Contact name                             |
| `email`               | Primary identifier, dedup key            |
| `phone`               | Contact info                             |
| `companyName`         | Organization name                        |
| `titleWithinCompany`  | Role/title                               |
| `investorType`        | Investor classification                  |
| `country`             | Geography filter                         |
| `isKYC`               | Verification status                      |
| `isActive`            | Active/inactive filter                   |
| `meta`                | Custom fields (flexible key-value pairs) |

---

## 3. Push Investors (SignalFinder -> DigiShares)

### Create investor (admin)

```graphql
mutation {
  adminCreateInvestor(
    investor: {
      firstName: "Jane"
      lastName: "Doe"
      email: "jane@fund.com"
      companyName: "ABC Capital"
      phone: "+1234567890"
      country: "US"
      investorType: 0
      options: {
        autoAcceptKyc: true # Skip KYC for pre-verified investors
      }
    }
  )
}
```

Returns the new investor ID.

### Required fields for `adminCreateInvestor`

| Field           | Required | Notes                               |
| --------------- | -------- | ----------------------------------- |
| `firstName`     | Yes      |                                     |
| `lastName`      | Yes      |                                     |
| `email`         | Yes      | Must be unique                      |
| `password`      | Yes\*    | For self-service login              |
| `stoID`         | Yes\*    | Which offering to associate with    |
| `companyName`   | No       |                                     |
| `phone`         | No       |                                     |
| `country`       | No       |                                     |
| `investorType`  | No       | 0 = individual (default)            |
| `autoAcceptKyc` | No       | Skip KYC for pre-verified investors |

\*May be optional for admin-created investors - needs testing with sandbox.

### Bulk upload

```graphql
mutation {
  basicCsvBulkUploadInvestments(stoID: 1, filePath: "path/to/csv")
}
```

---

## 4. Webhooks (Real-time Sync)

### Configure webhook

```graphql
mutation {
  adminUpsertWebhookTarget(
    url: "https://signalfinder.app/api/webhooks/digishares"
    # event types TBD - needs sandbox testing
  )
}
```

### List configured webhooks

```graphql
query {
  adminGetWebhookTargets {
    id
    url
    # event config
  }
}
```

### View webhook history

```graphql
query {
  adminGetWebhookCalls {
    # call history, status, payload
  }
}
```

### Expected webhook events (to confirm with sandbox)

- Investor registered
- Investor completed KYC
- Investor purchased shares
- Investor profile updated

---

## 5. Optional: Portfolio Data (for investor enrichment)

If SignalFinder wants to show investment activity alongside discovery data:

### Get investor holdings

```graphql
query {
  investorShares(investorID: 123) {
    shareTypeID
    shares
    # balance info
  }
}
```

### Get portfolio summary

```graphql
query {
  getInvestorPortfolio(investorID: 123) {
    # holdings, value, history
  }
}
```

### Cap table view (all holders of a share type)

```graphql
query {
  shareTypeShares(shareTypeID: 1) {
    # all investors + their balances
  }
}
```

---

## Architecture: Provider Adapter

DigiShares fits SignalFinder's hexagonal architecture as a **provider adapter**:

```
app/server/providers/
  adapters/
    digishares.ts       # GraphQL client, query/mutation wrappers
  registry.ts           # Add "digishares" entry
```

**Key difference from other providers:** DigiShares is bidirectional (pull AND push), unlike AI search providers which are read-only. This means:

- The adapter needs both `search()` (pull investors) and `push()` (create investor) methods
- Webhook handler needs a route: `app/routes/api.webhooks.digishares.ts`
- Auth token management (long-lived API token stored in env vars)

---

## Open Questions (Need Sandbox Testing)

1. **Webhook event types** - What events can we subscribe to? What's the payload format?
2. **Rate limits** - Any throttling on the GraphQL API?
3. **Pagination** - How does `findAllInvestors` handle large datasets? Cursor-based? Offset?
4. **Required fields** - Exact required vs optional fields for `adminCreateInvestor`
5. **Meta fields** - What custom meta keys are configured for Equilibria?
6. **Token expiry** - How long does `generateAPIToken` last? Is it truly permanent?
