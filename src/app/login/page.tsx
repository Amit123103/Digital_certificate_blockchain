"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { ShieldCheck, Wallet, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, loginWithApple, loginWithMicrosoft, loginWithEmail, connectMetaMask } = useWallet();

  const [email, setEmail] = useState("user@enterprise.com");
  const [password, setPassword] = useState("••••••••••••");

  const handleGoogleLogin = () => {
    loginWithGoogle();
    router.push("/");
  };

  const handleAppleLogin = () => {
    loginWithApple();
    router.push("/");
  };

  const handleMicrosoftLogin = () => {
    loginWithMicrosoft();
    router.push("/");
  };

  const handleMetaMaskLogin = async () => {
    await connectMetaMask();
    router.push("/");
  };

  const handleEmailFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    loginWithEmail(email);
    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-400 p-0.5 shadow-2xl shadow-emerald-500/30 mx-auto">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <ShieldCheck className="w-9 h-9 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Sign In to TrustChain
        </h1>
        <p className="text-xs text-slate-800 dark:text-slate-200 font-bold max-w-sm mx-auto">
          Access your digital certificates, supply chain provenance, tokenized NFTs, DeFi positions, and DAO governance.
        </p>
      </div>

      {/* Social, Enterprise & Web3 Auth Options */}
      <div className="glass-panel p-8 rounded-3xl space-y-5 shadow-2xl border border-emerald-300 dark:border-emerald-800">
        <div className="space-y-3">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3.5 px-4 bg-white hover:bg-emerald-50 text-slate-900 font-extrabold text-xs rounded-2xl border border-slate-300 shadow-md flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Apple Sign In */}
          <button
            onClick={handleAppleLogin}
            className="w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-2xl border border-slate-800 shadow-md flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.48-6.08-3.41-2.73-7.3-7.46-11.67-14.19-7.32-11.28-12.87-23.82-16.66-37.62-3.79-13.8-5.69-26.68-5.69-38.63 0-14.86 3.79-27.28 11.37-37.26 7.58-9.98 17.06-15.09 28.44-15.34 4.58-.13 9.77 1.12 15.57 3.75 5.8 2.63 9.94 3.95 12.43 3.95 2.11 0 6.32-1.38 12.63-4.14 6.31-2.76 11.44-4.02 15.39-3.77 12.73.63 22.84 5.37 30.33 14.22-11.28 6.82-16.79 16.59-16.54 29.3.26 10.05 4.3 18.42 12.12 25.1 7.82 6.68 17.07 10.42 27.75 11.22-2.58 7.7-6.04 15.38-10.37 23.05zM119.22 31.08c0-7.36 2.69-14.38 8.07-21.07 5.38-6.69 12.02-10.74 19.92-12.16.26 1.01.39 1.95.39 2.84 0 7.42-2.78 14.54-8.34 21.36-5.56 6.82-12.22 10.87-19.98 12.15-.06-.82-.06-1.85-.06-3.12z" />
            </svg>
            Continue with Apple ID
          </button>

          {/* Microsoft Sign In */}
          <button
            onClick={handleMicrosoftLogin}
            className="w-full py-3.5 px-4 bg-white hover:bg-emerald-50 text-slate-900 font-extrabold text-xs rounded-2xl border border-slate-300 shadow-md flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Continue with Microsoft
          </button>

          {/* Web3 Wallet Sign In */}
          <button
            onClick={handleMetaMaskLogin}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5"
          >
            <Wallet className="w-4 h-4" />
            Connect MetaMask / Web3 Wallet
          </button>
        </div>

        <div className="relative flex items-center justify-center pt-2">
          <div className="border-t border-emerald-200 dark:border-emerald-800 w-full" />
          <span className="bg-white dark:bg-emerald-950 px-3 text-[11px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider absolute">
            Or Login With Email
          </span>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailFormSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-emerald-50/50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-emerald-50/50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-emerald-900 dark:bg-emerald-800 hover:bg-emerald-800 dark:hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
          >
            Sign In to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-emerald-800 dark:text-emerald-300 font-bold space-y-1">
        <p>Protected by Enterprise SHA-256 Encryption & EVM Smart Contracts.</p>
        <p>© {new Date().getFullYear()} TrustChain Ecosystem.</p>
      </div>
    </div>
  );
}
