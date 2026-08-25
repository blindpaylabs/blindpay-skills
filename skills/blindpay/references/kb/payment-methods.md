# Payment methods

Every bank transfer rail BlindPay supports, by country and currency: ACH, wire, RTP, SWIFT, Pix, SPEI, PSE, Transfers, and SEPA.

Source: https://blindpay.com/docs/kb/payment-methods

BlindPay supports bank transfers over local rails in the US, Brazil, Mexico, Colombia, Argentina, and Europe, plus international SWIFT globally. Each payment method moves money in one or both directions: **receive** (a payin, money coming into BlindPay) and **send** (a payout, money going out to a bank account).

| Payment method | Country/Region | Currency | Direction |
| --- | --- | --- | --- |
| International SWIFT | 🌎 Global | USD | Receive + send |
| ACH | 🇺🇸 United States | USD | Receive + send |
| Domestic Wire | 🇺🇸 United States | USD | Receive + send |
| RTP | 🇺🇸 United States | USD | Receive + send |
| Pix | 🇧🇷 Brazil | BRL | Receive + send |
| SPEI | 🇲🇽 Mexico | MXN | Receive + send |
| PSE | 🇨🇴 Colombia | COP | Receive |
| ACH Colombia | 🇨🇴 Colombia | COP | Send |
| Transfers 3.0 | 🇦🇷 Argentina | ARS | Receive + send |
| SEPA | 🇪🇺 Europe (SEPA zone) | EUR | Send |

**Note:**

On the receive side, US payments arrive either into a customer's own [virtual account](../virtual-accounts/virtual-accounts.md) or into BlindPay's bank details with a `memo_code`. Alternatively, an ACH payin can pull the funds directly from a bank account the customer connected through [Plaid](../payouts/bank-accounts.md#connect-with-plaid), skipping the manual transfer entirely; see [Payins](../payins/payins.md#pull-funding-from-a-plaid-connected-account).

## SEPA destinations

SEPA payouts in EUR are available to bank accounts in:

Albania, Andorra, Austria, Belgium, Bulgaria, Croatia, Cyprus, Czechia, Denmark, Estonia, Finland, France, Germany, Greece, Holy See, Hungary, Iceland, Ireland, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Moldova, Monaco, Montenegro, Netherlands, North Macedonia, Norway, Poland, Portugal, Romania, San Marino, Slovakia, Slovenia, Spain, Sweden, Switzerland, and the United Kingdom.

**Note:**

SEPA payouts to Austria, Estonia, Finland, France, Lithuania, Norway, and Portugal are currently limited to individual beneficiaries (`account_class: individual`).

## Settlement and cut-offs

How fast each rail settles, and the daily cut-offs for ACH, wire, and SWIFT, are covered in [Cut-off times](cut-off-times.md). As a rule of thumb: Pix, SPEI, and Transfers settle in minutes; RTP is instant; ACH, wire, ACH Colombia, and SEPA take about 1-2 business days; SWIFT can take up to 5 business days.

## Related

- [Supported countries](supported-countries.md): which countries customers can onboard from
- [Bank transfer in](../payins/payins.md): payin quotes and what to show the payer
- [Pay out to bank](../payouts/payouts.md): adding bank accounts and sending payouts
- [Cut-off times](cut-off-times.md): settlement windows and processing cut-offs per rail
