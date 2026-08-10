"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { getMarketplaceContract, getProductNFTContract, getSigner } from "@/lib/contracts";
import { ShoppingBag, Search, Filter, ShieldCheck, Sparkles, Plus, ExternalLink, Tag } from "lucide-react";
import { ethers } from "ethers";

export default function MarketplacePage() {
  const { setTxStatus, activeAccountKey, account } = useWallet();

  const [listings, setListings] = useState<any[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Listing Form State
  const [showListModal, setShowListModal] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number | "">("");
  const [listPrice, setListPrice] = useState("1.5");

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      const mRes = await fetch("/api/marketplace");
      const mData = await mRes.json();
      if (Array.isArray(mData)) setListings(mData);

      const nRes = await fetch("/api/nfts");
      const nData = await nRes.json();
      if (Array.isArray(nData)) setNfts(nData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTokenId || !listPrice) return;

    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Approving Marketplace contract to transfer NFT...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const nftContract = getProductNFTContract(signer);
      const marketplaceContract = getMarketplaceContract(signer);
      const marketplaceAddr = await marketplaceContract.getAddress();

      // Approve marketplace
      const approveTx = await nftContract.approve(marketplaceAddr, selectedTokenId);
      await approveTx.wait();

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Listing Token #${selectedTokenId} on Marketplace for ${listPrice} ETH...`,
      });

      const priceWei = ethers.parseEther(listPrice);
      const listTx = await marketplaceContract.listNFT(await nftContract.getAddress(), selectedTokenId, priceWei);

      setTxStatus({
        active: true,
        step: "confirming",
        message: "Waiting for EVM block confirmation...",
        txHash: listTx.hash,
      });

      await listTx.wait();
      await fetch("/api/sync");

      setTxStatus({
        active: true,
        step: "success",
        message: `NFT Token #${selectedTokenId} listed on Marketplace for ${listPrice} ETH!`,
        txHash: listTx.hash,
      });

      setShowListModal(false);
      await fetchMarketplaceData();
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to list NFT",
        errorDetails: err.reason || err.message,
      });
    }
  };

  const handleBuyNFT = async (listing: any) => {
    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: `Signing purchase of Listing #${listing.listingId} for ${listing.price} ETH...`,
      });

      const signer = getSigner(activeAccountKey || undefined);
      const marketplaceContract = getMarketplaceContract(signer);
      const priceWei = ethers.parseEther(listing.price);

      setTxStatus({
        active: true,
        step: "submitting",
        message: "Executing payment & instant NFT escrow transfer on-chain...",
      });

      const tx = await marketplaceContract.buyNFT(listing.listingId, { value: priceWei });

      setTxStatus({
        active: true,
        step: "confirming",
        message: "Waiting for EVM block confirmation...",
        txHash: tx.hash,
      });

      await tx.wait();
      await fetch("/api/sync");

      setTxStatus({
        active: true,
        step: "success",
        message: `NFT #${listing.tokenId} purchased successfully! Ownership updated on-chain.`,
        txHash: tx.hash,
      });

      await fetchMarketplaceData();
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to purchase NFT",
        errorDetails: err.reason || err.message,
      });
    }
  };

  const filteredListings = listings.filter((l) => l.active);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-rose-400" />
            NFT Marketplace
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Trade authenticated product NFTs backed by digital certificate provenance and automated seller payouts.
          </p>
        </div>

        <button
          onClick={() => setShowListModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> List NFT for Sale
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search marketplace listings by Token ID or seller..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
        />
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm animate-pulse">Loading active marketplace listings...</div>
      ) : filteredListings.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Listings</h3>
          <p className="text-xs text-slate-400">List an owned NFT for sale to start trading on TrustChain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="glass-panel glass-panel-hover rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-400 font-bold">NFT Token #{listing.tokenId}</span>
                <span className="badge-verified text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Certificate Verified
                </span>
              </div>

              <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-900 relative p-4">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-rose-400 mx-auto mb-1 animate-pulse" />
                  <div className="text-sm font-bold text-white">TrustChain Verified Product NFT</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">Listing #{listing.listingId}</div>
                </div>
              </div>

              <div className="space-y-1 text-xs font-mono text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Seller:</span>
                  <span className="text-slate-300 truncate max-w-[140px]">{listing.seller}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Listing Price:</span>
                  <span className="text-emerald-400 font-bold text-sm">{listing.price} ETH</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <Link
                  href={`/marketplace/${listing.tokenId}`}
                  className="flex-1 py-2.5 px-3 rounded-xl glass-panel hover:bg-slate-800 text-white font-semibold text-xs text-center border border-slate-700 transition"
                >
                  Details
                </Link>

                <button
                  onClick={() => handleBuyNFT(listing)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg transition"
                >
                  Buy Now ({listing.price} ETH)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List NFT Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowListModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-rose-400" /> List Product NFT on Marketplace
            </h3>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Token ID to List</label>
                <select
                  value={selectedTokenId}
                  onChange={(e) => setSelectedTokenId(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                >
                  <option value="">Choose an owned NFT...</option>
                  {nfts.map((nft) => (
                    <option key={nft.id} value={nft.tokenId}>
                      Token #{nft.tokenId} ({nft.productId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Listing Price (ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-emerald-400 font-bold focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Marketplace Fee (2.5%):</span>
                  <span>{((parseFloat(listPrice || "0") * 250) / 10000).toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-900">
                  <span>Net Seller Payout:</span>
                  <span className="text-emerald-400">
                    {(parseFloat(listPrice || "0") * 0.975).toFixed(4)} ETH
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-xl transition"
              >
                Approve & Create On-Chain Listing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
