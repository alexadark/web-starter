# DigiShares GraphQL API - Technical Report

**Date**: 2026-03-25
**Endpoint**: `https://api-equilibria-dev.digishares.tech/gql`
**Server**: Apollo Server (Express-based, Node.js)
**Schema size**: 273 queries, 300 mutations, 160+ object types, 80+ enum types

---

## 1. Authentication

**Format**: `Authorization: Bearer <token>` header on every request.

### Login Mutations

| Login Type     | Mutation                                          | Credentials      | JWT Role          |
| -------------- | ------------------------------------------------- | ---------------- | ----------------- |
| Platform Admin | `adminSignIn(username, password, platform: true)` | admin / a        | role: 2           |
| Project Admin  | `adminSignIn(username, password)`                 | equilibria / 123 | role: 1           |
| Investor       | `signIn(email, password, stoID)`                  | Per investor     | role: 0 (assumed) |

### Other Auth

- `signUp(data: SignUpInput!)` - Self-registration, returns investor ID
- `signInSSO(data: SignInSSOInput!)` - SSO login
- `signInExternalSSO(...)` - Third-party SSO (LinkedIn, Google, Discord, Custom)
- `signInExternalOAuth2(...)` - OAuth2 provider login
- `generateAPIToken` - Generate long-lived API token (ideal for server-to-server)
- `refreshAccess` - Refresh session
- `investor2FAConfirm(code)` - 2FA confirmation

---

## 2. Investor Management (CRITICAL for Signal Finder integration)

### Can we PULL investors from DigiShares? YES

**Queries available:**

- `findInvestor(email?, investorID?, taxID?, govtID?, passportNumber?)` - Find by any criterion
- `findInvestors` - Find multiple by email array
- `findAllInvestors` - List all investors
- `investorUser` - Get full user data
- `getNonKycInvestors` - Investors who haven't completed KYC
- `unverifiedRegistrations` - New, unverified registrations
- `investorLogs` - Activity logs

**Investor data fields include:**

- Personal: firstName, lastName, email, phone, address, country, birthDate
- Identity: passportNumber, nationalID, driversLicenseID, govtID, taxID, socialSecurity
- Company: companyName, titleWithinCompany, investorType
- Financial: allowedTotalInvestment, yearlyTotalInvestment
- Status: isKYC, isActive, isAccountClosed, lastLogin
- Custom: meta ([MetaValues]!)

### Can we PUSH investors into DigiShares? YES

**Mutations available:**

- `adminCreateInvestor(investor: InvestorMarketSpaceInput!, sellSideAgentID?)` - Create investor + STO record, returns ID
- `signUp(data: SignUpInput!)` - Self-registration flow
- `basicCsvBulkUploadInvestments(...)` - Bulk upload via CSV
- `copyInvestorsToOtherProjects(...)` - Copy between projects/offerings
- `createOrCopyInvestorForSellAgent(...)` - Create for sell-side agent

**SignUpInput fields:** firstName!, lastName!, companyName?, password!, email!, stoID!, investorType?, brokerID?, referredBy?, phone?, address?, city?, state?, zip?, country?, metaValues?

**InvestorMarketSpaceInput (admin create):** Same as SignUpInput + kyc (JSON!), notes, options (autoAcceptKyc?, customKYCstatus?)

### Can we upload existing investors with shares for cap table? YES

- `adminCreateInvestor(...)` to create the investor record
- `investorTransferShares(...)` to assign shares (increases investor shares, decreases company shares)
- `investorBuyAlertAdmin(...)` to create a buy alert on behalf of investor
- `basicCsvBulkUploadInvestments(...)` for bulk operations

---

## 3. Offerings (STOs)

**Queries:**

- `findSto` / `findAllSto` / `findAllStoPublic` - Get offerings
- `findVisibleOfferings` - Visible to investor
- `adminStos` - Admin view

**Mutations:**

- `createStoAdmin` - Create new offering
- `adminUpdateOffering(...)` - Update offering
- `deleteStoAdmin(...)` - Delete (testing only)

