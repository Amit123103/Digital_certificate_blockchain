"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { getCertificateContract, getSigner } from "@/lib/contracts";
import { ShieldCheck, CheckCircle, AlertTriangle, ArrowLeft, QrCode, ExternalLink } from "lucide-react";

export default function CertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const certId = params.id as string;
  const { setTxStatus, activeAccountKey, role } = useWallet();

  const [certData, setCertData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (certId) {
      fetch(`/api/certificates/${certId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.certificate) {
            setCertData(data.certificate);
            setProductData(data.product);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [certId]);

  const handleRevoke = async () => {
    if (!confirm(`Are you sure you want to revoke certificate ${certId}? This action is irreversible on-chain.`)) {
      return;
    }

    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Signing Revocation Transaction...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const certContract = getCertificateContract(signer);

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Revoking Certificate ${certId} on smart contract...`,
      });

      const tx = await certContract.revokeCertificate(certId);

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
        message: `Certificate ${certId} revoked on-chain!`,
        txHash: tx.hash,
      });

      // Refresh
      setCertData({ ...certData, revoked: true });
    } catch (e: any) {
      console.error(e);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to revoke certificate",
        errorDetails: e.reason || e.message,
      });
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400 text-sm">Loading certificate data...</div>;
  if (!certData) return <div className="text-center py-12 text-slate-400 text-sm">Certificate not found.</div>;

  const verificationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify?id=${certId}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Certificates
      </button>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-blue-950 text-blue-400 border border-blue-800">
              {certData.certificateId}
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-2">Digital Certificate Audit Record</h1>
          </div>

          {certData.revoked ? (
            <span className="badge-revoked text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> REVOKED
            </span>
          ) : (
            <span className="badge-verified text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> VERIFIED ON-CHAIN
            </span>
          )}
        </div>

        {/* Certificate Hash & Blockchain Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 md:col-span-2 truncate">
            <span className="text-slate-500 block mb-1">Cryptographic Keccak-256 Hash:</span>
            <span className="text-emerald-400 font-bold">{certData.certificateHash}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900">
            <span className="text-slate-500 block mb-1">Authorized Issuer Wallet:</span>
            <span className="text-slate-300 truncate block">{certData.issuer}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900">
            <span className="text-slate-500 block mb-1">Issue Date:</span>
            <span className="text-slate-300">{new Date(certData.issuedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* QR Code Verification Link Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-950 border border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-400" /> Verification QR Code Endpoint
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              Scan or navigate to this direct link to verify authenticity against the EVM smart contract state.
            </p>
            <a
              href={verificationUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 font-mono hover:underline flex items-center gap-1"
            >
              {verificationUrl} <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Simple QR representation container */}
          <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded border border-slate-300 flex items-center justify-center text-[10px] font-mono text-center text-blue-300 p-1">
              QR Verification
            </div>
          </div>
        </div>

        {/* Product Info */}
        {productData && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linked Product Record</span>
            <div className="text-sm font-bold text-white">{productData.name} ({productData.productId})</div>
            <p className="text-xs text-slate-400">{productData.description}</p>
          </div>
        )}

        {/* Actions */}
        {!certData.revoked && (role === "ISSUER" || role === "ADMIN") && (
          <div className="pt-4 border-t border-slate-900 flex justify-end">
            <button
              onClick={handleRevoke}
              className="px-5 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 rounded-xl font-bold text-xs transition"
            >
              Revoke Certificate On-Chain
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
