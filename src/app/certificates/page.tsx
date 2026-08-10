"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Plus, Search, CheckCircle, AlertTriangle, FileText, ExternalLink, QrCode } from "lucide-react";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates");
      const data = await res.json();
      if (Array.isArray(data)) setCertificates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = certificates.filter(
    (c) =>
      c.certificateId.toLowerCase().includes(search.toLowerCase()) ||
      c.productId.toLowerCase().includes(search.toLowerCase()) ||
      c.issuer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            Digital Certificate Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Register, audit, verify, and revoke cryptographic SHA-256 digital certificates on-chain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/verify"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Public Verification Portal
          </Link>

          <Link
            href="/certificates/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Register Certificate
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Certificate ID, Product ID, or Issuer Wallet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
        />
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm animate-pulse">Loading certificates...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Certificates Found</h3>
          <p className="text-xs text-slate-400">Register a new certificate or adjust your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cert) => (
            <div
              key={cert.id}
              className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/50">
                    {cert.certificateId}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2 font-mono">Product: {cert.productId}</h3>
                </div>

                {cert.revoked ? (
                  <span className="badge-revoked text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> REVOKED
                  </span>
                ) : (
                  <span className="badge-verified text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> VERIFIED
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 font-mono bg-slate-950/50 p-3 rounded-xl border border-slate-900">
                <div className="truncate">
                  <span className="text-slate-500">Hash:</span> {cert.certificateHash}
                </div>
                <div className="truncate">
                  <span className="text-slate-500">Issuer:</span> {cert.issuer}
                </div>
                <div>
                  <span className="text-slate-500">Issued:</span> {new Date(cert.issuedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <Link
                  href={`/certificates/${cert.certificateId}`}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  View Details & QR <QrCode className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/verify?id=${cert.certificateId}`}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                >
                  Audit <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
