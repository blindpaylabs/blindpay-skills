---
name: blindpay
description: BlindPay integration for payins/payouts and stablecoin on/off-ramps (ACH, wire, SWIFT, Pix, SPEI, SEPA, USDC/USDT), customer KYC/KYB, bank and virtual accounts, managed or blockchain wallets, cross-chain transfers, payables (boletos, PIX QR codes, invoices), partner fees, or webhooks.
license: MIT
metadata:
  author: blindpay
  version: "2.0"
  tags: [payments, stablecoin, crypto, fiat, payout, payin, payables, usdc, usdt, virtual-accounts, webhooks]
---

# BlindPay Integration

BlindPay is a global payment API. One integration covers bank rails (ACH, wire, RTP, SWIFT, Pix, SPEI, ACH COP, Transfers 3.0, SEPA) and stablecoins (USDC, USDT) across seven chains. Every payment settles through stablecoins under the hood, and BlindPay is a non-custodial processor: funds stay under the customer's control, and failed transactions are returned to the originating wallet or bank account.

The docs come in two flavors and the reference files keep both, marked inline:

- **Abstracted flavor**: bank-rails framing. Virtual accounts, payins as deposits, payouts as bank transfers. BlindPay handles the stablecoin leg.
- **Advanced flavor**: stablecoin framing. Managed and external wallets, chains and tokens, on-chain authorization, cross-chain transfers.

Both run on the same API, keys, instances and webhooks. When answering, pick the flavor that matches what the user is building.

## Terminology

`receiver` was renamed to **customer**. The API path is `/customers`, IDs still start with `re_`. The legacy `/receivers` path and `receiver.*` webhook events were retired with the July 2026 receivers-to-customers sunset; use `/customers` and `customer.*` events exclusively.

## Authentication

Every call needs a secret API key and an instance ID in the path:

```bash
curl --request GET \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers \
  --header 'Authorization: Bearer YOUR_API_KEY'
```

Keys are per instance. A **development** instance is the sandbox (testnets, simulated fiat, and USDB in place of USDC/USDT — see Chains and tokens below); a **production** instance moves real money. See [Sandbox vs production](references/essentials/sandbox-vs-production.md).

## The two core flows

Both flows are the same **quote-then-execute** pattern — the term BlindPay's own migration docs use throughout: create a quote, execute it before it expires, then track the result over webhooks.

### Payout: money out to a bank account

1. Accept Terms of Service → `tos_id`
2. Create a customer (KYC/KYB) → `re_...`, wait for `approved`
3. Add a bank account → `ba_...`
4. Create a payout quote → `qu_...`, single-use — see "quote expired" under Common errors; the destination is a `bank_account_id`, or a `payable_id` to pay a registered bill (boleto, PIX QR code or invoice — see [Payables](references/payables/payables.md))
5. Fund the payout: a managed wallet balance needs no signature; an external wallet needs authorization (ERC-20 `approve` on EVM, signed XDR on Stellar, token delegation on Solana)
6. Execute the payout → `po_...`, then track it over webhooks

Start at [Payouts](references/payouts/payouts.md).

### Payin: money in from a bank account

1. Accept Terms of Service → `tos_id`
2. Create a customer (KYC/KYB) → `re_...`, wait for `approved`
3. Pick a destination: managed wallet (`bl_...`), external blockchain wallet (`bw_...`), or issue a virtual account for standing deposits
4. Create a payin quote → `pq_...` — see "quote expired" under Common errors
5. Execute the payin → `pi_...` and show the payer the returned instructions (Pix code, CLABE, memo code, ACH/wire details)
6. Funds arrive, BlindPay delivers the stablecoin leg and fires webhooks

Start at [Payins](references/payins/payins.md).

## Main endpoints

All paths are prefixed with `https://api.blindpay.com/v1/instances/{instance_id}`.

