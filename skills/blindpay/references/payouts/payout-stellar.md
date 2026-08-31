# Payout with Stellar

Fund a payout from an external Stellar wallet, authorize the payout, sign the XDR transaction, then create the payout.

Source: https://blindpay.com/docs/payout-stellar

This tutorial funds a [payout](payouts.md) from an external [blockchain wallet](../payins/blockchain-wallets.md) on Stellar. Stellar has no allowance mechanism, so the client constructs and signs a real payment transaction to BlindPay's treasury address: authorize, sign, then create the payout.

**Note:**

BlindPay's Stellar mainnet treasury address: `GCOSSQDM2SWMHRP7CDBOLL2V45NHCRLUWUCEHPPBA2ABCOOLPOLZKIHE`. This is the address that receives payout crypto and sends payin crypto on Stellar mainnet.

**Note:**

The examples below use `stellar_testnet` and `USDB` since they're the development network and test token. Swap in the production network and token (`USDC`) when you go live.

## Prerequisites

**Before you start:**

1. Create an account at https://app.blindpay.com/sign-up
2. Create a development instance (see essentials/instances.md)
3. Create your API key (see essentials/api-keys.md)

You also need a [customer](../essentials/customers.md) with `kyc_status: "approved"`, a [bank account](bank-accounts.md) (`ba_...`), and an unexpired [payout quote](payout-quotes.md) (`qu_...`) created with a Stellar `network`.

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID, `re_000000000000` with your customer ID, `ba_000000000000` with your bank account ID.

### Authorize the payout

Call the authorize endpoint with the quote and the sender's wallet address. This does not consume the quote or create any record, it only returns an unsigned transaction hash for the client to sign.

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/payouts/stellar/authorize \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "quote_id": "qu_000000000000",
  "sender_wallet_address": "YOUR_WALLET_ADDRESS"
}'
```

The response is the unsigned transaction, ready to sign:

```json
{
  "transaction_hash": "AAA...AAA"
}
```

### Sign and submit the transaction

Install the Stellar SDK:

```bash
npm install @stellar/stellar-sdk
```

Sign the returned transaction with the sender's Stellar key and submit it to the network:

```js [index.js]
import {
  Horizon,
  Keypair,
  Networks,
  TransactionBuilder,
} from '@stellar/stellar-sdk'

const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const sourceKeypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY)

// Rebuild the transaction returned by the authorize endpoint
const transaction = TransactionBuilder.fromXDR(
  transactionHash,
  Networks.TESTNET
)

// Sign it with the sender's key
transaction.sign(sourceKeypair)

// Submit it to Stellar
const result = await server.submitTransaction(transaction)

console.log(result.hash)
// Save result.hash, you need it to create the payout on BlindPay
```

### Create the payout

Create the payout with the quote, the sender's wallet address, and the signed transaction from the previous step. BlindPay independently re-validates the signed transaction against the quote (destination and amount) before dispatching the payout.

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/payouts/stellar \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "quote_id": "qu_000000000000",
  "signed_transaction": "YOUR_SIGNED_TRANSACTION",
  "sender_wallet_address": "YOUR_WALLET_ADDRESS"
}'
```

**Success:**

That's a completed payout on Stellar. To send another, create a new quote and repeat the authorize, sign, and create steps, the quote and signed transaction are single-use.

## Related

- [Payouts](payouts.md): status lifecycle, cover_fees, testing sentinels, and webhooks
- [Payout quotes](payout-quotes.md): full request and response fields
- [Payin with blockchain wallet](../payins/payin-blockchain-wallet.md): fund your test wallet on development instances
- [Payout with managed wallet](payout-managed-wallet.md): the no-signing alternative (Stellar not yet supported for managed wallets)
