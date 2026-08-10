import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("==================================================");
  console.log("Deploying TrustChain Smart Contracts with account:", deployer.address);
  console.log("==================================================");

  // 1. CertificateRegistry
  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
  const certRegistry = await CertificateRegistry.deploy(deployer.address);
  await certRegistry.waitForDeployment();
  const certAddress = await certRegistry.getAddress();
  console.log("CertificateRegistry deployed to:", certAddress);

  // 2. ProductRegistry
  const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy(deployer.address, certAddress);
  await productRegistry.waitForDeployment();
  const productAddress = await productRegistry.getAddress();
  console.log("ProductRegistry deployed to:", productAddress);

  // 3. SupplyChain
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy(productAddress);
  await supplyChain.waitForDeployment();
  const supplyChainAddress = await supplyChain.getAddress();
  console.log("SupplyChain deployed to:", supplyChainAddress);

  // 4. ProductNFT
  const ProductNFT = await ethers.getContractFactory("ProductNFT");
  const productNFT = await ProductNFT.deploy(deployer.address, certAddress, productAddress);
  await productNFT.waitForDeployment();
  const nftAddress = await productNFT.getAddress();
  console.log("ProductNFT deployed to:", nftAddress);

  // 5. Marketplace (2.5% fee = 250 BPS)
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(deployer.address, 250);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("Marketplace deployed to:", marketplaceAddress);

  // 6. MockUSD
  const MockUSD = await ethers.getContractFactory("MockUSD");
  const mockUSD = await MockUSD.deploy(deployer.address);
  await mockUSD.waitForDeployment();
  const usdAddress = await mockUSD.getAddress();
  console.log("MockUSD deployed to:", usdAddress);

  // 7. LendingPool
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(deployer.address, nftAddress, usdAddress);
  await lendingPool.waitForDeployment();
  const lendingAddress = await lendingPool.getAddress();
  console.log("LendingPool deployed to:", lendingAddress);

  // Transfer 500,000 mUSD liquidity to LendingPool for borrows
  const mintTx = await mockUSD.mint(lendingAddress, ethers.parseEther("500000"));
  await mintTx.wait();
  console.log("Seeded LendingPool with 500,000 mUSD liquidity");

  // 8. GovernanceToken
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const govToken = await GovernanceToken.deploy(deployer.address);
  await govToken.waitForDeployment();
  const govTokenAddress = await govToken.getAddress();
  console.log("GovernanceToken deployed to:", govTokenAddress);

  // 9. DAO (100 TCG threshold, 7 days voting period = 604800 seconds)
  const DAO = await ethers.getContractFactory("DAO");
  const dao = await DAO.deploy(
    deployer.address,
    govTokenAddress,
    ethers.parseEther("100"),
    604800
  );
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  console.log("DAO deployed to:", daoAddress);

  const deployedAddresses = {
    CertificateRegistry: certAddress,
    ProductRegistry: productAddress,
    SupplyChain: supplyChainAddress,
    ProductNFT: nftAddress,
    Marketplace: marketplaceAddress,
    MockUSD: usdAddress,
    LendingPool: lendingAddress,
    GovernanceToken: govTokenAddress,
    DAO: daoAddress,
  };

  // Save to src/contracts/addresses.json
  const outDir = path.join(__dirname, "../src/contracts");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(outDir, "addresses.json"),
    JSON.stringify(deployedAddresses, null, 2)
  );
  console.log("Saved contract addresses to src/contracts/addresses.json");

  console.log("==================================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("==================================================");

  return deployedAddresses;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
