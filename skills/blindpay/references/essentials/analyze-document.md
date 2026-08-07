# Analyze document

Read a KYC document with AI and get an approval-rate signal before you submit it.

Source: https://blindpay.com/docs/learn/analyze-document

## What it is

Analyze Document reads a PDF, JPG, or PNG with AI, checks it against the rules for its document type, and returns an `approval_rate` of `low`, `medium`, or `high` plus a short reason. Use it to pre-screen customer documents before submitting them for KYC, so you can prompt for a better file early instead of waiting for a rejection.

The analysis is a signal, not a decision. It does not approve or reject KYC; the official outcome still comes from the verification flow.

## Prerequisites

**Before you start:**

1. Create an account at https://app.blindpay.com/sign-up
2. Create a development instance (see essentials/instances.md)
3. Create your API key (see essentials/api-keys.md)

## Document types

Pass the `type` that matches the document. It selects the rule set used for the analysis.

| Type                     | Use for                                                    |
| ------------------------ | ---------------------------------------------------------- |
| `identity_document`      | National ID, driver's license, or residence permit         |
| `passport`               | Passport                                                   |
| `selfie`                 | Selfie / liveness photo                                    |
| `proof_of_address`       | Utility bill, bank statement, or lease as proof of address |
| `incorporation_document` | Company incorporation / registration document              |
| `proof_of_ownership`     | Proof of company ownership                                 |
| `source_of_funds`        | Source of funds evidence                                   |
| `proof_of_income`        | Proof of income                                            |
| `bank_statement`         | Bank statement                                             |
| `financial_statement`    | Company financial statement                                |
| `tax_return`             | Tax return                                                 |
| `invoice`                | Invoice                                                    |
| `transaction_document`   | Transaction supporting document                            |

## Optional metadata

Pass `metadata` as a JSON string of values you already collected to cross-check them against the document. A clear mismatch caps the rating at `low` and the reason explains it.

| Field                       | Checked against                                         |
| --------------------------- | ------------------------------------------------------- |
| `full_name`                 | Name on the document                                    |
| `entity_name`               | Company name on the document                            |
| `date_of_birth`             | Date of birth on the document                           |
| `address`                   | Address on the document                                 |
| `id_number`                 | ID / document number                                    |
| `requested_per_transaction` | Capacity shown supports the per-transaction limit (USD) |
| `requested_daily`           | Capacity shown supports the daily limit (USD)           |
| `requested_monthly`         | Capacity shown supports the monthly limit (USD)         |

**Note:**

Only send fields you have already collected. Name, entity, date of birth, address, and ID are matched against the document; requested limits are checked for sufficient capacity, with non-USD amounts converted at a reasonable rate.

## Analyze a document

You can check the required fields in the [BlindPay API Docs](https://api.blindpay.com/reference#tag/upload/POST/v1/upload/analyze).

The file must be a PDF, JPG, or PNG of up to 5MB. The real format is detected from the file contents, so a mislabeled extension is rejected.

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID.

Each tab shows the `type` with the metadata fields that fit it. The file should be a standard [File](https://developer.mozilla.org/en-US/docs/Web/API/File) format.

```bash [Identity document]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=identity_document' \
  --form 'metadata={"full_name":"Jane Doe","date_of_birth":"1990-01-01","id_number":"123456789"}' \
  --form 'file=your_file.pdf'
```

```bash [Passport]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=passport' \
  --form 'metadata={"full_name":"Jane Doe","date_of_birth":"1990-01-01","id_number":"A12345678"}' \
  --form 'file=your_file.pdf'
```

```bash [Selfie]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=selfie' \
  --form 'metadata={"full_name":"Jane Doe"}' \
  --form 'file=your_file.jpg'
```

```bash [Proof of address]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=proof_of_address' \
  --form 'metadata={"full_name":"Jane Doe","address":"123 Main St, Miami, FL 33101"}' \
  --form 'file=your_file.pdf'
```

```bash [Incorporation document]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=incorporation_document' \
  --form 'metadata={"entity_name":"Acme Inc","id_number":"12-3456789"}' \
  --form 'file=your_file.pdf'
```

```bash [Proof of ownership]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=proof_of_ownership' \
  --form 'metadata={"entity_name":"Acme Inc","full_name":"Jane Doe"}' \
  --form 'file=your_file.pdf'
```

```bash [Source of funds]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=source_of_funds' \
  --form 'metadata={"full_name":"Jane Doe","requested_monthly":"50000"}' \
  --form 'file=your_file.pdf'
```

```bash [Proof of income]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=proof_of_income' \
  --form 'metadata={"full_name":"Jane Doe","requested_monthly":"20000"}' \
  --form 'file=your_file.pdf'
```

```bash [Bank statement]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=bank_statement' \
  --form 'metadata={"full_name":"Jane Doe","requested_monthly":"30000"}' \
  --form 'file=your_file.pdf'
```

```bash [Financial statement]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=financial_statement' \
  --form 'metadata={"entity_name":"Acme Inc","requested_monthly":"500000"}' \
  --form 'file=your_file.pdf'
```

```bash [Tax return]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=tax_return' \
  --form 'metadata={"full_name":"Jane Doe","id_number":"123-45-6789"}' \
  --form 'file=your_file.pdf'
```

```bash [Invoice]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=invoice' \
  --form 'metadata={"entity_name":"Acme Inc","requested_per_transaction":"10000"}' \
  --form 'file=your_file.pdf'
```

```bash [Transaction document]
curl 'http://localhost:8787/v1/upload/analyze?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'type=transaction_document' \
  --form 'metadata={"entity_name":"Acme Inc","requested_per_transaction":"25000"}' \
  --form 'file=your_file.pdf'
```

The response tells you how confident the analysis is and why:

```json
{
  "approval_rate": "high",
  "description": "Recent utility bill issued within the last 3 months, name and full address clearly legible."
}
```

## Related

- [Upload](upload.md) · [Customers](customers.md) · [KYC Basics](../kb/kyc-basics.md)
