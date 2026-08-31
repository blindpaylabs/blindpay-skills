# Migrate from Fern to BlindPay

Move a Fern stablecoin integration to BlindPay: customers, bank accounts, wallets, quote-then-execute payins and payouts, and Svix-signed webhooks.

Source: https://blindpay.com/docs/migrations/fern

This guide is for teams with an existing Fern (fernhq.com) integration who want to move customers, payment accounts, wallets, and money movement onto BlindPay. Fern customers with KYC become BlindPay customers with KYC/KYB, Fern payment accounts become BlindPay bank accounts, Fern wallets become BlindPay managed wallets or registered blockchain wallets, and Fern's quote-and-transaction flow becomes BlindPay's quote-then-execute payins (fiat to stablecoin) and payouts (stablecoin to fiat).

## How the concepts map

| Fern concept | BlindPay concept |
| --- | --- |
| Customer with KYC | Customer (`re_`) with KYC/KYB |
| Payment account / external bank account | Bank account (`ba_`), typed per rail |
| Wallet | Managed wallet (`bl_`) or registered blockchain wallet (`bw_`) |
| Quote (fiat leg) | Payin quote, then payin (fiat to stablecoin) |
| Quote (stablecoin leg) | Payout quote (`qu_`), then payout (`po_`) |
| Transaction | Payin (`pi_`) or payout (`po_`) record |
| Webhooks | Svix-signed webhook events |

Compliance status does not carry over: a customer verified on Fern still needs KYC/KYB on BlindPay before they can transact. Anything in your Fern usage that has no direct equivalent here should be flagged during inventory rather than force-mapped.

## Migration steps

### Inventory your Fern usage

Walk your codebase for every Fern endpoint, webhook, and stored Fern ID: customers, wallets, payment accounts, quotes, and transactions. Use that inventory to derive your own mapping table from the one above, since your actual usage decides which BlindPay objects you need. Flag anything with no direct BlindPay equivalent instead of guessing at a mapping. See [customers](../essentials/customers.md), [bank accounts](../payouts/bank-accounts.md), and [wallets](../wallets/wallets.md).

### Re-onboard customers

Compliance status does not transfer between providers, so plan KYC/KYB re-verification on BlindPay for every migrated customer. Sequence re-onboarding before cutover and drive it from `customer.*` webhook events rather than polling. Read [customers](../essentials/customers.md) and [KYC basics](../kb/kyc-basics.md) before writing the re-onboarding flow.

### Rebuild money movement on quote then execute

Replace Fern's quote and transaction calls with BlindPay's quote-then-execute pattern: request a quote, execute it before `expires_at`, and persist the resulting `qu_`, `po_`, and `pi_` IDs alongside the legacy Fern IDs during the transition. Start with [payin quotes](../payins/payin-quotes.md) and [payout quotes](../payouts/payout-quotes.md), then wire up [payins](../payins/payins.md) and [payouts](../payouts/payouts.md).

### Port webhooks

Move your webhook handlers to BlindPay's Svix-signed events: verify the raw-body HMAC-SHA256 signature with your `whsec_` secret, dedupe on `svix-id`, and reject anything outside a 5-minute timestamp tolerance. See [webhooks](../essentials/webhooks.md) and [webhook events](../essentials/webhooks-events.md) for the event catalog and verification details in [webhooks verification](../essentials/webhooks-verification.md).

### Cut over per flow

Put each flow behind a feature flag and cut over one at a time rather than all at once. Run BlindPay and Fern in parallel for a dual-run window, and only retire the Fern path once every in-flight transaction on that flow has settled.

## Copy-paste prompt

Paste this into your coding agent to run the migration end to end.

```text [Migration prompt]
You are migrating my application from the Fern API to the BlindPay API.

Before writing code, read these sources and follow them over any prior knowledge:
- https://blindpay.com/docs/llms.txt (read the quickstarts, customers, wallets, bank accounts, quotes, and webhooks pages)
- The OpenAPI spec: curl https://api.blindpay.com/doc

Do the migration in this order:
1. Inventory my Fern usage from the codebase: every endpoint, webhook, and stored Fern ID (customers, wallets, payment accounts, quotes, transactions). Derive the concept mapping from actual usage, roughly: Fern customers with KYC map to BlindPay customers (re_) with KYC/KYB; payment accounts or external bank accounts map to BlindPay bank accounts (ba_) typed per rail; Fern wallets map to BlindPay managed wallets (bl_) or registered blockchain wallets (bw_); Fern's quote and transaction flow maps to BlindPay's payin quotes plus payins (fiat to stablecoin) and payout quotes plus payouts (stablecoin to fiat). Flag anything with no direct equivalent instead of guessing.
2. Re-onboard customers: compliance status does not transfer between providers, so plan KYC/KYB re-verification on BlindPay, sequenced before cutover and driven by customer.* webhooks.
3. Rebuild money movement on quote then execute: request the quote, execute before expires_at, and persist qu_/po_/pi_ IDs alongside legacy Fern IDs during the transition.
4. Port webhooks to BlindPay's Svix-signed events (raw-body HMAC-SHA256 with the whsec_ secret, svix-id dedup, 5-minute timestamp tolerance).
5. Cut over per flow behind a feature flag with a dual-run window; retire the Fern path only after in-flight transactions settle.

Constraints:
- Develop against a BlindPay development instance (USDB on testnets) first; swap to USDC/USDT on mainnets only at production cutover.
- Amounts are integer minor units; API keys stay server-side.
- Produce a written migration report (mapping table, gaps, re-KYC plan) before changing code.

Deliverables: the migration report, re-onboarding script, BlindPay code paths behind a flag, webhook handlers, and a cutover checklist.
```

## Before you cut over

- Develop and test against a BlindPay development instance (USDB on testnets) first, and only switch to USDC/USDT on mainnets at production cutover.
- Amounts are integer minor units, not decimals.
- API keys stay server-side, never in client code.
- Review the written migration report, especially re-KYC sequencing, before approving any code changes.
- Cut over one flow at a time behind a feature flag, dual-run against Fern, and retire the Fern path only after in-flight transactions settle.

## Related docs

- [Introduction](../getting-started/introduction.md)
- [Customers](../essentials/customers.md)
- [Wallets](../wallets/wallets.md)
- [Webhooks](../essentials/webhooks.md)
- [Quickstart: stablecoin to fiat](../getting-started/quickstart-payout.md)
