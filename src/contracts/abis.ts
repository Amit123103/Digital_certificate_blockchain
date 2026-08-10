export const CertificateRegistryABI = [
  "function registerCertificate(string certificateId, bytes32 certificateHash, string productId)",
  "function revokeCertificate(string certificateId)",
  "function verifyCertificate(string certificateId, bytes32 inputHash) view returns (bool isValid, bool isRevoked, bool hashMatch)",
  "function isCertificateValid(string certificateId) view returns (bool)",
  "function getCertificate(string certificateId) view returns (bytes32 certificateHash, string id, string productId, address issuer, uint256 issuedAt, bool revoked)",
  "function certificateExists(string certificateId) view returns (bool)",
  "event CertificateRegistered(string indexed certificateId, bytes32 indexed certificateHash, string productId, address indexed issuer, uint256 issuedAt)",
  "event CertificateRevoked(string indexed certificateId, address indexed revokedBy, uint256 revokedAt)"
];

export const ProductRegistryABI = [
  "function registerProduct(string productId, string name, string description, string certificateId, string metadataURI)",
  "function updateProductStatus(string productId, string newStatus)",
  "function transferOwnership(string productId, address newOwner)",
  "function getProduct(string productId) view returns (string id, string name, string description, address manufacturer, string certificateId, uint256 manufacturingDate, address currentOwner, string status, string metadataURI)",
  "function productExists(string productId) view returns (bool)",
  "event ProductRegistered(string indexed productId, string name, address indexed manufacturer, string certificateId, uint256 createdAt)",
  "event ProductUpdated(string indexed productId, string newStatus, address indexed updatedBy)",
  "event ProductTransferred(string indexed productId, address indexed from, address indexed to)"
];

export const SupplyChainABI = [
  "function recordTransfer(string productId, address to, string location, string status, string notes)",
  "function getProductHistory(string productId) view returns (tuple(string productId, address from, address to, string location, uint256 timestamp, string status, string notes)[])",
  "function getEventCount(string productId) view returns (uint256)",
  "event SupplyChainEventCreated(string indexed productId, address indexed from, address indexed to, string location, uint256 timestamp, string status, string notes)"
];

export const ProductNFTABI = [
  "function mintProductNFT(string productId, string metadataURI) returns (uint256)",
  "function getTokenIdByProductId(string productId) view returns (uint256)",
  "function getProductIdByTokenId(uint256 tokenId) view returns (string)",
  "function isProductMinted(string productId) view returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function approve(address to, uint256 tokenId)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "event ProductNFTMinted(uint256 indexed tokenId, string indexed productId, string certificateId, address indexed owner, string tokenURI)"
];

export const MarketplaceABI = [
  "function listNFT(address nftContract, uint256 tokenId, uint256 price) returns (uint256)",
  "function cancelListing(uint256 listingId)",
  "function buyNFT(uint256 listingId) payable",
  "function getListing(uint256 listingId) view returns (tuple(uint256 listingId, address nftContract, uint256 tokenId, address seller, uint256 price, bool active))",
  "function marketplaceFeeBps() view returns (uint256)",
  "event NFTListed(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 price)",
  "event NFTListingCancelled(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller)",
  "event NFTSold(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, address buyer, uint256 price)"
];

export const MockUSDABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function faucet(address to, uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export const LendingPoolABI = [
  "function setNFTValuation(uint256 tokenId, uint256 valuation)",
  "function depositAndBorrow(uint256 tokenId, uint256 borrowAmount) returns (uint256)",
  "function calculateTotalRepayment(uint256 loanId) view returns (uint256)",
  "function repayLoan(uint256 loanId)",
  "function getLoanDetails(uint256 loanId) view returns (tuple(uint256 loanId, uint256 tokenId, address borrower, uint256 collateralValue, uint256 borrowedAmount, uint256 interestRate, uint256 startTime, bool repaid, bool liquidated))",
  "function nftValuations(uint256 tokenId) view returns (uint256)",
  "event ValuationSet(uint256 indexed tokenId, uint256 valuation)",
  "event NFTDeposited(uint256 indexed loanId, uint256 indexed tokenId, address indexed borrower)",
  "event LoanBorrowed(uint256 indexed loanId, uint256 indexed tokenId, address indexed borrower, uint256 amount)",
  "event LoanRepaid(uint256 indexed loanId, uint256 indexed tokenId, address indexed borrower, uint256 amountPaid)",
  "event NFTWithdrawn(uint256 indexed loanId, uint256 indexed tokenId, address indexed borrower)"
];

export const GovernanceTokenABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address account) view returns (uint256)",
  "function faucet(address to, uint256 amount)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export const DAOABI = [
  "function createProposal(string title, string description) returns (uint256)",
  "function castVote(uint256 proposalId, uint8 voteType)",
  "function executeProposal(uint256 proposalId)",
  "function getProposal(uint256 proposalId) view returns (tuple(uint256 id, string title, string description, address proposer, uint256 votesFor, uint256 votesAgainst, uint256 votesAbstain, uint256 startTime, uint256 endTime, bool executed, bool canceled))",
  "function hasVotedOnProposal(uint256 proposalId, address voter) view returns (bool)",
  "event ProposalCreated(uint256 indexed proposalId, string title, address indexed proposer, uint256 startTime, uint256 endTime)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 voteType, uint256 weight)",
  "event ProposalExecuted(uint256 indexed proposalId, address indexed executor)"
];
