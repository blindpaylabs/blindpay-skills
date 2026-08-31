# Invoice payables

Register a supplier invoice paid to a US bank account over ACH or wire, optionally prefilled by reading the PDF with AI.

Source: https://blindpay.com/docs/payable-invoice

An invoice payable is a bill paid to a US bank account in `USD`, over `ach` or `wire`. Nothing is resolved from a rail: you send the vendor's bank details and the invoice's line items, and the payable's `amount` is derived from them. To pay one afterwards, see [How to pay one](payables.md#how-to-pay-one).

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID, `re_000000000000` with your customer ID.

## Register an invoice

An invoice carries `from`/`to` parties, itemized charges and the vendor's bank details in `bank_account`. The object has the same shape as `POST /customers/{customer_id}/bank-accounts` (`type` must be `ach` or `wire`) and goes through the same validation. The account it creates belongs to the payable: it is not listed with the customer's bank accounts and cannot be quoted or used anywhere else (`bank_account_owned_by_payable`). `to.legal_name` is set to `bank_account.beneficiary_name`, which is what screening checks.

To prefill these fields from the invoice PDF, [read it with AI](#read-the-invoice-with-ai) first.

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/payables \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "customer_id": "re_000000000000",
  "from": {
    "legal_name": "Acme Inc",
    "address_line_1": "123 Main St",
    "city": "Austin",
    "state_province_region": "TX",
    "postal_code": "78701",
    "country": "US",
    "tax_id": "12-3456789"
  },
  "to": {
    "legal_name": "Northwind Cloud Services Inc",
    "country": "US"
  },
  "currency": "USD",
  "line_items": [
    { "name": "Consulting services", "quantity": 2, "price": 150000 },
    { "name": "Software license", "quantity": 1, "price": 50000 }
  ],
  "note": "August retainer",
  "discount": 10000,
  "taxes": 5000,
  "bank_account": {
    "type": "ach",
    "name": "Northwind Cloud Services Inc",
    "beneficiary_name": "Northwind Cloud Services Inc",
    "routing_number": "026009593",
    "account_number": "000123456789",
    "account_type": "checking",
    "account_class": "business",
    "recipient_relationship": "vendor_or_supplier",
    "address_line_1": "1 Market St",
    "city": "San Francisco",
    "state_province_region": "CA",
    "country": "US",
    "postal_code": "94105"
  },
  "document_file": "https://files-documents.blindpay.com/1712345678901-invoice.pdf",
  "due_date": "2026-09-01"
}'
```

```js [index.js]
const response = await fetch(
  'https://api.blindpay.com/v1/instances/in_000000000000/payables',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_id: 're_000000000000',
      from: {
        legal_name: 'Acme Inc',
        address_line_1: '123 Main St',
        city: 'Austin',
        state_province_region: 'TX',
        postal_code: '78701',
        country: 'US',
        tax_id: '12-3456789',
      },
      to: {
        legal_name: 'Northwind Cloud Services Inc',
        country: 'US',
      },
      currency: 'USD',
      line_items: [
        { name: 'Consulting services', quantity: 2, price: 150000 },
        { name: 'Software license', quantity: 1, price: 50000 },
      ],
      note: 'August retainer',
      discount: 10000,
      taxes: 5000,
      bank_account: {
        type: 'ach',
        name: 'Northwind Cloud Services Inc',
        beneficiary_name: 'Northwind Cloud Services Inc',
        routing_number: '026009593',
        account_number: '000123456789',
        account_type: 'checking',
        account_class: 'business',
        recipient_relationship: 'vendor_or_supplier',
        address_line_1: '1 Market St',
        city: 'San Francisco',
        state_province_region: 'CA',
        country: 'US',
        postal_code: '94105',
      },
      document_file: 'https://files-documents.blindpay.com/1712345678901-invoice.pdf',
      due_date: '2026-09-01',
    }),
  }
)

const payable = await response.json()
```

`line_items[].price` is the unit price in cents, so `150000` is $1,500.00. The response's `amount` is `345000`: `(2 × 150000) + (1 × 50000) + 5000 taxes - 10000 discount`.

The response (and every later read and webhook) carries a `bank_account` summary with `type`, `beneficiary_name`, `routing_number`, `account_number` and `account_type`. The account behind it belongs to the payable: it is not listed with the customer's bank accounts, cannot be read or deleted by id, and cannot be quoted on its own. Boleto and PIX payables return `bank_account: null`.

## Read the invoice with AI

The dashboard prefills the invoice form by reading the PDF with `POST /upload/extract`. The endpoint is not part of the SDK today and is limited to 60 requests per minute per instance; if you want it in your own integration, tell us.

It takes an invoice PDF or image and returns the fields above so you can prefill the request: `amount` (cents), `currency`, `due_date`, `invoice_number`, the `to` party, `line_items` and `payment_options`.

Invoices often print more than one way to pay, so `payment_options` has one entry per printed instruction block, ordered `ach`, `wire`, `international_swift`. Each carries its own `routing_number` and `account_number` (US rails) or `iban` and `swift_bic`, plus `account_type`, `beneficiary_name` and `bank_name`. Pick the option for the rail you want to pay with; ACH is the cheapest when the vendor accepts it.

Every field is nullable and nothing is guessed: a number that fails format validation comes back `null`, and an option with no usable number is dropped. The result is not a payable, it is input for one, and the person registering should confirm the bank fields against the document before submitting. Development instances return a fixed sample result.

```bash [cURL]
curl --request POST \
  --url 'https://api.blindpay.com/v1/upload/extract?instance_id=in_000000000000' \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --form 'file=@invoice.pdf'
```

Files sent to this endpoint are processed by our AI provider to read them and are not used to train models.

## Attach the document

A boleto or invoice payable can store the original file (PDF, JPG, PNG, WEBP or HEIC, up to 5MB). PIX payables cannot: a PIX code has no document, and `document_file` on one is rejected with `payable_document_not_allowed_for_pix`.

Upload the file first with `POST /upload` using bucket `documents`, then pass the returned `file_url` as `document_file` when registering the payable. The URL must be one your instance uploaded (`payable_document_invalid` otherwise). The document cannot be changed after registration.

`document_file` is returned on every payable read and webhook. To download it, call `POST /presign` with the URL to get a one-hour signed link.

## Related

- [Payables](payables.md): amount semantics, lifecycle, dedupe and webhooks
- [Boleto and PIX payables](payable-boleto-pix.md): bills registered from a code
- [Bank accounts](../payouts/bank-accounts.md): the `bank_account` object and its per-type fields
