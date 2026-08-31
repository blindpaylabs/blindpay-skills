# Payout with managed wallet

Fund a payout from a BlindPay-managed wallet with a single REST call, no on-chain approval or signing involved.

Source: https://blindpay.com/docs/payout-managed-wallet

This is the simplest way to fund a [payout](payouts.md): pull the stablecoins from a [managed wallet](../wallets/wallets.md). BlindPay already custodies the balance, so there is no `approve` call, no signed transaction, and no delegation. You create a payout quote and execute the payout, two REST calls.

If the funds live in a wallet you or your customer controls instead, see the blockchain wallet tutorials: [EVM](payout-evm.md), [Stellar](payout-stellar.md), or [Solana](payout-solana.md).

## Prerequisites

**Before you start:**

1. Create an account at https://app.blindpay.com/sign-up
2. Create a development instance (see essentials/instances.md)
3. Create your API key (see essentials/api-keys.md)

You also need:

- A [customer](../essentials/customers.md) with `kyc_status: "approved"`
- A [bank account](bank-accounts.md) (`ba_...`) as the payout destination
- A [managed wallet](../wallets/wallets.md) (`bl_...`) holding enough stablecoins to cover the payout

On a development instance, fund the wallet with a [payin](../payins/payin-managed-wallet.md): it auto-completes about 30 seconds after creation and delivers USDB straight into the wallet.

### Create a payout quote

A quote locks the conversion rate and fees for 5 minutes. The `network` and `token` describe the funding wallet: match them to the managed wallet's network and the token it holds.

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/quotes \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "bank_account_id": "ba_000000000000",
    "currency_type": "sender",
    "cover_fees": false,
    "request_amount": 5000,
    "network": "solana_devnet",
    "token": "USDB"
  }'
```

`request_amount` is an integer in minor units, so `5000` here means $50.00. Save the quote ID (`qu_...`). The response also includes a `contract` object with approval data; you can ignore it, it only matters for external wallets.

### Execute the payout

Execute the payout by passing the quote ID and the managed wallet's `address` as the funding source. Because BlindPay custodies the wallet, this single call moves the funds.

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID, `re_000000000000` with your customer ID, `ba_000000000000` with your bank account ID.

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/payouts/evm \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "quote_id": "qu_000000000000",
    "sender_wallet_address": "YOUR_MANAGED_WALLET_ADDRESS"
  }'
```

The response returns the payout with `status: "processing"`. On a development instance it completes automatically a few seconds later and fires a `payout.complete` webhook.

**Note:**

The endpoint is `/payouts/evm` regardless of the managed wallet's network; it handles managed wallets on every supported chain, including Solana.

**Success:**

That's a complete payout. To send another, create a new quote and execute again; each quote is single-use.

## Related

- [Payouts](payouts.md): status lifecycle, cover_fees, testing sentinels, and webhooks
- [Managed wallets](../wallets/wallets.md): the funding wallet entity, including balance and inbound webhooks
- [Payout quotes](payout-quotes.md): full request and response fields
- [Payout with EVM](payout-evm.md): the external-wallet alternative on EVM chains
