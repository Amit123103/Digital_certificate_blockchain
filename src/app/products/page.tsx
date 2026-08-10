"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, Search, ShieldCheck, User, Sparkles, ExternalLink } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productId.toLowerCase().includes(search.toLowerCase()) ||
      p.certificateId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-400" />
            Product Registry
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Register enterprise physical/digital assets linked strictly to valid on-chain digital certificates.
          </p>
        </div>

        <Link
          href="/products/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Register Product
        </Link>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search product name, ID, or linked certificate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm animate-pulse">Loading product registry...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Products Registered</h3>
          <p className="text-xs text-slate-400">Register a new product linked to a valid certificate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                    {product.productId}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">{product.name}</h3>
                </div>

                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {product.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2">{product.description}</p>

              <div className="space-y-1.5 text-xs text-slate-400 font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Certificate:</span>
                  <span className="text-emerald-400 font-bold">{product.certificateId}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">Owner:</span> {product.currentOwner}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <Link
                  href={`/supply-chain/${product.productId}`}
                  className="text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                >
                  Track Custody <ExternalLink className="w-3 h-3" />
                </Link>

                <Link
                  href={`/nft?productId=${product.productId}`}
                  className="text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Tokenize NFT <Sparkles className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
