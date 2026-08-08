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

## Upload a file

You can check the required fields in the [BlindPay API Docs](https://api.blindpay.com/reference#tag/upload/POST/v1/upload).

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
