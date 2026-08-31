# Migrate from Crossmint to BlindPay

Move the stablecoin-to-fiat leg of a Crossmint integration to BlindPay while Crossmint keeps handling wallets, checkout, or orchestration.

Source: https://blindpay.com/docs/migrations/crossmint

This guide is for teams using Crossmint's offramp/payout surface for KYC, bank accounts, and payout requests, who want to move that money-movement leg to BlindPay while keeping Crossmint wallets, checkout, or stablecoin orchestration in place. Crossmint offramp customers and KYC map to BlindPay customers, Crossmint bank accounts map to BlindPay bank accounts, and Crossmint payout requests map to a BlindPay quote followed by an executed payout.

## How the concepts map

| Crossmint concept | BlindPay concept |
| --- | --- |
| Offramp customer + KYC | Customer (`re_`) with KYC/KYB |
| Bank account | Bank account (`ba_`) with rail-specific type (Pix, SPEI, SEPA, ACH, wire) |
| Payout request | Quote (`qu_`) followed by an executed payout (`po_`) |
| Receiving/deposit address | Virtual account (`va_`) or offramp wallet |
| Offramp order and wallet transfer webhooks (`wallets.transfer.in`, `wallets.transfer.out`) | Svix-signed webhooks |

If funds keep living in Crossmint wallets, there is no BlindPay customer-facing equivalent to migrate: instead, register each wallet with BlindPay as an external wallet through the sign-message challenge flow and store the resulting `bw_` ID, so BlindPay can pull from or verify ownership of the same wallet Crossmint already manages.

## Migration steps

### Inventory your Crossmint usage

List every call your codebase makes into Crossmint's offramp API: KYC/bring-your-own-KYC, bank accounts, and payout requests, plus stablecoin orchestration pay-ins, wallet transfer webhooks, and payment/checkout webhooks. Confirm exact endpoint names and payload shapes against the Crossmint docs rather than assuming, since offramp API routes are not fully public. Write the mapping into a migration report and flag anything with no direct BlindPay equivalent instead of guessing.

### Decide what stays on Crossmint

If funds keep living in Crossmint wallets, register each one with BlindPay as an external wallet through the sign-message challenge flow and store the resulting `bw_` ID. See [blockchain wallets](../payins/blockchain-wallets.md) for the registration flow.

### Re-onboard customers

KYC does not transfer between providers. Re-onboard each customer on BlindPay: accept the [terms of service](../essentials/terms-of-service.md), create the customer record, and run KYC/KYB via [document upload](../essentials/upload.md), driven by customer webhooks. Sequence this ahead of the cutover so approved customers are ready when you switch. See [customers](../essentials/customers.md).

### Rebuild the payout leg

BlindPay uses an explicit two-step model: request a [payout quote](../payouts/payout-quotes.md), then execute the payout against it before `expires_at` (about 5 minutes). Store the resulting `qu_` and `po_` IDs alongside the legacy Crossmint order IDs during the transition. See [payouts](../payouts/payouts.md) and [bank accounts](../payouts/bank-accounts.md) for the rail-specific payout paths.

### Port webhooks

Replace Crossmint's offramp order and wallet transfer webhooks with BlindPay's Svix-signed webhooks (`svix-id`, `svix-timestamp`, `svix-signature` verified against your `whsec_` with raw-body HMAC), deduping on `svix-id`. See [webhooks](../essentials/webhooks.md) and [webhook events](../essentials/webhooks-events.md).

### Cut over per corridor

Cut over behind a feature flag, one corridor at a time. Dual-run new payouts on BlindPay while Crossmint settles in-flight orders, keep both webhook handlers live during the window, and only retire the Crossmint payout path once one full dual-run settlement cycle has cleared on BlindPay.

## Copy-paste prompt

Paste this into your coding agent to run the migration end to end.