| Resource | Endpoint |
| --- | --- |
| Customers | `/customers`, `/customers/{re}` |
| Terms of Service | `/e/instances/{instance_id}/tos` (public, no key) |
| Bank accounts | `/customers/{re}/bank-accounts` |
| Offramp wallets | `/customers/{re}/bank-accounts/{ba}/offramp-wallets` |
| Blockchain wallets | `/customers/{re}/blockchain-wallets`, `.../sign-message` |
| Managed wallets | `/customers/{re}/wallets`, `.../wallets/{bl}/balance` |
| Virtual accounts | `/customers/{re}/virtual-accounts` |
| Payout quotes | `/quotes` |
| Payouts | `/payouts/evm`, `/payouts/stellar`, `/payouts/solana`, `/payouts/stellar/authorize` |
| Payables | `/payables`, `/payables/{pb}` (paid via the payout flow: quote with `payable_id`) |
| Payin quotes | `/payin-quotes` |
| Payins | `/payins/evm` |
| Transfers | `/transfer-quotes`, `/transfers` |
| RFI and limits | `/customers/{re}/rfi`, `/customers/{re}/limit-increase` |
| Partner fees | `/partner-fees` |
| Webhooks | `/webhook-endpoints`, `.../{we}/secret` |
| Upload | `https://api.blindpay.com/v1/upload?instance_id={instance_id}` |

Amounts are always integers in minor units: `100000` is $1,000.00.

## ID prefixes

| Prefix | Resource |
| --- | --- |
| `in_` | Instance |
| `re_` | Customer (formerly receiver) |
| `ba_` | Bank account |
| `bw_` | External blockchain wallet |
| `bl_` | BlindPay-managed wallet |
| `pb_` | Payable (a registered bill) |
| `va_` | Virtual account |
| `qu_` | Payout quote |
| `po_` | Payout |
| `pq_` | Payin quote |
| `pi_` | Payin |
| `tr_` | Transfer |
| `pf_` | Partner fee |
| `we_` | Webhook endpoint |

## Payment methods

Ten bank transfer rails across the US, Brazil, Mexico, Colombia, Argentina, and Europe, plus international SWIFT. Country, currency, and direction (receive/send) per method, including PSE and SEPA's special cases: [Payment methods](references/kb/payment-methods.md). Settlement speed and cut-off times per rail: [Cut-off times](references/kb/cut-off-times.md).

## Chains and tokens

Seven chains: Ethereum, Polygon, Base, Arbitrum, Stellar, Solana, Tron (beta). A production instance sends real USDC/USDT on a mainnet network name (`ethereum`, `polygon`, `base`, `arbitrum`, `stellar`, `solana`, `tron`); a development instance sends **USDB** (BlindPay's test token) on the matching testnet — mismatched combinations are rejected. Which tokens exist on which chain, and the testnet network names, are the enums that gate every quote request: [Supported chains](references/kb/supported-chains.md) is the one place that stays current on them.

## Testing on a development instance

Set the quote's `request_amount` to a sentinel value to force an outcome:

| `request_amount` | Result |
| --- | --- |
| `66600` | `failed` |
| `77700` | `refunded` |
| anything else | `completed` (payins auto-complete about 30 seconds after creation) |

Create a customer with first name `Fail` to simulate a KYC rejection. To fund a test wallet with USDB, create a payin targeting it: on a development instance the payin auto-completes about 30 seconds after creation and delivers USDB into the wallet.

## Customer KYC statuses

Five `kyc_status` values gate what a customer can do: `verifying`, `approved`, `rejected`, `compliance_request`, `approved_rfi`. See [Customers](references/essentials/customers.md) for what triggers each and how long review takes, and [RFI](references/essentials/rfi.md) for the `compliance_request` / `approved_rfi` pair.

## Common errors

- `please_accept_terms_of_service`: the customer must accept the current TOS version
- quote expired: read `expires_at` — never assume a fixed window. Payin, payout, and transfer quotes default to 5 minutes, but OTC (BRL-only) payin quotes expire in 10 seconds and SEPA payout quotes may be shorter; create a new quote once expired. See [Quote expiry windows](references/kb/cut-off-times.md#quote-expiry-windows).
- insufficient balance or allowance: the wallet lacks funds, or the ERC-20 approval is below the quote amount
- KYC not approved: the customer hasn't reached `approved` yet — see Customer KYC statuses above for the full state list and RFI handling
- unsupported token/chain pairing: see [Supported chains](references/kb/supported-chains.md)

## Reference documentation

<!-- REFERENCE-INDEX -->
