"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet, TEST_ACCOUNTS } from "@/context/WalletContext";
import {
  ShieldCheck,
  Package,
  Truck,
  Sparkles,
  ShoppingBag,
  Coins,
  Vote,
  LayoutDashboard,
  Wallet,
  CheckCircle,
  Copy,
  ChevronDown,
  RefreshCw,
  History,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { account, role, connectMetaMask, switchAccount, isMetaMaskConnected } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const navItems = [
    { name: "Verify & Certs", href: "/certificates", icon: ShieldCheck },
    { name: "Products", href: "/products", icon: Package },
    { name: "Supply Chain", href: "/supply-chain", icon: Truck },
    { name: "NFT Mint", href: "/nft", icon: Sparkles },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { name: "DeFi Lending", href: "/defi", icon: Coins },
    { name: "DAO Governance", href: "/dao", icon: Vote },
    { name: "Transactions", href: "/transactions", icon: History },
    { name: "Admin", href: "/admin", icon: LayoutDashboard },
  ];

  const formatAddress = (addr: string | null) => {
    if (!addr) return "Not Connected";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSync = async () => {
    try {
      await fetch("/api/sync");
      alert("Synced database with on-chain Hardhat state!");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-blue-400 transition">
                TrustChain
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                EVM Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Digital Certs • Supply Chain • NFT • DeFi • DAO</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Wallet & Account Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            title="Sync DB Indexer"
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Role & Account Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 text-xs text-white transition shadow-md"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-blue-400 uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/50">
                {role}
              </span>
              <span className="font-mono text-slate-200">{formatAddress(account)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 space-y-2 z-50 animate-in fade-in zoom-in-95">
                <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/60">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Connected Wallet
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-white">
                    <span>{formatAddress(account)}</span>
                    <button onClick={handleCopy} className="text-slate-400 hover:text-white transition">
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 pt-1">
                  Switch Role / Test Signer
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {TEST_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.key}
                      onClick={() => {
                        switchAccount(acc.key, acc.role);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition flex items-center justify-between ${
                        account?.toLowerCase() === acc.address.toLowerCase()
                          ? "bg-blue-600/20 border border-blue-500/40 text-white"
                          : "hover:bg-slate-800/60 text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-white">{acc.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {acc.address.substring(0, 8)}...{acc.address.substring(38)}
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-slate-800 text-blue-400 border border-slate-700">
                        {acc.role}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={connectMetaMask}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg"
                  >
                    <Wallet className="w-4 h-4" />
                    {isMetaMaskConnected ? "MetaMask Connected" : "Connect MetaMask"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
