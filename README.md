# TrustChain Platform

> **Digital Certificate Verification → Supply Chain Tracking → NFT Minting → NFT Marketplace → DeFi Lending → DAO Governance**

TrustChain is a decentralized enterprise platform built using Next.js 14, Ethers.js, Solidity ^0.8.20, Hardhat, OpenZeppelin, and Prisma.

---

## Architecture

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

## Core Features

1. **Digital Certificate Verification**: SHA-256 / Keccak-256 cryptographic document hashing, on-chain registry, public audit portal (`/verify`), and revocation management.
2. **Product Registry**: Enterprise product registration linked strictly to valid certificates.
3. **Supply Chain Provenance Tracker**: Interactive visual timeline logging multi-role custodial transfer events (`Manufacturer` → `Distributor` → `Warehouse` → `Retailer` → `Customer`).
4. **Product NFT Tokenization**: Converts verified products into ERC-721 NFTs with duplicate mint prevention.
5. **NFT Marketplace**: Decentralized listing, non-custodial escrow, buyer purchasing, seller payouts, and platform fee collection (2.5%).
6. **DeFi Collateral Loans**: Lock Product NFTs as collateral to borrow `mUSD` stablecoins up to 50% LTV, repay with 5% interest, and unlock collateral.
7. **DAO Governance**: Token-weighted (`TCG`) proposal creation, voting (FOR/AGAINST/ABSTAIN), quorum check, and automated execution.
8. **Admin & Analytics**: Role access control management, fee parameter configuration, indexer synchronization, and real-time transaction explorer.

---

## Smart Contracts

| Contract | Purpose |
|---|---|
| `CertificateRegistry.sol` | Stores SHA-256 certificate hashes, authorizes issuers, handles verification & revocation |
| `ProductRegistry.sol` | Registers products linked to valid certificates |
| `SupplyChain.sol` | Tracks custodial movement events, locations, timestamps, and status notes |
| `ProductNFT.sol` | Mintable ERC-721 token representing verified physical assets |
| `Marketplace.sol` | Non-custodial trading marketplace with seller payouts and platform fees |
| `MockUSD.sol` | ERC-20 stablecoin used for lending pool liquidity |
| `LendingPool.sol` | NFT-backed DeFi lending protocol enforcing 50% LTV limits |
| `GovernanceToken.sol` | ERC-20 governance voting token (`TCG`) |
| `DAO.sol` | Token-weighted proposal creation, voting, and proposal execution |

---

## Installation & Local Setup

### Prerequisites
- Node.js 18+
- npm / npx

### Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Compile Smart Contracts
npm run contracts:compile

# 3. Run Hardhat Tests
npm run contracts:test

# 4. Start Local Hardhat Blockchain (Terminal 1)
npm run blockchain

# 5. Deploy Contracts & Seed Demo Data (Terminal 2)
npm run contracts:deploy
npm run db:push
npm run db:seed

# 6. Launch Next.js Development Web Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## End-to-End Demo Journey

1. **Connect Wallet / Switch Account**: Use the top-right account switcher to select pre-funded signers (`Admin`, `Issuer`, `Manufacturer`, `Distributor`, `Retailer`, `Customer`).
2. **Digital Certificate Portal (`/certificates`)**: Register a certificate or upload a document to `/verify` to view `VERIFIED ✓` report.
3. **Product Registry (`/products`)**: Register a product linked to your valid Certificate ID.
4. **Supply Chain Custody (`/supply-chain/[productId]`)**: Record custodial transfer to next custodian wallet with location and manifest notes.
5. **Product NFT Tokenization (`/nft`)**: Mint an ERC-721 NFT for the verified product.
6. **Marketplace Trading (`/marketplace`)**: List the NFT for 1.5 ETH and purchase it from a second account.
7. **DeFi Collateral Loans (`/defi`)**: Deposit the NFT as collateral, borrow 300 mUSD, repay with interest, and retrieve collateral.
8. **DAO Governance (`/dao`)**: Claim TCG tokens, create a proposal, cast weighted votes, and execute approved decisions.

---

## API Endpoints

- `GET /api/stats`: System metrics aggregation
- `GET /api/certificates`: List digital certificates
- `GET /api/certificates/:id`: Get certificate detail & product link
- `GET /api/products`: List registered products
- `GET /api/products/:id`: Get product detail, certificate & supply chain history
- `GET /api/sync`: Trigger manual event indexer sync

---

## Documentation

Full project documentation is available in the `docs/` folder:
- [architecture.md](file:///c:/Users/amita/OneDrive/Desktop/blockchain_project/docs/architecture.md)
- [smart-contracts.md](file:///c:/Users/amita/OneDrive/Desktop/blockchain_project/docs/smart-contracts.md)
- [viva-questions.md](file:///c:/Users/amita/OneDrive/Desktop/blockchain_project/docs/viva-questions.md)
- [presentation-outline.md](file:///c:/Users/amita/OneDrive/Desktop/blockchain_project/docs/presentation-outline.md)
- [project-report.md](file:///c:/Users/amita/OneDrive/Desktop/blockchain_project/docs/project-report.md)
