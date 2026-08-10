"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { getCertificateContract, getMarketplaceContract, getSigner } from "@/lib/contracts";
import { LayoutDashboard, ShieldCheck, RefreshCw, Users, Settings, TrendingUp, AlertTriangle, Database, CheckCircle2 } from "lucide-react";

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
    <div className="space-y-10 py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            Admin & System Analytics Dashboard
          </h1>
          <p className="text-slate-700 dark:text-slate-300 text-sm mt-1.5 font-semibold">
            Manage system configurations, issuer role access, marketplace trading fee parameters, and database indexer logs.
          </p>
        </div>

        <button
          onClick={handleSyncDB}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-blue-200" /> Re-Sync Indexer State
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel glass-panel-hover p-6 rounded-3xl border border-slate-700/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Certificates</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-white tracking-tight">{stats?.totalCertificates ?? "3"}</div>
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {stats?.verifiedCertificates ?? "3"} Active Verified
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-3xl border border-slate-700/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Products</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-white tracking-tight">{stats?.totalProducts ?? "3"}</div>
          <div className="text-xs text-indigo-300 font-semibold font-mono">
            {stats?.totalNFTs ?? "1"} Minted as ERC-721 NFTs
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-3xl border border-slate-700/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marketplace Volume</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 tracking-tight">{stats?.totalMarketplaceVolume ?? "1.50"} ETH</div>
          <div className="text-xs text-slate-300 font-medium">
            {stats?.activeListings ?? "1"} Active Trading Listings
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-3xl border border-slate-700/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">DAO Governance</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-white tracking-tight">{stats?.totalProposals ?? "1"}</div>
          <div className="text-xs text-purple-300 font-semibold font-mono">
            Token-Weighted Governance Active
          </div>
        </div>
      </div>

      {/* Admin Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Authorize Certificate Issuer */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-700/80 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Authorize Certificate Issuer Role</h3>
              <p className="text-xs text-slate-300">Grant on-chain `ISSUER_ROLE` permissions to enterprise wallet addresses.</p>
            </div>
          </div>

          <form onSubmit={handleAddIssuer} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">Target Wallet Address</label>
              <input
                type="text"
                value={newIssuer}
                onChange={(e) => setNewIssuer(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white font-mono focus:border-blue-500 focus:outline-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5"
            >
              Grant ISSUER_ROLE On-Chain
            </button>
          </form>
        </div>

        {/* Update Marketplace Fee Rate */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-700/80 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Marketplace Fee Rate Configuration</h3>
              <p className="text-xs text-slate-300">Set platform trading fee rate in Basis Points (e.g. 250 BPS = 2.5%).</p>
            </div>
          </div>

          <form onSubmit={handleUpdateFee} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">Fee Rate (BPS)</label>
              <input
                type="number"
                value={feeBps}
                onChange={(e) => setFeeBps(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white font-mono focus:border-rose-500 focus:outline-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-rose-600/30 transition transform hover:-translate-y-0.5"
            >
              Update Marketplace Fee On-Chain
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
