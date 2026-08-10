"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { getCertificateContract, getMarketplaceContract, getSigner } from "@/lib/contracts";
import { LayoutDashboard, ShieldCheck, RefreshCw, Users, Settings, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const { setTxStatus, activeAccountKey, role } = useWallet();

  const [stats, setStats] = useState<any>(null);
  const [newIssuer, setNewIssuer] = useState("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  const [feeBps, setFeeBps] = useState("250");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddIssuer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssuer) return;

    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Signing Grant Role Transaction...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const certContract = getCertificateContract(signer);

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Granting ISSUER_ROLE to ${newIssuer}...`,
      });

      const tx = await certContract.addIssuer(newIssuer);

      setTxStatus({
        active: true,
        step: "confirming",
        message: "Waiting for EVM block confirmation...",
        txHash: tx.hash,
      });

      await tx.wait();
      setTxStatus({
        active: true,
        step: "success",
        message: `Granted ISSUER_ROLE to ${newIssuer} successfully!`,
        txHash: tx.hash,
      });
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to add issuer",
        errorDetails: err.reason || err.message,
      });
    }
  };

  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Signing Marketplace Fee Update...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const mContract = getMarketplaceContract(signer);

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Updating Marketplace Fee to ${feeBps} BPS (${(Number(feeBps) / 100).toFixed(1)}%)...`,
      });

      const tx = await mContract.setMarketplaceFee(Number(feeBps));

      setTxStatus({
        active: true,
        step: "confirming",
        message: "Waiting for EVM block confirmation...",
        txHash: tx.hash,
      });

      await tx.wait();
      setTxStatus({
        active: true,
        step: "success",
        message: `Marketplace fee rate updated on-chain!`,
        txHash: tx.hash,
      });
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to update fee",
        errorDetails: err.reason || err.message,
      });
    }
  };

  const handleSyncDB = async () => {
    try {
      await fetch("/api/sync");
      alert("DB Indexer refreshed state with blockchain!");
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-400" />
            Admin & System Analytics Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            System configuration, issuer access control management, marketplace parameter controls, and indexer status.
          </p>
        </div>

        <button
          onClick={handleSyncDB}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-200 font-bold text-xs transition self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-blue-400" /> Re-Sync Indexer State
        </button>
      </div>

      {/* Analytics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Certificates</span>
            <div className="text-2xl font-extrabold text-white">{stats.totalCertificates}</div>
            <div className="text-[10px] text-emerald-400 font-mono">{stats.verifiedCertificates} Active Verified</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Registered Products</span>
            <div className="text-2xl font-extrabold text-white">{stats.totalProducts}</div>
            <div className="text-[10px] text-indigo-400 font-mono">{stats.totalNFTs} Minted as NFTs</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Marketplace Volume</span>
            <div className="text-2xl font-extrabold text-emerald-400">{stats.totalMarketplaceVolume} ETH</div>
            <div className="text-[10px] text-slate-400 font-mono">{stats.activeListings} Active Listings</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">DAO Governance</span>
            <div className="text-2xl font-extrabold text-white">{stats.totalProposals} Proposals</div>
            <div className="text-[10px] text-purple-400 font-mono">Token-Weighted System</div>
          </div>
        </div>
      )}

      {/* Management Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Authorize Certificate Issuer */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" /> Authorize Certificate Issuer Role
          </h3>
          <p className="text-xs text-slate-400">
            Grant `ISSUER_ROLE` to an enterprise wallet address allowing them to issue verified certificates.
          </p>

          <form onSubmit={handleAddIssuer} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Wallet Address</label>
              <input
                type="text"
                value={newIssuer}
                onChange={(e) => setNewIssuer(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Grant ISSUER_ROLE On-Chain
            </button>
          </form>
        </div>

        {/* Update Marketplace Fee */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-rose-400" /> Marketplace Fee Rate Configuration
          </h3>
          <p className="text-xs text-slate-400">
            Set platform marketplace trading fee in Basis Points (e.g. 250 BPS = 2.5%).
          </p>

          <form onSubmit={handleUpdateFee} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Fee Rate (BPS)</label>
              <input
                type="number"
                value={feeBps}
                onChange={(e) => setFeeBps(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Update Marketplace Fee On-Chain
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
