# Instance requests

How BlindPay compliance asks your team for additional information about your own account, and how to respond before the 27-day window closes.

Source: https://blindpay.com/docs/kb/instance-requests

An Instance RFI is a Request for Information directed at your instance (your BlindPay account) rather than at one of your customers. Compliance uses it to collect updated business information or supporting documents from your team, for example during a periodic review. For RFIs about a specific customer, see [Information requests](information-requests.md).

## How it differs from a customer RFI

| Aspect | Customer RFI | Instance RFI |
| --- | --- | --- |
| Who it is about | One of your customers | Your own company |
| Where you answer | The customer's profile page | Your instance settings page |
| Effect while open | That customer cannot transact | No effect on your account or payments |
| Missed deadline | The customer is auto-rejected | The request expires, nothing else happens |

## When an instance RFI is created

Compliance creates an instance RFI whenever it needs information about your company itself. Common triggers include:

- A periodic review of your account requires refreshed documents
- Your business description or website no longer matches what we have on file
- Ownership changes need an updated share register or UBO documentation
- A proof of address or source of funds document needs to be renewed

Each RFI is built as a list of sections. Each section has a title, a description explaining what compliance needs, and one or more fields to fill in (text, file upload, or dropdown).

## Email notifications

When an instance RFI is opened, BlindPay emails **every active member of your instance**. The cadence is:

| Day | Email | Purpose |
| --- | --- | --- |
| 0 | Action Required | Lists each section and the fields requested. Includes the deadline. |
| 7 | Reminder | Sent only if the RFI is still pending. |
| 17 | Final Notice | Sent only if the RFI is still pending. |
| 27 | Expired | Sent if the deadline passes without a submission. |

All emails come from `compliance@blindpay.com` and link to your dashboard at `app.blindpay.com`.

**Note:**

Emails are sent to every non-deleted user in your instance. To control who receives them, manage your team's membership in **Settings → Members**.

## Responding to an instance RFI

1. Open **Settings → Instance** in your BlindPay dashboard. A "Request for Information" section highlights the open RFI.
2. Review each requested section and collect the documents or explanations.
3. Upload the files and submit the response in a single action.

Once submitted, the RFI moves to `submitted`, the reminder emails stop, and compliance reviews the response. If anything else is needed, a new RFI is opened.

**Warning:**

**Submit the entire RFI at once.** The submission is single-shot. All required fields must be filled before you can send the response.

## Deadlines and expiry

If 27 days pass without a submission, the RFI is marked expired and a final email is sent to your team. Unlike customer RFIs, **nothing happens to your account automatically**: no status changes, no blocked payments. Our compliance team follows up with you directly if the information is still required.

## Best practices

- **Answer from the dashboard.** The instance settings page validates every required field before letting you send.
- **Keep your member list clean.** Only members who should see compliance correspondence should remain on the instance.
- **Match the format compliance asks for.** If a section requires a utility bill, a bank statement won't satisfy it.

## Related

- [Information requests](information-requests.md): RFIs about a specific customer
- [KYB documents](kyb-documents.md): business verification document requirements
