import React from "react";
import Link from "next/link";
import { ShieldCheck, Github, BookOpen, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">TrustChain Ecosystem</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Decentralized Platform for Digital Certificate Verification, Supply Chain Provenance, ERC-721 Tokenization, NFT Marketplace Trading, Collateralized DeFi Lending, and Token-Weighted DAO Governance.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-emerald-400" /> Hardhat Localhost Network</span>
              <span>•</span>
              <span>Solidity 0.8.20</span>
              <span>•</span>
              <span>EVM Compatible</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/certificates" className="hover:text-blue-400 transition">Certificate Verification</Link></li>
              <li><Link href="/products" className="hover:text-blue-400 transition">Product Registry</Link></li>
              <li><Link href="/supply-chain" className="hover:text-blue-400 transition">Supply Chain Tracking</Link></li>
              <li><Link href="/nft" className="hover:text-blue-400 transition">NFT Tokenization</Link></li>
              <li><Link href="/marketplace" className="hover:text-blue-400 transition">NFT Marketplace</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Financial & Governance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/defi" className="hover:text-blue-400 transition">DeFi Collateral Loans</Link></li>
              <li><Link href="/dao" className="hover:text-blue-400 transition">DAO Governance</Link></li>
              <li><Link href="/admin" className="hover:text-blue-400 transition">Admin Dashboard</Link></li>
              <li><Link href="/transactions" className="hover:text-blue-400 transition">Transaction Explorer</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TrustChain Platform. Built for Enterprise Blockchain Verification.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 transition">Open Source Architecture</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition">Privacy Preserving SHA-256</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
