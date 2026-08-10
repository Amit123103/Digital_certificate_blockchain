"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, ArrowRight, Package, ShieldCheck, MapPin } from "lucide-react";

export default function SupplyChainOverviewPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Truck className="w-8 h-8 text-blue-400" />
          Supply Chain Provenance Tracker
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Select a registered asset to view its interactive custodial movement history across supply chain participants.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm animate-pulse">Loading tracked products...</div>
      ) : products.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Truck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Tracked Products</h3>
          <p className="text-xs text-slate-400">Register a product to start logging custodial movements.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/supply-chain/${product.productId}`}
              className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                    {product.productId}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2 group-hover:text-blue-400 transition flex items-center gap-2">
                    {product.name}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  </h3>
                </div>

                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {product.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-400 font-mono bg-slate-950 p-3 rounded-xl border border-slate-900">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">Owner: {product.currentOwner}</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Cert: <span className="text-emerald-400 font-bold">{product.certificateId}</span>
                </div>
              </div>

              <div className="text-xs font-semibold text-blue-400 group-hover:underline flex items-center justify-end gap-1 pt-2 border-t border-slate-800">
                View Interactive Timeline <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
