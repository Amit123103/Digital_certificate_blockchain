import React from "react";
import Link from "next/link";
import { Cpu } from "lucide-react";
import { CertiChainLogo } from "./CertiChainLogo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-emerald-300 dark:border-emerald-800 bg-white/80 dark:bg-emerald-950/80 backdrop-blur-md text-slate-700 dark:text-slate-300 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <CertiChainLogo size="lg" />
            <p className="text-xs text-slate-800 dark:text-slate-200 max-w-md leading-relaxed font-bold">
              Decentralized Platform for Digital Certificate Verification, Supply Chain Provenance, ERC-721 Tokenization, NFT Marketplace Trading, Collateralized DeFi Lending, and Token-Weighted DAO Governance.
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-400 font-extrabold font-mono">
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Hardhat Localhost Network</span>
              <span>•</span>
              <span>Solidity 0.8.24</span>
              <span>•</span>
              <span>EVM Compatible</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs font-bold">
              <li><Link href="/certificates" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Certificate Verification</Link></li>
              <li><Link href="/products" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Product Registry</Link></li>
              <li><Link href="/supply-chain" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Supply Chain Tracking</Link></li>
              <li><Link href="/nft" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">NFT Tokenization</Link></li>
              <li><Link href="/marketplace" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">NFT Marketplace</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">Financial & Governance</h4>
            <ul className="space-y-2 text-xs font-bold">
              <li><Link href="/defi" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">DeFi Collateral Loans</Link></li>
              <li><Link href="/dao" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">DAO Governance</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Admin Dashboard</Link></li>
              <li><Link href="/transactions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Transaction Explorer</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-900 dark:text-emerald-300 font-bold gap-4">
          <p>© {new Date().getFullYear()} CertiChain Platform. Built for Enterprise Blockchain Verification.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-emerald-600 transition">Open Source Architecture</span>
            <span>•</span>
            <span className="hover:text-emerald-600 transition">Privacy Preserving SHA-256</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
