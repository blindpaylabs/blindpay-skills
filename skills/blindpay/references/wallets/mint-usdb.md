# Mint USDB

Mint BlindPay's USDB test stablecoin on EVM testnets, Stellar Testnet, and Solana Devnet to simulate payments on development instances.

Source: https://blindpay.com/docs/mint-usdb

USDB is BlindPay's test stablecoin. It only exists on development instances, across every development network, and you can mint as much as you need to simulate payins, payouts, and transfers.

**Warning:**

USDB is a development-only token. Production instances only accept `USDC` or `USDT`, never USDB.

## Where you can mint

| Network | How |
| --- | --- |
| EVM testnets (`sepolia`, `base_sepolia`, `arbitrum_sepolia`, `polygon_amoy`) | Dashboard mint utility, to a connected browser wallet |
| Stellar Testnet (`stellar_testnet`) | REST endpoints: create a trustline, then mint |
| Solana Devnet (`solana_devnet`) | REST endpoint, mints to any address |

The Solana endpoint is the only one that mints to an arbitrary address, which makes it the easiest way to fund a [managed wallet](wallets.md) with test tokens: create the wallet on `solana_devnet` and mint straight to its address.

## Mint on EVM chains

USDB on EVM chains is minted from the dashboard, not the API. The wallet needs testnet ether to pay gas. Get some from the [Base Sepolia faucet](https://www.alchemy.com/faucets/base-sepolia).

Open `https://app.blindpay.com/instances/{instance_id}/utilities/mint` in your browser, replace `{instance_id}` with your instance ID, and mint USDB on `Base Sepolia`.

**Note:**

Use the same wallet address you registered as a [blockchain wallet](../payins/blockchain-wallets.md). The dashboard mints to the wallet connected in your browser, double check you're minting on the correct network.

## Mint on Stellar

USDB can also be minted on `Stellar Testnet`.

**Note:**

Stellar Testnet USDB issuer: `GCQSSIMOW5OCGULZATDXKU5MOJBOMFX6G65X6CXZDQ7AIB3SKFUZ67NX`

### Create an asset trustline (one time only)

Before your wallet can receive USDB, it needs a trustline to the USDB asset. Do this once per wallet.

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/create-asset-trustline \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "address": "YOUR_ADDRESS"
  }'
```

This returns an unsigned XDR transaction:

```json
{
  "success": true,
  "xdr": "AAAAA..."
}
```

### Sign and submit the trustline transaction

You have two options, pick one:

- **Sign and submit it yourself**: sign the XDR with your Stellar wallet (or [Stellar Lab](https://lab.stellar.org/transaction/sign)) and submit it to the network directly.
- **Let BlindPay submit it**: sign the XDR with your Stellar wallet, then pass the resulting `signedXdr` to the mint endpoint in the next step and BlindPay submits the trustline transaction for you.

### Mint USDB tokens

Once the trustline exists, mint USDB to your wallet address. Pass `signedXdr` only if you chose the second option above.

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/mint-usdb-stellar \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "address": "YOUR_WALLET_ADDRESS",
    "amount": "1000000000000000000",
    "signedXdr": "YOUR_SIGNED_XDR"
  }'
```

## Mint on Solana

USDB can also be minted on `Solana Devnet`. Pass the destination `address` and the `amount`:

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/mint-usdb-solana \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "address": "YOUR_WALLET_ADDRESS",
    "amount": "100"
  }'
```

This returns the on-chain signature:

```json
{
  "success": true,
  "signature": "5xY..."
}
```

## Related

- [Sandbox vs. production](../essentials/sandbox-vs-production.md): how development instances simulate settlement
- [Managed wallets](wallets.md): BlindPay-custodied wallets you can mint into on Solana Devnet
- [Blockchain wallets](../payins/blockchain-wallets.md): the external wallets the EVM and Stellar mints target
- [Payout with EVM](../payouts/payout-evm.md): spend the minted USDB in an off-ramp payout
- [Supported chains](../kb/supported-chains.md): the full chain and token matrix
