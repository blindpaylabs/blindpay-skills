# API keys

Authenticate all BlindPay API requests with an instance-scoped API key created in the dashboard.

Source: https://blindpay.com/docs/learn/api-keys

An API key authenticates your requests to the BlindPay API. Each key is scoped to a single instance: a key created for one instance will not work against another, and a key created on a development instance will not work against a production instance.

**Before you start:**

1. Create an account at https://app.blindpay.com/sign-up
2. Create a development instance (see essentials/instances.md)

## Create an API key

Go to the [BlindPay dashboard](https://app.blindpay.com), select an instance, and open the **API Keys** tab.

![BlindPay dashboard API Keys tab](https://pub-4fabf5dd55154f19a0384b16f2b816d9.r2.dev/api_keys.jpg)

**Warning:**

Keys are shown once at creation. Copy and store them securely: you cannot retrieve the key value again after leaving the creation screen. The dashboard only ever displays a short prefix of the key afterward, for identification purposes.

Creating a key requires a dashboard (user) session; it cannot be done from an existing API key. This prevents a compromised key from minting new keys for itself.

## Authenticate requests

Pass the key as a bearer token in every request:

```bash [cURL]
curl https://api.blindpay.com/v1/instances/in_000000000000/customers \
  --header 'Authorization: Bearer YOUR_API_KEY'
```

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID.

**Note:**

Done. Authenticate all requests by passing the header `Authorization: Bearer YOUR_API_KEY`.

## Security best practices

- Never expose API keys in client-side code, mobile apps, or version control.
- Use environment variables to inject keys at runtime instead of hardcoding them.
- Rotate keys immediately if you suspect a key has been compromised: delete the old key and create a new one in the dashboard. There is no separate rotate endpoint; delete and recreate is the only path, and deleting a key revokes it immediately.
- Use separate keys per environment: one for development, one for production. Keys created on a development instance will not work against a production instance, and vice versa.
- Keys accept an IP whitelist at creation time via the API if your integration calls the API from a fixed set of servers.

## Key types

The dashboard currently creates one type of key, with full read and write access to the instance. A restricted or read-only key type with scoped permissions is not yet available, so every key for an instance carries the same level of access. Keep this in mind when deciding who on your team gets a key, since there is no way to limit a given key to, for example, read-only access.

## Related

- [Instances](instances.md): each API key is scoped to one instance
- [Sandbox vs. production](sandbox-vs-production.md): use separate keys per environment
- [Webhooks](webhooks.md): a complementary way to receive updates without polling the API
- [Quickstart](../getting-started/quickstart-payin.md): see an API key used in your first request
