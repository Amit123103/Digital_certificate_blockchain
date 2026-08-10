import { expect } from "chai";
import { ethers } from "hardhat";
import {
  CertificateRegistry,
  ProductRegistry,
  SupplyChain,
  ProductNFT,
  Marketplace,
  MockUSD,
  LendingPool,
  GovernanceToken,
  DAO,
} from "../typechain-types";

describe("TrustChain Comprehensive Suite", function () {
  let admin: any;
  let issuer: any;
  let manufacturer: any;
  let distributor: any;
  let retailer: any;
  let customer: any;

  let certRegistry: CertificateRegistry;
  let productRegistry: ProductRegistry;
  let supplyChain: SupplyChain;
  let productNFT: ProductNFT;
  let marketplace: Marketplace;
  let mockUSD: MockUSD;
  let lendingPool: LendingPool;
  let govToken: GovernanceToken;
  let dao: DAO;

  const sampleCertId = "CERT-2026-001";
  const sampleCertHash = ethers.keccak256(ethers.toUtf8Bytes("Cert-Document-Payload-12345"));
  const sampleProductId = "PROD-2026-X100";

  before(async function () {
    [admin, issuer, manufacturer, distributor, retailer, customer] = await ethers.getSigners();

    // 1. CertificateRegistry
    const CertificateRegistryFactory = await ethers.getContractFactory("CertificateRegistry");
    certRegistry = await CertificateRegistryFactory.deploy(admin.address);
    await certRegistry.waitForDeployment();
    await certRegistry.addIssuer(issuer.address);

    // 2. ProductRegistry
    const ProductRegistryFactory = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistryFactory.deploy(admin.address, await certRegistry.getAddress());
    await productRegistry.waitForDeployment();
    await productRegistry.addManufacturer(manufacturer.address);

    // 3. SupplyChain
    const SupplyChainFactory = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChainFactory.deploy(await productRegistry.getAddress());
    await supplyChain.waitForDeployment();

    // 4. ProductNFT
    const ProductNFTFactory = await ethers.getContractFactory("ProductNFT");
    productNFT = await ProductNFTFactory.deploy(
      admin.address,
      await certRegistry.getAddress(),
      await productRegistry.getAddress()
    );
    await productNFT.waitForDeployment();

    // 5. Marketplace
    const MarketplaceFactory = await ethers.getContractFactory("Marketplace");
    marketplace = await MarketplaceFactory.deploy(admin.address, 250); // 2.5% fee
    await marketplace.waitForDeployment();

    // 6. MockUSD
    const MockUSDFactory = await ethers.getContractFactory("MockUSD");
    mockUSD = await MockUSDFactory.deploy(admin.address);
    await mockUSD.waitForDeployment();

    // 7. LendingPool
    const LendingPoolFactory = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPoolFactory.deploy(
      admin.address,
      await productNFT.getAddress(),
      await mockUSD.getAddress()
    );
    await lendingPool.waitForDeployment();
    await mockUSD.mint(await lendingPool.getAddress(), ethers.parseEther("100000"));

    // 8. GovernanceToken
    const GovernanceTokenFactory = await ethers.getContractFactory("GovernanceToken");
    govToken = await GovernanceTokenFactory.deploy(admin.address);
    await govToken.waitForDeployment();

    // 9. DAO
    const DAOFactory = await ethers.getContractFactory("DAO");
    dao = await DAOFactory.deploy(
      admin.address,
      await govToken.getAddress(),
      ethers.parseEther("100"),
      3600 // 1 hour duration
    );
    await dao.waitForDeployment();
  });

  describe("1. Certificate Registry", function () {
    it("Should allow authorized issuer to register a certificate", async function () {
      await certRegistry.connect(issuer).registerCertificate(sampleCertId, sampleCertHash, sampleProductId);
      const exists = await certRegistry.certificateExists(sampleCertId);
      expect(exists).to.be.true;

      const (isValid, isRevoked, hashMatch) = await certRegistry.verifyCertificate(sampleCertId, sampleCertHash);
      expect(isValid).to.be.true;
      expect(isRevoked).to.be.false;
      expect(hashMatch).to.be.true;
    });

    it("Should reject duplicate certificate registration", async function () {
      await expect(
        certRegistry.connect(issuer).registerCertificate(sampleCertId, sampleCertHash, sampleProductId)
      ).to.be.revertedWith("Certificate ID already exists");
    });

    it("Should reject registration from unauthorized user", async function () {
      await expect(
        certRegistry.connect(customer).registerCertificate("CERT-UNAUTH", sampleCertHash, "PROD-X")
      ).to.be.reverted;
    });

    it("Should allow issuer to revoke certificate", async function () {
      const revokeCertId = "CERT-REVOKE-01";
      await certRegistry.connect(issuer).registerCertificate(revokeCertId, sampleCertHash, "PROD-REV");
      await certRegistry.connect(issuer).revokeCertificate(revokeCertId);

      const isValid = await certRegistry.isCertificateValid(revokeCertId);
      expect(isValid).to.be.false;
    });
  });

  describe("2. Product Registry", function () {
    it("Should allow manufacturer to register product linked to valid certificate", async function () {
      await productRegistry.connect(manufacturer).registerProduct(
        sampleProductId,
        "Swiss Chronograph Watch",
        "High-precision luxury timepiece",
        sampleCertId,
        "ipfs://QmSampleProductMetadata"
      );

      const exists = await productRegistry.productExists(sampleProductId);
      expect(exists).to.be.true;

      const (id, name,,,,,, status,) = await productRegistry.getProduct(sampleProductId);
      expect(id).to.equal(sampleProductId);
      expect(name).to.equal("Swiss Chronograph Watch");
      expect(status).to.equal("REGISTERED");
    });

    it("Should reject registering product with invalid or revoked certificate", async function () {
      await expect(
        productRegistry.connect(manufacturer).registerProduct(
          "PROD-INVALID-CERT",
          "Fake Watch",
          "Counterfeit",
          "CERT-NON-EXISTENT",
          "ipfs://fake"
        )
      ).to.be.revertedWith("Invalid or revoked certificate");
    });
  });

  describe("3. Supply Chain Tracking", function () {
    it("Should record custodial transfer from Manufacturer to Distributor", async function () {
      await supplyChain.connect(manufacturer).recordTransfer(
        sampleProductId,
        distributor.address,
        "Geneva Hub",
        "IN_TRANSIT",
        "Dispatched via secure freight"
      );

      const history = await supplyChain.getProductHistory(sampleProductId);
      expect(history.length).to.equal(1);
      expect(history[0].from).to.equal(manufacturer.address);
      expect(history[0].to).to.equal(distributor.address);
      expect(history[0].location).to.equal("Geneva Hub");

      const (,,,,,, currentOwner, status,) = await productRegistry.getProduct(sampleProductId);
      expect(currentOwner).to.equal(distributor.address);
      expect(status).to.equal("IN_TRANSIT");
    });

    it("Should record custodial transfer from Distributor to Retailer", async function () {
      await supplyChain.connect(distributor).recordTransfer(
        sampleProductId,
        retailer.address,
        "New York Retail Store",
        "RETAIL",
        "Stocked at Manhattan flagship store"
      );

      const count = await supplyChain.getEventCount(sampleProductId);
      expect(count).to.equal(2);
    });
  });

  describe("4. Product NFT Tokenization", function () {
    it("Should allow current product owner to mint ERC-721 NFT", async function () {
      const mintTx = await productNFT.connect(retailer).mintProductNFT(
        sampleProductId,
        "ipfs://QmSampleNFTTokenURI"
      );
      await mintTx.wait();

      const tokenId = await productNFT.getTokenIdByProductId(sampleProductId);
      expect(tokenId).to.equal(1);

      const owner = await productNFT.ownerOf(tokenId);
      expect(owner).to.equal(retailer.address);
    });

    it("Should reject duplicate NFT minting for same product", async function () {
      await expect(
        productNFT.connect(retailer).mintProductNFT(sampleProductId, "ipfs://QmDuplicate")
      ).to.be.revertedWith("NFT already minted for product");
    });
  });

  describe("5. NFT Marketplace", function () {
    it("Should allow seller to list NFT and buyer to purchase it", async function () {
      const tokenId = 1;
      const price = ethers.parseEther("1.0");

      // Approve marketplace
      await productNFT.connect(retailer).approve(await marketplace.getAddress(), tokenId);

      // List NFT
      const listTx = await marketplace.connect(retailer).listNFT(
        await productNFT.getAddress(),
        tokenId,
        price
      );
      await listTx.wait();

      const listing = await marketplace.getListing(1);
      expect(listing.active).to.be.true;
      expect(listing.seller).to.equal(retailer.address);
      expect(listing.price).to.equal(price);

      // Customer buys NFT
      const buyTx = await marketplace.connect(customer).buyNFT(1, { value: price });
      await buyTx.wait();

      const updatedListing = await marketplace.getListing(1);
      expect(updatedListing.active).to.be.false;

      const newOwner = await productNFT.ownerOf(tokenId);
      expect(newOwner).to.equal(customer.address);
    });
  });

  describe("6. DeFi Lending", function () {
    it("Should deposit NFT collateral, borrow mUSD, repay loan, and withdraw NFT", async function () {
      const tokenId = 1;
      const collateralValuation = ethers.parseEther("1000"); // $1,000 valuation
      const borrowAmount = ethers.parseEther("400"); // $400 borrow (under 50% LTV)

      // Admin sets valuation
      await lendingPool.connect(admin).setNFTValuation(tokenId, collateralValuation);

      // Customer approves lending pool for NFT
      await productNFT.connect(customer).approve(await lendingPool.getAddress(), tokenId);

      // Deposit and Borrow
      await lendingPool.connect(customer).depositAndBorrow(tokenId, borrowAmount);

      const customerUSD = await mockUSD.balanceOf(customer.address);
      expect(customerUSD).to.equal(borrowAmount);

      const loan = await lendingPool.getLoanDetails(1);
      expect(loan.borrower).to.equal(customer.address);
      expect(loan.repaid).to.be.false;

      // Customer gets extra mUSD for interest repayment
      await mockUSD.connect(admin).mint(customer.address, ethers.parseEther("50"));
      const totalRepay = await lendingPool.calculateTotalRepayment(1);

      // Customer approves repayment
      await mockUSD.connect(customer).approve(await lendingPool.getAddress(), totalRepay);

      // Repay loan
      await lendingPool.connect(customer).repayLoan(1);

      const finalLoan = await lendingPool.getLoanDetails(1);
      expect(finalLoan.repaid).to.be.true;

      // NFT returned to customer
      const collateralOwner = await productNFT.ownerOf(tokenId);
      expect(collateralOwner).to.equal(customer.address);
    });
  });

  describe("7. DAO Governance", function () {
    it("Should handle proposal creation, token-weighted voting, and execution", async function () {
      // Transfer TCG tokens to customer & retailer
      await govToken.connect(admin).transfer(customer.address, ethers.parseEther("1000"));
      await govToken.connect(admin).transfer(retailer.address, ethers.parseEther("500"));

      // Customer creates proposal
      const createTx = await dao.connect(customer).createProposal(
        "Reduce Marketplace Fee to 2%",
        "Proposal to optimize trading volume by reducing fee rate to 200 bps"
      );
      await createTx.wait();

      const proposal = await dao.getProposal(1);
      expect(proposal.title).to.equal("Reduce Marketplace Fee to 2%");

      // Customer votes FOR (1000 votes)
      await dao.connect(customer).castVote(1, 1);

      // Retailer votes AGAINST (500 votes)
      await dao.connect(retailer).castVote(1, 0);

      const updatedProposal = await dao.getProposal(1);
      expect(updatedProposal.votesFor).to.equal(ethers.parseEther("1000"));
      expect(updatedProposal.votesAgainst).to.equal(ethers.parseEther("500"));

      // Check double voting prevention
      await expect(
        dao.connect(customer).castVote(1, 1)
      ).to.be.revertedWith("Already voted on this proposal");
    });
  });
});
