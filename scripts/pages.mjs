// Source of truth for which docs pages become skill references, and in what order.
// Each group maps to references/<dir>/ in the skill. `files` are docs-relative
// paths without the .md extension; `glob: 'kb'` pulls every page in that folder.

export const GROUPS = [
  {
    dir: 'getting-started',
    title: 'Getting started',
    files: [
      'introduction',
      'overview',
      'quickstart-payout',
      'quickstart-payin',
      'sdks',
      'build-with-ai',
    ],
  },
  {
    dir: 'essentials',
    title: 'Essentials',
    files: [
      'learn/instances',
      'learn/sandbox-vs-production',
      'learn/billing',
      'learn/partner-fees',
      'learn/customers',
      'learn/terms-of-service',
      'learn/rfi',
      'learn/limit-increase',
      'learn/upload',
      'learn/analyze-document',
      'learn/api-keys',
      'learn/webhooks',
      'learn/webhooks-events',
      'learn/webhooks-verification',
    ],
  },
  {
    dir: 'payouts',
    title: 'Payouts (money out to a bank account)',
    files: [
      'payouts',
      'bank-accounts',
      'payout-quotes',
      'payout-managed-wallet',
      'payout-evm',
      'payout-stellar',
      'payout-solana',
      'offramp-wallets',
    ],
  },
  {
    dir: 'payins',
    title: 'Payins (money in from a bank account)',
    files: [
      'payins',
      'payin-quotes',
      'blockchain-wallets',
      'payin-managed-wallet',
      'payin-blockchain-wallet',
    ],
  },
  {
    dir: 'payables',
    title: 'Payables (paying a registered bill)',
    files: [
      'payables',
      'payable-boleto-pix',
      'payable-invoice',
      'payable-managed-wallet',
      'payable-evm',
    ],
  },
  {
    dir: 'virtual-accounts',
    title: 'Virtual accounts',
    files: ['virtual-accounts', 'virtual-accounts-create'],
  },
  {
    dir: 'wallets',
    title: 'Wallets, transfers and stablecoins',
    files: [
      'store',
      'wallets',
      'send',
      'transfer-quotes',
      'transfers',
      'receive',
    ],
  },
  {
    dir: 'kb',
    title: 'Knowledge base (compliance, coverage, operations)',
    glob: 'kb',
  },
  {
    dir: 'migrations',
    title: 'Migration guides (moving from another provider)',
    glob: 'migrations',
  },
  {
    dir: 'integrations',
    title: 'AI tooling integrations',
    glob: 'integrations',
  },
]
