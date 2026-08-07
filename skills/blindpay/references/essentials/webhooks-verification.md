# Webhook verification

Verify the signature on every BlindPay webhook call using the svix-id, svix-timestamp, and svix-signature headers.

Source: https://blindpay.com/docs/learn/webhooks-verification

Every webhook call BlindPay sends is signed so you can confirm it actually came from BlindPay and was not tampered with in transit. Verify the signature before you act on any payload.

## Headers

| Header | Description |
| --- | --- |
| `svix-id` | Unique message identifier. Stays the same across redelivery attempts of the same event, so you can use it to deduplicate. |
| `svix-timestamp` | Signing timestamp, in seconds since the Unix epoch. |
| `svix-signature` | Space-delimited list of signatures, each prefixed with a version tag (for example `v1,`). |

## Verification process

### 1. Construct the signed content

Concatenate the message ID, the timestamp, and the raw request body with `.` between each part:

```javascript
const signedContent = `${svixId}.${svixTimestamp}.${body}`
```

Use the exact raw body bytes received on the wire. Re-serializing the parsed JSON can reorder keys or change whitespace, which invalidates the signature.

### 2. Compute the expected signature

Your signing secret has the form `whsec_<base64>`. Take the part after the underscore, base64-decode it into raw bytes, and use those bytes as the HMAC-SHA256 key:

```javascript
const crypto = require('node:crypto')

const secretBytes = Buffer.from(secret.split('_')[1], 'base64')

const expectedSignature = crypto
  .createHmac('sha256', secretBytes)
  .update(signedContent)
  .digest('base64')
```

### 3. Compare against the header, in constant time

`svix-signature` can contain more than one signature (for example during secret rotation), space-delimited, each with a `v1,` version prefix:

```
v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE= v1,bYCGmRKsaKWcsNccKXlIktD0/rAvfW3dJ/X/qxh=
```

Strip the `v1,` prefix from each candidate and compare it against your computed signature with a constant-time comparison, not `===`. Accept the request if any candidate matches:

```javascript
const signatures = svixSignature
  .split(' ')
  .map(sig => sig.split(',')[1])

const isValid = signatures.some(sig =>
  crypto.timingSafeEqual(
    Buffer.from(sig, 'base64'),
    Buffer.from(expectedSignature, 'base64'),
  ),
)
```

### 4. Check the timestamp tolerance

Compare `svix-timestamp` against your own system clock and reject the request if it falls outside a tolerance window (5 minutes is a reasonable default). This blocks replay attacks that resend a previously valid, captured payload.

```javascript
const toleranceInSeconds = 5 * 60
const now = Math.floor(Date.now() / 1000)

if (Math.abs(now - Number(svixTimestamp)) > toleranceInSeconds) {
  throw new Error('Webhook timestamp outside tolerance window')
}
```

**Warning:**

Never modify the request body before verification. Even reformatting whitespace or reordering keys invalidates the signature.

## Full example

**Note:**

Get your signing secret from the BlindPay dashboard: open your instance, go to the **Webhooks** tab, click the ellipsis button next to your endpoint, and select **Get secret**.

```javascript [verify.js]
const crypto = require('node:crypto')

function verifyWebhook(secret, payload, svixId, svixTimestamp, svixSignature) {
  const toleranceInSeconds = 5 * 60
  const now = Math.floor(Date.now() / 1000)

  if (Math.abs(now - Number(svixTimestamp)) > toleranceInSeconds) {
    throw new Error('Webhook timestamp outside tolerance window')
  }

  const signedContent = `${svixId}.${svixTimestamp}.${payload}`
  const secretBytes = Buffer.from(secret.split('_')[1], 'base64')

  const expectedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64')

  const signatures = svixSignature.split(' ').map(sig => sig.split(',')[1])

  const isValid = signatures.some((sig) => {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(sig, 'base64'),
        Buffer.from(expectedSignature, 'base64'),
      )
    }
    catch {
      return false
    }
  })

  if (!isValid) {
    throw new Error('Invalid webhook signature')
  }

  return true
}

// Example values
const secret = 'whsec_plJ3nmyCDGBKInavdOK15jsl'
const payload = '{"webhook_event":"payin.complete","id":"pi_000000000000"}'
const svixId = 'msg_loFOjxBNrRLzqYUf'
const svixTimestamp = '1731705121'
const svixSignature = 'v1,rAvfW3dJ/X/qxhsaXPOyyCGmRKsaKWcsNccKXlIktD0='

verifyWebhook(secret, payload, svixId, svixTimestamp, svixSignature)
```

```bash [cURL]
# Verification happens in your handler code, not at request time.
# This shows the raw headers your endpoint receives on every call.
curl -X POST https://your-endpoint.example.com/webhooks \
  --header 'svix-id: msg_loFOjxBNrRLzqYUf' \
  --header 'svix-timestamp: 1731705121' \
  --header 'svix-signature: v1,rAvfW3dJ/X/qxhsaXPOyyCGmRKsaKWcsNccKXlIktD0=' \
  --data '{"webhook_event":"payin.complete","id":"pi_000000000000"}'
```

## Retries and replaying events

If your endpoint does not respond with a `2xx` status, BlindPay retries delivery with backoff over the following hours. `svix-id` stays the same across retries of the same event, so use it to deduplicate on your side if you process the payload more than once.

You can inspect every event BlindPay has sent to your endpoint, including delivery attempts and response codes, and manually replay any event from the dashboard.

Go to the **Webhooks** tab, then open **Events dashboard**:

![BlindPay dashboard webhook events and replay screen](https://pub-4fabf5dd55154f19a0384b16f2b816d9.r2.dev/webhook_debug.jpg)

Replaying an event resends the exact original payload with a new delivery attempt. It does not create a new business event, so it is safe to use for backfilling a webhook handler you just fixed.

## Related

- [Webhooks](webhooks.md): create an endpoint and get your signing secret
- [Events](webhooks-events.md): the full event catalog and payload shapes
- [API keys](api-keys.md): authenticate the rest of the API alongside your webhook endpoint
- [Payin quickstart](../getting-started/quickstart-payin.md): see webhooks in a full payment flow
- [Payout quickstart](../getting-started/quickstart-payout.md): see webhooks in a payout flow
