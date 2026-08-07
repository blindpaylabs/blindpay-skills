# Customers

People or businesses that send or receive payments and stablecoins through BlindPay.

Source: https://blindpay.com/docs/learn/customers

## What it is

A customer is an individual or business entity designated to interact with BlindPay. You can attach multiple bank accounts, blockchain wallets, and [BlindPay-managed wallets](../wallets/wallets.md) to a customer.

## How it works

For compliance and regulatory requirements, **every customer on your platform must be registered as a customer in BlindPay**. This is mandatory for transaction tracking and reporting. If any of your customers operate as money transmitters (entities that transfer funds on behalf of others), they must also register their end customers as customers in the system. This multi-level registration ensures complete transparency throughout the payment chain.

Every customer must complete a KYC process to verify their identity before sending or receiving funds.

### Required fields

We collect the following data per customer `type` (business, individual) and `kyc_type` (standard, enhanced). Fields marked with `*` are **optional**.

**KYC/B Standard**

| Individual                                               | Business                                                                                 |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| First name                                               | Legal name                                                                               |
| Last name                                                | Tax ID (government id number)                                                            |
| Date of birth                                            | Formation date                                                                           |
| Email                                                    | Email                                                                                    |
| Country                                                  | Country                                                                                  |
| Tax ID (government id number)                            | Doing business as\*                                                                      |
| Phone number                                             | Website\*                                                                                |
| IP Address                                               | IP Address                                                                               |
| Country                                                  | Country                                                                                  |
| Address 1                                                | Address 1                                                                                |
| Address 2\*                                              | Address 2\*                                                                              |
| City                                                     | City                                                                                     |
| State/province/region                                    | State/province/region                                                                    |
| Postal code                                              | Postal code                                                                              |
| ID Document - Country                                    | UBOS + Shareholders above 25% (everything from Standard KYC but no Phone and IP Address) |
| ID Document - Type (passport, id card, drivers license)  | Company Formation Document                                                               |
| ID Document - Front                                      | Proof of Ownership Document                                                              |
| ID Document - Back\*                                     | Proof of Address - Type\*                                                                |
| Proof of Address - Type (utility bill, bank statement)\* | Proof of Address - Document\*                                                            |
| Proof of Address - Document\*                            |                                                                                          |
| Selfie File                                              |                                                                                          |

**KYC Enhanced** — everything from KYC/B Standard, plus:

| Individual                          |
| ----------------------------------- |
| Source of Funds Document Type       |
| Source of Funds Document File       |
| Purpose of Transactions             |
| Purpose of Transactions Explanation |

**Note:**

