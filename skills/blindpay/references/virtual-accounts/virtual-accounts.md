# Virtual accounts

Issue a virtual account (virtual bank account) that receives USD bank transfers and settles automatically to stablecoins like USDC or USDT in your customer's wallet.

Source: https://blindpay.com/docs/virtual-accounts

Your customer gets a real US bank account in their own name, with its own routing and account number. Anyone can send money to it like to any other bank account. Each deposit creates a [payin](../payins/payins.md). BlindPay converts the deposit and sends USDC or USDT (USDB on development instances) to the wallet you linked at creation. You do not build a checkout flow or show payment instructions. The account number is the integration.

**Note:**

Transaction fees for each deposit are charged on your invoice at the end of the billing cycle.

## How it works

Each virtual account belongs to one customer and settles to one blockchain wallet. A customer can hold more than one account. Give the routing and account number to the payer. Track each deposit through the payin it creates.

### Available account types

| Type | Payment methods | Countries | SLA | Cost |
| --- | --- | --- | --- | --- |
| US (individuals and businesses) | ACH, Wire, SWIFT | US and foreign | 24 hours | $1.50/mo per account |
| US (businesses, foreign senders) | ACH, RTP, Wire, SWIFT | Foreign only | 3-5 business days | $1.50/mo per account |
| US (businesses, US senders) | ACH, Wire, SWIFT | US only | 3-5 business days | $1.50/mo per account |

**Note:**

Named payouts: when a virtual account is issued to an end user, all payouts originating from that account are sent under the end user's name rather than a pooled or omnibus account name. This ensures the recipient sees the actual payer on incoming transfers and aligns with originator-information requirements for payment-rail compliance. These accounts can also send and collect third-party payments.

### Approval process

After a virtual account is created via the API, it goes through a two-stage review:

1. **Compliance review.** The virtual account starts in `pending_review` status while BlindPay's compliance team reviews the application.
2. **Bank review.** Once compliance approves, the account moves to `verifying` while BlindPay's banking partner does final approval.

Issuance SLAs vary by account type, see the table above. Approval is not guaranteed at either stage: both BlindPay's compliance team and the banking partner reserve the right to reject an application. On a development instance, virtual accounts skip both stages and are created directly in `approved` status.

### Statuses

| Status | Description |
| --- | --- |
| `pending_review` | The virtual account has been created and is awaiting compliance review. |
| `verifying` | Compliance approved. The virtual account has been submitted to the bank. |
| `approved` | The bank has approved the virtual account. It is now active, with real routing and account numbers, and the `virtualAccount.complete` webhook has fired. |
| `rejected` | The virtual account was rejected during compliance or bank review. |

**Warning:**

A customer can't have two non-deleted virtual accounts of the same type unless the earlier one was `rejected`. Create a new customer, or wait for the rejection, before retrying that type.

## Frequently asked questions

**What is a stablecoin virtual account?** A dedicated bank account issued in your customer's name whose incoming bank deposits (ACH, wire, or SWIFT) are automatically converted to stablecoins like USDC or USDT and delivered to a linked wallet.

**How do I create a virtual account for USDC?** Create a customer that has completed KYC, link a wallet as the settlement destination, and call the virtual accounts API. See [Create a virtual account](virtual-accounts-create.md) for the full request.

**Can a virtual account receive international payments?** Yes. US virtual accounts accept ACH, wire, and SWIFT transfers from US and foreign senders, depending on the account type.

**How much does a stablecoin virtual account cost?** US virtual accounts cost $1.50 per month per account. Deposits generate payins, and transaction fees are charged on your monthly invoice.

## Next

- [Create a virtual account](virtual-accounts-create.md): prerequisites, required fields, the create request, and webhooks.

## Related

- [Bank transfer in](../payins/payins.md)
- [Blockchain wallets](../payins/blockchain-wallets.md)

**Advanced flavor (stablecoin and blockchain mechanics)**

- [Offramp wallets](../payouts/offramp-wallets.md): the mirror of a virtual account, a deposit address whose incoming stablecoin pays out as fiat

- [Knowledge base: virtual account requirements](../kb/virtual-accounts.md)
- [Learn: webhooks](../essentials/webhooks.md)
