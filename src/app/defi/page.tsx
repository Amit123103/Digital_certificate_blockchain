"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { getLendingPoolContract, getMockUSDContract, getProductNFTContract, getSigner } from "@/lib/contracts";
import { Coins, Lock, ArrowUpRight, CheckCircle2, ShieldCheck, DollarSign, Wallet } from "lucide-react";
import { ethers } from "ethers";

export default function DeFiPage() {
  const { setTxStatus, activeAccountKey, account, role } = useWallet();

  const [nfts, setNfts] = useState<any[]>([]);
  const [usdBalance, setUsdBalance] = useState("0");
  const [selectedTokenId, setSelectedTokenId] = useState<number | "">("");
  const [borrowAmount, setBorrowAmount] = useState("300");
  const [valuation, setValuation] = useState("1000");

  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeFiData();
  }, [account]);

  const fetchDeFiData = async () => {
    try {
      const nRes = await fetch("/api/nfts");
      const nData = await nRes.json();
      if (Array.isArray(nData)) setNfts(nData);

      if (account) {
        const mockUSDContract = getMockUSDContract();
        const bal = await mockUSDContract.balanceOf(account);
        setUsdBalance(ethers.formatEther(bal));
      }

      // Check loan for default token #1
      const lendingContract = getLendingPoolContract();
      try {
        const loanDetails = await lendingContract.getLoanDetails(1);
        if (loanDetails && loanDetails.borrowedAmount > 0n && !loanDetails.repaid) {
          setActiveLoan({
            loanId: Number(loanDetails.loanId),
            tokenId: Number(loanDetails.tokenId),
            borrower: loanDetails.borrower,
            collateralValue: ethers.formatEther(loanDetails.collateralValue),
            borrowedAmount: ethers.formatEther(loanDetails.borrowedAmount),
            interestRate: Number(loanDetails.interestRate) / 100,
            repaid: loanDetails.repaid,
          });
        }
      } catch (e) {}
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFaucetmUSD = async () => {
    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Signing mUSD Faucet Transaction...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const mockUSDContract = getMockUSDContract(signer);
      const recipient = account || (await signer.getAddress());

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Claiming 1,000 mUSD test tokens for ${recipient}...`,
      });

      const tx = await mockUSDContract.faucet(recipient, ethers.parseEther("1000"));

      setTxStatus({
        active: true,
        step: "confirming",
        message: "Waiting for EVM block confirmation...",
        txHash: tx.hash,
      });

      await tx.wait();
      setTxStatus({
        active: true,
        step: "success",
        message: "Claimed 1,000 mUSD tokens successfully!",
        txHash: tx.hash,
      });

      await fetchDeFiData();
    } catch (e: any) {
      console.error(e);
      setTxStatus({
        active: true,
        step: "error",
        message: "Faucet failed",
        errorDetails: e.reason || e.message,
      });
    }
  };

  const handleDepositAndBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTokenId || !borrowAmount) return;

    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Setting Oracle Valuation and Approving NFT Collateral...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const lendingContract = getLendingPoolContract(signer);
      const nftContract = getProductNFTContract(signer);
      const lendingPoolAddr = await lendingContract.getAddress();

      // 1. Admin sets valuation
      const valTx = await lendingContract.setNFTValuation(selectedTokenId, ethers.parseEther(valuation));
      await valTx.wait();

      // 2. Approve NFT
      const approveTx = await nftContract.approve(lendingPoolAddr, selectedTokenId);
      await approveTx.wait();

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Depositing NFT #${selectedTokenId} & borrowing ${borrowAmount} mUSD on-chain...`,
      });

      const borrowTx = await lendingContract.depositAndBorrow(selectedTokenId, ethers.parseEther(borrowAmount));

      setTxStatus({
        active: true,
        step: "confirming",
        message: "Waiting for EVM block confirmation...",
        txHash: borrowTx.hash,
      });

      await borrowTx.wait();
      await fetch("/api/sync");

      setTxStatus({
        active: true,
        step: "success",
        message: `Loan opened! Borrowed ${borrowAmount} mUSD against Collateral NFT #${selectedTokenId}`,
        txHash: borrowTx.hash,
      });

      await fetchDeFiData();
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to open loan",
        errorDetails: err.reason || err.message,
      });
    }
  };

  const handleRepay = async () => {
    if (!activeLoan) return;

    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Approving mUSD Repayment & Executing On-Chain Loan Settlement...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const lendingContract = getLendingPoolContract(signer);
      const usdContract = getMockUSDContract(signer);
      const lendingPoolAddr = await lendingContract.getAddress();

      const totalDue = await lendingContract.calculateTotalRepayment(activeLoan.loanId);

      // Approve mUSD
      const approveTx = await usdContract.approve(lendingPoolAddr, totalDue);
      await approveTx.wait();

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Repaying Loan #${activeLoan.loanId} and unlocking Collateral NFT #${activeLoan.tokenId}...`,
      });

      const tx = await lendingContract.repayLoan(activeLoan.loanId);

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
        message: `Loan #${activeLoan.loanId} fully repaid! Collateral NFT #${activeLoan.tokenId} returned to your wallet.`,
        txHash: tx.hash,
      });

      setActiveLoan(null);
      await fetchDeFiData();
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to repay loan",
        errorDetails: err.reason || err.message,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Coins className="w-8 h-8 text-amber-400" />
            DeFi NFT Lending Protocol
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Lock verified product NFTs as collateral to borrow mUSD stablecoins up to 50% Loan-to-Value (LTV).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Balance: <strong className="text-emerald-400">{parseFloat(usdBalance).toFixed(2)} mUSD</strong></span>
          </div>

          <button
            onClick={handleFaucetmUSD}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
          >
            Claim 1,000 mUSD Faucet
          </button>
        </div>
      </div>

      {/* Active Loan Position Banner */}
      {activeLoan && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Active Collateralized Loan Position</h3>
                <p className="text-xs text-slate-400 font-mono">Loan #{activeLoan.loanId} • Collateral NFT #{activeLoan.tokenId}</p>
              </div>
            </div>

            <button
              onClick={handleRepay}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Repay Loan & Unlock NFT
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono bg-slate-950/80 p-4 rounded-2xl border border-slate-900">
            <div>
              <span className="text-slate-500 block">Collateral Value:</span>
              <span className="text-white font-bold">${activeLoan.collateralValue} mUSD</span>
            </div>
            <div>
              <span className="text-slate-500 block">Borrowed Principal:</span>
              <span className="text-amber-400 font-bold">${activeLoan.borrowedAmount} mUSD</span>
            </div>
            <div>
              <span className="text-slate-500 block">Interest Rate:</span>
              <span className="text-slate-300">{activeLoan.interestRate}% Flat</span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Due on Repay:</span>
              <span className="text-emerald-400 font-bold">
                ${(parseFloat(activeLoan.borrowedAmount) * 1.05).toFixed(2)} mUSD
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Deposit & Borrow Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Loan Calculator Form */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" /> Deposit Collateral & Borrow mUSD
          </h2>

          <form onSubmit={handleDepositAndBorrow} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select NFT Collateral</label>
              <select
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">Choose an owned Product NFT...</option>
                {nfts.map((n) => (
                  <option key={n.id} value={n.tokenId}>
                    Token #{n.tokenId} ({n.productId})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Oracle Valuation ($)</label>
                <input
                  type="number"
                  value={valuation}
                  onChange={(e) => setValuation(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Borrow Amount (Max 50% LTV)</label>
                <input
                  type="number"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-emerald-400 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-2 text-xs font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Maximum Allowed Loan (50% LTV):</span>
                <span className="text-white">${parseFloat(valuation || "0") * 0.5} mUSD</span>
              </div>
              <div className="flex justify-between">
                <span>Annual Interest Rate:</span>
                <span className="text-amber-400">5% Simple Interest</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-amber-600/30 transition transform hover:-translate-y-0.5"
            >
              Deposit Collateral & Disburse Loan
            </button>
          </form>
        </div>

        {/* How DeFi Lending Works */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">TrustChain Lending Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              TrustChain DeFi allows owners of verified luxury/industrial products to unlock liquid capital without relinquishing long-term ownership of physical assets.
            </p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Authenticity Backed:</strong> Smart contract strictly checks that collateral NFTs are linked to valid digital certificates.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>50% LTV Safeguard:</strong> Loans are capped at half the Oracle collateral value to prevent liquidation risks.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Escrow Vault:</strong> Collateral NFT is safely held in the `LendingPool.sol` contract until repayment.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-900/50 text-[11px] text-amber-300">
            Educational MVP Note: Oracle valuations are assigned via admin role for local testing.
          </div>
        </div>
      </div>
    </div>
  );
}