All customers from [high risk countries](../kb/supported-countries.md#high-risk-countries) must go through Enhanced KYC. Enhanced KYC individuals are manually verified by BlindPay's compliance team — this can take up to 1 business day and may require additional documents.

For document quality and submission guidelines, see [KYC Basics](../kb/kyc-basics.md#document-quality).

### Review timeline

| Verification Type | Review Timeline            |
| ----------------- | -------------------------- |
| KYC Standard      | ~60 seconds                |
| KYC Enhanced      | 3 hours to 1 business day  |
| KYB Standard      | 3 hours to 1 business day  |

### Statuses

Every customer has a KYC status indicating the current state of their verification:

- **`verifying`**: KYC is being processed
- **`approved`**: KYC verified and approved
- **`rejected`**: KYC rejected
- **`compliance_request`**: compliance team opened a [Request for Information](rfi.md) and is waiting for additional documents or clarifications; the customer is paused
- **`approved_rfi`**: the customer is approved and fully operational, but has an open [Request for Information](rfi.md#approved-with-an-open-rfi) they still need to answer

On creation the status is `verifying`. The update timeline depends on the KYC type:

- **KYC Standard**: after ~60 seconds the status typically becomes `approved` or `rejected` automatically. When our compliance team needs to review manually, it stays `verifying` until they decide.
- **KYC Enhanced & KYB Standard**: always require manual review, so the status stays `verifying` until review completes.

When KYC is rejected, BlindPay returns feedback in the `kyc_warnings` or `fraud_warnings` field explaining what to correct. To retry after a rejection, create a brand new customer with corrected information — you cannot update an existing customer's KYC information.

### Limits

Transfer limits are calculated on the stablecoin amount transferred. Each customer has separate limits for payouts (sending) and payins (receiving).

|                 | KYC Standard | KYB Standard | KYC Enhanced |
| --------------- | ------------ | ------------ | ------------ |
| Per transaction | US$ 10,000   | US$ 30,000   | US$ 50,000   |
| Daily           | US$ 50,000   | US$ 100,000  | US$ 100,000  |
| Monthly         | US$ 100,000  | US$ 250,000  | US$ 500,000  |

**Warning:**

**Note**: These limits are set for compliance purposes and can be increased upon submission of additional documentation. See [Limit increase](limit-increase.md) for the full flow.

## Prerequisites

**Before you start:**

1. Create an account at https://app.blindpay.com/sign-up
2. Create a development instance (see essentials/instances.md)
3. Create your API key (see essentials/api-keys.md)
4. Accept the Terms of Service and get your `tos_id` (see essentials/terms-of-service.md)

## Create a customer

You can check the required fields in the [BlindPay API Docs](https://api.blindpay.com/reference#tag/customers/POST/v1/instances/{instance_id}/customers).

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID.

```bash [Standard KYC]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "tos_id": "<replace_with_your_tos_id>",
    "type": "individual",
    "kyc_type": "standard",
    "email": "email@example.com",
    "tax_id": "12345678",
    "address_line_1": "8 The Green",
    "address_line_2": "#12345",
    "city": "Dover",
    "state_province_region": "DE",
    "country": "US",
    "postal_code": "02050",
    "ip_address": "127.0.0.1",
    "phone_number": "+13022006100",
    "proof_of_address_doc_type": "UTILITY_BILL",
    "proof_of_address_doc_file": "https://pub-4fabf5dd55154f19a0384b16f2b816d9.r2.dev/v4-460px-Get-Proof-of-Address-Step-3-Version-2.jpg.jpeg",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1998-01-01T00:00:00Z",
    "id_doc_country": "US",
    "id_doc_type": "PASSPORT",
    "id_doc_front_file": "https://pub-4fabf5dd55154f19a0384b16f2b816d9.r2.dev/1000_F_365165797_VwQbNaD4yjWwQ6y1ENKh1xS0TXauOQvj.jpg",
    "selfie_file": "https://pub-4fabf5dd55154f19a0384b16f2b816d9.r2.dev/selfie.png"
  }'
```

```bash [Enhanced KYC]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "tos_id": "<replace_with_your_tos_id>",
    "type": "individual",
    "kyc_type": "enhanced",
    "email": "email@example.com",
    "tax_id": "123456788",
    "address_line_1": "8 The Green",
    "address_line_2": "#12345",
    "city": "Dover",
    "state_province_region": "DE",
    "country": "US",
    "postal_code": "02050",
    "ip_address": "127.0.0.1",
    "phone_number": "+13022006100",
    "proof_of_address_doc_type": "UTILITY_BILL",
    "proof_of_address_doc_file": "https://pub-4fabf5dd55154f19a0384b16f2b816d9.r2.dev/v4-460px-Get-Proof-of-Address-Step-3-Version-2.jpg.jpeg",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1998-01-01T00:00:00Z",
    "id_doc_country": "US",
    "id_doc_type": "PASSPORT",
    "id_doc_front_file": "https://pub-4fabf5dd55154f19a0384b16f2b816d9.r2.dev/1000_F_365165797_VwQbNaD4yjWwQ6y1ENKh1xS0TXauOQvj.jpg",
    "selfie_file": "https://pub-4fabf5dd55154f19a0384b16f2b816d9.r2.dev/selfie.png",
    "source_of_funds_doc_file": "https://pub-4fabf5dd55154f19a0384b16f2b816d9.r2.dev/source-of-funds.jpg",
    "source_of_funds_doc_type": "business_income",
    "purpose_of_transactions": "business_transactions",
    "purpose_of_transactions_explanation": "I am using the money for my personal expenses."
  }'
```

```bash [Standard KYB]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "tos_id": "<replace_with_your_tos_id>",
    "type": "business",
    "kyc_type": "standard",
    "email": "test@blindpay.com",
    "tax_id": "123456",
    "address_line_1": "8 The Green",
    "city": "Dover",
    "state_province_region": "DE",
    "country": "US",
    "postal_code": "19901",
    "phone_number": "+13022006336",
    "proof_of_address_doc_type": "UTILITY_BILL",
    "proof_of_address_doc_file": "https://files.blindpay.com/1767022801827-icon.png",
    "legal_name": "Test Inc.",
    "alternate_name": "Test",
    "formation_date": "2000-01-01T00:00:00.000Z",
    "website": "https://test.com",
    "owners": [
      {
        "role": "beneficial_controlling",
        "title": "CEO",
        "ownership_percentage": 100,
        "first_name": "John",
        "last_name": "Doe",
        "date_of_birth": "2000-01-01T00:00:00.000Z",
        "tax_id": "GC200075",
        "address_line_1": "5th Avenue",
        "city": "Manhattan",
        "state_province_region": "NY",
        "country": "US",
        "postal_code": "",
        "id_doc_country": "US",
        "id_doc_type": "PASSPORT",
        "id_doc_front_file": "https://files.blindpay.com/1767022774904-blindpay-square.svg",
        "proof_of_address_doc_type": "UTILITY_BILL",
        "proof_of_address_doc_file": "https://files.blindpay.com/1767022787021-icon.png"
      }
    ],
    "incorporation_doc_file": "https://files.blindpay.com/1767022793017-icon.png",
    "proof_of_ownership_doc_file": "https://files.blindpay.com/1767022796322-icon.png"
  }'
```

### Testing scenarios

By default all customers created in `development` instances are automatically approved. To test a rejection, use `Fail` as the first name (individuals) or legal name (businesses).

## Related

- [Wallets](../wallets/wallets.md) · [Bank Accounts](../payouts/bank-accounts.md) · [Blockchain Wallets](../payins/blockchain-wallets.md)
- [KYC Basics](../kb/kyc-basics.md) · [Requests for Information](rfi.md)
