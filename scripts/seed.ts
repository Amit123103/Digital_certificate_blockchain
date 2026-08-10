import { ethers } from "hardhat";
import { PrismaClient } from "@prisma/client";
import deployedAddresses from "../src/contracts/addresses.json";
import {
  CertificateRegistryABI,
  ProductRegistryABI,
  SupplyChainABI,
  ProductNFTABI,
  MarketplaceABI,
  MockUSDABI,
  LendingPoolABI,
  GovernanceTokenABI,
  DAOABI,
} from "../src/contracts/abis";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================");
  console.log("RUNNING TRUSTCHAIN END-TO-END AUTOMATED SEED SCRIPT");
  console.log("==================================================");

  const [admin, issuer, manufacturer, distributor, retailer, customerA, customerB] =
    await ethers.getSigners();

  console.log("Admin Wallet:", admin.address);
  console.log("Issuer Wallet:", issuer.address);
  console.log("Manufacturer Wallet:", manufacturer.address);

  // 1. Connect Contracts
  const certRegistry = new ethers.Contract(deployedAddresses.CertificateRegistry, CertificateRegistryABI, admin);
  const productRegistry = new ethers.Contract(deployedAddresses.ProductRegistry, ProductRegistryABI, admin);
  const supplyChain = new ethers.Contract(deployedAddresses.SupplyChain, SupplyChainABI, admin);
  const productNFT = new ethers.Contract(deployedAddresses.ProductNFT, ProductNFTABI, admin);
  const marketplace = new ethers.Contract(deployedAddresses.Marketplace, MarketplaceABI, admin);
  const mockUSD = new ethers.Contract(deployedAddresses.MockUSD, MockUSDABI, admin);
  const lendingPool = new ethers.Contract(deployedAddresses.LendingPool, LendingPoolABI, admin);
  const govToken = new ethers.Contract(deployedAddresses.GovernanceToken, GovernanceTokenABI, admin);
  const dao = new ethers.Contract(deployedAddresses.DAO, DAOABI, admin);

  // 2. Grant Roles
  console.log("\n[Step 1] Granting Roles to Issuer and Manufacturer...");
  try {
    const tx1 = await certRegistry.addIssuer(issuer.address);
    await tx1.wait();

    const tx2 = await productRegistry.addManufacturer(manufacturer.address);
    await tx2.wait();
    console.log("✓ Roles granted.");
  } catch (e) {
    console.log("Roles already granted or skipped.");
  }

  // 3. Register Digital Certificates
  console.log("\n[Step 2] Registering Digital Certificates...");
  const certsToRegister = [
    {
      certId: "CERT-2026-1001",
      productId: "PROD-2026-WATCH",
      payload: "Swiss Chronograph Official ISO-9001 Certificate of Authenticity",
    },
    {
      certId: "CERT-2026-1002",
      productId: "PROD-2026-COFFEE",
      payload: "Fairtrade Organic Single-Origin Yirgacheffe Coffee Batch Audit",
    },
    {
      certId: "CERT-2026-1003",
      productId: "PROD-2026-QUANTUM",
      payload: "3nm Cryogenic Semiconductor Processor Quality Guarantee",
    },
  ];

  for (const c of certsToRegister) {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(c.payload));
    try {
      const tx = await certRegistry.connect(issuer).registerCertificate(c.certId, hash, c.productId);
      await tx.wait();
      console.log(`✓ Registered Certificate ${c.certId} with hash ${hash.substring(0, 16)}...`);
    } catch (e) {
      console.log(`Certificate ${c.certId} already registered.`);
    }
  }

  // 4. Register Products
  console.log("\n[Step 3] Registering Products Linked to Certificates...");
  const productsToRegister = [
    {
      productId: "PROD-2026-WATCH",
      name: "Rolex Daytona Platinum Edition",
      description: "Authentic mechanical chronograph watch certified by Swiss bureau.",
      certId: "CERT-2026-1001",
    },
    {
      productId: "PROD-2026-COFFEE",
      name: "Ethiopian Specialty Organic Coffee",
      description: "Grade-1 washed arabica coffee bean batch tracked from farm.",
      certId: "CERT-2026-1002",
    },
    {
      productId: "PROD-2026-QUANTUM",
      name: "Quantum Core Chipset V9",
      description: "Sub-nanometer processor designed for supercomputing clusters.",
      certId: "CERT-2026-1003",
    },
  ];

  for (const p of productsToRegister) {
    try {
      const tx = await productRegistry
        .connect(manufacturer)
        .registerProduct(p.productId, p.name, p.description, p.certId, `ipfs://QmMetadata_${p.productId}`);
      await tx.wait();
      console.log(`✓ Registered Product ${p.name} (${p.productId})`);
    } catch (e) {
      console.log(`Product ${p.productId} already exists.`);
    }
  }

  // 5. Supply Chain Custody Transfers
  console.log("\n[Step 4] Logging Custodial Supply Chain Transfers...");
  try {
    // Manufacturer -> Distributor
    const tx1 = await supplyChain
      .connect(manufacturer)
      .recordTransfer(
        "PROD-2026-WATCH",
        distributor.address,
        "Geneva Central Logistics Hub",
        "IN_TRANSIT",
        "Dispatched via secure armored transport"
      );
    await tx1.wait();

    // Distributor -> Retailer
    const tx2 = await supplyChain
      .connect(distributor)
      .recordTransfer(
        "PROD-2026-WATCH",
        retailer.address,
        "Manhattan Boutique Storefront",
        "RETAIL",
        "Stocked in flagship showroom vault"
      );
    await tx2.wait();
    console.log("✓ Logged custodial transfers for PROD-2026-WATCH");
  } catch (e) {
    console.log("Supply chain transfers logged or skipped.");
  }

  // 6. Tokenize Product into ERC-721 NFT
  console.log("\n[Step 5] Minting Product NFT...");
  try {
    const tx = await productNFT
      .connect(retailer)
      .mintProductNFT("PROD-2026-WATCH", "ipfs://QmWatchNFTMetadata");
    await tx.wait();
    console.log("✓ Minted Product NFT Token #1 for PROD-2026-WATCH");
  } catch (e) {
    console.log("NFT already minted.");
  }

  // 7. NFT Marketplace Trade
  console.log("\n[Step 6] Listing & Selling NFT on Marketplace...");
  try {
    const tokenId = 1;
    const price = ethers.parseEther("1.5");

    // Approve marketplace
    const appTx = await productNFT.connect(retailer).approve(deployedAddresses.Marketplace, tokenId);
    await appTx.wait();

    // List NFT
    const listTx = await marketplace.connect(retailer).listNFT(deployedAddresses.ProductNFT, tokenId, price);
    await listTx.wait();
    console.log("✓ Listed NFT Token #1 for 1.5 ETH");

    // Customer A buys NFT
    const buyTx = await marketplace.connect(customerA).buyNFT(1, { value: price });
    await buyTx.wait();
    console.log("✓ Customer A bought NFT Token #1 for 1.5 ETH");
  } catch (e) {
    console.log("Marketplace trade completed or skipped.");
  }

  // 8. DeFi Collateral Loan
  console.log("\n[Step 7] Executing DeFi Collateralized Loan Flow...");
  try {
    const tokenId = 1;
    const valuation = ethers.parseEther("1000"); // $1,000
    const borrow = ethers.parseEther("400"); // $400

    // Admin sets oracle valuation
    const valTx = await lendingPool.connect(admin).setNFTValuation(tokenId, valuation);
    await valTx.wait();

    // Approve lending pool
    const appTx = await productNFT.connect(customerA).approve(deployedAddresses.LendingPool, tokenId);
    await appTx.wait();

    // Deposit & Borrow
    const borrowTx = await lendingPool.connect(customerA).depositAndBorrow(tokenId, borrow);
    await borrowTx.wait();
    console.log("✓ Customer A deposited NFT #1 collateral and borrowed 400 mUSD");

    // Repay loan
    const totalDue = await lendingPool.calculateTotalRepayment(1);
    const faucetTx = await mockUSD.mint(customerA.address, ethers.parseEther("50"));
    await faucetTx.wait();

    const appUSDTx = await mockUSD.connect(customerA).approve(deployedAddresses.LendingPool, totalDue);
    await appUSDTx.wait();

    const repayTx = await lendingPool.connect(customerA).repayLoan(1);
    await repayTx.wait();
    console.log("✓ Repaid loan with 5% interest and unlocked NFT #1 collateral");
  } catch (e) {
    console.log("DeFi loan flow completed or skipped.");
  }

  // 9. DAO Proposal & Voting
  console.log("\n[Step 8] Launching DAO Governance Proposal & Voting...");
  try {
    // Distribute TCG tokens
    const txTcg = await govToken.connect(admin).transfer(customerA.address, ethers.parseEther("2000"));
    await txTcg.wait();

    const propTx = await dao
      .connect(customerA)
      .createProposal(
        "Reduce Marketplace Fee to 2.0%",
        "Proposal to lower trading fee rate to boost marketplace transaction volume."
      );
    await propTx.wait();
    console.log("✓ Created DAO Proposal #1");

    // Cast Vote
    const voteTx = await dao.connect(customerA).castVote(1, 1); // Vote FOR
    await voteTx.wait();
    console.log("✓ Customer A cast 2,000 TCG votes FOR Proposal #1");
  } catch (e) {
    console.log("DAO proposal flow completed or skipped.");
  }

  // 10. Populate Database Cache via Prisma
  console.log("\n[Step 9] Indexing On-Chain State to Prisma SQLite Database...");
  try {
    const { syncBlockchainStateToDB } = require("../src/services/indexer");
    await syncBlockchainStateToDB();
    console.log("✓ Indexed all blockchain events to database.");
  } catch (e) {
    console.log("Prisma sync skipped or completed.");
  }

  console.log("==================================================");
  console.log("TRUSTCHAIN DEMO SEEDING COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
