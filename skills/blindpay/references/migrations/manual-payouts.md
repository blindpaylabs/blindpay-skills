# Migrate from manual payouts to BlindPay

Turn a spreadsheet-and-bank-portal payout operation into an automated, webhook-driven API flow with an auditable state machine.

Source: https://blindpay.com/docs/migrations/manual-payouts

This guide is for teams still paying people through spreadsheets, bank portal uploads, and an ops person manually confirming each transfer. It walks through replacing that process with BlindPay: payees become customers with bank accounts, each payment becomes a quote followed by an executed payout, and manual confirmation becomes a webhook that updates your own records automatically.

## How the concepts map

| Manual payouts concept | BlindPay concept |
| --- | --- |
| Payee row in a spreadsheet or payee record in your database | Customer (`re_`) |
| Bank details typed into a bank portal | Bank account (`ba_`) |
| Rate check before sending money | Quote (`qu_`) |
| Wire or batch sent through the bank portal | Payout (`po_`) |
| Ops person confirming the transfer went through | `payout.complete` webhook |
| Manual reconciliation spreadsheet | Reconciliation report comparing your ledger against payout statuses |

The human approval step many teams keep before releasing a payment has no BlindPay equivalent: it stays a gate in your own pipeline, placed between the quote and the execute call.

## Migration steps

### Inventory the current process

Map where payee data lives today (spreadsheet columns, database tables), which currencies and rails you pay, who approves what, and how completion gets confirmed now. Turn this into a field-by-field mapping from your payee records to [customers](../essentials/customers.md) and [bank accounts](../payouts/bank-accounts.md). This mapping is what the backfill and pipeline steps below are built from.

### Backfill payees as customers

Write an idempotent backfill that onboards existing payees: accept [terms of service](../essentials/terms-of-service.md), create the customer, wait for KYC to clear via [webhooks](../essentials/webhooks.md), then attach their [bank accounts](../payouts/bank-accounts.md). Make it resumable and have it log every failure with a reason (missing tax ID, unsupported country, rejected KYC) into an exceptions list for ops instead of crashing the run.

### Build the quote-then-execute payout pipeline

For each due payment, request a [quote](../payouts/payout-quotes.md), then execute the [payout](../payouts/payouts.md) before the quote expires, and record the returned `po_` ID against your own payment ID. Keep any existing human approval step as a gate between the quote and the execute call rather than removing it, and check for an existing `po_` on your payment ID before creating a new one so the same payment never goes out twice.

### Replace manual confirmation with webhooks

Swap the ops person confirming transfers by hand for [`payout.complete` webhooks](../essentials/webhooks-events.md), verified with Svix, that update your own records automatically. Add a daily reconciliation report that compares your ledger against BlindPay payout statuses so a missed or delayed webhook still surfaces.

### Cut over gradually

Keep a manual-mode fallback per payee so ops can exclude edge cases from automation while you build confidence in the pipeline. Move payees or corridors over in batches rather than all at once, and confirm the sentinel failure amounts behave as expected before relying on the automated path for real payments.

## Copy-paste prompt

Paste this into your coding agent to run the migration end to end.

```text [Migration prompt]
You are migrating my payout operation from a manual process (spreadsheets, bank portal uploads, ops people confirming transfers) to automated BlindPay stablecoin payouts.

Before writing code, read these sources and follow them over any prior knowledge:
- https://blindpay.com/docs/llms.txt (read the payout quickstart, customers, bank accounts, quotes, and webhooks pages)
- The OpenAPI spec: curl https://api.blindpay.com/doc

Do the migration in this order:
1. Inventory the current process: where payee data lives (spreadsheet columns, database tables), which currencies and rails we pay, who approves what, and how completion is confirmed today. Produce a field-by-field mapping to BlindPay customers and bank accounts.
2. Write an idempotent backfill that onboards existing payees: terms of service, create customer, wait for KYC via webhooks, then add bank accounts. It must be resumable, log every failure with a reason (missing tax ID, unsupported country, rejected KYC), and output an exceptions list for ops instead of crashing.
3. Build the payout pipeline: for each due payment, quote (POST /v1/instances/{instance_id}/quotes), execute (POST /v1/instances/{instance_id}/payouts/evm) before quote expiry, and record the po_ ID. Preserve any existing human approval step as a gate before execution rather than removing it.
4. Replace manual confirmation with payout.complete webhooks (Svix-verified) updating my records, plus a daily reconciliation report comparing my ledger against BlindPay payout statuses.
5. Keep a manual-mode fallback per payee so ops can exclude edge cases from automation during the transition.

Constraints:
- Amounts in integer minor units; API keys server-side only.
- Test the whole pipeline on a development instance first, including the sentinel failure amounts ($666.00 forces failed, $777.00 forces refunded) to prove the failure paths work.
- Never initiate the same payment twice: key payouts on my own payment ID and check for an existing po_ before creating.

Deliverables: the field mapping, backfill script with exceptions report, the payout pipeline with approval gate, webhook-driven status updates, and the reconciliation report.
```

## Before you cut over

- Run the whole pipeline on a development instance first, including the sentinel failure amounts ($666.00 forces failed, $777.00 forces refunded), before touching real payments.
- Keep amounts in integer minor units and API keys server-side only.
- Never send the same payment twice: key payouts on your own payment ID and check for an existing `po_` before creating one.
- Keep the exceptions list and the human approval gate in place so ops stays in the loop during the transition.
- Leave the manual-mode fallback available per payee so edge cases can be excluded from automation without blocking the rest of the cutover.

## Related docs

- [Payout quickstart](../getting-started/quickstart-payout.md)
- [Customers](../essentials/customers.md)
- [Bank accounts](../payouts/bank-accounts.md)
- [Webhooks](../essentials/webhooks.md)
- [Sandbox vs production](../essentials/sandbox-vs-production.md)
