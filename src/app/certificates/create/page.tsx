"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { getCertificateContract, getSigner } from "@/lib/contracts";
import { calculateKeccak256, generateCertificateId, generateProductId } from "@/lib/hash";
import { uploadToIPFS } from "@/lib/ipfs";
import { ShieldCheck, Upload, FileText, ArrowLeft, Key } from "lucide-react";

export default function CreateCertificatePage() {
  const router = useRouter();
  const { setTxStatus, activeAccountKey, role } = useWallet();

  const [certId, setCertId] = useState(generateCertificateId());
  const [productId, setProductId] = useState(generateProductId());
  const [fileContent, setFileContent] = useState<string>("Official Authenticity Guarantee Payload for TrustChain Asset");
  const [calculatedHash, setCalculatedHash] = useState<string>(
    calculateKeccak256("Official Authenticity Guarantee Payload for TrustChain Asset")
  );

  const handleContentChange = (content: string) => {
    setFileContent(content);
    setCalculatedHash(calculateKeccak256(content));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleContentChange(text || file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role !== "ISSUER" && role !== "ADMIN") {
      alert("Role Warning: Certificate creation is reserved for authorized ISSUER role. Please switch role in navbar to ISSUER or ADMIN.");
    }

    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Requesting signature from Authorized Issuer Wallet...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const certContract = getCertificateContract(signer);

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Registering Certificate ${certId} on-chain...`,
      });

      const tx = await certContract.registerCertificate(certId, calculatedHash, productId);

      setTxStatus({
        active: true,
        step: "confirming",
        message: "Waiting for EVM block confirmation...",
        txHash: tx.hash,
      });

      await tx.wait();

      // Trigger indexer sync
      await fetch("/api/sync");

      setTxStatus({
        active: true,
        step: "success",
        message: `Certificate ${certId} registered successfully on blockchain!`,
        txHash: tx.hash,
      });

      setTimeout(() => {
        router.push("/certificates");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to register certificate on-chain",
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
        <ArrowLeft className="w-4 h-4" /> Back to Certificates
      </button>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-blue-400" />
            Register Digital Certificate
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compute SHA-256 / Keccak-256 document hash and record permanent cryptographic proof on the blockchain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Certificate ID</label>
              <input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Product ID</label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Upload Document or Enter Payload Text
            </label>
            <div className="space-y-3">
              <input
                type="file"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer"
              />

              <textarea
                rows={3}
                value={fileContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" /> Computed Cryptographic Hash (Keccak-256)
            </div>
            <div className="text-xs font-mono text-emerald-400 break-all bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              {calculatedHash}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5"
          >
            Submit Certificate to Blockchain
          </button>
        </form>
      </div>
    </div>
  );
}
