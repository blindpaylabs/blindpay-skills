<h1>BlindPay Skills<img src="https://github.com/user-attachments/assets/c42b121d-adf1-467c-88ce-6f5be1efa93c" align="right" width="102"/></h1>

[![chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.gg/2DFKYaxjpp)
[![twitter](https://img.shields.io/twitter/follow/blindpay?style=social)](https://twitter.com/intent/follow?screen_name=blindpay)

The official [Agent Skills](https://agentskills.io) for [BlindPay](https://blindpay.com) - Stablecoin API for global payments.

## What These Skills Do

These skills provide AI assistants (Cursor, Claude Code, Codex, etc.) with domain knowledge for integrating BlindPay's stablecoin payment infrastructure. They enable AI assistants to:

- Understand payout flows (stablecoin to fiat)
- Understand payin flows (fiat to stablecoin)
- Create and manage receivers with proper KYC/KYB
- Add bank accounts for different payment rails (ACH, Wire, PIX, SPEI, SWIFT)
- Generate quotes and handle token approvals
- Set up virtual accounts and offramp wallets
- Configure webhooks and handle events
- And more...

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

"Walk me through creating a receiver with enhanced KYC"

"How do I create a SWIFT bank account?"

"What are the KYC requirements for a business receiver?"

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
