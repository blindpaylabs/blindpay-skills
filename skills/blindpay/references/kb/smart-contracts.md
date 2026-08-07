# Smart contracts

USDB is BlindPay's test stablecoin, freely mintable on testnets, with deployed contract addresses across supported networks.

Source: https://blindpay.com/docs/kb/smart-contracts

## Summary

BlindPay provides USDB, a test stablecoin you can mint freely on testnets to develop and test your integration. The contract is a standard ERC-20 with an open `mintUSDB` function, deployed on Sepolia, Arbitrum Sepolia, Base Sepolia, and Polygon Amoy.

## USDB Test Stablecoin

Contract code:

```solidity [BankAccounts.sol]
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDB is ERC20 {
  constructor() ERC20("USDB", "USDB") {
    _mint(msg.sender, 5000 * 10 ** 18);
  }

  function mintUSDB(uint256 amount) external {
    _mint(msg.sender, amount);
  }
}
```

Deployed addresses:

| Network          | Address                                    |
| ---------------- | ------------------------------------------ |
| Sepolia          | 0x8Cb65c1334b348E8d486AC935a784967AAEbB6e3 |
| Arbitrum Sepolia | 0x4D423D2cfB373862B8E12843B6175752dc75f795 |
| Base Sepolia     | 0x4D423D2cfB373862B8E12843B6175752dc75f795 |
| Polygon Amoy     | 0x587C3D85C9272484A6e40a8300290F55a4D5a589 |