**Live data:** 2 offerings exist - "Platform operator" (ID: 0) and "Investment Opportunity" (ID: 1)

---

## 4. Share Types (Tokens)

**Queries:**

- `findShareTypes(stoID)` - Get share types for offering
- `findAllShareTypes` - All share types
- `findShareHistoricalValues` - Historical values

**Mutations:**

- `createShareType(...)` / `updateShareType(...)` - CRUD

**Live data:** 1 share type - "Name of the Asset 1" (ID: 1), 10,000 total shares, 9,990 available, price: 10, blockchain-enabled

---

## 5. Share Transfers & Portfolio

**Queries:**

- `investorShare` / `investorShares` - Investor holdings
- `investorShareBalance` - Balance per share type
- `getInvestorPortfolio(...)` - Full portfolio
- `portfolioValue` / `portfolioCalculations` - Valuations
- `shareTypeShares` - All balances for a share type (cap table view)

**Mutations:**

- `investorTransferShares(...)` - Company -> Investor (issue shares)
- `companyTransferShares(...)` - Investor -> Company (buyback)
- `transferSharesBetween(...)` - Investor -> Investor
- `convertInvestorShares(...)` - Convert between share types
- `changeInvestorShareWallet(...)` - Off-chain <-> On-chain

---

## 6. KYC (Know Your Customer)

**Supported providers:** Internal, BlockPass, SumSub, Netki, GCash
**KYC requirement steps:** OnRegister, OnPurchase, Ignore, PrePayment

**Queries:**

- `investorKyc` - Get KYC info
- `getSumSubInvestorToken` - SumSub SDK token
- `getBlockPassClientID` - BlockPass client ID
- `getNonKycInvestors` - Investors without KYC
- `adminGetInvestorKyc(...)` - Admin view

**Mutations:**

- `fillKyc(...)` / `applyKyc(...)` - Submit KYC
- `updateInvestorKyc(...)` - Admin update
- `refreshInvestorData(...)` - Re-fetch from SumSub

---

## 7. Payments & Invoicing

**Payment channel types:** Mercury, Internal, Metamask, Xendit, PINTCustom, ManualDeposits, Stripe, PayoutOne, Polymesh
**Invoice statuses:** Unpaid, PendingVerification, Paid, Declined, PaymentFailure, PaymentOngoing, PaymentAwaiting, Cancelled

**Queries:**

- `investorPaymentChannels` - Available channels
- `investorGetInvoices` / `adminGetInvoices(...)` - Invoices
- `checkInvoiceStatus(...)` - Payment status
- `investorBalance` / `investorBalances` - Balances
- `investorDepositHistory` - History

**Mutations:**

- `upsertPaymentChannel(...)` - Create/update channel
- `createInvoice_Investor(...)` - Create invoice
- `payInvoice(...)` - Initiate payment (returns checkout URL for Stripe etc.)
- `updateInvoiceStatus_Admin(...)` - Admin approve/decline
- `refundInvoice(...)` - Issue refund

---

## 8. Buy/Sell Alerts (Share Purchases)

**Statuses:** Unused, Pending, Accepted, Declined, PaymentFailure, PaymentOngoing, PaymentAwaiting, KycRequired, AccreditationRequired, PendingDocuments, BlockchainProcessing, AccreditationPending

**Mutations:**

- `investorBuyAlert(query: InvestorBuyAlertInput!)` - Investor initiates purchase
- `investorBuyAlertAdmin(data: InvestorBuyAlertInputAdmin!)` - Admin creates on behalf of investor
- `investorBuyAlertApprove(...)` - Approve + initiate transfer
- `investorBuyAlertDeclineAdmin(...)` - Decline
- `investorSellAlert(...)` - Sell request

---

## 9. Investing Entities (Legal Entities)

**Entity types:** OWNER, INVESTOR, ACCOUNTANT, ADVISOR

**Mutations:**

