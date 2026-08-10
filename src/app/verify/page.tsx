"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getCertificateContract } from "@/lib/contracts";
import { calculateKeccak256 } from "@/lib/hash";
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText, Search, QrCode, ExternalLink } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [certId, setCertId] = useState(initialId);
  const [fileContent, setFileContent] = useState("");
  const [computedHash, setComputedHash] = useState("");

  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (initialId) {
      handleVerify(initialId);
    }
  }, [initialId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFileContent(text || file.name);
        setComputedHash(calculateKeccak256(text || file.name));
      };
      reader.readAsText(file);
    }
  };

  const handleVerify = async (targetId?: string) => {
    const idToQuery = targetId || certId;
    if (!idToQuery) {
      alert("Please enter a Certificate ID");
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const certContract = getCertificateContract();

      const exists = await certContract.certificateExists(idToQuery);
      if (!exists) {
        setResult({ status: "NOT_FOUND", certId: idToQuery });
        return;
      }

      const details = await certContract.getCertificate(idToQuery);
      // details: bytes32 certificateHash, string id, string productId, address issuer, uint256 issuedAt, bool revoked

      let hashMatch = true;
      if (computedHash) {
        hashMatch = details[0].toLowerCase() === computedHash.toLowerCase();
      }

      let status = "VERIFIED";
      if (details[5]) status = "REVOKED";
      else if (!hashMatch) status = "MODIFIED";

      // Query database for product metadata
      const res = await fetch(`/api/certificates/${idToQuery}`);
      const dbData = await res.json();

      setResult({
        status,
        certId: details[1],
        certificateHash: details[0],
        productId: details[2],
        issuer: details[3],
        issuedAt: new Date(Number(details[4]) * 1000).toLocaleString(),
        revoked: details[5],
        hashMatch,
        product: dbData.product,
      });
    } catch (e: any) {
      console.error(e);
      setResult({ status: "ERROR", error: e.message });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" /> Tamper-Proof Audit
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Public Certificate Verification</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Verify digital certificate hashes directly against the immutable Hardhat/EVM smart contract ledger.
        </p>
      </div>

      {/* Input Box */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">Enter Certificate ID or Scan QR Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. CERT-2026-1001"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={() => handleVerify()}
              disabled={verifying}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> {verifying ? "Auditing..." : "Verify"}
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-900">
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            Optional: Upload Document to Compare SHA-256 Hash
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
          />

          {computedHash && (
            <div className="mt-2 text-xs font-mono text-slate-400 truncate">
              Calculated Local Hash: <span className="text-emerald-400">{computedHash}</span>
            </div>
          )}
        </div>
      </div>

      {/* Verification Result Report */}
      {result && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 animate-in fade-in zoom-in-95">
          {result.status === "VERIFIED" && (
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-pulse" />
              <h2 className="text-2xl font-extrabold text-emerald-400 tracking-wide">CERTIFICATE VERIFIED ✓</h2>
              <p className="text-xs text-slate-300">
                On-chain cryptographic hash matches record. Issued by authorized authority and active.
              </p>
            </div>
          )}

          {result.status === "REVOKED" && (
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <AlertTriangle className="w-16 h-16 text-rose-400" />
              <h2 className="text-2xl font-extrabold text-rose-400 tracking-wide">CERTIFICATE REVOKED ⚠</h2>
              <p className="text-xs text-slate-300">
                This certificate was officially revoked by the issuer or authority on-chain.
              </p>
            </div>
          )}

          {result.status === "MODIFIED" && (
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <AlertTriangle className="w-16 h-16 text-amber-400" />
              <h2 className="text-2xl font-extrabold text-amber-400 tracking-wide">HASH MISMATCH / TAMPERED ✕</h2>
              <p className="text-xs text-slate-300">
                Uploaded document hash does not match the on-chain certificate hash!
              </p>
            </div>
          )}

          {result.status === "NOT_FOUND" && (
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <XCircle className="w-16 h-16 text-slate-500" />
              <h2 className="text-2xl font-extrabold text-slate-300 tracking-wide">CERTIFICATE NOT FOUND</h2>
              <p className="text-xs text-slate-400">No certificate with ID '{result.certId}' exists on the smart contract registry.</p>
            </div>
          )}

          {result.status !== "NOT_FOUND" && result.status !== "ERROR" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Blockchain Audit Trail</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                  <span className="text-slate-500 block">Certificate ID:</span>
                  <span className="text-white font-bold">{result.certId}</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                  <span className="text-slate-500 block">Linked Product ID:</span>
                  <span className="text-blue-400 font-bold">{result.productId}</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 md:col-span-2 truncate">
                  <span className="text-slate-500 block">On-Chain Hash (Keccak-256):</span>
                  <span className="text-emerald-400">{result.certificateHash}</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 truncate">
                  <span className="text-slate-500 block">Authorized Issuer:</span>
                  <span className="text-slate-300">{result.issuer}</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                  <span className="text-slate-500 block">Issue Timestamp:</span>
                  <span className="text-slate-300">{result.issuedAt}</span>
                </div>
              </div>

              {result.product && (
                <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/40 space-y-2">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Associated Product Details</h4>
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-white">{result.product.name}</span> — {result.product.description}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PublicVerifyPage() {
  return (
    <React.Suspense fallback={<div className="text-center py-12 text-slate-800 dark:text-slate-200 font-bold">Loading Verification Portal...</div>}>
      <VerifyContent />
    </React.Suspense>
  );
}
