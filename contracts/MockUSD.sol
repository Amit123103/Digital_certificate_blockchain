// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSD
 * @dev ERC-20 Mock Stablecoin used for DeFi lending and liquidity testing.
 */
contract MockUSD is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Mock USD Token", "mUSD") Ownable(initialOwner) {
        _mint(initialOwner, 1_000_000 * 10**decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function faucet(address to, uint256 amount) external {
        require(amount <= 10_000 * 10**decimals(), "Faucet drip limit 10,000 mUSD");
        _mint(to, amount);
    }
}
