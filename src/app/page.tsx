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
  LogIn,
} from "lucide-react";

export default function HomePage() {
  const { authSession } = useWallet();
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
      href: authSession.isAuthenticated ? "/certificates" : "/login",
      color: "from-emerald-600 to-teal-600",
    },
    {
      num: "02",
      title: "Supply Chain Provenance",
      desc: "Track custodial transfers step-by-step from manufacturer to distributor, retailer, and customer.",
      icon: Truck,
      href: authSession.isAuthenticated ? "/supply-chain" : "/login",
      color: "from-teal-600 to-green-600",
    },
    {
      num: "03",
      title: "Product NFT Tokenization",
      desc: "Mint ERC-721 digital twin NFTs representing physical luxury goods and certified assets.",
      icon: Sparkles,
      href: authSession.isAuthenticated ? "/nft" : "/login",
      color: "from-green-600 to-emerald-500",
    },
    {
      num: "04",
      title: "NFT Marketplace",
      desc: "Trade verified product NFTs with automated fee collection, provenance verification & direct payouts.",
      icon: ShoppingBag,
      href: authSession.isAuthenticated ? "/marketplace" : "/login",
      color: "from-emerald-500 to-teal-500",
    },
    {
      num: "05",
      title: "DeFi Lending",
      desc: "Deposit product NFTs as collateral to borrow mUSD stablecoins up to LTV ratio.",
      icon: Coins,
      href: authSession.isAuthenticated ? "/defi" : "/login",
      color: "from-teal-500 to-green-500",
    },
    {
      num: "06",
      title: "DAO Governance",
      desc: "Hold TCG governance tokens to propose parameter changes, cast votes, and execute decisions.",
      icon: Vote,
      href: authSession.isAuthenticated ? "/dao" : "/login",
      color: "from-green-500 to-emerald-600",
    },
  ];

  return (
    <div className="space-y-20 py-6">
      {/* Alive Green Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-emerald-500/50 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-widest shadow-lg">
          <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-bounce" />
          Alive Green Decentralized Supply Chain & Verification System
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Trust. Track. Trade.{" "}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-400 bg-clip-text text-transparent">
            Govern.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-800 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed font-bold">
          A full-stack enterprise blockchain platform establishing tamper-resistant product authenticity, end-to-end custodial provenance, tokenization, decentralized trading, collateral lending, and community DAO governance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {!authSession.isAuthenticated ? (
            /* Alive Green Unauthenticated CTAs */
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition transform hover:-translate-y-0.5"
              >
                <LogIn className="w-5 h-5" />
                Get Started & Sign In (Google / Apple / Microsoft / Web3)
              </Link>
            </div>
          ) : (
            /* Alive Green Authenticated CTAs */
            <>
              <Link
                href="/marketplace"
                className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-5 h-5" />
                Explore Marketplace
              </Link>

              <Link
                href="/certificates"
                className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-emerald-950 dark:bg-emerald-900 hover:bg-emerald-900 dark:hover:bg-emerald-800 text-white font-extrabold text-sm shadow-lg transition"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Verify Certificate
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Alive Green Metrics Showcase */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Verified Certificates", val: stats.verifiedCertificates || "3", icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Tracked Products", val: stats.totalProducts || "3", icon: Package, color: "text-teal-600 dark:text-teal-400" },
          { label: "NFTs Tokenized", val: stats.totalNFTs || "1", icon: Sparkles, color: "text-green-600 dark:text-green-400" },
          { label: "Marketplace Volume", val: `${stats.totalMarketplaceVolume || "1.50"} ETH`, icon: TrendingUp, color: "text-emerald-500 dark:text-emerald-300" },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-3xl border border-emerald-300 dark:border-emerald-800 space-y-2 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                <Icon className={`w-4 h-4 ${m.color}`} />
                {m.label}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">{m.val}</div>
            </div>
          );
        })}
      </section>

      {/* Alive Green Architecture Ecosystem Showcase */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Complete Architecture Workflow
          </h2>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 max-w-xl mx-auto">
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
                className="glass-panel glass-panel-hover p-8 rounded-3xl border border-emerald-300 dark:border-emerald-800 space-y-5 block group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${f.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-emerald-800 dark:text-emerald-400 group-hover:text-emerald-600 transition">
                    {f.num}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition flex items-center gap-2">
                    {f.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
                  </h3>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-relaxed">{f.desc}</p>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400">
                  <span>{authSession.isAuthenticated ? "Explore Module" : "Sign In to Access"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Alive Green Security Banner */}
      <section className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-400 dark:border-emerald-800 bg-gradient-to-r from-emerald-100/90 via-teal-100/90 to-green-100/90 dark:from-emerald-950/60 dark:via-teal-950/60 dark:to-green-950/60 space-y-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-200 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-700 text-xs font-black uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Enterprise Security Standard
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Role-Based EVM Access Control & Audit Log
          </h3>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
            OpenZeppelin AccessControl enforces strict role boundaries: `ISSUER_ROLE` registers certificates, `MANUFACTURER_ROLE` registers products, custodial transfers update real-time owner, and `DAO` token-holders approve system updates.
          </p>
        </div>

        <Link
          href={authSession.isAuthenticated ? "/admin" : "/login"}
          className="px-6 py-4 rounded-2xl bg-emerald-900 dark:bg-emerald-100 hover:bg-emerald-800 dark:hover:bg-white text-white dark:text-emerald-950 font-black text-sm shadow-xl shrink-0 transition"
        >
          {authSession.isAuthenticated ? "Open Admin Control Panel" : "Sign In to Admin Panel"}
        </Link>
      </section>
    </div>
  );
}
