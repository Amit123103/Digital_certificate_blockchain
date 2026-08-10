import { ethers } from "ethers";
import contractAddresses from "../contracts/addresses.json";
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
} from "../contracts/abis";

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
