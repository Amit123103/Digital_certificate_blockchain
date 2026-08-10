"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { getProductNFTContract, getSigner } from "@/lib/contracts";
import { uploadToIPFS } from "@/lib/ipfs";
import { Sparkles, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, RefreshCw } from "lucide-react";

function NFTMintContent() {
  const searchParams = useSearchParams();
  const preselectProduct = searchParams.get("productId") || "";

  const { setTxStatus, activeAccountKey } = useWallet();

  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(preselectProduct);
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pRes = await fetch("/api/products");
      const pData = await pRes.json();
      if (Array.isArray(pData)) setProducts(pData);

      const nRes = await fetch("/api/nfts");
      const nData = await nRes.json();
      if (Array.isArray(nData)) setNfts(nData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMintNFT = async (prodId: string) => {
    const targetProduct = products.find((p) => p.productId === prodId);
    if (!targetProduct) return;

    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Signing ERC-721 NFT Minting Transaction...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const nftContract = getProductNFTContract(signer);

      const metadata = {
        name: `TrustChain Tokenized Asset #${targetProduct.productId}`,
        description: targetProduct.description,
        productId: targetProduct.productId,
        certificateId: targetProduct.certificateId,
        manufacturer: targetProduct.manufacturer,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      };
      const tokenURI = uploadToIPFS(metadata);

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Validating Certificate ${targetProduct.certificateId} and minting ERC-721 NFT...`,
      });

      const tx = await nftContract.mintProductNFT(targetProduct.productId, tokenURI);

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
        message: `Product ${targetProduct.productId} successfully minted into ERC-721 NFT!`,
        txHash: tx.hash,
      });

      await fetchData();
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to mint NFT",
        errorDetails: err.reason || err.message,
      });
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          Product NFT Tokenization Portal
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Convert verified physical products into ERC-721 NFTs. Enforces strictly valid digital certificates.
        </p>
      </div>

      {/* Un-tokenized Products Eligible for NFT Minting */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Eligible Verified Products Ready for Minting
        </h2>

        {products.filter((p) => p.status !== "TOKENIZED").length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            All registered products have been tokenized into NFTs or no products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter((p) => p.status !== "TOKENIZED")
              .map((prod) => (
                <div key={prod.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                        {prod.productId}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{prod.name}</h3>
                    </div>
                    <span className="badge-verified text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Cert Valid ✓
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono truncate">Cert: {prod.certificateId}</div>

                  <button
                    onClick={() => handleMintNFT(prod.productId)}
                    className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Mint ERC-721 NFT
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Minted Product NFTs Gallery */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" /> Tokenized Product NFTs Gallery
        </h2>

        {nfts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No NFTs minted yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-400 font-bold">Token ID #{nft.tokenId}</span>
                  <span className="badge-verified text-[10px] font-bold px-2 py-0.5 rounded-full">Authentic ✓</span>
                </div>

                <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-900 relative">
                  <div className="text-center p-4">
                    <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-1 animate-pulse" />
                    <span className="text-xs font-bold text-white">TrustChain Token #{nft.tokenId}</span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{nft.productId}</div>
                  </div>
                </div>

                <div className="space-y-1 text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                  <div className="truncate"><span className="text-slate-500">Owner:</span> {nft.owner}</div>
                  <div className="truncate"><span className="text-slate-500">Metadata:</span> {nft.metadataURI}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NFTMintPage() {
  return (
    <React.Suspense fallback={<div className="text-center py-12 text-slate-800 dark:text-slate-200 font-bold">Loading NFT Minting Portal...</div>}>
      <NFTMintContent />
    </React.Suspense>
  );
}
