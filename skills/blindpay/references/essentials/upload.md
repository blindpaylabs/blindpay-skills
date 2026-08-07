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

## Related

- [Analyze Document](analyze-document.md) · [Customers](customers.md) · [KYC Basics](../kb/kyc-basics.md)
