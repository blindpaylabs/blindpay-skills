# Send

Send stablecoins out of a BlindPay-managed wallet to another managed wallet or any external address, using the BlindPay API.

Source: https://blindpay.com/docs/send

Send covers moving stablecoins out of a [managed wallet](wallets.md) (`bl_...`): to another managed wallet, or to any external blockchain address. There is no fiat leg; both sides of the move are stablecoin, and because BlindPay custodies the source wallet, it's all REST calls with no signing.

If you want the funds to leave as fiat in a bank account instead, that's a [payout](../payouts/payouts.md).

**Warning:**

Transfers are in beta. For now, only same-token, same-network transfers are supported: the destination token and network must match the source wallet's. Cross-chain and cross-token conversion is planned but not yet available.

## How it works

Every transfer follows the same two-step flow as a payin or payout: create a quote, then execute it.

| Step | Call | Purpose |
| --- | --- | --- |
| 1 | Create a [transfer quote](transfer-quotes.md) | Lock in the amount, token, and network for the move |
| 2 | Execute the [transfer](transfers.md) | Consume the quote and send the stablecoins |

- **Source**: a managed wallet (`wallet_id`, `bl_...`) that holds the stablecoin balance
- **Destination**: another managed wallet's address, or any external blockchain address the receiver controls
- **Token and network**: must be identical on both sides while the feature is in beta

Transfer quotes are consumed the same way payin and payout quotes are: create one, then execute against its ID before it expires. Because there is no fiat conversion involved, the quote step exists mainly to lock in the amount and destination, not to price an exchange rate. The transfer quote expires in 15 seconds, the shortest of any BlindPay quote.

## In this section

- [Transfer quotes](transfer-quotes.md): create a quote that locks in the source wallet, destination, token, network, and amount
- [Transfers](transfers.md): execute a transfer against a quote and track its status

## Related

- [Managed wallets](wallets.md): create and fund the source wallet for a transfer
- [Receive](receive.md): the other direction, stablecoins arriving in a managed wallet
- [Payouts](../payouts/payouts.md): convert stablecoins held in a wallet to fiat instead of moving them on-chain
- [Supported chains](../kb/supported-chains.md): chain and token support matrix
