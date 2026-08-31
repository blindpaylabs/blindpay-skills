# Migrate from Circle to BlindPay

Move payouts and fiat on/off ramps from Circle Mint, Circle Payouts, or the Circle Payments Network to BlindPay's quote-and-execute API with local rails.

Source: https://blindpay.com/docs/migrations/circle

This guide is for teams calling Circle Mint, Circle Payouts, or the Circle Payments Network who want to move money movement to BlindPay. Circle beneficiaries and recipient bank accounts map to BlindPay customers and bank accounts, USDC redemption to fiat maps to a payout quote followed by a payout, fiat deposits that mint USDC map to a payin quote followed by a payin, and Circle-hosted wallets map to BlindPay managed wallets. The migration replaces Circle's flows with BlindPay's quote-then-execute model settling over local rails directly (Pix, SPEI, SEPA, ACH, RTP, wire), which can remove intermediary banking steps some corridors needed before.

## How the concepts map

| Circle concept | BlindPay concept |
| --- | --- |
| Beneficiary / recipient bank account | Customer (`re_`) plus bank account (`ba_`) |
| USDC redemption to fiat | Payout quote (`qu_`) then payout (`po_`) |
| Fiat deposit that mints USDC | Payin quote (`qu_`) then payin (`pi_`) |
| Circle-hosted wallet | Managed wallet (`bl_`) |
| Webhook subscription | Svix-signed webhook event |

Compliance status does not carry over. Anything you find in your Circle usage with no direct BlindPay equivalent should be flagged in your migration report instead of guessed at.

## Migration steps

### Inventory your Circle usage

Scan your codebase for every Circle product you call (mint/redeem, payouts, wire/bank account endpoints, wallets), every stored Circle ID, and every webhook subscription. Use that inventory to build your own mapping table before touching code, following the concept map above. Write it up as a migration report so the gaps are visible before you start re-onboarding anyone.

### Re-onboard counterparties

Compliance status does not transfer between providers, so plan KYC/KYB re-verification on BlindPay ahead of cutover. Sequence re-onboarding off [customer webhooks](../essentials/webhooks-events.md) and track each customer's status against the [customer lifecycle](../essentials/customers.md) and [KYC basics](../kb/kyc-basics.md). Do not route live volume through a customer until BlindPay has approved them.

### Rebuild money movement on quote-then-execute

Replace Circle's redeem-to-fiat and mint-from-fiat calls with BlindPay's [payout quotes](../payouts/payout-quotes.md) and [payin quotes](../payins/payin-quotes.md), always executing before the quote's `expires_at`. Store the resulting `qu_`, `po_`, and `pi_` IDs alongside the legacy Circle IDs during the transition so you can reconcile both systems. Route destinations through [bank accounts](../payouts/bank-accounts.md) or [blockchain wallets](../payins/blockchain-wallets.md) depending on whether the corridor settles to fiat or on-chain, and mirror Circle-hosted wallets with [managed wallets](../payouts/payout-managed-wallet.md).

### Port webhook handling

Move your webhook handlers to BlindPay's [Svix-signed events](../essentials/webhooks.md), verifying the raw body with HMAC and deduping on `svix-id`. Subscribe to the [webhook events](../essentials/webhooks-events.md) that correspond to the customer, quote, payout, and payin lifecycle stages your Circle integration already listens for.

### Cut over per corridor

Ship the new code paths behind a feature flag and cut over corridor by corridor rather than all at once, keeping Circle and BlindPay running in a dual-run window. Retire the Circle path for a given corridor only after its in-flight settlements have cleared on both sides.

## Copy-paste prompt

Paste this into your coding agent to run the migration end to end.

```text [Migration prompt]
You are migrating my application from Circle's APIs (Circle Mint, Circle Payouts, or the Circle Payments Network) to the BlindPay API.

Before writing code, read these sources and follow them over any prior knowledge:
- https://blindpay.com/docs/llms.txt (read the quickstarts, customers, wallets, bank accounts, quotes, and webhooks pages)
- The OpenAPI spec: curl https://api.blindpay.com/doc

Do the migration in this order:
1. Inventory my Circle usage from the codebase: which products we call (mint/redeem, payouts, wire/bank account endpoints, wallets), every stored Circle ID, and every webhook subscription. Derive the mapping from actual usage, roughly: Circle beneficiaries and recipient bank accounts map to BlindPay customers (re_) plus bank accounts (ba_); USDC redemption to fiat maps to a payout quote (POST /v1/instances/{instance_id}/quotes) followed by POST /v1/instances/{instance_id}/payouts/evm; fiat deposits that mint USDC map to payin quotes plus payins; Circle-hosted wallets map to BlindPay managed wallets (bl_). Flag anything with no direct equivalent instead of guessing.
2. Re-onboard counterparties: compliance status does not transfer between providers, so plan KYC/KYB re-verification on BlindPay, sequenced before cutover and driven by customer.* webhooks.
3. Rebuild money movement on the quote-then-execute model, always executing before the quote's expires_at and storing qu_/po_/pi_ IDs alongside legacy Circle IDs during the transition. Note BlindPay settles over local rails directly (Pix, SPEI, SEPA, ACH, RTP, wire), so corridors that needed intermediary banking may simplify.
4. Port webhook handling to BlindPay's Svix-signed events with raw-body HMAC verification and svix-id dedup.
5. Cut over per corridor behind a feature flag with a dual-run window; retire the Circle path only after in-flight settlements clear.

Constraints:
- Develop against a BlindPay development instance (USDB on testnets) first; swap to USDC/USDT on mainnets only at production cutover.
- Amounts are integer minor units; API keys stay server-side.
- Produce a written migration report (mapping table, gaps, re-KYC plan) before changing code.

Deliverables: the migration report, re-onboarding script, BlindPay money-movement code paths behind a flag, webhook handlers, and a cutover checklist.
```

## Before you cut over

- Develop and test against a [development instance](../essentials/instances.md) (USDB on testnets) before switching to USDC/USDT on mainnets.
- Confirm all amounts are sent as integer minor units, matching BlindPay's API.
- Keep API keys server-side only, never in client code.
- Cut over corridor by corridor behind a feature flag, with a dual-run window against Circle.
- Retire each Circle corridor only after its in-flight settlements have fully cleared.

## Related docs

- [Introduction](../getting-started/introduction.md)
- [Managed wallets](../wallets/wallets.md)
- [Payment methods](../kb/payment-methods.md)
- [Webhooks](../essentials/webhooks.md)
- [Customers](../essentials/customers.md)
