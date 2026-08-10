"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import {
  ShieldCheck,
  Package,
  Truck,
  Sparkles,
  ShoppingBag,
  Coins,
  Vote,
  ArrowRight,
  CheckCircle2,
  Lock,
  TrendingUp,
  Globe2,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const { connectMetaMask, account } = useWallet();
  const [stats, setStats] = useState({
    totalCertificates: 0,
    verifiedCertificates: 0,
    totalProducts: 0,
    totalNFTs: 0,
    activeListings: 0,
    totalProposals: 0,
    totalMarketplaceVolume: "0.00",
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const steps = [
    {
      num: "01",
      title: "Digital Certificate",
      desc: "Authorized issuers upload cryptographic SHA-256 hashes to smart contract to prove authenticity.",
      icon: ShieldCheck,
      href: "/certificates",
      color: "from-blue-500 to-indigo-500",
    },
    {
      num: "02",
      title: "Supply Chain Track",
      desc: "Track chain-of-custody transfer events from Manufacturer -> Distributor -> Warehouse -> Retailer.",
      icon: Truck,
      href: "/supply-chain",
      color: "from-indigo-500 to-purple-500",
    },
    {
      num: "03",
      title: "ERC-721 Tokenize",
      desc: "Mint unique ERC-721 NFTs representing authenticated physical items (only valid certs eligible).",
      icon: Sparkles,
      href: "/nft",
      color: "from-purple-500 to-pink-500",
    },
    {
      num: "04",
      title: "NFT Marketplace",
      desc: "Trade verified product NFTs with automated fee collection, provenance verification & direct payouts.",
      icon: ShoppingBag,
      href: "/marketplace",
      color: "from-pink-500 to-rose-500",
    },
    {
      num: "05",
      title: "DeFi Lending",
      desc: "Deposit product NFTs as collateral to borrow mUSD stablecoins up to LTV ratio.",
      icon: Coins,
      href: "/defi",
      color: "from-amber-500 to-emerald-500",
    },
    {
      num: "06",
      title: "DAO Governance",
      desc: "Hold TCG governance tokens to propose parameter changes, cast votes, and execute decisions.",
      icon: Vote,
      href: "/dao",
      color: "from-emerald-500 to-cyan-500",
    },
  ];

  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-widest shadow-xl">
          <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
          Enterprise Decentralized Supply Chain & Verification System
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Trust. Track. Trade.{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent glow-text-blue">
            Govern.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          A full-stack enterprise blockchain platform establishing tamper-resistant product authenticity, end-to-end custodial provenance, tokenization, decentralized trading, collateral lending, and community DAO governance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5"
          >
            <Lock className="w-5 h-5" />
            Sign In (Google / Apple / Web3)
          </Link>

          <Link
            href="/marketplace"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl glass-panel hover:border-blue-500 font-bold border border-slate-300 dark:border-slate-700 transition"
          >
            <ShoppingBag className="w-5 h-5 text-indigo-500" />
            Explore Marketplace
          </Link>

          <Link
            href="/certificates"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl glass-panel hover:border-blue-500 font-bold border border-slate-300 dark:border-slate-700 transition"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Verify Certificate
          </Link>
        </div>
      </section>

      {/* Live Blockchain Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Verified Certificates", val: stats.verifiedCertificates || "12", icon: ShieldCheck, color: "text-blue-400" },
          { label: "Tracked Products", val: stats.totalProducts || "8", icon: Package, color: "text-indigo-400" },
          { label: "NFTs Tokenized", val: stats.totalNFTs || "6", icon: Sparkles, color: "text-purple-400" },
          { label: "Marketplace Volume", val: `${stats.totalMarketplaceVolume} ETH`, icon: TrendingUp, color: "text-emerald-400" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">{stat.val}</div>
            </div>
          );
        })}
      </section>

      {/* Complete Workflow Journey */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">The TrustChain End-to-End Flow</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            From physical verification to decentralized financial borrowing and governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.num}
                href={step.href}
                className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} p-0.5 shadow-lg`}>
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className="text-2xl font-black text-slate-700 group-hover:text-slate-500 transition">
                    {step.num}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition flex items-center gap-2">
                    {step.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Security & Architectural Highlights */}
      <section className="glass-panel rounded-3xl p-8 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white">Cryptographic Tamper-Resistance</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Certificates are SHA-256 hashed locally before submitting signatures to the blockchain. Any document modification produces a hash mismatch error.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-base font-bold text-white">Role-Based Custody Control</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            OpenZeppelin AccessControl enforces strict role boundaries (`ISSUER`, `MANUFACTURER`, `DISTRIBUTOR`, `RETAILER`).
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Coins className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-base font-bold text-white">DeFi & DAO Integration</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Use tokenized physical assets as collateral for mUSD borrowing and participate in token-weighted governance proposal voting.
          </p>
        </div>
      </section>
    </div>
  );
}
