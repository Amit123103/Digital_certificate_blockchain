"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { getSupplyChainContract, getSigner } from "@/lib/contracts";
import { Truck, ArrowLeft, MapPin, ShieldCheck, CheckCircle2, Send, Clock, User, FileText } from "lucide-react";

export default function SupplyChainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const { setTxStatus, activeAccountKey, account, role } = useWallet();

  const [productData, setProductData] = useState<any>(null);
  const [certData, setCertData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [recipient, setRecipient] = useState("0x90F79bf6EB2c4f8090654381D227588e9395e313"); // Default Distributor
  const [location, setLocation] = useState("Rotterdam Logistics Terminal, Hub #4");
  const [status, setStatus] = useState("IN_TRANSIT");
  const [notes, setNotes] = useState("Customs cleared, sealed container transferred to bonded freight.");

  useEffect(() => {
    if (productId) {
      fetchData();
    }
  }, [productId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (data.product) {
        setProductData(data.product);
        setCertData(data.certificate);
        setHistory(data.supplyChain || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient) {
      alert("Please enter recipient wallet address");
      return;
    }

    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Signing Supply Chain Transfer Transaction...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const scContract = getSupplyChainContract(signer);

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Recording custodial transfer of ${productId} to ${recipient}...`,
      });

      const tx = await scContract.recordTransfer(productId, recipient, location, status, notes);

      setTxStatus({
        active: true,
        step: "confirming",
        message: "Waiting for EVM block confirmation...",
        txHash: tx.hash,
      });

      await tx.wait();
      await fetch("/api/sync");

      setTxStatus({
        active: true,
        step: "success",
        message: `Supply chain event logged on-chain successfully!`,
        txHash: tx.hash,
      });

      // Refresh state
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to record supply chain transfer",
        errorDetails: err.reason || err.message,
      });
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400 text-sm">Loading supply chain timeline...</div>;
  if (!productData) return <div className="text-center py-12 text-slate-400 text-sm">Product not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Supply Chain
      </button>

      {/* Header Panel */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-blue-950 text-blue-400 border border-blue-800">
              {productData.productId}
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-2">{productData.name}</h1>
            <p className="text-xs text-slate-400 mt-1">{productData.description}</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Status: {productData.status}
            </span>
            <div className="text-xs font-mono text-slate-400 mt-2 truncate max-w-xs">
              Current Owner: <span className="text-white">{productData.currentOwner}</span>
            </div>
          </div>
        </div>

        {certData && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-semibold">
              <ShieldCheck className="w-4 h-4" /> Linked Certificate: {certData.certificateId}
            </div>
            <span className="text-slate-500 text-[11px]">Hash Match Verified ✓</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visual Timeline (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Custodial Movement Timeline
          </h2>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-emerald-500">
            {/* Initial Registration Event */}
            <div className="relative flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-lg z-10 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Product Registered & Certified</span>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date(productData.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-slate-300">
                  Registered by Manufacturer: <span className="font-mono text-blue-400">{productData.manufacturer}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Transfer Events */}
            {history.map((evt, idx) => (
              <div key={evt.id || idx} className="relative flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-lg z-10 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{evt.status}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold">
                    <MapPin className="w-3.5 h-3.5" /> {evt.location}
                  </div>

                  <div className="text-xs font-mono text-slate-400 space-y-0.5 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                    <div className="truncate"><span className="text-slate-500">From:</span> {evt.fromAddress}</div>
                    <div className="truncate"><span className="text-slate-500">To:</span> {evt.toAddress}</div>
                  </div>

                  {evt.notes && <p className="text-xs text-slate-300 italic pt-1">{evt.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel: Record New Transfer */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-400" /> Record Custodial Transfer
            </h3>
            <p className="text-xs text-slate-400">
              Only the current product owner can transfer custody on-chain.
            </p>

            <form onSubmit={handleRecordTransfer} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Recipient Wallet Address</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Location / Hub Name</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">New Custody Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="IN_TRANSIT">IN_TRANSIT (Distributor/Freight)</option>
                  <option value="WAREHOUSED">WAREHOUSED (Logistics Center)</option>
                  <option value="RETAIL">RETAIL (Boutique Storefront)</option>
                  <option value="DELIVERED">DELIVERED (Final Customer)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Notes / Shipping Manifest</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Sign & Record Transfer On-Chain
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
