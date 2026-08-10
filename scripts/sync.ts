import hre from "hardhat";
import { syncBlockchainStateToDB } from "../src/services/indexer.ts";

async function main() {
  console.log("Triggering DB Indexer Sync...");
  await syncBlockchainStateToDB();
  console.log("✓ DB Indexer Sync finished.");
}

main().catch(console.error);
