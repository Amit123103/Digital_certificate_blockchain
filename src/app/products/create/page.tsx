"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { getProductRegistryContract, getSigner } from "@/lib/contracts";
import { generateProductId } from "@/lib/hash";
import { uploadToIPFS } from "@/lib/ipfs";
import { Package, ArrowLeft, ShieldCheck } from "lucide-react";

export default function CreateProductPage() {
  const router = useRouter();
  const { setTxStatus, activeAccountKey, role } = useWallet();

  const [productId, setProductId] = useState(generateProductId());
  const [name, setName] = useState("Luxury Chronograph Special Edition");
  const [description, setDescription] = useState("Swiss certified mechanical movement timepiece with sapphire glass casing.");
  const [certificateId, setCertificateId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateId) {
      alert("Please specify a valid Certificate ID");
      return;
    }

    if (role !== "MANUFACTURER" && role !== "ADMIN") {
      alert("Role Warning: Product registration requires MANUFACTURER or ADMIN role. Switch account in top right navbar.");
    }

    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Signing Product Registration Transaction...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const productContract = getProductRegistryContract(signer);

      const metadata = {
        name,
        description,
        productId,
        certificateId,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      };
      const metadataURI = uploadToIPFS(metadata);

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Validating Certificate ${certificateId} and registering Product ${productId}...`,
      });

      const tx = await productContract.registerProduct(productId, name, description, certificateId, metadataURI);

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
        message: `Product ${productId} registered on smart contract!`,
        txHash: tx.hash,
      });

      setTimeout(() => {
        router.push("/products");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to register product",
        errorDetails: err.reason || err.message,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-indigo-400" />
            Register Enterprise Product
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enforces strict on-chain certificate validation prior to registering asset.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Product ID</label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Linked Certificate ID</label>
              <input
                type="text"
                placeholder="e.g. CERT-2026-1001"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-emerald-400 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title / Brand Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Specs</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-300 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>Smart contract will reject registration if the Certificate ID is missing, fake, or revoked.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
          >
            Register Product On-Chain
          </button>
        </form>
      </div>
    </div>
  );
}
