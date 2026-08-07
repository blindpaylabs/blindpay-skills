# Offramp wallets

What a BlindPay offramp wallet is, the chains and stablecoins it supports, minimums, and how deposits automatically convert to a fiat payout.

Source: https://blindpay.com/docs/offramp-wallets

An offramp wallet is a blockchain wallet that BlindPay creates and manages for you, tied to one of your customer's bank accounts. Every USDC or USDT deposit it receives is automatically converted to fiat and paid out to that bank account, with no quote or execute call on your side. It is the stablecoin-side mirror of a [virtual account](../virtual-accounts/virtual-accounts.md): where a virtual account turns incoming fiat into stablecoin, an offramp wallet turns incoming stablecoin into fiat.

## How it works

BlindPay always creates a [payout](payouts.md) automatically whenever the wallet receives a USDC or USDT transaction. You share the wallet's deposit address with whoever is paying your customer; the moment funds land, conversion and settlement to the linked bank account happen on their own.

### Supported chains and stablecoins

| Chain | Stablecoins | Minimum | Additional fee |
| --- | --- | --- | --- |
| Tron | USDT only | 200 USDT | 15 USDT |
| Solana | USDC only | 50 USDC | 0 USDC |
| Ethereum | USDC only | No fixed minimum* | 1 USDC |
| Polygon | USDC and USDT | No fixed minimum* | 0 USDC |
| Arbitrum | USDC only | No fixed minimum* | 0 USDC |
| Base | USDC only | No fixed minimum* | 0 USDC |

*The deposit only needs to cover its fees (additional fee, percentage fee, and bank transfer fee). A deposit smaller than the total fees is not converted.

### Fee example

Sending 100 USDT to an offramp wallet on Tron that settles over ACH (assuming 1 USDT = $1.00):

1. Convert: 100 USDT = $100.00
2. Additional fee: 15 USDT = $15.00
3. Percentage fee: 0.1% of $100.00 = $0.10
4. Bank transfer fee: $0.40 (ACH)

Final: $100.00 - $15.00 - $0.10 - $0.40 = **$84.50** delivered to the recipient's bank account. The additional fee is fixed per chain (see the table above); the percentage fee and bank transfer fee depend on your pricing and the payout rail.

## Create an offramp wallet

An offramp wallet is created on an existing bank account, which becomes its payout destination. Once created, it has a deposit address on the network you chose; anything sent to that address is converted and paid out automatically.

### Prerequisites

**Before you start:**

1. Create an account at https://app.blindpay.com/sign-up
2. Create a development instance (see essentials/instances.md)
3. Create your API key (see essentials/api-keys.md)

You must also [create a customer](../essentials/customers.md) and add a [bank account](bank-accounts.md) before creating an offramp wallet. The wallet inherits that bank account as its payout destination.

### The request

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID, `re_000000000000` with your customer ID.

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/customers/re_000000000000/bank-accounts/ba_000000000000/offramp-wallets \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "network": "tron"
}'
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `network` | enum | Yes | Production: `tron`, `solana`, `ethereum`, `polygon`, `arbitrum`, `base`. Development instances use the matching testnets: `solana_devnet`, `sepolia`, `polygon_amoy`, `arbitrum_sepolia`, `base_sepolia`. |
| `external_id` | string | No | Your own reference for the wallet, echoed back on the response. |

The response includes `id` (`ow_...`), `network`, `address`, and your `external_id`. Share `address` with whoever is paying your customer: any USDC or USDT sent to it on the chosen network is converted and paid out to the linked bank account automatically.

## Related

- [Payouts](payouts.md): the payout created automatically on each deposit
- [Bank accounts](bank-accounts.md): the settlement destination
- [Virtual accounts](../virtual-accounts/virtual-accounts.md): the fiat-side mirror
