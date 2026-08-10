# TrustChain Viva & Technical Q&A Guide

## Sample Viva Questions and Answers

### Q1: Why use blockchain for digital certificate verification?
**Answer**: Centralized databases are vulnerable to single-point-of-failure, unauthorized administrative tampering, or database compromise. Storing cryptographic SHA-256 / Keccak-256 hashes on an EVM smart contract ensures immutable, publicly auditable authenticity verification without exposing private document content.

### Q2: How does TrustChain prevent fake or duplicate product NFTs?
**Answer**: `ProductNFT.sol` enforces a hard smart-contract constraint before minting:
1. It queries `CertificateRegistry.sol` to verify that the associated certificate exists, is valid, and is unrevoked.
2. It maintains a strict 1:1 mapping between Product ID and Token ID (`mapping(string => bool) private _isMinted`), preventing double minting for the same physical product.

### Q3: How is reentrancy prevented in the Marketplace and DeFi Lending Pool contracts?
**Answer**: All state-changing functions transferring ETH or ERC-20 tokens utilize OpenZeppelin's `ReentrancyGuard` with the `nonReentrant` modifier, enforcing the **Checks-Effects-Interactions** design pattern.

### Q4: How does the event indexer synchronize data?
**Answer**: The custom indexer daemon listens to smart contract event logs (`CertificateRegistered`, `SupplyChainEventCreated`, `NFTSold`, `VoteCast`) via Ethers.js filters and mirrors state into the Prisma SQLite/PostgreSQL database for lightning-fast frontend queries.

### Q5: What is the LTV limit in the DeFi module and how is interest calculated?
**Answer**: The DeFi lending pool enforces a maximum 50% Loan-to-Value (LTV) limit based on oracle valuations. Loans incur a 5% simple interest rate calculated via `calculateTotalRepayment(loanId)`.
