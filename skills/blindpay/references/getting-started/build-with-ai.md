# Build with AI

Connect AI coding agents and AI builders to BlindPay with an MCP server, Agent Skills, and a REST API.

Source: https://blindpay.com/docs/build-with-ai

BlindPay exposes its full payments API through three surfaces that drop into any AI coding agent or AI app builder: an **MCP server**, **Agent Skills**, and a **REST API**. Use them to create quotes, execute payments, manage customers, and configure webhooks directly from the terminal, your IDE, or a no-code builder.

## The three surfaces

### MCP server

The Model Context Protocol server exposes the BlindPay API as callable tools. Any MCP-compatible agent (Codex, Claude Code, Cursor, Windsurf, and others) can call these tools to move money in response to natural-language prompts.

```bash [Codex]
codex mcp add blindpay \
  --env BLINDPAY_API_KEY=YOUR_API_KEY \
  --env BLINDPAY_INSTANCE_ID=in_000000000000 \
  -- npx -y @blindpay/mcp
```

```bash [Claude Code]
claude mcp add blindpay \
  --env BLINDPAY_API_KEY=YOUR_API_KEY \
  --env BLINDPAY_INSTANCE_ID=in_000000000000 \
  -- npx -y @blindpay/mcp
```

For Claude Code or another JSON-configured MCP host, add it directly to `.mcp.json` in your project:

```json [.mcp.json]
{
  "mcpServers": {
    "blindpay": {
      "command": "npx",
      "args": ["-y", "@blindpay/mcp"],
      "env": {
        "BLINDPAY_API_KEY": "YOUR_API_KEY",
        "BLINDPAY_INSTANCE_ID": "in_000000000000"
      }
    }
  }
}
```

### Agent Skills

A packaged knowledge layer that teaches the agent BlindPay's rails, corridors, fees, and API patterns, so generated integrations are correct on the first pass.

```bash [Terminal]
npx skills add blindpaylabs/skills
```

### REST API

For builders that generate code but do not run an MCP host (Lovable, v0, Bolt, Replit), call the REST API directly from a backend route or server action.

```bash [cURL]
curl https://api.blindpay.com/v1/instances/in_000000000000/payouts \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID.

## What you can ask

Once connected, the agent can:

- Create payout and payin quotes, and preview fees and FX rates
- Execute payouts across EVM chains, Stellar, and Solana
- Create and verify customers
- Generate virtual accounts
- Configure webhooks
- Query transaction status

```text [Prompt]
Use the BlindPay tools to create a payout quote for 1000 USDC to a USD ACH
bank account. Show me the fees and rate, then execute after I confirm.
```

**Warning:**

Money-movement tools should require explicit confirmation before executing. The MCP server does not gate confirmation on its own: build a confirmation step into your agent prompt or app flow before any payout, payin, or transfer is executed.

## Per-platform setup

| Platform | Method | Notes |
| --- | --- | --- |
| Codex | `codex mcp add` | Run `codex mcp add` from the terminal, then load Agent Skills for full scaffolding. The CLI, IDE extension, and desktop app share the configuration. |
| Claude Code | `claude mcp add` or `.mcp.json` | Run `claude mcp add` from the terminal, or add the server to `.mcp.json` and load Agent Skills for full scaffolding. |
| Cursor | `.cursor/mcp.json` | Create the file, restart Cursor, then enable the `blindpay` server in Settings -> MCP. |
| Windsurf | MCP settings | Add the same server config in Windsurf's MCP configuration. |
| Lovable | Copy-paste prompt + REST API | No MCP host. Paste a prompt describing the backend function and add `BLINDPAY_API_KEY` / `BLINDPAY_INSTANCE_ID` as secrets. |
| v0 | Copy-paste prompt + REST API | Paste a prompt describing a Next.js route handler; add credentials as Vercel environment variables. |
| Bolt | Copy-paste prompt + REST API | Paste a prompt describing a server route; add credentials as environment variables in the Bolt project. |
| Replit | Copy-paste prompt + REST API | Give the prompt to Replit Agent; add credentials in Replit Secrets (Tools -> Secrets). |

### Codex, Claude Code, Cursor, and Windsurf (MCP)

These hosts call BlindPay tools directly, so the agent can run multi-step flows (quote, confirm, execute) in one conversation. Add the MCP server as shown above, then optionally layer in Agent Skills for richer domain knowledge of corridors and fees.

### Lovable, v0, Bolt, and Replit (prompt + REST API)

These builders generate application code rather than hosting MCP tools, so the integration runs through a backend function calling the REST API. The pattern is the same across all four:

```text [Builder prompt]
Add stablecoin payments to this app using the BlindPay API (https://api.blindpay.com).

- Create a backend route/function that calls BlindPay to:
  1. Create a payout quote (POST /v1/instances/{instance_id}/quotes)
  2. Execute a payout (POST /v1/instances/{instance_id}/payouts/evm)
- Read BLINDPAY_API_KEY and BLINDPAY_INSTANCE_ID from environment variables/secrets.
- Authenticate with: Authorization: Bearer ${BLINDPAY_API_KEY}
- Build a form where a user enters an amount in USDC and a destination
  (bank account / blockchain wallet), shows the live quote, and submits the payout.
- Never expose the API key in client code: all BlindPay calls go through the backend.
```

```ts [Backend route]
const res = await fetch(
  `https://api.blindpay.com/v1/instances/${instanceId}/quotes`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.BLINDPAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    // request_amount is in minor units; 10000000 = 10 USDC at 6 decimals
    body: JSON.stringify({ currency_type: 'sender', request_amount: 10000000 }),
  },
)
const quote = await res.json()
```

**Note:**

Keep the secret API key server-side in all four builders: a backend/edge function, a Next.js route handler, or a server-only environment variable. Never call BlindPay from client-side code.

## Related

- [API reference](https://api.blindpay.com/reference)
- [Fiat overview](overview.md)
- [Stablecoin overview](overview.md)
- [API keys](../essentials/api-keys.md)
- [Webhooks](../essentials/webhooks.md)
