import { prisma } from "../lib/prisma";
import {
  getCertificateContract,
  getProductRegistryContract,
  getSupplyChainContract,
  getProductNFTContract,
  getMarketplaceContract,
  getLendingPoolContract,
  getDAOContract,
} from "../lib/contracts";
import { ethers } from "ethers";

export async function syncBlockchainStateToDB(runner?: any) {
  try {
    const certContract = getCertificateContract(runner);
    const productContract = getProductRegistryContract(runner);
    const supplyChainContract = getSupplyChainContract(runner);
    const nftContract = getProductNFTContract(runner);
    const marketplaceContract = getMarketplaceContract(runner);
    const lendingContract = getLendingPoolContract(runner);
    const daoContract = getDAOContract(runner);

    console.log("[Indexer] Starting sync with local blockchain...");

    // 1. Sync Certificate Events
    const certEvents = await certContract.queryFilter("CertificateRegistered", 0, "latest");
    for (const event of certEvents) {
      if ("args" in event) {
        const [certificateId, certificateHash, productId, issuer, issuedAt] = event.args;
        await prisma.certificate.upsert({
          where: { certificateId },
          update: {
            certificateHash,
            productId,
            issuer,
            txHash: event.transactionHash,
          },
          create: {
            certificateId,
            certificateHash,
            productId,
            issuer,
            issuedAt: new Date(Number(issuedAt) * 1000),
            revoked: false,
            txHash: event.transactionHash,
          },
        });
      }
    }

    // 2. Sync Certificate Revocation Events
    const revokeEvents = await certContract.queryFilter("CertificateRevoked", 0, "latest");
    for (const event of revokeEvents) {
      if ("args" in event) {
        const [certificateId, , revokedAt] = event.args;
        await prisma.certificate.updateMany({
          where: { certificateId },
          data: {
            revoked: true,
            revokedAt: new Date(Number(revokedAt) * 1000),
          },
        });
      }
    }

    // 3. Sync Product Events
    const productEvents = await productContract.queryFilter("ProductRegistered", 0, "latest");
    for (const event of productEvents) {
      if ("args" in event) {
        const [productId, name, manufacturer, certificateId, createdAt] = event.args;
        const details = await productContract.getProduct(productId);

        await prisma.product.upsert({
          where: { productId },
          update: {
            name,
            description: details[2],
            manufacturer,
            certificateId,
            currentOwner: details[6],
            status: details[7],
            metadataURI: details[8],
          },
          create: {
            productId,
            name,
            description: details[2],
            manufacturer,
            certificateId,
            currentOwner: details[6],
            status: details[7],
            metadataURI: details[8],
            manufacturingDate: new Date(Number(details[5]) * 1000),
            createdAt: new Date(Number(createdAt) * 1000),
          },
        });
      }
    }

    // 4. Sync Supply Chain Events
    const scEvents = await supplyChainContract.queryFilter("SupplyChainEventCreated", 0, "latest");
    for (const event of scEvents) {
      if ("args" in event) {
        const [productId, from, to, location, timestamp, status, notes] = event.args;

        const existing = await prisma.supplyChainEvent.findFirst({
          where: {
            productId,
            fromAddress: from,
            toAddress: to,
            location,
            timestamp: new Date(Number(timestamp) * 1000),
          },
        });

        if (!existing) {
          await prisma.supplyChainEvent.create({
            data: {
              productId,
              fromAddress: from,
              toAddress: to,
              location,
              timestamp: new Date(Number(timestamp) * 1000),
              status,
              notes,
              txHash: event.transactionHash,
            },
          });
        }
      }
    }

    // 5. Sync NFT Mint Events
    const nftEvents = await nftContract.queryFilter("ProductNFTMinted", 0, "latest");
    for (const event of nftEvents) {
      if ("args" in event) {
        const [tokenId, productId, , owner, tokenURI] = event.args;
        const tId = Number(tokenId);
        await prisma.nFT.upsert({
          where: { tokenId: tId },
          update: {
            owner,
            metadataURI: tokenURI,
          },
          create: {
            tokenId: tId,
            productId,
            owner,
            metadataURI: tokenURI,
            txHash: event.transactionHash,
          },
        });
      }
    }

    // 6. Sync Marketplace Listed Events
    const listingEvents = await marketplaceContract.queryFilter("NFTListed", 0, "latest");
    for (const event of listingEvents) {
      if ("args" in event) {
        const [listingId, , tokenId, seller, price] = event.args;
        const lId = Number(listingId);
        await prisma.marketplaceListing.upsert({
          where: { listingId: lId },
          update: {
            tokenId: Number(tokenId),
            seller,
            price: ethers.formatEther(price),
            active: true,
          },
          create: {
            listingId: lId,
            tokenId: Number(tokenId),
            seller,
            price: ethers.formatEther(price),
            active: true,
            txHash: event.transactionHash,
          },
        });
      }
    }

    // 7. Sync Marketplace Sold Events
    const soldEvents = await marketplaceContract.queryFilter("NFTSold", 0, "latest");
    for (const event of soldEvents) {
      if ("args" in event) {
        const [listingId, , tokenId, , buyer] = event.args;
        const lId = Number(listingId);
        await prisma.marketplaceListing.updateMany({
          where: { listingId: lId },
          data: { active: false },
        });

        await prisma.nFT.updateMany({
          where: { tokenId: Number(tokenId) },
          data: { owner: buyer },
        });
      }
    }

    // 8. Sync DAO Proposals
    const proposalEvents = await daoContract.queryFilter("ProposalCreated", 0, "latest");
    for (const event of proposalEvents) {
      if ("args" in event) {
        const [proposalId, title, proposer, startTime, endTime] = event.args;
        const pId = Number(proposalId);
        const details = await daoContract.getProposal(pId);

        await prisma.proposal.upsert({
          where: { proposalId: pId },
          update: {
            title,
            description: details.description,
            votesFor: ethers.formatEther(details.votesFor),
            votesAgainst: ethers.formatEther(details.votesAgainst),
            votesAbstain: ethers.formatEther(details.votesAbstain),
            executed: details.executed,
          },
          create: {
            proposalId: pId,
            title,
            description: details.description,
            proposer,
            votesFor: ethers.formatEther(details.votesFor),
            votesAgainst: ethers.formatEther(details.votesAgainst),
            votesAbstain: ethers.formatEther(details.votesAbstain),
            startTime: new Date(Number(startTime) * 1000),
            endTime: new Date(Number(endTime) * 1000),
            executed: details.executed,
            txHash: event.transactionHash,
          },
        });
      }
    }

    console.log("[Indexer] Sync complete successfully.");
  } catch (error) {
    console.error("[Indexer] Sync error:", error);
  }
}
