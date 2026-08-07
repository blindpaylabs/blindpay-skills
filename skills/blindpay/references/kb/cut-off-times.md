# Cut-off times

ACH, wire, and SWIFT cut-offs and settlement, instant rails, quote expiry windows, onboarding SLAs, and refund timing.

Source: https://blindpay.com/docs/kb/cut-off-times

Requests submitted after a payment method's daily cut-off are processed the next business day. Business days exclude weekends, US federal holidays, and applicable international banking holidays.

**Note:**

The cut-off and settlement windows below describe the underlying ACH, wire, and SWIFT processing networks in general. They are not the same as BlindPay's end-to-end ETAs for a specific payin or payout, which also include BlindPay's own processing time. For payin arrival windows see [Bank transfer in](../payins/payins.md); for payout ETAs by bank account type see [Pay out to bank](../payouts/payouts.md).

## ACH

| Method | Cut-off (ET) | Estimated settlement |
| --- | --- | --- |
| ACH | 9:00 PM | 1-3 business days |
| Same-Day ACH | 3:00 PM | Same business day |

**Note:**

For US payments, customers with an enabled [virtual account](../virtual-accounts/virtual-accounts.md) see their own account details displayed to the payer. Customers without a virtual account get a unique `memo_code` plus BlindPay's bank account details for the transaction. The memo code is ignored once a virtual account is approved.

## Wire and SWIFT

| Type | Cut-off (ET) | Estimated settlement |
| --- | --- | --- |
| Domestic wire | 3:00 PM | Same business day |
| International SWIFT | 10:30 AM | Up to 5 business days |

SWIFT payouts carry extra country-conditional required fields (a NAICS `business_industry` code for business accounts, a local `tax_id` for the beneficiary's country, and `phone_number` for certain countries). See [Pay out to bank](../payouts/payouts.md) for the full field list per country.

## Instant methods

These rails settle in minutes rather than business days, both for payins (money coming in) and payouts (money going out):

| Method | Currency | Country | Payin arrival | Payout `type` value |
| --- | --- | --- | --- | --- |
| Pix | BRL | Brazil | Up to 5 minutes | `pix` |
| SPEI (CLABE) | MXN | Mexico | Up to 10 minutes | `spei_bitso` |
| Transfers (CBU) | ARS | Argentina | Up to 10 minutes | `transfers_bitso` |
| PSE | COP | Colombia | Up to 10 minutes | (payin only; payout equivalent is `ach_cop_bitso`) |

**Note:**

On the payout side, `ach_cop_bitso` (Colombia) settles in around 1 business day, not instantly. High transaction volumes may affect estimated delivery times on any rail.

In development, every payin auto-completes about 30 seconds after initiation, regardless of payment method.

## Currency minimums

Payin quotes enforce a minimum and maximum `request_amount` (minor units) per currency. Most currencies share the same bounds, but COP's minimum is far higher in raw minor units, reflecting its much smaller nominal value per unit:

| Currency | Minimum | Maximum |
| --- | --- | --- |
| USD | $10.00 | $100,000 |
| BRL | R$10.00 | R$100,000 |
| ARS | $10.00 | $100,000 |
| MXN | $10.00 | $100,000 |
| EUR | €10.00 | €100,000 |
| **COP** | **$2,000.00** | $100,000 |

**Note:**

Thresholds are enforced at quote-creation time and can change; treat the min/max as "varies by currency, the quote enforces it" rather than hardcoding these numbers in your integration. Payin methods without an approved virtual account (`ach`, `wire`) are additionally capped at $500,000 per transaction.

## Quote expiry windows

Every quote has a limited lifetime. Read `expires_at` from the response rather than assuming a fixed TTL, since some rails can return a shorter window.

| Quote type | Default expiry | Notes |
| --- | --- | --- |
| Payin quote | 5 minutes | OTC (BRL-only) payin quotes expire in **10 seconds** instead |
| Payout quote | 5 minutes | May be **shorter** for SEPA payout quotes, since the underlying rail's own deadline can be tighter than 5 minutes |
| Transfer quote | 5 minutes | Fixed; transfers execute immediately after creation |

**Warning:**

`expires_at` is returned in **epoch milliseconds**, not seconds. Divide by 1000 only if your date library expects seconds.

## Onboarding SLAs

| Service | Timeline |
| --- | --- |
| New instance creation | Up to 3 business days |
| KYC Standard | About 60 seconds (automated) |
| KYC Enhanced | 3 hours to 1 business day (manual review) |
| KYB Standard | 3 hours to 1 business day (manual review) |
| Virtual account: compliance review | Part of overall review |
| Virtual account: bank review | Varies by banking partner and account type; typically several business days |
| Limit increase review | Reviewed on submission of supporting documents |

For a limit increase review, the accepted supporting documents are:

- **Individuals:** bank statement, tax return, or proof of income
- **Businesses:** bank statement, financial statements, or tax return

KYC Standard customers are typically auto-approved or auto-rejected after about 60 seconds. If the compliance team needs to review manually, the customer stays in `verifying` until they decide. KYC Enhanced and KYB Standard always require manual review.

Virtual accounts go through a two-stage review: compliance review (`pending_review`) followed by bank review (`verifying`), before reaching `approved` or `rejected`. In development, virtual accounts auto-approve. If the bank requests additional documents during its review, the SLA clock restarts from the date the new documents are submitted.

## Compliance holds

Certain transactions or onboarding steps may be held for compliance review. Common triggers:

- First-time withdrawals or unusual activity patterns
- Large transaction amounts relative to a customer's history
- Sanctions or watchlist screening matches
- Customers from high-risk countries (always routed to Enhanced KYC, manual review)
- Open [requests for information](kyc.md) on a customer (status `compliance_request`, which cannot stack, only one RFI is open at a time)

While a hold is open, the related customer, payin, payout, or virtual account stays in a pending or verifying state until compliance clears it. A payout can also land `on_hold` for manual review after crypto has already been collected from the sender; this applies to all USD ACH/Wire/RTP/SWIFT payouts, not only risk-flagged ones, and can take up to 30 days to resolve.

## Failed or refunded transactions

A payin or payout may fail or be refunded if:

- Beneficiary or bank account details are incorrect
- The receiving bank rejects the payment
- The receiving account is closed or restricted
- Compliance requirements are not met

Refund timing depends on which side of the rail the funds are on:

- **Stablecoin refunds** (the blockchain wallet side) process immediately, since BlindPay is non-custodial and funds simply return to the originating wallet.
- **Fiat refunds** are credited once the funds are returned from the banking network, which depends on that bank's own processing time. Fees may apply to fiat refunds.

**Note:**

In development, force these outcomes on a payin or payout by setting `request_amount` to `66600` ($666.00, forces `failed`) or `77700` ($777.00, forces `refunded`).

## Related

- [Bank transfer in](../payins/payins.md): payin payment methods and arrival windows
- [Pay out to bank](../payouts/payouts.md): payout bank account types and ETAs
- [Payin quotes](../payins/payin-quotes.md): creating and consuming a payin quote before its expiry
- [Virtual accounts](../virtual-accounts/virtual-accounts.md): virtual account review stages and statuses
- [KYC requirements](kyc.md): verification levels, required fields, and limits
