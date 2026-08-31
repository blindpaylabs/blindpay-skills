# Instances

Instances are isolated BlindPay environments, one per stage of your stack, created in the dashboard.

Source: https://blindpay.com/docs/learn/instances

An instance is an isolated BlindPay environment. If your product has separate development, staging, and production environments, create one instance for each. All features live inside an instance: customers, bank accounts, wallets, virtual accounts, payouts, and payins.

Instances are created through the [BlindPay dashboard](https://app.blindpay.com). You cannot create them via the API.

Each instance is either a `development` or `production` instance. Both expose the same features but differ in KYC handling, network availability, and whether fiat actually moves.

**Note:**

All payouts and payins made on development instances skip the real fiat payment rails. Payouts do not move real money, and payins auto-complete a simulated deposit instead of waiting for a real bank transfer.

## Development vs. production

| Feature | Development | Production |
| --- | --- | --- |
| Customers | Supported | Supported |
| Bank accounts | Supported | Supported |
| Payout quotes | Supported | Supported |
| Payouts | Supported (no real fiat movement) | Supported |
| Payin quotes | Supported | Supported |
| Payins | Supported (auto-completes in ~30s) | Supported |
| KYC | Auto-approved | Automated (~60s) or manual review |
| EVM networks | `sepolia`, `base_sepolia`, `arbitrum_sepolia`, `polygon_amoy` | `ethereum`, `base`, `polygon`, `arbitrum` |
| Stellar | Testnet | Mainnet |
| Solana | Devnet | Mainnet |
| Tron | N/A | Mainnet (beta) |
| API keys | Supported | Supported |
| Webhooks | Supported | Supported |

On development instances, use USDB as the test stablecoin: a BlindPay-issued test token that stands in for real USDC or USDT. See [Sandbox vs. production](sandbox-vs-production.md) for the full testing workflow.

## Create an instance

### Open the dashboard

Go to the [BlindPay dashboard](https://app.blindpay.com) and click **Create instance**.

### Choose an environment

Choose whether the new instance is `development` or `production`. Development instances are ready immediately.

![Create instance screen in the BlindPay dashboard](https://pub-4fabf5dd55154f19a0384b16f2b816d9.r2.dev/Frame%201216401961.jpg)

### Wait for activation (production only)

New production instances may take up to 3 business days to set up. See [Cut-off times](../kb/cut-off-times.md) for full SLAs.

## API keys are per-instance

An API key authenticates requests to one instance only. A key created for instance A will not work against instance B, even within the same organization. See [API keys](api-keys.md) to create and manage keys.

## Related

- [Sandbox vs. production](sandbox-vs-production.md): behavior differences in depth
- [API keys](api-keys.md): create and manage instance keys
- [Billing](billing.md): how usage is charged per instance
