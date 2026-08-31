# Payout with EVM

Fund a payout from an external EVM wallet, approve the ERC-20 token transfer, then execute the payout.

Source: https://blindpay.com/docs/payout-evm

This tutorial funds a [payout](payouts.md) from an external [blockchain wallet](../payins/blockchain-wallets.md) on an EVM chain (Ethereum, Base, Polygon, Arbitrum). All stablecoins on EVM chains are ERC-20 tokens, so authorization means calling `approve` on the token contract to let BlindPay pull the quoted amount from the sender's wallet.

If the funds live in a BlindPay-custodied wallet instead, skip the approval entirely: see [Payout with managed wallet](payout-managed-wallet.md).

**Note:**

The examples below use `base_sepolia` and `USDB` since they're the development network and test token. Swap in the matching production network and token (`USDC` or `USDT`) when you go live.

## Prerequisites

**Before you start:**

1. Create an account at https://app.blindpay.com/sign-up
2. Create a development instance (see essentials/instances.md)
3. Create your API key (see essentials/api-keys.md)

You also need:

1. A [customer](../essentials/customers.md) with `kyc_status: "approved"` and a [bank account](bank-accounts.md) (`ba_...`)
2. [An RPC provider URL for Base Sepolia](https://chainlist.org/?search=base&testnets=true)
3. [A wallet funded with testnet ether](https://www.alchemy.com/faucets/base-sepolia) to pay gas
4. [The private key, or any way to instantiate the wallet with ethers.js](https://docs.ethers.org/v6/api/wallet/#BaseWallet_new)

### Create a quote and approve the tokens

The ERC-20 token contract address, ABI, and BlindPay's contract address are all returned in the [payout quote](payout-quotes.md) response, so quote and approval fit naturally in one script. This example uses an [Express](https://expressjs.com/en/starter/hello-world.html) server and [ethers.js](https://docs.ethers.org/v6/). Make sure [Node.js](https://nodejs.org/en/download/) is installed.

Create a folder, initialize it, and install the dependencies:

```bash
npm init -y
npm install express ethers
```

Create `index.js` and replace the placeholder values with your own:

```js [index.js]
import express from 'express'
import { ethers } from 'ethers'

const app = express()

app.get('/', async (req, res) => {
  const rpcProviderUrl = '<Replace this>' // Get one at https://chainlist.org/?search=base&testnets=true
  const walletPrivateKey = '<Replace this>' // This wallet needs testnet ether and USDB to run the transactions below
  const instanceId = '<Replace this>'
  const blindpayApiKey = 'YOUR_API_KEY'
  const bankAccountId = 'ba_000000000000'

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${blindpayApiKey}`,
  }

  // 1. Create a payout quote
  const fiftyDollars = 5000
  const quoteBody = {
    bank_account_id: bankAccountId,
    currency_type: 'sender',
    cover_fees: false,
    request_amount: fiftyDollars,
    network: 'base_sepolia', // also "sepolia", "arbitrum_sepolia", "polygon_amoy"
    token: 'USDB', // development instances only ever use USDB
  }
  const createQuote = await fetch(
    `https://api.blindpay.com/v1/instances/${instanceId}/quotes`,
    { headers, method: 'POST', body: JSON.stringify(quoteBody) }
  )
  const quoteResponse = await createQuote.json()

  // 2. Approve the tokens
  const provider = new ethers.JsonRpcProvider(
    rpcProviderUrl,
    quoteResponse.contract.network
  )
  const yourWallet = new ethers.Wallet(walletPrivateKey, provider)
  const contract = new ethers.Contract(
    quoteResponse.contract.address,
    quoteResponse.contract.abi,
    provider
  )
  const contractSigner = contract.connect(yourWallet)

  const result = await contractSigner.approve(
    quoteResponse.contract.blindpayContractAddress,
    quoteResponse.contract.amount
  )

  res.send({
    hash: result?.hash,
    quoteId: quoteResponse.id,
  })
})

app.listen(3000)
console.log('Express started on port 3000')
```

Run it:

```bash
node index.js
```

Visit `http://localhost:3000`. After a few seconds you should see a response like:

```json
{
  "hash": "0x1ab66830a4804d80251f01b9d31c054a42068f5783c80d165507cddce0ac78ca",
  "quoteId": "qu_lxrCXUOOyrem"
}
```

### Execute the payout

Once the approval transaction confirms, create the payout with the same `quote_id`.

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID, `re_000000000000` with your customer ID, `ba_000000000000` with your bank account ID.

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/payouts/evm \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "quote_id": "qu_000000000000",
  "sender_wallet_address": "YOUR_WALLET_ADDRESS"
}'
```

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
      quote_id: 'qu_000000000000',
      sender_wallet_address: 'YOUR_WALLET_ADDRESS',
    }),
  }
)

const payout = await response.json()
```

**Success:**

That's a completed payout on EVM. To send another, create a new quote and approve again, the quote and approval are single-use.

## Related

- [Payouts](payouts.md): status lifecycle, cover_fees, testing sentinels, and webhooks
- [Payout quotes](payout-quotes.md): the `contract` object the approval step consumes
- [Payout with managed wallet](payout-managed-wallet.md): the no-signing alternative
- [Payin with blockchain wallet](../payins/payin-blockchain-wallet.md): fund your test wallet on development instances
