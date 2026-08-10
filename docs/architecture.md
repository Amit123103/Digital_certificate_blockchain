# TrustChain Architecture & Technical Specification

## System Overview
TrustChain is a multi-tier decentralized enterprise application built around an EVM-compatible core.

```text
                                   +-------------------+
                                   |   User / Wallet   |
                                   +---------+---------+
                                             |
                                             v
                                   +-------------------+
                                   |  Next.js Frontend |
                                   |  (App Router UI)  |
                                   +----+---------+----+
                                        |         |
                     +------------------+         +------------------+
                     v                                               v
          +-------------------+                             +-------------------+
          | Next.js API /     |                             | Hardhat EVM       |
          | Express Backend   |                             | Smart Contracts   |
          +---------+---------+                             +---------+---------+
                    |                                                 |
                    v                                                 v
          +-------------------+                             +-------------------+
          | PostgreSQL /      |<======== Event Indexer =====| On-Chain State &  |
          | Prisma DB Cache   |          (Sync Listener)    | IPFS Storage      |
          +-------------------+                             +-------------------+
```

---

## On-Chain vs. Off-Chain Separation

### On-Chain Storage (Smart Contracts)
- Certificate Keccak-256 Hashes
- Issuer Authorization & Roles (OpenZeppelin AccessControl)
- Product Serial IDs & Certificate Linkage
- Chain-of-Custody Transfer Events & Timestamps
- ERC-721 Token Ownership & Royalties
- Marketplace Listings, Prices & Escrow State
- Collateralized Loan Positions & Repayment Terms
- DAO Proposals, Voting Weights & Execution Signals

### Off-Chain Storage (IPFS / Database Cache)
- High-Resolution Product Images & Documents
- Rich JSON Metadata Documents
- Search Indexes & Full-Text Queries
- Analytical Aggregations & Performance Metrics
