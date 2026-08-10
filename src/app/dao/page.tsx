"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { getDAOContract, getGovernanceTokenContract, getSigner } from "@/lib/contracts";
import { Vote, Plus, CheckCircle2, XCircle, AlertCircle, Coins, ArrowRight, ShieldCheck } from "lucide-react";
import { ethers } from "ethers";

export default function DAOPage() {
  const { setTxStatus, activeAccountKey, account } = useWallet();

  const [tcgBalance, setTcgBalance] = useState("0");
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Proposal Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState("Reduce Marketplace Fee from 2.5% to 2.0%");
  const [proposalDesc, setProposalDesc] = useState("Proposal to lower platform fee rate to incentivize higher trading volumes.");

  useEffect(() => {
    fetchDAOData();
  }, [account]);

  const fetchDAOData = async () => {
    try {
      if (account) {
        const govContract = getGovernanceTokenContract();
        const bal = await govContract.balanceOf(account);
        setTcgBalance(ethers.formatEther(bal));
      }

      const res = await fetch("/api/dao");
      const data = await res.json();
      if (Array.isArray(data)) setProposals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTCG = async () => {
    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Signing TCG Governance Token Faucet...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const govContract = getGovernanceTokenContract(signer);
      const recipient = account || (await signer.getAddress());

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Claiming 1,000 TCG governance tokens for ${recipient}...`,
      });

      const tx = await govContract.faucet(recipient, ethers.parseEther("1000"));

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
        message: "Claimed 1,000 TCG governance tokens!",
        txHash: tx.hash,
      });

      await fetchDAOData();
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

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitle) return;

    try {
      setTxStatus({
        active: true,
        step: "waiting",
        message: "Signing DAO Proposal Creation Transaction...",
      });

      const signer = getSigner(activeAccountKey || undefined);
      const daoContract = getDAOContract(signer);

      setTxStatus({
        active: true,
        step: "submitting",
        message: "Creating DAO Proposal on-chain...",
      });

      const tx = await daoContract.createProposal(proposalTitle, proposalDesc);

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
        message: "DAO Proposal created successfully!",
        txHash: tx.hash,
      });

      setShowCreateModal(false);
      await fetchDAOData();
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to create proposal",
        errorDetails: err.reason || err.message,
      });
    }
  };

  const handleCastVote = async (proposalId: number, voteType: number) => {
    try {
      const voteLabels = ["AGAINST", "FOR", "ABSTAIN"];
      setTxStatus({
        active: true,
        step: "waiting",
        message: `Signing vote '${voteLabels[voteType]}' for Proposal #${proposalId}...`,
      });

      const signer = getSigner(activeAccountKey || undefined);
      const daoContract = getDAOContract(signer);

      setTxStatus({
        active: true,
        step: "submitting",
        message: `Submitting token-weighted vote (${tcgBalance} TCG power)...`,
      });

      const tx = await daoContract.castVote(proposalId, voteType);

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
        message: `Vote '${voteLabels[voteType]}' recorded on-chain!`,
        txHash: tx.hash,
      });

      await fetchDAOData();
    } catch (err: any) {
      console.error(err);
      setTxStatus({
        active: true,
        step: "error",
        message: "Failed to cast vote",
        errorDetails: err.reason || err.message,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Vote className="w-8 h-8 text-emerald-400" />
            DAO Governance Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Participate in token-weighted governance, propose system parameter changes, and cast weighted votes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Voting Power: <strong className="text-emerald-400">{parseFloat(tcgBalance).toFixed(0)} TCG</strong></span>
          </div>

          <button
            onClick={handleClaimTCG}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
          >
            Claim 1,000 TCG
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
          >
            <Plus className="w-4 h-4 inline mr-1" /> New Proposal
          </button>
        </div>
      </div>

      {/* Active & Passed Proposals */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm animate-pulse">Loading DAO proposals...</div>
      ) : proposals.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Vote className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Proposals Found</h3>
          <p className="text-xs text-slate-400">Create the first proposal to launch governance voting.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => {
            const votesForNum = parseFloat(proposal.votesFor || "0");
            const votesAgainstNum = parseFloat(proposal.votesAgainst || "0");
            const totalVotes = votesForNum + votesAgainstNum || 1;
            const forPct = Math.round((votesForNum / totalVotes) * 100);

            return (
              <div
                key={proposal.id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
                      Proposal #{proposal.proposalId}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1.5">{proposal.title}</h3>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                    proposal.executed ? "badge-verified" : "badge-in-progress"
                  }`}>
                    {proposal.executed ? "EXECUTED ✓" : "VOTING ACTIVE"}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{proposal.description}</p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">FOR: {votesForNum} TCG ({forPct}%)</span>
                    <span className="text-rose-400 font-bold">AGAINST: {votesAgainstNum} TCG ({100 - forPct}%)</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex border border-slate-900">
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${forPct}%` }} />
                    <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${100 - forPct}%` }} />
                  </div>
                </div>

                {/* Voting Action Buttons */}
                {!proposal.executed && (
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-900">
                    <button
                      onClick={() => handleCastVote(proposal.proposalId, 1)}
                      className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Vote FOR (100% Weight)
                    </button>

                    <button
                      onClick={() => handleCastVote(proposal.proposalId, 0)}
                      className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Vote AGAINST
                    </button>

                    <button
                      onClick={() => handleCastVote(proposal.proposalId, 2)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                    >
                      Abstain
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Proposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Vote className="w-5 h-5 text-emerald-400" /> Create On-Chain DAO Proposal
            </h3>

            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Proposal Title</label>
                <input
                  type="text"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Rationales</label>
                <textarea
                  rows={4}
                  value={proposalDesc}
                  onChange={(e) => setProposalDesc(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-400">
                Requires minimum threshold of <strong>100 TCG</strong> governance tokens to submit.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-xl transition"
              >
                Submit Proposal to Smart Contract
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
