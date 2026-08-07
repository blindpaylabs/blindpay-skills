# Rejection reasons

Reason codes and messages returned when an application or document is rejected during verification.

Source: https://blindpay.com/docs/kb/rejection-reasons

## Summary

When an application or document is rejected during verification, BlindPay returns a reason code and message explaining the outcome. The table below lists every code, from document-quality issues (corners cut off, low resolution, photocopies) to compliance and commercial decisions. Most document rejections can be resolved by re-uploading a clear, full, in-date original.

## Reason codes

| # | Reason Code | Reason Message |
| --- | --- | --- |
| 1 | Business activity | The business industry classification (NAICS, CNAE or similar) listed in the articles of incorporation does not match the company's stated business activity. |
| 2 | Commercial | Commercial Reason. |
| 3 | Compliance Verification | This decision is based on non-compliance with the criteria established in our Internal Compliance Policies and risk assessment guidelines. For reasons of confidentiality and security, we do not provide specific details regarding our internal approval criteria. |
| 4 | Document corners cut off | We were unable to accept the Identity Document because some edges or corners were cut off in the photo. Please re-upload a clear, full-page photo, ensuring that all four corners of the document are completely visible within the frame. |
| 5 | Document not readable | We were unable to verify the Identity Document because the document image provided is blurry, has glare, or is too low resolution. Please upload a new, clear photo, ensuring that all four corners of the document are visible and all text is easy to read. |
| 6 | Document photo with low quality | We were unable to verify the Identity Document because the document image provided is blurry, has glare, or is too low resolution. Please upload a new, clear photo, ensuring that all four corners of the document are visible and all text is easy to read. |
| 7 | Duplicated | Duplicated Account. |
| 8 | Expired | The documentation provided is expired. Please submit a valid document. |
| 9 | Incorrect Proof of Address Document (POA) | The document provided does not meet our [compliance requirements](proof-of-address.md). Please ensure it is less than 90 days old, shows the full page, contains an emission date, and is issued under the user/entity name. |
| 10 | Low quality selfie | We couldn't verify the selfie because it was blurry, dark, or out of focus. Please restart the onboarding process and try again with a clearer, well-lit selfie. |
| 11 | Nested | [Nested Payments](nested-payments.md). |
| 12 | No Response to RFI | Application rejected due to customer failure to respond to Enhanced Due Diligence (EDD) / [RFI](information-requests.md) requests. |
| 13 | Photocopy | New identification document is required. The attached ID is a scan, photocopy, picture of a screen, or a cropped image. Please upload a fresh photo of the original document taken directly from the webcam or phone camera. |
| 14 | Reversal Payments | Reversal Payments. |

## Related

- [KYC Basics — photo tips](kyc-basics.md#photo-tips) · [Proof of Address](proof-of-address.md)
- [Requests for Information](information-requests.md)
