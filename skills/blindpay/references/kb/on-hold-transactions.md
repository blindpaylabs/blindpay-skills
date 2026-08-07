# On-hold transactions

Transactions flagged as suspicious by BlindPay's monitoring system, held pending compliance review or a Request for Information.

Source: https://blindpay.com/docs/kb/on-hold-transactions

## Summary

On-hold transactions are payins or payouts that BlindPay's transaction monitoring system flags as suspicious to prevent fraud and money laundering. BlindPay's compliance team reviews each flagged transaction, and may send a Request for Information (RFI) asking for transaction details. If the RFI is not answered within 24 hours, the transaction may be refunded to the sender.

## How On-Hold Transactions Are Handled

When a transaction is flagged, BlindPay's compliance team manually reviews it to determine whether it's a false positive.

If the flag cannot be cleared internally, BlindPay sends you an email (or Slack message) with the transaction details and a [Request for Information (RFI)](information-requests.md) asking for:

- The relationship between the sender and the customer
- The purpose of the transaction
- The expected outcome of the transaction
- Any other information that helps us understand the transaction

Once you respond, the compliance team reviews the information and decides whether to release the transaction.

**Warning:**

**Note**: If the RFI is not answered within **24 hours**, the transaction may be refunded to the sender.

## Upcoming API Integration

BlindPay is replacing the manual RFI process with a dedicated API endpoint for submitting transaction information programmatically:

1. You receive a [webhook](../essentials/webhooks.md) with the `on_hold` status.
2. You send a POST request to the new endpoint with the transaction information.
3. BlindPay collects and reviews it automatically.

For programmatic handling of KYC/KYB RFIs, see the [RFI API documentation](information-requests.md).

## Related

- [Requests for Information](information-requests.md) · [Webhooks](../essentials/webhooks.md)
- [SWIFT Statuses](swift-statuses.md)
