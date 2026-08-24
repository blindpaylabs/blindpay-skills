# Bank accounts

Add recipient bank accounts BlindPay pays out to, across SWIFT, ACH, wire, RTP, Pix, SPEI, ACH COP, Transfers, and SEPA rails.

Source: https://blindpay.com/docs/bank-accounts

**Abstracted flavor (bank-rails framing, fiat-first API surface)**

A bank account represents the recipient details BlindPay pays out to when you execute a payout. A customer can hold multiple bank accounts, and you can add bank accounts that belong to someone other than the customer.

**Advanced flavor (stablecoin and blockchain mechanics)**

A bank account represents the recipient details BlindPay pays out to when a payout converts a customer's stablecoin balance to fiat. A customer can hold multiple bank accounts, and you can add bank accounts that belong to someone other than the customer.

**Note:**

You can add **third-party bank accounts**: a customer named "John" can have a payout sent to a bank account belonging to "Jack". Set `recipient_relationship` to anything other than `first_party` to skip the name-match check.

## How it works

All bank account data must be valid, even on development instances. Validation (regex, length, country rules) runs the same way regardless of instance type; only the downstream provider submission is skipped in development.

### Supported payout rails

| `type` | Country | Estimated time of arrival |
| --- | --- | --- |
| `international_swift` | Global | ~5 business days |
| `ach` | United States | ~2 business days |
| `wire` | United States | ~1 business day |
| `rtp` | United States | instant |
| `pix` | Brazil | instant |
| `spei_bitso` | Mexico | instant |
| `ach_cop_bitso` | Colombia | ~1 business day |
| `transfers_bitso` | Argentina | instant |
| `sepa` | Europe (SEPA zone) | ~1 business day |

**Note:**

High transaction volumes may affect estimated payout delivery times.

### Required fields per type

| Type | Required fields | Notes |
| --- | --- | --- |
| `international_swift` | `name`, `account_class`, `recipient_relationship`, `swift_code_bic`, `swift_account_holder_name`, `swift_account_number_iban`, full beneficiary address, full bank address | See International SWIFT rules below |
| `ach` | `name`, `recipient_relationship`, `beneficiary_name`, `routing_number`, `account_number`, `account_type`, `account_class`, `address_line_1`, `city`, `state_province_region`, `country`, `postal_code` | Blocked for `light` KYC customers |
| `wire` | Same as `ach` | Blocked for `light` KYC customers |
| `rtp` | Same as `wire` | `routing_number` must be RTP-eligible. Blocked for `light` KYC customers |
| `pix` | `name`, `pix_key` | `pix_key` can be a CPF, CNPJ, phone, email, or random key |
| `spei_bitso` | `name`, `spei_protocol`, `spei_clabe`, `beneficiary_name` | `spei_institution_code` required for `debitcard`/`phonenum` protocols |
| `ach_cop_bitso` | `name`, `ach_cop_beneficiary_first_name`, `ach_cop_beneficiary_last_name`, `ach_cop_document_id`, `ach_cop_document_type`, `ach_cop_email`, `ach_cop_bank_code`, `ach_cop_bank_account`, `account_type` | |
| `transfers_bitso` | `name`, `transfers_type`, `transfers_account`, `beneficiary_name` | `transfers_type` is `CVU`, `CBU`, or `ALIAS` |
| `sepa` | `name`, `account_class`, `sepa_iban`, `sepa_beneficiary_bic`, `sepa_beneficiary_legal_name`, `sepa_beneficiary_address_line_1`, `sepa_beneficiary_city`, `sepa_beneficiary_postal_code`, `sepa_beneficiary_country` | The IBAN's country code must match `sepa_beneficiary_country`. Some destinations are individual-only; see [Payment methods](../kb/payment-methods.md#sepa-destinations) |

`account_type` is `checking` or `saving`. `account_class` is `individual` or `business`. `recipient_relationship` accepts `first_party`, `employee`, `independent_contractor`, `vendor_or_supplier`, `subsidiary_or_affiliate`, `merchant_or_partner`, `customer`, `landlord`, `family`, or `other`.

## Prerequisites

**Before you start:**

1. Create an account at https://app.blindpay.com/sign-up
2. Create a development instance (see essentials/instances.md)
3. Create your API key (see essentials/api-keys.md)

You also need a [customer](../getting-started/overview.md) who has completed KYC.