- `investorInvestingEntityCreate/Update/Remove(...)` - Investor CRUD
- `adminInvestingEntityCreate/Update/Remove(...)` - Admin CRUD
- Member management mutations for entity members

---

## 10. Exchange / Secondary Market

**Mutations:**

- `createSellOrder/createBuyOrder(...)` - Create orders
- `createOffer(...)` - Create offer
- `startSwap(...)` - Initiate atomic swap
- `acceptInternalSwap/rejectInternalSwap(...)` - Accept/reject

---

## 11. Dividends

**Mutations:**

- `adminDividendCreate(...)` - Create dividend campaign
- `adminDividendTriggerAllPayments(...)` - Trigger payments
- `paySingleInvestorDividend(...)` - Pay individual

---

## 12. Documents & Contracts

**Mutations:**

- `setSignature/sendContract(...)` - Sign/send contracts
- `getDocuSignUrl(...)` - DocuSign redirect URL
- `sendHelloSignTemplateSignRequest(...)` - HelloSign integration
- `setSubmittedDocument(...)` - Submit documents

---

## 13. Webhooks (Event Notifications)

**Queries:**

- `adminGetWebhookTargets` - List configured webhooks
- `adminGetWebhookCalls` - Webhook call history

**Mutations:**

- `adminUpsertWebhookTarget(...)` - Create/update webhook
- `adminDeleteWebhookTarget(...)` - Delete webhook

This is critical for real-time sync: configure webhooks to notify Signal Finder when investors register, complete KYC, or make purchases.

---

## 14. Communications

- `getChats/getChat` - Chat system
- `messageCreate/messageUpdate` - Messaging
- `investorInbox/investorInboxes` - Inbox
- `sendEmailNotification(...)` - Bulk email to investors

---

## 15. Blockchain

**Supported:** Ethereum, Binance, Polygon, Bitcoin, Ravencoin, Polymesh, Libex, Fantom
**Protocols:** ERC1404 (primary), PolyMath, Ravencoin

**Mutations:**

- `investorPublicKeyAdd/Delete(...)` - Manage wallet keys
- `whitelistWallet(...)` - Whitelist investor wallet
- `createBlockchainTransactionTransfer(...)` - On-chain transfer
- `verifyTransactionFromBlockchain(...)` - Verify TX hash

---

## 16. Admin & Configuration

- `adminParameters` - App parameters
- `adminDashboardOverview` - Dashboard stats
- `adminGetAllAdminRights` - 70+ granular permissions
- `setPlatformParam(...)` - Platform config
- `createSmtpSettings/updateSmtpSettings(...)` - Email config
- `runScript(...)` - Run manuscript script

---

## Summary: Bill's Questions Answered

| Question                                             | Answer                                                                                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SDK available?                                       | No SDK. Full GraphQL API (273 queries, 300 mutations). Better than SDK - full database access.                                                               |
| How to manage connectivity?                          | Bearer token auth. `adminSignIn` for admin ops, `signIn` for investor ops. `generateAPIToken` for long-lived server-to-server tokens.                        |
| What actions are supported?                          | Everything: CRUD investors, offerings, shares, payments, KYC, documents, dividends, blockchain ops, exchange.                                                |
| Pull investors from DigiShares -> Signal Finder?     | YES. `findAllInvestors`, `findInvestor(email)`, `findInvestors` (by email array). Full investor data including contact info, company, investment history.    |
| Push investors into DigiShares?                      | YES. `adminCreateInvestor(...)` with optional `autoAcceptKyc`. Also `signUp(...)` for self-registration flow, `basicCsvBulkUploadInvestments(...)` for bulk. |
| Upload existing investors with shares for cap table? | YES. `adminCreateInvestor` + `investorTransferShares` to assign shares. Or `basicCsvBulkUploadInvestments` for bulk.                                         |
| Real-time sync?                                      | YES via webhooks: `adminUpsertWebhookTarget` to get notified of investor events.                                                                             |
