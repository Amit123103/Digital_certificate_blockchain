// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GovernanceToken
 * @dev ERC-20 token (TCG) representing voting weight in the TrustChain DAO.
 */
contract GovernanceToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("TrustChain Governance Token", "TCG") Ownable(initialOwner) {
        _mint(initialOwner, 10_000_000 * 10**decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function faucet(address to, uint256 amount) external {
        require(amount <= 1_000 * 10**decimals(), "Faucet drip limit 1,000 TCG");
        _mint(to, amount);
    }
}
