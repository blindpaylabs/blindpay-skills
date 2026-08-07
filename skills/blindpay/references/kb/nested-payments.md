# Nested payments

Nesting is moving money on behalf of a party BlindPay cannot see; this guide explains how to recognize it and stay compliant.

Source: https://blindpay.com/docs/kb/nested-payments

## Summary

Nesting occurs when one BlindPay customer uses their account to move money for another party that BlindPay has not onboarded, screened, or approved. You may not use your BlindPay account, wallet, or virtual account to process, facilitate, or move payments on behalf of any party whose identity or transaction activity is not visible to BlindPay. If BlindPay cannot see who owns the funds, who is sending or receiving them, or what a transaction is for, the structure is nested and may be delayed, frozen, or terminated.

## The Core Rule

> **You may not use your BlindPay account, wallet, or virtual account to process, facilitate, or move payments on behalf of any party whose identity or transaction activity is not visible to BlindPay.**

That is the entire principle in one sentence. Everything else in this document exists to help you recognize what that looks like in practice for your specific business.

## What Is Nesting

Nesting happens when one customer uses their BlindPay account to move money for another party that BlindPay has not onboarded, screened, or approved. The key word is **visibility**: if BlindPay cannot see who really owns the funds, who is really sending or receiving them, or what the transaction is really for, the structure is nested.

### Common Signs of Nesting

- Funds in the account belong economically to someone other than the onboarded customer.
- Payment documentation (invoices, contracts, payroll files) names a different entity than the account holder.
- One account collects or distributes funds for multiple underlying businesses, users, or counterparties.
- Sub-accounts or virtual accounts each represent a different third party's money, not the customer's own.
- The customer is acting as an intermediary, aggregator, or pass-through layer without BlindPay's written approval.

### What Is NOT Nesting

A transaction is generally fine when the onboarded customer is acting for itself, the funds are its own, and the economic purpose belongs to that customer. Legitimate revenue for services the customer actually provided, or ordinary expenses paid from its own account for its own operations, are not nesting.

## The Quick Test

Before initiating any activity through BlindPay, run this simple check:

1. **Do the funds belong to your entity?** If no → likely nested.
2. **Does the documentation match your entity name?** If no → likely nested.
3. **Is the beneficiary visible to BlindPay?** If no → likely nested.
4. **Are there multiple underlying parties behind this single payment?** If yes → likely nested.
5. **All answers clear?** Proceed normally. ✅

Always provide a detailed and accurate description of the Nature of Business. Extensive details are required for a successful onboarding.

## Consequences of Non-Compliance

If BlindPay determines that a customer is engaging in nesting or other restricted activity, BlindPay may take one or more of the following actions: delay, reject, freeze, or reverse the transaction where possible; request additional information or documentation; impose limits on account activity; suspend or terminate the BlindPay account.

Where required, BlindPay may also report the activity to applicable law enforcement, regulatory authorities, banking partners, or other relevant counterparties consistent with its legal and compliance obligations.

## If Your Customer Was Rejected for Nesting

A rejection for nesting does not mean the underlying business cannot work with BlindPay. If one of your customers was rejected because their structure would create a nested relationship, there is a compliant path forward: onboard that business as its own BlindPay instance.

With their own instance, the business can then onboard all of its customers directly inside that instance. This gives BlindPay full visibility into every party involved, which avoids nested payments entirely.

Key points about this option:

- The new instance goes through the standard onboarding and compliance review as a direct BlindPay customer.
- The new instance receives its own API keys, fully independent from yours.
- There is no additional cost for setting up the new instance.
- Once approved, the business onboards its own customers inside its instance, so every payment has a visible, screened counterparty.

If this applies to one of your customers, reach out to our team and we will help set up the new instance.

*This guidance uses terminology consistent with the BlindPay Terms and Conditions. Where any inconsistency exists between this document and the governing customer terms, any applicable separate written agreement, or written instructions provided by BlindPay, the governing terms and written approval framework shall control.*

## Related

- [Terms of Service](kyc.md) · [Customers](kyc.md)