## Add a bank account

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID, `re_000000000000` with your customer ID.

```bash [🌎 International SWIFT]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers/re_000000000000/bank-accounts \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "type": "international_swift",
  "name": "Display Name",
  "account_class": "business",
  "swift_code_bic": "EXAMPLECHXXX",
  "swift_account_holder_name": "Example Beneficiary GmbH",
  "swift_account_number_iban": "CH4008735681787160333",
  "swift_beneficiary_address_line_1": "75 Example Strasse",
  "swift_beneficiary_country": "CN",
  "swift_beneficiary_city": "ZUG",
  "swift_beneficiary_state_province_region": "ZG",
  "swift_beneficiary_postal_code": "8008",
  "swift_bank_name": "Example Bank, N.A.",
  "swift_bank_address_line_1": "18-20 Example Lane",
  "swift_bank_address_line_2": "PO BOX 3941",
  "swift_bank_country": "CN",
  "swift_bank_city": "GENEVA",
  "swift_bank_state_province_region": "GE",
  "swift_bank_postal_code": "1221",
  "recipient_relationship": "vendor_or_supplier",
  "swift_payment_code": "cn_swift_cgoddr"
}'
```

```bash [🇺🇸 ACH]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers/re_000000000000/bank-accounts \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "type": "ach",
  "name": "Display Name",
  "beneficiary_name": "Jane Doe",
  "routing_number": "121000358",
  "account_number": "3211237578",
  "account_type": "checking",
  "account_class": "individual",
  "address_line_1": "Rua Jose Pena Medina, 150",
  "address_line_2": "Apt 902",
  "city": "Vila Velha",
  "state_province_region": "ES",
  "country": "BR",
  "postal_code": "29101320",
  "recipient_relationship": "first_party"
}'
```

```bash [🇺🇸 Wire]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers/re_000000000000/bank-accounts \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "type": "wire",
  "name": "Display Name",
  "beneficiary_name": "JANE DOE",
  "routing_number": "026073008",
  "account_number": "8211239565",
  "account_class": "individual",
  "address_line_1": "5 Penn Plaza",
  "city": "NY",
  "state_province_region": "NY",
  "country": "US",
  "postal_code": "10001",
  "recipient_relationship": "first_party"
}'
```

```bash [🇺🇸 RTP]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers/re_000000000000/bank-accounts \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "type": "rtp",
  "name": "Display Name",
  "beneficiary_name": "JANE DOE",
  "routing_number": "026073008",
  "account_number": "8211239565",
  "account_class": "individual",
  "address_line_1": "5 Penn Plaza",
  "city": "NY",
  "state_province_region": "NY",
  "country": "US",
  "postal_code": "10001",
  "recipient_relationship": "first_party"
}'
```

```bash [🇧🇷 Pix]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers/re_000000000000/bank-accounts \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "type": "pix",
  "name": "Display Name",
  "pix_key": "<Replace this>"
}'
```

```bash [🇲🇽 SPEI]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers/re_000000000000/bank-accounts \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "type": "spei_bitso",
  "name": "Display Name",
  "beneficiary_name": "<Replace this>",
  "spei_protocol": "<Replace this>",
  "spei_institution_code": "<Replace this>",
  "spei_clabe": "<Replace this>"
}'
```

```bash [🇨🇴 ACH COP]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers/re_000000000000/bank-accounts \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "type": "ach_cop_bitso",
  "name": "Display Name",
  "account_type": "checking",
  "ach_cop_beneficiary_first_name": "<Replace this>",
  "ach_cop_beneficiary_last_name": "<Replace this>",
  "ach_cop_document_id": "<Replace this>",
  "ach_cop_document_type": "<Replace this>",
  "ach_cop_email": "<Replace this>",
  "ach_cop_bank_code": "<Replace this>",
  "ach_cop_bank_account": "<Replace this>"
}'
```

```bash [🇦🇷 Transfers 3.0]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers/re_000000000000/bank-accounts \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "type": "transfers_bitso",
  "name": "Display Name",
  "beneficiary_name": "<Replace this>",
  "transfers_type": "<Replace this>",
  "transfers_account": "<Replace this>"
}'
```

