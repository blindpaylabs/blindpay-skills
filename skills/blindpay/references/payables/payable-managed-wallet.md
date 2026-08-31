# Payable with managed wallet

Register a bill your customer owes, then pay it from a BlindPay-custodied wallet, with no on-chain approval and no wallet prompt.

Source: https://blindpay.com/docs/payable-managed-wallet

This tutorial registers a [payable](payables.md) and pays it from a [managed wallet](../essentials/customers.md), a wallet BlindPay custodies on the customer's behalf. Because BlindPay controls the wallet, there is no `approve` call and no signature to collect: register the bill, quote it, execute the payout, done.

If the funds live in a wallet your user controls instead, you need the approval step: see [Payable with EVM](payable-evm.md).

**Note:**

The examples below use `base_sepolia` and `USDB` since they're the development network and test token. Swap in the matching production network and token (`USDC` or `USDT`) when you go live.

This is the shape most "the platform holds the stablecoins" products want: your user pastes a bill and it gets paid, with no wallet interaction at any point.

**Note:**

This path is API only. The BlindPay dashboard pays payables from a connected wallet, so use the API when the funds are in a managed wallet.

## Prerequisites

**Before you start:**

1. Create an account at https://app.blindpay.com/sign-up
2. Create a development instance (see essentials/instances.md)
3. Create your API key (see essentials/api-keys.md)

You also need:

1. A [customer](../essentials/customers.md) with `kyc_status: "approved"`
2. A managed wallet for that customer, funded with enough stablecoin to cover the bill
3. A real boleto or PIX copia e cola code to pay

### Register the payable

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID, `re_000000000000` with your customer ID.

```js [index.js]
const payableResponse = await fetch(
  'https://api.blindpay.com/v1/instances/in_000000000000/payables',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_id: 're_000000000000',
      currency: 'BRL',
      boleto_barcode: '34191790010104351004791020150008191070026000',
    }),
  }
)

const payable = await payableResponse.json()
```

The payable is created in `draft`. Registering the same code twice while a live payable exists fails with `duplicate_payable`; to retry a failed attempt, quote the same payable again (it returns to `draft`), and a deleted draft frees the code for re-registration.

### Quote against the managed wallet

Pass `network` and `token` matching the managed wallet, and `payable_id` instead of `bank_account_id`. Do not send `request_amount` or `currency_type`: the amount comes from the payable, re-resolved from the rail (fines, interest) for a boleto.

```js [index.js]
const quoteResponse = await fetch(
  'https://api.blindpay.com/v1/instances/in_000000000000/quotes',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payable_id: payable.id,
      network: 'base_sepolia',
      token: 'USDB',
    }),
  }
)

const quote = await quoteResponse.json()

// Resolved from the rail, not from your user's expectations.
console.log(quote.receiver_amount, quote.sender_amount)
```

The response still includes a `contract` object. Ignore it here: it exists for external wallets, and a managed wallet needs no approval.

### Execute the payout

`sender_wallet_address` is the managed wallet's own address. BlindPay recognises it as custodied and moves the funds internally rather than running an ERC-20 `transferFrom`.

```js [index.js]
const response = await fetch(
  'https://api.blindpay.com/v1/instances/in_000000000000/payouts/evm',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quote_id: quote.id,
      sender_wallet_address: 'THE_MANAGED_WALLET_ADDRESS',
    }),
  }
)

const payout = await response.json()
```

The payout starts `processing`, with no signature collected from anyone, and the payable's own `status` now mirrors it.

**Warning:**

An insufficiently funded managed wallet fails during collection, not at quote time, so the payout is created and then fails. Check the wallet's balance against `sender_amount` before executing if you want to catch that earlier.

### Track it to settlement

A PIX code usually completes in under a minute. A boleto settles on a banking day. Subscribe to `payable.complete` to hear when the bill is paid and `payable.update` for changes while it is in flight.

```js [index.js]
const detail = await fetch(
  `https://api.blindpay.com/v1/instances/in_000000000000/payables/${payable.id}`,
  { headers: { Authorization: 'Bearer YOUR_API_KEY' } }
).then(r => r.json())

console.log(detail.status, detail.amount)
```

## Related

- [Payables](payables.md): registration, amount semantics, lifecycle, and webhooks
- [Payable with EVM](payable-evm.md): the same flow from a wallet your user controls
