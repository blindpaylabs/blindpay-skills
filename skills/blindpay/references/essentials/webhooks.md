# Webhooks

Receive real-time events for customers, payments, virtual accounts, wallets, and transfers instead of polling the API.

Source: https://blindpay.com/docs/learn/webhooks

A webhook is an HTTP callback that BlindPay sends to your server when something changes: a payin completes, a customer is created, a virtual account is approved. Subscribe once and receive every event as it happens, instead of polling the API for status.

Webhooks are configured per [instance](instances.md). You can register up to 25 endpoints on the same instance if you want to split traffic across services.

## Create a webhook

Register your endpoint URL on the instance. The URL must be `https`; local or private addresses are rejected. Pass an empty `events` array to receive every event, or list specific events to subscribe to only those.

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID.

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/webhook-endpoints \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "url": "https://example.com/webhook",
    "events": []
  }'
```

The response returns the endpoint ID (`we_...`). To verify the signatures on incoming calls, fetch the endpoint's signing secret:

```bash [cURL]
curl --request GET \
  --url https://api.blindpay.com/v1/instances/in_000000000000/webhook-endpoints/we_000000000000/secret \
  --header 'Authorization: Bearer YOUR_API_KEY'
```

This returns `{ "key": "whsec_..." }`; see [Verification](webhooks-verification.md) for how to use it.

You can also manage endpoints from the [BlindPay dashboard](https://app.blindpay.com), under the instance's **Webhooks** tab.

For quick testing before you have a real handler, point the endpoint at [webhook.cool](https://webhook.cool/): it gives you a temporary URL that logs every incoming request so you can inspect a payload first.

**Abstracted flavor (bank-rails framing, fiat-first API surface)**

### Key events for the Abstracted flavor

Working with the Abstracted flavor, you will listen most often to:

- `virtualAccount.complete`: the account is approved and ready to receive deposits
- `payin.complete`: a deposit arrived and settled
- `payout.complete`: a bank transfer was sent, failed, or was refunded

See [Events](webhooks-events.md) for the full catalog.

**Advanced flavor (stablecoin and blockchain mechanics)**

### Key events for stablecoin

Working with the stablecoin flavor, you will listen most often to:

- `wallet.inbound`: stablecoins were deposited into a managed wallet
- `payin.complete`: fiat was received and stablecoins were delivered
- `payout.complete`: stablecoins were pulled and fiat was sent

See [Events](webhooks-events.md) for the full catalog.

**Note:**

Every webhook call is signed. Verify the `svix-id`, `svix-timestamp`, and `svix-signature` headers before trusting a payload; see Verification for the full process.

## In this section

- [Events](webhooks-events.md): the full event catalog, payload shapes, and when each one fires
- [Verification](webhooks-verification.md): how to verify the signature headers on every call

## Related

- [Instances](instances.md): webhooks are configured per instance
- [API keys](api-keys.md): authenticate the rest of the API alongside your webhook endpoint
- [Partner fees](partner-fees.md): how partner fee tracking fields appear on payin/payout webhooks
- [Payin quickstart](../getting-started/quickstart-payin.md): see webhooks in a full payment flow
- [Payout quickstart](../getting-started/quickstart-payout.md): see webhooks in a payout flow