```text [Migration prompt]
You are migrating the stablecoin-to-fiat leg of my application from Crossmint's offramp/payout surface to the BlindPay API. Crossmint wallets, checkout, or stablecoin orchestration may stay in place; only money movement to fiat is moving.

Before writing code, read these sources and follow them over any prior knowledge:
- https://blindpay.com/docs/llms.txt (read the quickstarts, customers, bank accounts, wallets, quotes, and webhooks pages)
- The OpenAPI spec: curl https://api.blindpay.com/doc

Do the migration in this order:
1. Inventory my Crossmint usage from the codebase: every call into Crossmint's offramp API (KYC/bring-your-own-KYC, bank accounts, payout requests), stablecoin orchestration pay-ins, wallet transfer webhooks (wallets.transfer.in, wallets.transfer.out), and payment/checkout webhooks, plus every stored Crossmint ID. Confirm exact endpoint names and payload shapes in the Crossmint docs rather than assuming, since offramp API routes are not fully public. Derive the mapping from what we actually use, roughly: Crossmint offramp customers and KYC map to BlindPay customers (re_) with KYC/KYB; Crossmint bank accounts map to BlindPay bank accounts (ba_) with rail-specific types (Pix, SPEI, SEPA, ACH, wire); Crossmint payout requests map to a BlindPay quote (qu_) followed by an executed payout (po_); if Crossmint receiving/deposit addresses are in use, map those to BlindPay virtual accounts (va_) or offramp wallets. Write the mapping table into a migration report and flag anything with no direct equivalent instead of guessing.
2. Decide what stays on Crossmint: if funds keep living in Crossmint wallets, register each wallet with BlindPay as an external wallet through the sign-message challenge flow and store the resulting bw_ ID, so BlindPay can pull from or verify ownership of the same wallet Crossmint already manages.
3. Re-onboard customers on BlindPay: terms of service, create customer, KYC/KYB via document upload, driven by customer.* webhooks. KYC does not transfer between providers, so plan for re-verification and sequence it before the cutover so approved customers are ready when we switch.
4. Rebuild the payout leg on BlindPay's explicit two-step model: request a quote, then execute the payout against it via POST /v1/instances/{instance_id}/payouts/evm before expires_at (about 5 minutes). Store qu_ and po_ IDs alongside the legacy Crossmint order IDs during the transition.
5. Port status handling to BlindPay's Svix-signed webhooks (svix-id, svix-timestamp, svix-signature verified against whsec_ with raw-body HMAC) in place of Crossmint's offramp order and wallet transfer webhooks, with svix-id dedup.
6. Cut over per corridor behind a feature flag: dual-run with new payouts on BlindPay while Crossmint settles in-flight orders, keep both webhook handlers live during the window, and only retire the Crossmint payout path once one full dual-run settlement cycle has cleared on BlindPay.

Constraints:
- Develop against a BlindPay development instance (USDB on testnets, KYC auto-approves, sentinel amounts $666.00 forced failed and $777.00 forced refunded for testing) before moving to mainnets.
- Amounts are integer minor units; API keys stay server-side.
- Produce a written migration report before changing code: the mapping table, gaps, and the re-KYC plan.

Deliverables: the migration report, re-onboarding script, the BlindPay client and payout/quote code paths behind a flag, external wallet registration for any Crossmint wallets that stay, webhook handlers, and a cutover checklist.
```

## Before you cut over

- Build and test against a BlindPay development instance first: USDB on testnets, KYC auto-approves, sentinel amounts $666.00 forced failed and $777.00 forced refunded for testing.
- Handle amounts as integer minor units and keep API keys server-side, never in client code.
- Write the migration report (mapping table, gaps, re-KYC plan) before changing any code.
- Sequence re-KYC ahead of cutover so approved customers are ready when the switch happens.
- Cut over per corridor behind a feature flag, dual-running both webhook handlers until one full settlement cycle has cleared on BlindPay.

## Related docs

- [Customers](../essentials/customers.md)
- [Bank accounts](../payouts/bank-accounts.md)
- [Payouts](../payouts/payouts.md)
- [Webhooks](../essentials/webhooks.md)
- [Offramp wallets](../payouts/offramp-wallets.md)
