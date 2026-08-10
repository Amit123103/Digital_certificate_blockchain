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
  Sun,
  Moon,
  LogIn,
  LogOut,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const {
    account,
    role,
    connectMetaMask,
    switchAccount,
    themeMode,
    toggleThemeMode,
    authSession,
    logout,
  } = useWallet();
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
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-emerald-300 dark:border-emerald-800 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-2xl shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        {/* Brand Logo - Alive Green Badge */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-400 p-0.5 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition">
            <div className="w-full h-full bg-white dark:bg-emerald-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                TrustChain
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-500/50 shadow-sm">
                Alive EVM Live
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 hidden xl:block font-bold">
              Digital Certs • Supply Chain • NFT • DeFi • DAO
            </p>
          </div>
        </Link>

        {/* Module Links (Only When Signed In) */}
        {authSession.isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/60 shadow-sm"
                      : "text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-emerald-700 dark:text-emerald-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Mode Toggle Button */}
          <button
            onClick={toggleThemeMode}
            title={themeMode === "white" ? "Switch to Dark Theme" : "Switch to White Theme"}
            className="p-2.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 hover:border-emerald-500 transition shadow-sm"
          >
            {themeMode === "white" ? <Moon className="w-4 h-4 text-emerald-800" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {!authSession.isAuthenticated ? (
            /* Unauthenticated View: Single Alive Green CTA */
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5"
            >
              <LogIn className="w-4 h-4" /> Sign In / Get Started
            </Link>
          ) : (
            /* Authenticated View: Role Selector & Account Dropdown */
            <>
              <button
                onClick={handleSync}
                title="Sync DB Indexer"
                className="p-2.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 hover:border-emerald-500 transition shadow-sm"
              >
                <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 text-xs text-slate-900 dark:text-white transition shadow-md font-bold"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-400" />
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-950/90 border border-emerald-400 dark:border-emerald-700/60 shadow-inner">
                    {role}
                  </span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{formatAddress(account)}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-emerald-950/95 border border-emerald-300 dark:border-emerald-700 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                        Authenticated Session ({authSession.provider || "wallet"})
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {authSession.userName || "User"}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 dark:text-slate-300 mt-1">
                        <span>{formatAddress(account)}</span>
                        <button onClick={handleCopy} className="text-slate-400 hover:text-emerald-600 transition">
                          {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider px-1 pt-1">
                      Switch Active Role & Test Signer
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {TEST_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.key}
                          onClick={() => {
                            switchAccount(acc.key, acc.role);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between border ${
                            account?.toLowerCase() === acc.address.toLowerCase()
                              ? "bg-emerald-100 dark:bg-emerald-600/30 border-emerald-400 dark:border-emerald-500/60 text-emerald-950 dark:text-white font-extrabold shadow-sm"
                              : "bg-emerald-50/60 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="font-extrabold text-slate-900 dark:text-white truncate">{acc.name}</div>
                            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                              {acc.address.substring(0, 8)}...{acc.address.substring(38)}
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded font-extrabold uppercase bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-700 shrink-0">
                            {acc.role}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex gap-2">
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
