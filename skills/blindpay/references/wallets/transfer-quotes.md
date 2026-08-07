# Transfer quotes

Create a transfer quote to lock in the source wallet, destination address, token, network, and amount before executing a transfer.

Source: https://blindpay.com/docs/transfer-quotes

A transfer quote locks in the details of a stablecoin move before you execute it: the source managed wallet, the destination address, the token, the network, and the amount. Executing the [transfer](transfers.md) simply consumes this quote, it does not take any new parameters of its own.

**Warning:**

Transfers are in beta. Only same-token, same-network transfers are supported: `customer_token` must match `sender_token`, and `customer_network` must match the source wallet's own network. There is no cross-chain bridging and no token conversion.

## How it works

- **Source**: a managed wallet (`wallet_id`, `bl_...`) that holds the stablecoin balance. This is the only supported source, unlike payouts, which can also draw from an external blockchain wallet.
- **Destination**: any blockchain address on the same network, `customer_wallet_address`. It does not need to belong to a BlindPay customer or wallet, it can be any address the recipient controls.
- **Expiry is very short**. A transfer quote is meant to be executed immediately after creation, not held for later use. Read `expires_at` from the response rather than assuming a fixed window, and call [create a transfer](transfers.md) right after creating the quote.

**Note:**

`expires_at` is returned in epoch milliseconds.

## Prerequisites

**Before you start:**

1. Create an account at https://app.blindpay.com/sign-up
2. Create a development instance (see essentials/instances.md)
3. Create your API key (see essentials/api-keys.md)

You also need a [customer](../kb/kyc.md) with `kyc_status: "approved"` and a [managed wallet](wallets.md) holding the stablecoin balance you want to move.

## Request fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `wallet_id` | string (`bl_...`) | yes | The managed wallet the funds move out of. Must belong to your instance and not be deleted. |
| `amount_reference` | enum | yes | `sender` or `receiver`. Since sender and receiver amounts are always equal for transfers today, this only affects which field you read the amount from in your own bookkeeping. |
| `request_amount` | integer | yes | Amount in minor units, no floats. `$100.00` sends as `10000`. Minimum is `1`. |
| `sender_token` | enum | yes | `USDC`, `USDT`, or `USDB`. Must be a token allowed on the source wallet's network. |
| `customer_token` | enum | yes | Must equal `sender_token`. |
| `customer_network` | enum | yes | Must equal the source wallet's own network. |
| `customer_wallet_address` | string | yes | The destination blockchain address, 32 to 64 characters, validated for the target network. Can be another wallet you created or any external address. |
| `cover_fees` | boolean | yes | Accepted for API consistency with payin and payout quotes, but fee math is not yet active for transfers: `sender_amount` and `receiver_amount` are always equal to `request_amount`. |
| `partner_fee_id` | string (`pf_...`) | no | Accepted, but partner fee amounts are not yet computed for transfers. |

**Note:**

USDT transfers are currently restricted to the Polygon network only, a tighter limit than payins and payouts allow for USDT.

## Create a transfer quote

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID, `re_000000000000` with your customer ID.

```bash [cURL]
curl https://api.blindpay.com/v1/instances/in_000000000000/transfer-quotes \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --data '{
  "wallet_id": "bl_000000000000",
  "amount_reference": "sender",
  "cover_fees": true,
  "request_amount": 1000,
  "sender_token": "USDC",
  "customer_wallet_address": "0xDD6a3aD0949396e57C7738ba8FC1A46A5a1C372",
  "customer_token": "USDC",
  "customer_network": "polygon",
  "partner_fee_id": "pf_000000000000"
}'
```

```js [index.js]
const response = await fetch(
  'https://api.blindpay.com/v1/instances/in_000000000000/transfer-quotes',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer YOUR_API_KEY',
    },
    body: JSON.stringify({
      wallet_id: 'bl_000000000000',
      amount_reference: 'sender',
      cover_fees: true,
      request_amount: 1000,
      sender_token: 'USDC',
      customer_wallet_address: '0xDD6a3aD0949396e57C7738ba8FC1A46A5a1C372',
      customer_token: 'USDC',
      customer_network: 'polygon',
      partner_fee_id: 'pf_000000000000',
    }),
  },
)

const quote = await response.json()
```

## Response

```json
{
  "id": "qu_000000000000",
  "expires_at": 1712958191000,
  "commercial_quotation": 100,
  "blindpay_quotation": 100,
  "receiver_amount": 1000,
  "sender_amount": 1000,
  "partner_fee_amount": 0,
  "flat_fee": 0
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string (`qu_...`) | Pass this as `transfer_quote_id` when you create the transfer. |
| `expires_at` | number | Epoch milliseconds. Execute the transfer before this passes. |
| `commercial_quotation` | number | Rate preview. Currently fixed at `100` for transfers since there is no FX conversion on a same-token move. |
| `blindpay_quotation` | number | Same as `commercial_quotation` for transfers today. |
| `receiver_amount` | number | Equal to `request_amount`. |
| `sender_amount` | number | Equal to `request_amount`. |
| `partner_fee_amount` | number | Always `0` for transfers today, even if `partner_fee_id` was set. |
| `flat_fee` | number | Always `0` for transfers today. |

**Note:**

The `qu_` prefix is shared across payin quotes, payout quotes, and transfer quotes, you can't tell which kind of quote an ID refers to just by looking at it.

## Validation order

The API checks, in this order: the caller has permission to create transactions, the wallet exists and belongs to your instance, the token and network are allowed for your instance type, USDT is only used on Polygon, the source wallet's network matches `customer_network`, `sender_token` matches `customer_token`, and the receiving customer's KYC is approved. The first failing check is the one returned.

## Testing

There is no dedicated test-amount sentinel for transfer quotes or transfers (unlike payins and payouts, which force outcomes at `$666.00` and `$777.00`). On development instances, transfer quotes go through the same token and network rules as production, restricted to the development tokens and testnets described in [supported chains](../kb/supported-chains.md).

## Related

- [Send](send.md): the concept overview and beta scope for transfers
- [Transfers](transfers.md): execute a transfer against this quote
- [Managed wallets](wallets.md): create and fund the source wallet
- [Payout quotes](../payouts/payout-quotes.md): compare against the quote used for off-ramp payouts
- [Supported chains](../kb/supported-chains.md): token and network support matrix
