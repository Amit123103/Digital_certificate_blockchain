"use client";

import React from "react";
import { useWallet } from "@/context/WalletContext";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export function TxModal() {
  const { txStatus, resetTxStatus } = useWallet();

  if (!txStatus.active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
        {txStatus.step === "success" || txStatus.step === "error" ? (
          <button
            onClick={resetTxStatus}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        ) : null}

        <div className="flex flex-col items-center text-center space-y-4">
          {txStatus.step === "waiting" || txStatus.step === "submitting" || txStatus.step === "confirming" ? (
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              <Loader2 className="w-8 h-8 text-blue-400 absolute animate-pulse" />
            </div>
          ) : null}

          {txStatus.step === "success" ? (
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          ) : null}

          {txStatus.step === "error" ? (
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-rose-400" />
            </div>
          ) : null}

          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">
              {txStatus.step === "waiting" && "Waiting for Wallet Confirmation..."}
              {txStatus.step === "submitting" && "Submitting Transaction to Network..."}
              {txStatus.step === "confirming" && "Confirming Block Execution..."}
              {txStatus.step === "success" && "Transaction Confirmed Successfully!"}
              {txStatus.step === "error" && "Transaction Failed"}
            </h3>
            <p className="text-sm text-slate-300 mt-2">{txStatus.message}</p>
          </div>

          {txStatus.txHash && (
            <div className="w-full bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 break-all">
              <span className="text-slate-500 block mb-1">TX Hash:</span>
              <a
                href={`#`}
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Transaction Hash: ${txStatus.txHash}`);
                }}
                className="text-blue-400 hover:underline flex items-center justify-center gap-1"
              >
                {txStatus.txHash} <ExternalLink className="w-3 h-3 inline" />
              </a>
            </div>
          )}

          {txStatus.errorDetails && (
            <div className="w-full bg-rose-950/40 p-3 rounded-lg border border-rose-900/50 text-xs font-mono text-rose-300 text-left">
              {txStatus.errorDetails}
            </div>
          )}

          {(txStatus.step === "success" || txStatus.step === "error") && (
            <button
              onClick={resetTxStatus}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition duration-200 mt-2"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
