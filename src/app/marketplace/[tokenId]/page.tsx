"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { getMarketplaceContract, getSigner } from "@/lib/contracts";
import { ShoppingBag, ArrowLeft, ShieldCheck, Sparkles, ExternalLink, Tag, Truck } from "lucide-react";
import { ethers } from "ethers";

export default function NFTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tokenId = Number(params.tokenId);
  const { setTxStatus, activeAccountKey } = useWallet();

  const [nftData, setNftData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [certData, setCertData] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tokenId) {
      fetchNFTDetails();
    }
  }, [tokenId]);

  const fetchNFTDetails = async () => {
    try {
      const nRes = await fetch("/api/nfts");
      const nData = await nRes.json();
      const targetNFT = nData.find((n: any) => n.tokenId === tokenId);

      if (targetNFT) {
        setNftData(targetNFT);
        const pRes = await fetch(`/api/products/${targetNFT.productId}`);
        const pData = await pRes.json();
        if (pData.product) {
          setProductData(pData.product);
          setCertData(pData.certificate);
        }
      }

      const mRes = await fetch("/api/marketplace");
      const mData = await mRes.json();
      const activeList = mData.find((l: any) => l.tokenId === tokenId && l.active);
      if (activeList) setListing(activeList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!listing) return;

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
        message: `NFT #${tokenId} purchased successfully! Ownership updated on-chain.`,
        txHash: tx.hash,
      });

      await fetchNFTDetails();
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

  if (loading) return <div className="text-center py-12 text-slate-400 text-sm">Loading NFT detail page...</div>;
  if (!nftData) return <div className="text-center py-12 text-slate-400 text-sm">NFT not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: NFT Image/Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="aspect-square bg-slate-950 rounded-2xl border border-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
            <Sparkles className="w-16 h-16 text-rose-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white">TrustChain Verified Product NFT</h2>
            <span className="text-xs font-mono text-purple-400 font-bold bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800">
              Token ID #{tokenId}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-2 text-xs font-mono text-slate-400">
            <div className="truncate"><span className="text-slate-500">Current NFT Owner:</span> {nftData.owner}</div>
            <div className="truncate"><span className="text-slate-500">Metadata IPFS URI:</span> {nftData.metadataURI}</div>
          </div>
        </div>

        {/* Right Column: Provenance & Purchase Action */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="badge-verified text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> On-Chain Certificate Verified
              </span>
              {listing && <span className="text-xs font-bold text-rose-400 uppercase">Listed for Sale</span>}
            </div>

            {productData && (
              <div>
                <h1 className="text-2xl font-bold text-white">{productData.name}</h1>
                <p className="text-xs text-slate-400 mt-1">{productData.description}</p>
              </div>
            )}

            {certData && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Certificate ID:</span>
                  <span className="text-emerald-400 font-bold">{certData.certificateId}</span>
                </div>
                <div className="truncate text-slate-400">
                  <span className="text-slate-500">SHA-256 Hash:</span> {certData.certificateHash}
                </div>
                <div className="truncate text-slate-400">
                  <span className="text-slate-500">Issuer:</span> {certData.issuer}
                </div>
              </div>
            )}

            {productData && (
              <Link
                href={`/supply-chain/${productData.productId}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs font-semibold text-blue-400 hover:bg-blue-950/40 transition"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4" /> View Full Custodial Supply Chain History
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Pricing & Buy Action */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            {listing ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Current Price:</span>
                  <span className="text-2xl font-extrabold text-emerald-400">{listing.price} ETH</span>
                </div>

                <button
                  onClick={handleBuy}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-rose-600/30 transition transform hover:-translate-y-0.5"
                >
                  Buy NFT Now ({listing.price} ETH)
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 text-center text-xs text-slate-400">
                This NFT is currently not listed for sale on the marketplace.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