```bash [🇪🇺 SEPA]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers/re_000000000000/bank-accounts \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "type": "sepa",
  "name": "Display Name",
  "account_class": "individual",
  "sepa_iban": "DE89370400440532013000",
  "sepa_beneficiary_bic": "COBADEFFXXX",
  "sepa_beneficiary_legal_name": "<Replace this>",
  "sepa_beneficiary_address_line_1": "<Replace this>",
  "sepa_beneficiary_city": "<Replace this>",
  "sepa_beneficiary_postal_code": "<Replace this>",
  "sepa_beneficiary_country": "DE"
}'
```

Save the bank account ID (`ba_...`) for use in payout quotes.

## Connect with Plaid

**Note:**

This feature is gated by `subscription_features.plaid` on the instance. Contact BlindPay to enable it. Calling the endpoint below without it enabled returns a 400 `plaid_not_supported` error.

Instead of entering ACH details manually, a customer can connect their bank account through Plaid. BlindPay reads the verified routing and account numbers directly from Plaid, so there's no manual entry and no micro-deposit wait. The resulting bank account is `type: "ach"`, carries the timestamp `plaid_connected_at`, and can fund an ACH payin by pull instead of a manual bank transfer; see [Payins](../payins/payins.md#pull-funding-from-a-plaid-connected-account).

There is a single endpoint. It returns a `hosted_link_url`; send the customer there and BlindPay does the rest.

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID, `re_000000000000` with your customer ID.

```bash [Create link]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers/re_000000000000/bank-accounts/plaid \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json'
```

The call returns `{ "link_token": "...", "expiration": "...", "hosted_link_url": "..." }`. Open `hosted_link_url` in a browser tab or an external webview - Plaid Hosted Link cannot be embedded in an iframe.

When the customer finishes, Plaid notifies BlindPay and the bank account is created automatically, one per account the customer selected. All the identity fields on it (beneficiary name, address, tax id) come from the customer record, never from the bank connection, so the account is always first party. Listen to the `bankAccount.new` webhook, or poll [List bank accounts](https://api.blindpay.com/reference#tag/bank-accounts/GET/v1/instances/{instance_id}/customers/{customer_id}/bank-accounts){target="_blank"}, to know when it is available.

The same connection is never turned into two bank accounts, even if Plaid redelivers the notification.

**Note:**

BlindPay never returns or stores the Plaid access token in plaintext anywhere reachable from the API, logs, or webhook payloads.

## International SWIFT rules

International SWIFT accounts have extra country-conditional required fields.

**Business accounts**

- `business_industry` (NAICS code) is required when the customer or account class is `"business"`.

**Individual customers**

- `tax_id` must be the local tax ID for the beneficiary's country (for example, CPF for Brazil, SSN for the US). It is validated and formatted per country where required.

**Phone number**

- `phone_number` is required when the beneficiary's country is one of: BR, CN, CO, HK, MY, MX, PH, UG, UY.

**Tax ID**

- `tax_id` is required when the beneficiary's country is one of: AR, BY, BR, CL, CN, CO, CR, EC, GT, HN, JP, KZ, KR, MX, PK, PE, PH, RU, TH, UY.

**Note:**

For international SWIFT payouts, compliance documents are collected after the payout is created, not at quote creation time. The payout is placed `on_hold` until the required documents are submitted and approved.

## Response fields

The response includes the bank account `id` (`ba_...`), `type`, and the fields you submitted. `account_number` is masked in responses, showing only the last 4 digits.

## Related

**Abstracted flavor (bank-rails framing, fiat-first API surface)**

- [Payouts](payouts.md): create a payout quote and execute a payout to this bank account
- [Payout quotes](payout-quotes.md): lock the rate and fee before paying out
- [Virtual accounts](../virtual-accounts/virtual-accounts.md): a customer's dedicated deposit account
- [Cut-off times](../kb/cut-off-times.md): settlement windows by payment rail
- [Webhooks](../essentials/webhooks.md): `bankAccount.new` fires on create

**Advanced flavor (stablecoin and blockchain mechanics)**

- [Payouts](payouts.md): create a payout quote and execute a payout to this bank account
- [Payout quotes](payout-quotes.md): lock the rate and fee before paying out
- [Managed wallet](../wallets/store.md): the stablecoin balance payouts pull from
- [Cut-off times](../kb/cut-off-times.md): settlement windows by payment rail
- [Webhooks](../essentials/webhooks.md): `bankAccount.new` fires on create
