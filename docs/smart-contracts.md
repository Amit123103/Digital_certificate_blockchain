# TrustChain Smart Contracts Documentation

## Core Smart Contracts

### 1. `CertificateRegistry.sol`
- **Inheritance**: `AccessControl`
- **Key Functions**:
  - `registerCertificate(certificateId, certificateHash, productId)`
  - `verifyCertificate(certificateId, inputHash)`
  - `revokeCertificate(certificateId)`

### 2. `ProductRegistry.sol`
- **Inheritance**: `AccessControl`
- **Key Functions**:
  - `registerProduct(productId, name, description, certificateId, metadataURI)`
  - `updateProductStatus(productId, status)`
  - `transferOwnership(productId, newOwner)`

### 3. `SupplyChain.sol`
- **Key Functions**:
  - `recordTransfer(productId, to, location, status, notes)`
  - `getProductHistory(productId)`

### 4. `ProductNFT.sol`
- **Inheritance**: `ERC721URIStorage`, `Ownable`
- **Key Functions**:
  - `mintProductNFT(productId, metadataURI)`

### 5. `Marketplace.sol`
- **Inheritance**: `ReentrancyGuard`, `Ownable`
- **Key Functions**:
  - `listNFT(nftContract, tokenId, price)`
  - `buyNFT(listingId)`
  - `cancelListing(listingId)`

### 6. `MockUSD.sol` & `LendingPool.sol`
- **Inheritance**: `ERC20`, `ReentrancyGuard`, `Ownable`
- **Key Functions**:
  - `setNFTValuation(tokenId, valuation)`
  - `depositAndBorrow(tokenId, borrowAmount)`
  - `repayLoan(loanId)`

### 7. `GovernanceToken.sol` & `DAO.sol`
- **Key Functions**:
  - `createProposal(title, description)`
  - `castVote(proposalId, voteType)`
  - `executeProposal(proposalId)`
