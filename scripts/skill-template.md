---
name: blindpay
description: Use when integrating with BlindPay for bank payouts and payins, stablecoin on-ramp and off-ramp, customer KYC/KYB, bank accounts, virtual accounts, managed and blockchain wallets, transfers, partner fees, or webhooks.
license: MIT
metadata:
  author: blindpay
  version: "2.0"
  tags: payments, stablecoin, crypto, fiat, payout, payin, usdc, usdt, virtual-accounts, webhooks
---

# BlindPay Integration

BlindPay is a global payment API. One integration covers bank rails (ACH, wire, RTP, SWIFT, Pix, SPEI, ACH COP, Transfers 3.0, SEPA) and stablecoins (USDC, USDT) across seven chains. Every payment settles through stablecoins under the hood, and BlindPay is a non-custodial processor: funds stay under the customer's control, and failed transactions are returned to the originating wallet or bank account.

The docs come in two flavors and the reference files keep both, marked inline:

- **Abstracted flavor**: bank-rails framing. Virtual accounts, payins as deposits, payouts as bank transfers. BlindPay handles the stablecoin leg.
- **Advanced flavor**: stablecoin framing. Managed and external wallets, chains and tokens, on-chain authorization, cross-chain transfers.

Both run on the same API, keys, instances and webhooks. When answering, pick the flavor that matches what the user is building.

## Terminology

`receiver` was renamed to **customer**. The API path is `/customers`, IDs still start with `re_`. Older integrations may use `/receivers`; new code should use `/customers`.

## Authentication

Every call needs a secret API key and an instance ID in the path:

```bash
curl --request GET \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers \
  --header 'Authorization: Bearer YOUR_API_KEY'
```

Keys are per instance. A **development** instance is the sandbox (testnets, USDB test token, simulated fiat); a **production** instance moves real money. See [Sandbox vs production](references/essentials/sandbox-vs-production.md).

## The two core flows

### Payout: money out to a bank account

1. Accept Terms of Service → `tos_id`
2. Create a customer (KYC/KYB) → `re_...`, wait for `approved`
3. Add a bank account → `ba_...`
4. Create a payout quote → `qu_...` (valid 5 minutes)
5. Fund the payout: a managed wallet balance needs no signature; an external wallet needs authorization (ERC-20 `approve` on EVM, signed XDR on Stellar, token delegation on Solana)
6. Execute the payout → `po_...`, then track it over webhooks

Start at [Payouts](references/payouts/payouts.md).

### Payin: money in from a bank account

1. Accept Terms of Service → `tos_id`
2. Create a customer (KYC/KYB) → `re_...`, wait for `approved`
3. Pick a destination: managed wallet (`bl_...`), external blockchain wallet (`bw_...`), or issue a virtual account for standing deposits
4. Create a payin quote → `pq_...` (valid 5 minutes)
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
| Payouts | `/payouts`, `/payouts/evm`, `/payouts/stellar`, `/payouts/stellar/authorize` |
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
| `qu_` | Payout quote |
| `po_` | Payout |
| `pq_` | Payin quote |
| `pi_` | Payin |
| `tr_` | Transfer |
| `pf_` | Partner fee |
| `we_` | Webhook endpoint |

## Payment methods

| Method | Country | Currency | Direction |
| --- | --- | --- | --- |
| `international_swift` | Global | USD | Send |
| `ach` | United States | USD | Receive + send |
| `wire` | United States | USD | Receive + send |
| `rtp` | United States | USD | Send |
| `pix` | Brazil | BRL | Receive + send |
| `spei_bitso` | Mexico | MXN | Receive + send |
| `ach_cop_bitso` | Colombia | COP | Send |
| PSE | Colombia | COP | Receive |
| `transfers_bitso` | Argentina | ARS | Receive + send |
| `sepa` | Europe (SEPA zone) | EUR | Send |

Pix, SPEI and Transfers settle in minutes; RTP is instant; ACH, wire, ACH COP and SEPA take 1-2 business days; SWIFT up to 5. See [Cut-off times](references/kb/cut-off-times.md).

## Chains and tokens

| Chain | Mainnet | Testnet (development) | Mainnet tokens |
| --- | --- | --- | --- |
| Ethereum | `ethereum` | `sepolia` | USDC, USDT |
| Polygon | `polygon` | `polygon_amoy` | USDC, USDT |
| Base | `base` | `base_sepolia` | USDC |
| Arbitrum | `arbitrum` | `arbitrum_sepolia` | USDC |
| Stellar | `stellar` | `stellar_testnet` | USDC |
| Solana | `solana` | `solana_devnet` | USDC, USDT |
| Tron (beta) | `tron` | none | USDT |

A production instance can only use USDC or USDT on a mainnet; a development instance can only use **USDB** (BlindPay's test token) on a testnet. Mismatched combinations are rejected. See [Supported chains](references/kb/supported-chains.md).

## Testing on a development instance

Set the quote's `request_amount` to a sentinel value to force an outcome:

| `request_amount` | Result |
| --- | --- |
| `66600` ($666.00) | `failed` |
| `77700` ($777.00) | `refunded` |
| anything else | `completed` (payins auto-complete about 30 seconds after creation) |

Create a customer with first name `Fail` to simulate a KYC rejection. Mint USDB from the dashboard (EVM) or the mint endpoints (Stellar, Solana).

## Customer KYC statuses

`verifying`, `approved`, `rejected`, `compliance_request` (an RFI is open and the customer is paused), `approved_rfi` (operational with an open RFI). Standard KYC clears in about 60 seconds; enhanced KYC and KYB take 3 hours to 1 business day. See [Customers](references/essentials/customers.md) and [RFI](references/essentials/rfi.md).

## Common errors

- `please_accept_terms_of_service`: the customer must accept the current TOS version
- quote expired: payout and payin quotes live 5 minutes, transfer quotes 15 seconds; create a new one
- insufficient balance or allowance: the wallet lacks funds, or the ERC-20 approval is below the quote amount
- KYC not approved: the customer is still `verifying`, `rejected`, or paused by an RFI
- unsupported token/chain pairing: check the chain table above

## Reference documentation

<!-- REFERENCE-INDEX -->
