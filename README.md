<h1>BlindPay Skills<img src="https://github.com/user-attachments/assets/c42b121d-adf1-467c-88ce-6f5be1efa93c" align="right" width="102"/></h1>

[![chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.gg/2DFKYaxjpp)
[![twitter](https://img.shields.io/twitter/follow/blindpay?style=social)](https://twitter.com/intent/follow?screen_name=blindpay)

The official [Agent Skills](https://agentskills.io) for [BlindPay](https://blindpay.com) - Stablecoin API for global payments.

## What These Skills Do

These skills provide AI assistants (Cursor, Claude Code, Codex, etc.) with domain knowledge for integrating BlindPay's payment infrastructure. They cover both flavors of the API: the bank-rails view (virtual accounts, payins, payouts) and the stablecoin view (wallets, chains, on-chain authorization, transfers). They enable AI assistants to:

- Understand payout flows (money out to a bank account, on any supported rail)
- Understand payin flows (money in from a bank account, delivered as stablecoin)
- Create and manage customers with the right KYC/KYB level, and handle RFIs and limit increases
- Add bank accounts for every payment method (ACH, wire, RTP, SWIFT, Pix, SPEI, ACH COP, Transfers 3.0, SEPA)
- Generate quotes and authorize funds per network (ERC-20 approve, Stellar XDR, Solana delegation)
- Set up virtual accounts, managed wallets, blockchain wallets and offramp wallets
- Move stablecoins with transfer quotes and transfers
- Configure webhooks, verify signatures and handle every event
- Answer compliance and coverage questions from the knowledge base (supported countries, cut-off times, prohibited activities, document requirements)

## Installation

### Claude Code

Run the following command in your terminal:

```bash
npx skills add blindpaylabs/blindpay-skills
```

### Cursor

Run the following command in your terminal:

```bash
npx skills add blindpaylabs/blindpay-skills
```

### Codex

Run the following command in your terminal:

```bash
npx skills add blindpaylabs/blindpay-skills
```

## Example Prompts

Once installed, skills are automatically activated when relevant tasks are detected:

```
"Explain the complete payout flow from quote to execution"

"Walk me through creating a customer with enhanced KYC"

"How do I create a SWIFT bank account?"

"What are the KYB requirements for a business customer?"

"Issue a virtual account for this customer and handle the payin webhooks"

"How do I test payouts using the USDB test token?"
```

## Documentation

- [Getting Started](https://blindpay.com/docs/getting-started/overview)
- [API Reference](https://api.blindpay.com/reference)

## Support

- Email: [eric@blindpay.com](mailto:eric@blindpay.com)
- Issues: [GitHub Issues](https://github.com/blindpaylabs/blindpay-skills/issues)

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

Made with ❤️ by the [BlindPay](https://blindpay.com) team
