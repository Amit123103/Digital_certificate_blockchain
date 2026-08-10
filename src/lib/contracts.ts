import { ethers } from "ethers";

let contractAddresses: any = {
  CertificateRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  ProductRegistry: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  SupplyChain: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  ProductNFT: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  Marketplace: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  MockUSD: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  LendingPool: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  GovernanceToken: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  DAO: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"
};

try {
  const fs = require("fs");
  const path = require("path");
  const p = path.join(process.cwd(), "src/contracts/addresses.json");
  if (fs.existsSync(p)) {
    contractAddresses = JSON.parse(fs.readFileSync(p, "utf8"));
  }
} catch (e) {}
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
} from "../contracts/abis.ts";

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export function getSigner(privateKey?: string) {
  const provider = getProvider();
  const pk = privateKey || process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  return new ethers.Wallet(pk, provider);
}

export function getCertificateContract(runner?: ethers.ContractRunner) {
  const provider = runner || getProvider();
  return new ethers.Contract(contractAddresses.CertificateRegistry, CertificateRegistryABI, provider);
}

export function getProductRegistryContract(runner?: ethers.ContractRunner) {
  const provider = runner || getProvider();
  return new ethers.Contract(contractAddresses.ProductRegistry, ProductRegistryABI, provider);
}

export function getSupplyChainContract(runner?: ethers.ContractRunner) {
  const provider = runner || getProvider();
  return new ethers.Contract(contractAddresses.SupplyChain, SupplyChainABI, provider);
}

export function getProductNFTContract(runner?: ethers.ContractRunner) {
  const provider = runner || getProvider();
  return new ethers.Contract(contractAddresses.ProductNFT, ProductNFTABI, provider);
}

export function getMarketplaceContract(runner?: ethers.ContractRunner) {
  const provider = runner || getProvider();
  return new ethers.Contract(contractAddresses.Marketplace, MarketplaceABI, provider);
}

export function getMockUSDContract(runner?: ethers.ContractRunner) {
  const provider = runner || getProvider();
  return new ethers.Contract(contractAddresses.MockUSD, MockUSDABI, provider);
}

export function getLendingPoolContract(runner?: ethers.ContractRunner) {
  const provider = runner || getProvider();
  return new ethers.Contract(contractAddresses.LendingPool, LendingPoolABI, provider);
}

export function getGovernanceTokenContract(runner?: ethers.ContractRunner) {
  const provider = runner || getProvider();
  return new ethers.Contract(contractAddresses.GovernanceToken, GovernanceTokenABI, provider);
}

export function getDAOContract(runner?: ethers.ContractRunner) {
  const provider = runner || getProvider();
  return new ethers.Contract(contractAddresses.DAO, DAOABI, provider);
}
