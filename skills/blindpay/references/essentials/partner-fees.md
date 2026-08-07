# Partner fees

Add percentage or flat fees to your customers' transactions and withdraw the accumulated revenue monthly.

Source: https://blindpay.com/docs/learn/partner-fees

## What it is

A partner fee is a markup you add on top of transactions processed through BlindPay. BlindPay collects the fee from your customer during each transaction, accumulates it over the calendar month, and releases the balance to you for withdrawal on the first day of the following month.

## Fee types

You can configure two types of fees, set independently for payins and payouts:

| Type | Description |
| --- | --- |
| Percentage | A percentage of the transaction amount |
| Flat | A fixed amount per transaction |

## Monthly collection cycle

Partner fees follow a monthly collection and withdrawal cycle:

- Fees are collected automatically from your customer during each transaction, throughout the month.
- All collected fees accumulate over the calendar month.
- On the first day of the following month, the total balance is released and becomes available for withdrawal.
- BlindPay nets your outstanding invoice out of the accumulated fees first. You never pay your BlindPay invoice separately; you receive the net amount.

You receive a `payin.partnerFee` or `payout.partnerFee` webhook event as each fee is collected. Track collection status through the `tracking_partner_fee` object in quote and transaction responses.

## Configure a partner fee

### Create a fee configuration

Create a fee configuration for payins, payouts, or both. Percentage fees are in basis points (`100` means 1%, capped at `1000` for 10%); flat fees are integers in minor units (`200` means $2.00).

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/partner-fees \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Display Name",
    "payin_percentage_fee": 100,
    "payin_flat_fee": 0,
    "payout_percentage_fee": 0,
    "payout_flat_fee": 200
  }'
```

Save the `id` from the response: this is your partner fee ID (`pf_...`). You can also manage fee configurations from the [BlindPay dashboard](https://app.blindpay.com), under the instance's Partner Fees tab.

### Pass it in your quote requests

Reference the `partner_fee_id` in a payin quote, payout quote, or transfer quote to apply that fee to the transaction.

```bash [cURL]
curl --request POST \
  --url https://api.blindpay.com/v1/instances/in_000000000000/payin-quotes \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "blockchain_wallet_id": "bw_000000000000",
    "currency_type": "sender",
    "cover_fees": false,
    "request_amount": 10000,
    "payment_method": "ach",
    "token": "USDC",
    "partner_fee_id": "pf_000000000000"
  }'
```

```js [index.js]
const response = await fetch(
  'https://api.blindpay.com/v1/instances/in_000000000000/payin-quotes',
  {
    method: 'POST',
    headers: {
      Authorization: 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      blockchain_wallet_id: 'bw_000000000000',
      currency_type: 'sender',
      cover_fees: false,
      request_amount: 10000,
      payment_method: 'ach',
      token: 'USDC',
      partner_fee_id: 'pf_000000000000',
    }),
  }
)

const data = await response.json()
```

**Remember:** replace `YOUR_API_KEY` with your API key, `in_000000000000` with your instance ID.

## Quote response fields

Each payin quote, payout quote, and transfer quote response includes:

| Field | Description |
| --- | --- |
| `partner_fee_amount` | Exact amount collected as a partner fee for this transaction |
| `tracking_partner_fee.status` | Collection status |
| `tracking_partner_fee.transaction_hash` | On-chain hash when the fee is delivered |
| `tracking_partner_fee.completed_at` | Timestamp when fee delivery completed |

## Example

A 1% payin fee and a $2.00 flat payout fee configured on the same instance:

| Transaction | Customer pays | Partner fee collected |
| --- | --- | --- |
| $100 payin | $101.00 | $1.00 |
| $100 payout | $102.00 | $2.00 |

Monthly settlement example:

| | Amount |
| --- | --- |
| Total partner fees collected in January | $500.00 |
| BlindPay invoice for January | $250.00 |
| Available for withdrawal on February 1 | $250.00 |

## Webhooks

**Note:**

Subscribe to `payin.partnerFee` and `payout.partnerFee` to track fee collection in real time, instead of polling quote or transaction objects.

## Related

- [Webhooks](webhooks.md): full event reference and signature verification
- [Billing](billing.md): how BlindPay invoices your account
- [Fiat receive](../payins/payins.md): payin quotes that accept `partner_fee_id`
- [Fiat send](../payouts/payouts.md): payout quotes that accept `partner_fee_id`
- [Stablecoin send](../wallets/send.md): transfer quotes that accept `partner_fee_id`
