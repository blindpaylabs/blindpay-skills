# Transfers

Execute a stablecoin transfer from a transfer quote and track it through to completion with the BlindPay API.

Source: https://blindpay.com/docs/transfers

A transfer is the object that actually moves stablecoins: it consumes a [transfer quote](transfer-quotes.md) and sends the funds from a managed wallet to the destination address locked in on that quote. The transfer itself takes a single field; the amount, token, network, and destination were already set when you created the quote.

**Warning:**

Transfers are in beta. Only same-token, same-network moves are supported today: the destination token and network must match the source wallet's exactly.

## How it works

```
transfer quote (qu_...) -> execute the transfer -> stablecoins sent from the managed wallet -> destination confirms receipt
```

A transfer quote expires 5 minutes after creation, so execute the transfer before then. Once created, a transfer cannot be canceled.

**Before you start:**

1. Create an account at https://app.blindpay.com/sign-up
2. Create a development instance (see essentials/instances.md)
3. Create your API key (see essentials/api-keys.md)

You also need a [managed wallet](wallets.md) (`bl_...`) and a [transfer quote](transfer-quotes.md) (`qu_...`).

## Execute a transfer

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID.

Replace `qu_000000000000` with the transfer quote ID you created previously.

```bash [cURL]
curl https://api.blindpay.com/v1/instances/in_000000000000/transfers \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --data '{
  "transfer_quote_id": "qu_000000000000"
}'
```

### Response

```json
{
  "id": "tr_000000000000",
  "status": "processing",
  "tracking_bridge_swap": { "step": "on_hold" },
  "tracking_complete": { "step": "on_hold" },
  "tracking_paymaster": { "step": "on_hold" },
  "tracking_transaction_monitoring": { "step": "on_hold" },
  "tracking_partner_fee": { "step": "on_hold" }
}
```

## Status lifecycle

| `status` | Meaning | Terminal? |
| --- | --- | --- |
| `processing` | The stablecoin send has been submitted and is waiting for confirmation | no |
| `completed` | The transfer confirmed and the destination received the stablecoins | yes |

**Note:**

Check `tracking_complete` alongside `status` when building a detailed view: it carries additional detail about the send once the transfer confirms.

## Testing

Transfers do not use the `66600`/`77700` sentinel amounts that payins and payouts support. On a development instance, a transfer executes against the sandbox `USDB` token on the corresponding testnet and confirms once the network finalizes the send.

## Webhooks

| Event | Fires when |
| --- | --- |
| `transfer.new` | The transfer is created and the stablecoin send has been submitted |
| `transfer.complete` | The transfer confirms and the destination has received the stablecoins |

See [webhooks](../essentials/webhooks.md) for signature verification and full payload details.

## Related

- [Transfer quotes](transfer-quotes.md): lock in the amount, token, network, and destination before executing a transfer
- [Send](send.md): the transfer concept and how it fits alongside payins and payouts
- [Managed wallets](wallets.md): create and fund the source wallet for a transfer
- [Blockchain wallets](../payins/blockchain-wallets.md): register an external destination address
