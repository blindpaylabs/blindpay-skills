# Migrate to BlindPay

Move any existing integration to BlindPay — Anchorage Digital, BitGo, Bridge, Circle, Cobo, Coinbase CDP, Conduit, Crossmint, Dfns, Dynamic, Fern, Fireblocks, Privy, Turnkey, Utila, manual payouts, or SWIFT wires: one universal playbook plus per-provider concept mappings.

Source: https://blindpay.com/docs/migrations

Every migration to BlindPay is the same five moves; only the concept mapping changes per provider. This guide gives the universal playbook once, a copy-paste prompt for a coding agent, and a per-provider mapping section for each supported source. Find your provider under [Per-provider mappings](#per-provider-mappings) and read its table together with the playbook.

## The two migration shapes

**Full migration** — the old provider ran customers, KYC, bank accounts, and money movement end to end. Everything moves to BlindPay: customers, bank accounts, payins, payouts, virtual accounts, webhooks. Applies to: Bridge, Circle, Conduit, Fern, and the process migrations (manual payouts, SWIFT wires).

**Offramp-leg migration** — the old provider is a custody, wallet, or signing layer that stays in place. Only the stablecoin-to-fiat leg moves: BlindPay takes over payee onboarding, quotes, payouts, and settlement webhooks, sourcing funds from the provider-controlled wallet, which you register with BlindPay as an external wallet (`bw_`) via a sign-message challenge. Custody and signing never move. Applies to: Anchorage Digital, BitGo, Cobo, Coinbase CDP, Crossmint, Dfns, Dynamic, Fireblocks, Privy, Turnkey, Utila.

## The universal concept map

Whatever the provider calls things, the destination objects are the same:

| Source concept (any provider) | BlindPay concept |
| --- | --- |
| Customer, payee, counterparty, beneficiary, recipient | Customer (`re_`) with KYC/KYB |
| Bank details, external account, payment account | Bank account (`ba_`) typed per rail (Pix, SPEI, SEPA, ACH, RTP, wire, Transfers, SWIFT) |
| Crypto-to-fiat transfer, redemption, payout call | Payout quote (`qu_`) then payout (`po_`) |
| Fiat-to-crypto transfer, deposit that mints stablecoin | Payin quote (`pq_`) then payin (`pi_`) |
| Liquidation address, auto-converting deposit address | Offramp wallet |
| Deposit account, top-up address for fiat | Virtual account (`va_`) |
| Provider-hosted wallet holding balances | Managed wallet (`bl_`) |
| Provider-controlled wallet that keeps custody | External wallet (`bw_`), registered via sign-message challenge |
| Provider webhooks or status polling | Svix-signed webhooks (`customer.*`, `payin.*`, `payout.*`, `virtualAccount.*`, `wallet.inbound`), verified with `whsec_` |

Not everything carries over. KYC/KYB status **never** transfers between providers, and custody/signing infrastructure (vaults, MPC, policy engines) has no BlindPay equivalent — it stays on the old provider or gets retired. Flag anything in your own usage with no direct equivalent instead of guessing at a mapping, and record it in your migration report.

## The migration playbook

### 1. Inventory your current usage

Scan the codebase for every provider endpoint you call, every webhook you handle, and every stored provider ID. Derive the concept mapping from what you actually use — your provider's table under [Per-provider mappings](#per-provider-mappings) is the starting point, not an assumption of full coverage. Confirm provider mechanics against the provider's own docs rather than memory, and write down anything with no direct BlindPay equivalent before touching code.

### 2. Re-onboard customers

KYC does not transfer between providers, so plan for re-verification. For each customer: accept BlindPay's [terms of service](../essentials/terms-of-service.md), [create the customer](../essentials/customers.md) (`re_`), run KYC/KYB via [document upload](../essentials/upload.md), and add rail-specific [bank accounts](../payouts/bank-accounts.md) (`ba_`), tracking status through [webhooks](../essentials/webhooks.md). Sequence this ahead of cutover so approved customers are ready before any flow switches. Store the new IDs alongside the legacy provider IDs so both systems stay queryable during the transition.

### 3. Register external wallets, if custody stays

Offramp-leg migrations only: register each provider-controlled wallet address as a BlindPay [blockchain wallet](../payins/blockchain-wallets.md) (`bw_`) using the sign-message challenge flow, signed by the wallet the provider controls. Funds keep living where they are — the old provider holds and signs, BlindPay sources the payout from the registered wallet and handles only the fiat leg.

### 4. Rebuild money movement on quote-then-execute

BlindPay separates pricing from execution. Outbound: request a [payout quote](../payouts/payout-quotes.md), then execute the [payout](../payouts/payouts.md) before `expires_at` (about 5 minutes by default — always read the field). Inbound: request a [payin quote](../payins/payin-quotes.md), then create the [payin](../payins/payins.md); use [virtual accounts](../virtual-accounts/virtual-accounts.md) for standing deposits or [offramp wallets](../payouts/offramp-wallets.md) for auto-converting deposit addresses. Batch operations become individual per-destination calls. Store the new `qu_`, `po_`, `pq_`, `pi_` IDs alongside the legacy IDs for reconciliation.

### 5. Port webhooks

Replace provider webhook handlers and polling with BlindPay's [Svix-signed events](../essentials/webhooks.md): verify `svix-id`, `svix-timestamp`, and `svix-signature` against the raw request body with your `whsec_` secret, and dedup on `svix-id`. Check the [webhook event catalog](../essentials/webhooks-events.md) to confirm every provider event you consume has a BlindPay equivalent before cutting a flow over, and see [webhook verification](../essentials/webhooks-verification.md) for the signature mechanics.

### 6. Cut over per flow

Move each flow (payouts, payins, virtual accounts — or corridor by corridor) behind a feature flag one at a time. Dual-run: new activity goes through BlindPay while the old provider settles in-flight items, both webhook handlers stay live during the window, and the old path is retired only after a full settlement cycle completes with matching amounts and statuses.

## Copy-paste prompt

Paste this into your coding agent, replacing `<PROVIDER>` and the mapping line with your provider's section from this guide.

```text [Migration prompt]
You are migrating my application from <PROVIDER> to the BlindPay API. <If the provider keeps custody/wallets/signing, say so here: this migration targets only the stablecoin-to-fiat leg.>

Before writing code, read these sources and follow them over any prior knowledge:
- https://blindpay.com/docs/llms.txt (read the quickstarts, customers, bank accounts, quotes, payouts, payins, virtual accounts, and webhooks pages)
- The OpenAPI spec: curl https://api.blindpay.com/doc

Do the migration in this order:
1. Inventory my <PROVIDER> usage from the codebase: every endpoint, webhook handler, and stored provider ID. Derive the concept mapping from what we actually use, roughly: <paste the provider's mapping table rows from https://blindpay.com/docs/migrations>. Flag anything with no direct BlindPay equivalent instead of guessing, and confirm provider mechanics against the provider's own docs.
2. Re-onboard customers on BlindPay: terms of service, create customer (re_), KYC/KYB via document upload, add rail-specific bank accounts (ba_), driven by webhooks. KYC does not transfer between providers, so sequence re-verification ahead of cutover. Store new IDs alongside the legacy provider IDs.
3. If custody stays with <PROVIDER>, register each provider-controlled wallet with BlindPay through the external-wallet sign-message challenge (bw_) so BlindPay can source funds from it without moving custody.
4. Rebuild money movement on BlindPay's explicit two-step model: request a quote, then execute the payout or payin against it before expires_at. Store qu_, po_, pq_, pi_ IDs alongside the legacy IDs during the transition.
5. Port webhooks to BlindPay's Svix-signed events (customer.*, payin.*, payout.*, virtualAccount.*, wallet.inbound): verify svix-id, svix-timestamp, and svix-signature against the raw body with whsec_, dedup on svix-id, and confirm every provider event we consume has a BlindPay equivalent.
6. Cut over per flow behind a feature flag: dual-run with new activity on BlindPay while <PROVIDER> settles in-flight items, keep both webhook handlers live, and retire the old path only after a full settlement cycle matches on both sides.

Constraints:
- Develop against a BlindPay development instance first (USDB on testnets, KYC auto-approves), and exercise the $666.00 forced-failed and $777.00 forced-refunded sentinel amounts before production.
- Amounts are integer minor units on both sides of every conversion; never do money math in floating point.
- BlindPay API keys stay server-side only.
- Produce a written migration report before changing code: the mapping table, the gaps list, and the re-KYC plan.

Deliverables: the migration report, the re-onboarding script, the BlindPay client and money-movement code paths behind a flag, the webhook handlers, and a cutover checklist per flow.
```

## Before you cut over

- Develop and test against a [development instance](../essentials/instances.md) first: USDB on testnets, KYC auto-approves, and sentinel amounts `66600` (forced `failed`) and `77700` (forced `refunded`) let you test failure handling without real bank rails.
- Amounts are integer minor units. Check every place you format or parse a value; never do money math in floating point.
- Keep API keys server-side only, never in client code.
- Write the migration report — mapping table, gaps list, re-KYC plan — before you change any code.
- Sequence re-KYC ahead of cutover so customers are approved before a flow switches to BlindPay.
- Dual-run each flow through at least one full settlement cycle, including the sentinel failure and refund cases, before retiring the old path.

## Per-provider mappings

Each section: what stays on the old provider, and how its concepts map. The full standalone guide for each provider lives at `https://blindpay.com/docs/migrations/<slug>`.

### Anchorage Digital (`anchorage`)

Offramp-leg migration. Anchorage stays the custodian (Atlas settlement, API custody, Porto signing have no BlindPay equivalent); BlindPay replaces the transfer/withdrawal call that ends a payout flow.

| Anchorage concept | BlindPay concept |
| --- | --- |
| Payee or recipient record | Customer (`re_`) with KYC/KYB |
| Payee bank details | Bank account (`ba_`) for the payout rail |
| Vault or Porto wallet holding funds until payout | External wallet (`bw_`) via sign-message challenge |
| Transfer or withdrawal request | Quote (`qu_`) then payout (`po_`) |
| Transfer webhook or status polling | Svix-signed payout webhooks |

### BitGo (`bitgo`)

Offramp-leg migration. BitGo keeps custody and signing; qualified-custody and counterparty checks do not carry over — recipients need fresh KYC/KYB on BlindPay.

| BitGo concept | BlindPay concept |
| --- | --- |
| BitGo wallet / wallet ID | External wallet (`bw_`) via sign-message challenge |
| Send-transaction / transfer call | Quote (`qu_`) then payout (`po_`) |
| Go Network settlement call | Payout execution (`POST .../payouts/evm`) |
| Offramp / settlement partner integration | BlindPay payout rails (Pix, SPEI, SEPA, ACH, wire) |
| Payout recipient + payout rail | Customer (`re_`) + bank account (`ba_`) |
| Wallet webhooks (`transfer`, `pendingapproval`, `address_confirmation`), HMAC `x-signature-sha256` | Svix-signed events, verified with `whsec_` |

### Bridge (`bridge`)

Full migration: customers, external accounts, liquidation addresses, virtual accounts, and transfers all move.

| Bridge concept | BlindPay concept |
| --- | --- |
| Customer with KYC | Customer (`re_`) with KYC/KYB |
| External account | Bank account (`ba_`) with rail-specific type |
| Liquidation address | Offramp wallet |
| Virtual account | Virtual account (`va_`) |
| Fiat-to-crypto transfer | Payin (`pi_`) via quote |
| Crypto-to-fiat transfer | Quote (`qu_`) plus payout (`po_`) |
| Webhook event | Svix-signed webhook event |

### Circle (`circle`)

Full migration from Circle Mint, Circle Payouts, or the Circle Payments Network. Settling over local rails directly can remove intermediary banking steps some corridors needed.

| Circle concept | BlindPay concept |
| --- | --- |
| Beneficiary / recipient bank account | Customer (`re_`) plus bank account (`ba_`) |
| USDC redemption to fiat | Payout quote (`qu_`) then payout (`po_`) |
| Fiat deposit that mints USDC | Payin quote then payin (`pi_`) |
| Circle-hosted wallet | Managed wallet (`bl_`) |
| Webhook subscription | Svix-signed webhook event |

### Cobo (`cobo`)

Offramp-leg migration (wallets can stay in Cobo custody). Refund links and subscriptions have no BlindPay equivalent — rebuild that logic in your own application.

| Cobo concept | BlindPay concept |
| --- | --- |
| Payment order / order mode | Payin (`pi_`) or payout (`po_`) from a quote |
| Top-up address | Virtual account, or offramp wallet |
| Payout destination | Bank account (`ba_`) scoped to a customer (`re_`) and rail |
| Batch payouts | Individual payout calls per destination |
| Wallet ID (MPC or custodial), if Cobo keeps custody | External wallet (`bw_`) via sign-message challenge |
| Signed webhook callbacks | Svix-signed events, verified with `whsec_` |

### Coinbase CDP (`coinbase-cdp`)

Offramp-leg migration. CDP wallets and Server Wallets stay for custody and signing; BlindPay adds Pix, SPEI, SEPA, and wire where CDP Offramp had no coverage.

| Coinbase CDP concept | BlindPay concept |
| --- | --- |
| Offramp session token + hosted sell URL (pay.coinbase.com) | Quote (`qu_`) then payout (`po_`) |
| Cashout methods: ACH, PayPal, Coinbase balance | Bank account (`ba_`), plus Pix/SPEI/SEPA/wire |
| Coinbase's own KYC on the user's Coinbase account | Customer (`re_`) with KYC/KYB via document upload |
| `offramp.transaction.*` webhooks | Svix-signed `customer.*`, `payout.*`, `wallet.inbound` |
| `partnerUserRef`, `transactionId`, wallet addresses | Stored alongside the new IDs, not replaced |

### Conduit (`conduit`)

Full migration of a cross-border payments integration, corridor by corridor.

| Conduit concept | BlindPay concept |
| --- | --- |
| Counterparty or recipient | Customer (`re_`) with KYC/KYB |
| Recipient bank account | Bank account (`ba_`) typed per rail |
| Cross-border payment, fiat to stablecoin | Payin quote plus payin (`pi_`) |
| Cross-border payment, stablecoin to fiat | Payout quote (`qu_`) plus payout (`po_`) |
| Status updates | Svix-verified `customer.*`, `payout.*`, `payin.*` webhooks |

### Crossmint (`crossmint`)

Offramp-leg migration. Crossmint keeps wallets, checkout, and orchestration; if funds stay in Crossmint wallets, register each as an external wallet (`bw_`).

| Crossmint concept | BlindPay concept |
| --- | --- |
| Offramp customer + KYC | Customer (`re_`) with KYC/KYB |
| Bank account | Bank account (`ba_`) with rail-specific type |
| Payout request | Quote (`qu_`) then payout (`po_`) |
| Receiving/deposit address | Virtual account (`va_`) or offramp wallet |
| Offramp order and wallet transfer webhooks (`wallets.transfer.in/out`) | Svix-signed webhooks |

### Dfns (`dfns`)

Offramp-leg migration. Dfns keeps custody and MPC signing; BlindPay replaces exchange withdrawals (Kraken, Binance, Coinbase Prime) or a bolted-on ramp provider. Dfns webhook subscriptions stay untouched; BlindPay's webhooks are added alongside.

| Dfns concept | BlindPay concept |
| --- | --- |
| Wallet custody and MPC signing | Stays on Dfns, out of scope |
| Transfer Asset / broadcast transaction | Payout funding transfer, still signed from the Dfns wallet |
| Create Exchange / Exchange Withdrawal | Payout quote (`qu_`) then payout (`po_`), or an offramp wallet as deposit destination |
| Payee / counterparty | Customer (`re_`) with webhook-driven KYC/KYB |
| Dfns wallet ID used as funding source | External wallet (`bw_`) via sign-message challenge |
| Stored transfer or exchange-withdrawal record | `qu_` and `po_` IDs stored alongside |

### Dynamic (`dynamic`)

Offramp-leg migration. Dynamic stays for embedded and server wallets. Its funding surface is onramp-only — confirm in your codebase what actually handles stablecoin-to-fiat today (funding integration, third-party offramp, or manual flow) instead of assuming.

| Dynamic concept | BlindPay concept |
| --- | --- |
| Payee / end user | Customer (`re_`) with KYC/KYB |
| Payout destination (bank details on file) | Bank account (`ba_`) on the relevant rail |
| Embedded or server wallet sending the crypto leg | Registered wallet (`bw_`), used as `sender_wallet_address` |
| Funding integration or manual offramp flow | Quote (`qu_`) then payout (`po_`) |
| Funding completion webhook or polling | `payout.new`, `payout.update`, `payout.complete` webhooks |

### Fern (`fern`)

Full migration: customers, payment accounts, wallets, and the quote-and-transaction flow all move.

| Fern concept | BlindPay concept |
| --- | --- |
| Customer with KYC | Customer (`re_`) with KYC/KYB |
| Payment account / external bank account | Bank account (`ba_`) typed per rail |
| Wallet | Managed wallet (`bl_`) or registered wallet (`bw_`) |
| Quote (fiat leg) | Payin quote then payin (`pi_`) |
| Quote (stablecoin leg) | Payout quote (`qu_`) then payout (`po_`) |
| Transaction | Payin (`pi_`) or payout (`po_`) record |
| Webhooks | Svix-signed webhook events |

### Fireblocks (`fireblocks`)

Offramp-leg migration. Vault accounts, transactions, and whitelisted addresses stay on Fireblocks as the custody and signing layer.

| Fireblocks concept | BlindPay concept |
| --- | --- |
| Payee fiat account | Customer (`re_`) with KYC/KYB and bank accounts (`ba_`) |
| Payout instruction set (creation) | Quote (`qu_`) |
| Payout instruction set (execution) | Payout (`po_`) |
| Fireblocks-Signature / Fireblocks-Webhook-Signature verification | Svix-signed webhooks, verified with `whsec_` |
| Fireblocks-controlled wallet funding a payout | External wallet (`bw_`) via sign-message challenge |

### Manual payouts (`manual-payouts`)

Process migration: spreadsheets and bank-portal uploads become an automated, webhook-driven API flow. The human approval gate stays in your own pipeline, between the quote and the execute call.

| Manual payouts concept | BlindPay concept |
| --- | --- |
| Payee row in a spreadsheet or database | Customer (`re_`) |
| Bank details typed into a bank portal | Bank account (`ba_`) |
| Rate check before sending money | Quote (`qu_`) |
| Wire or batch sent through the bank portal | Payout (`po_`) |
| Ops person confirming the transfer | `payout.complete` webhook |
| Manual reconciliation spreadsheet | Reconciliation against payout statuses |

### Privy (`privy`)

Offramp-leg migration. Privy stays as the wallet layer; users keep stablecoins in Privy embedded or server wallets. Treat any current offramp mechanism you can't trace in the codebase as unconfirmed.

| Privy or offramp concept | BlindPay concept |
| --- | --- |
| Payee receiving the payout | Customer (`re_`) with KYC/KYB |
| Payee's payout destination | Bank account (`ba_`) on the relevant rail |
| Privy wallet sending to the offramp address | `sender_wallet_address` on a payout, registered as `bw_` from a signed challenge |
| Old offramp price / conversion step | Quote (`qu_`) |
| Old offramp transfer execution | Payout (`po_`) |
| Old offramp completion signal | `payout.new`, `payout.update`, `payout.complete` webhooks |

### SWIFT wires (`swift-wires`)

Process migration, corridor by corridor: same-day local-rail settlement replaces multi-day MT103 confirmations. Corridors BlindPay doesn't cover keep moving over SWIFT — `international_swift` is itself a supported rail.

| SWIFT wires concept | BlindPay concept |
| --- | --- |
| Beneficiary record | Customer (`re_`) with KYC/KYB |
| IBAN, BIC, and other wire fields | Bank account (`ba_`) on the local rail (Pix for BRL, SPEI for MXN, SEPA for EUR, ACH/RTP/wire for USD, Transfers for ARS) |
| Rate lock before sending a wire | Quote (`qu_`) |
| Wire initiation | Payout (`po_`) |
| Waiting on an MT103 confirmation | `payout.new`, `payout.update`, `payout.complete` webhooks |
| Manual reconciliation against SWIFT confirmations | Reconciliation against payout statuses |

### Turnkey (`turnkey`)

Offramp-leg migration. Turnkey keeps custody, signing (sign transaction / sign raw payload), and its policy engine; only the fiat rail on top of a signed transaction moves. Turnkey's activity webhooks stay; BlindPay's are added alongside.

| Turnkey concept | BlindPay concept |
| --- | --- |
| Sign transaction / sign raw payload backing a payout | Turnkey stays the signer |
| Wallet account / address funding payouts | External wallet (`bw_`), challenge signed by the Turnkey wallet |
| Payee or counterparty in your custom offramp | Customer (`re_`) |
| Payee bank details | Bank account (`ba_`) |
| Custom offramp payout call | Quote (`qu_`) then payout (`po_`) |
| Your own activity webhooks tied to a payout | Svix-signed `customer.*`, `payout.*`, `wallet.inbound` |

### Utila (`utila`)

Offramp-leg migration. Vaults, transaction initiation, the policy engine, and the co-signer stay on Utila; recipients need BlindPay's own KYC/KYB before their first payout.

| Utila concept | BlindPay concept |
| --- | --- |
| Wallet (custody address) | External wallet (`bw_`) via sign-message challenge |
| Address book entry tagged for offramp | Bank account (`ba_`) once the recipient is onboarded |
| Recipient KYC / policy approval | Customer (`re_`) with its own KYC/KYB |
| `transactions_initiatetransaction` (fiat leg) | Quote (`qu_`) then payout (`po_`) |
| Transaction resource name | Stored alongside `qu_` and `po_` |
| Webhook (`x-utila-signature`, `TRANSACTION_STATE_UPDATED`) | Svix-signed `customer.*`, `payout.*`, `wallet.inbound` |

## Related docs

- [Customers](../essentials/customers.md)
- [Bank accounts](../payouts/bank-accounts.md)
- [Payout quotes](../payouts/payout-quotes.md)
- [Payouts](../payouts/payouts.md)
- [Payins](../payins/payins.md)
- [Blockchain wallets](../payins/blockchain-wallets.md)
- [Offramp wallets](../payouts/offramp-wallets.md)
- [Virtual accounts](../virtual-accounts/virtual-accounts.md)
- [Webhooks](../essentials/webhooks.md)
- [Development instances](../essentials/instances.md)
