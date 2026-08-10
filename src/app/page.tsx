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
  TrendingUp,
  Award,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const { account, connectMetaMask } = useWallet();
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  const features = [
    {
      num: "01",
      title: "Digital Certificate Verification",
      desc: "Tamper-proof cryptographic hashes registered on-chain by authorized audit institutions.",
      icon: ShieldCheck,
      href: "/certificates",
      color: "from-blue-600 to-indigo-600",
    },
    {
      num: "02",
      title: "Supply Chain Provenance",
      desc: "Track custodial transfers step-by-step from manufacturer to distributor, retailer, and customer.",
      icon: Truck,
      href: "/supply-chain",
      color: "from-indigo-600 to-purple-600",
    },
    {
      num: "03",
      title: "Product NFT Tokenization",
      desc: "Mint ERC-721 digital twin NFTs representing physical luxury goods and certified assets.",
      icon: Sparkles,
      href: "/nft",
      color: "from-purple-600 to-pink-600",
    },
    {
      num: "04",
      title: "NFT Marketplace",
      desc: "Trade verified product NFTs with automated fee collection, provenance verification & direct payouts.",
      icon: ShoppingBag,
      href: "/marketplace",
      color: "from-pink-600 to-rose-600",
    },
    {
      num: "05",
      title: "DeFi Lending",
      desc: "Deposit product NFTs as collateral to borrow mUSD stablecoins up to LTV ratio.",
      icon: Coins,
      href: "/defi",
      color: "from-amber-600 to-emerald-600",
    },
    {
      num: "06",
      title: "DAO Governance",
      desc: "Hold TCG governance tokens to propose parameter changes, cast votes, and execute decisions.",
      icon: Vote,
      href: "/dao",
      color: "from-emerald-600 to-cyan-600",
    },
  ];

  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-blue-500/40 text-blue-700 dark:text-blue-400 text-xs font-extrabold uppercase tracking-widest shadow-lg">
          <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-bounce" />
          Enterprise Decentralized Supply Chain & Verification System
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Trust. Track. Trade.{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-blue-400 dark:via-indigo-300 dark:to-emerald-400 bg-clip-text text-transparent">
            Govern.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-semibold">
          A full-stack enterprise blockchain platform establishing tamper-resistant product authenticity, end-to-end custodial provenance, tokenization, decentralized trading, collateral lending, and community DAO governance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5"
          >
            <Lock className="w-5 h-5" />
            Get Started & Sign In (Google / Apple / Web3)
          </Link>

          <Link
            href="/marketplace"
            className="flex items-center gap-2 px-6 py-4 rounded-2xl glass-panel hover:border-blue-500 font-extrabold text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 transition"
          >
            <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Explore Marketplace
          </Link>

          <Link
            href="/certificates"
            className="flex items-center gap-2 px-6 py-4 rounded-2xl glass-panel hover:border-blue-500 font-extrabold text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 transition"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Verify Certificate
          </Link>
        </div>
      </section>

      {/* Live Blockchain Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Verified Certificates", val: stats.verifiedCertificates || "3", icon: ShieldCheck, color: "text-blue-600 dark:text-blue-400" },
          { label: "Tracked Products", val: stats.totalProducts || "3", icon: Package, color: "text-indigo-600 dark:text-indigo-400" },
          { label: "NFTs Tokenized", val: stats.totalNFTs || "1", icon: Sparkles, color: "text-purple-600 dark:text-purple-400" },
          { label: "Marketplace Volume", val: `${stats.totalMarketplaceVolume || "1.50"} ETH`, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400" },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <Icon className={`w-4 h-4 ${m.color}`} />
                {m.label}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{m.val}</div>
            </div>
          );
        })}
      </section>

      {/* Full Module Ecosystem Showcase */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Complete Architecture Workflow
          </h2>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            From cryptographic certificate issuance to custodial supply chain tracking, NFT minting, decentralized trading, DeFi loans, and DAO voting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.num}
                href={f.href}
                className="glass-panel glass-panel-hover p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 block group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${f.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {f.num}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition flex items-center gap-2">
                    {f.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">{f.desc}</p>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400">
                  <span>Explore Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Enterprise Security Banner */}
      <section className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 space-y-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Enterprise Security Standard
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Role-Based EVM Access Control & Audit Log
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
            OpenZeppelin AccessControl enforces strict role boundaries: `ISSUER_ROLE` registers certificates, `MANUFACTURER_ROLE` registers products, custodial transfers update real-time owner, and `DAO` token-holders approve system updates.
          </p>
        </div>

        <Link
          href="/admin"
          className="px-6 py-4 rounded-2xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-sm shadow-xl shrink-0 transition"
        >
          Open Admin Control Panel
        </Link>
      </section>
    </div>
  );
}
