# Upload

Generate encrypted file URLs from customer KYC documents and pictures.

Source: https://blindpay.com/docs/learn/upload

## What it is

Upload generates file URLs from your customers' KYC documents and pictures. BlindPay encrypts them before sharing with vendors and saving them in our database, helping you stay compliant with data protection laws.

## Prerequisites

**Before you start:**

1. Create an account at https://app.blindpay.com/sign-up
2. Create a development instance (see essentials/instances.md)
3. Create your API key (see essentials/api-keys.md)

## Buckets

Pass the `bucket` that matches what you are uploading. Any caller can target any bucket; BlindPay does not restrict which bucket a given role may use.

| Bucket | Use for | Accepted formats |
| --- | --- | --- |
| `avatar` | Customer or company profile picture | JPEG, PNG, WEBP, HEIC/HEIF |
| `onboarding` | KYC documents (identity, proof of address, incorporation, etc.) | JPEG, PNG, WEBP, HEIC/HEIF, PDF |
| `limit_increase` | Supporting document for a [limit increase](limit-increase.md) request | JPEG, PNG, WEBP, HEIC/HEIF, PDF |
| `documents` | Payable attachments (invoice or boleto file) | JPEG, PNG, WEBP, HEIC/HEIF, PDF |

Every bucket enforces the same 5MB maximum. A file whose actual bytes don't match its declared content type is rejected with `file_type_not_allowed`, even if the extension and MIME type look right.

## Upload a file

You can check the required fields in the [BlindPay API Docs](https://api.blindpay.com/reference#tag/upload/POST/v1/upload).

`instance_id` also controls how the request must be authenticated, the same as on [Analyze Document](analyze-document.md) and Extract Invoice: pass it to authenticate with an API key scoped to that instance, or omit it to authenticate with a BlindPay dashboard session instead.

**Warning:**

If you omit `instance_id`, the file is tagged internally with the literal string `avatar` instead of a real instance, and you will not be able to presign it later with your actual `instance_id`. Always pass `instance_id` unless the file will never need to be presigned.

Calling this endpoint (or Analyze Document / Extract Invoice) with an API key also requires your instance to have finished onboarding: a key for an instance still mid-onboarding gets `onboarding_incomplete`, and a blocked instance (for example, a billing hold) gets `instance_blocked`.

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID.

```bash [cURL]
curl 'http://localhost:8787/v1/upload?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'bucket=onboarding' \
  --form 'file=your_file.pdf' # this file should be a standard File format, please see more: https://developer.mozilla.org/en-US/docs/Web/API/File
```

**Note:**

Success! Use the `file_url` returned by the API to populate the required document URLs when [creating a customer](customers.md#create-a-customer).

HEIC/HEIF images are converted to JPEG before storage, and every PDF is sanitized: embedded JavaScript, auto-open actions, embedded files, and interactive form scripts are stripped, and any bytes appended after the file's original end-of-file marker are dropped. A PDF that cannot be parsed or safely sanitized is rejected with `file_type_not_allowed` rather than stored as-is. The file you later download via a signed URL is not always byte-identical to what you uploaded.

The name you upload is not preserved as-is either: BlindPay strips everything except letters, digits, hyphens, underscores, and dots from it, then prefixes it with an upload timestamp, for example `1712345678901-invoice.pdf`. Do not rely on the original filename being recoverable from the stored file.

`file_url` points at one of several BlindPay-hosted domains, depending on which bucket you uploaded to (you may see `files.blindpay.com` for one bucket and `files-documents.blindpay.com` for another). Don't assume every `file_url` shares the same host: treat it as opaque and pass it back exactly as received to `POST /presign` or to a document field like `document_file`.

## Open an uploaded file

Files are stored in a private bucket, so the `file_url` returned by the upload is not directly downloadable. To open a file, exchange its `file_url` for a presigned URL: a temporary link that grants read access for 1 hour.

You can check the required fields in the [BlindPay API Docs](https://api.blindpay.com/reference#tag/upload/POST/v1/presign).

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID.

```bash [cURL]
curl 'http://localhost:8787/v1/presign?instance_id=in_000000000000' \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
    "file_url": "https://files.blindpay.com/1712345678901-document.pdf"
  }'
```

The response contains the temporary link and when it stops working:

```json
{
  "file_url": "https://files.blindpay.com/1712345678901-document.pdf?Expires=...&Signature=...&Key-Pair-Id=...",
  "expires_at": "2026-01-01T13:00:00.000Z"
}
```

**Note:**

- `file_url` must be a BlindPay file URL returned by the upload endpoint. Any other URL is rejected with `file_url_invalid`.
- You can only presign files that were uploaded with your `instance_id`. Requesting another instance's file returns `403`.
- The presigned URL expires after 1 hour and this is not configurable. Request a new one whenever you need to open the file again; do not store it.

## Related

- [Analyze Document](analyze-document.md) · [Customers](customers.md) · [KYC Basics](../kb/kyc-basics.md)
