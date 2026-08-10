"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

export const TEST_ACCOUNTS = [
  { name: "Admin / Fee Recipient", role: "ADMIN", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", key: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" },
  { name: "Certified Issuer (Bureau Veritas)", role: "ISSUER", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", key: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" },
  { name: "Manufacturer (Rolex / Swiss Luxury)", role: "MANUFACTURER", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", key: "0x5de4111ffa188d0a0ed59644130181485a3e9ec16d540a3fe8096d4ae564f69a" },
  { name: "Distributor (Global Logistics Ltd)", role: "DISTRIBUTOR", address: "0x90F79bf6EB2c4f8090654381D227588e9395e313", key: "0x7c88215e9e428b4c5d8f33d31b35f57731e642d992e59e120894564c7eda6021" },
  { name: "Retailer (Manhattan Boutique)", role: "RETAILER", address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", key: "0x47e179ec197488593b12f49310e24f23c5ff031fc0050190f0d6d2192751969d" },
  { name: "Customer Alpha (Collector)", role: "CUSTOMER", address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", key: "0x8b3a35084c348068c9154d4f422850772f66f444c86b696740bc18a4a584025d" },
];

export interface TxStatus {
  active: boolean;
  step: "idle" | "waiting" | "submitting" | "confirming" | "success" | "error";
  message: string;
  txHash?: string;
  errorDetails?: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  provider: "google" | "apple" | "wallet" | "email" | null;
  userName?: string;
  email?: string;
}

interface WalletContextType {
  account: string | null;
  role: string;
  isMetaMaskConnected: boolean;
  activeAccountKey: string | null;
  txStatus: TxStatus;
  authSession: AuthSession;
  themeMode: "white" | "dark";
  connectMetaMask: () => Promise<void>;
  switchAccount: (accountKey: string, role: string) => void;
  setTxStatus: React.Dispatch<React.SetStateAction<TxStatus>>;
  resetTxStatus: () => void;
  loginWithGoogle: () => void;
  loginWithApple: () => void;
  loginWithMicrosoft: () => void;
  loginWithEmail: (email: string) => void;
  logout: () => void;
  toggleThemeMode: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(TEST_ACCOUNTS[0].address);
  const [activeAccountKey, setActiveAccountKey] = useState<string | null>(TEST_ACCOUNTS[0].key);
  const [role, setRole] = useState<string>("ADMIN");
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<"white" | "dark">("white");

  const [authSession, setAuthSession] = useState<AuthSession>({
    isAuthenticated: true,
    provider: "wallet",
    userName: "Admin / Fee Recipient",
    email: "admin@trustchain.io",
  });

  const [txStatus, setTxStatus] = useState<TxStatus>({
    active: false,
    step: "idle",
    message: "",
  });

  useEffect(() => {
    if (themeMode === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === "white" ? "dark" : "white"));
  };

  const resetTxStatus = () => {
    setTxStatus({ active: false, step: "idle", message: "" });
  };

  const connectMetaMask = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setActiveAccountKey(null);
          setIsMetaMaskConnected(true);
          setRole("CUSTOMER");
          setAuthSession({
            isAuthenticated: true,
            provider: "wallet",
            userName: `Wallet User (${accounts[0].substring(0, 6)}...)`,
            email: `${accounts[0].substring(0, 8)}@web3.eth`,
          });
        }
      } catch (err) {
        console.error("MetaMask connection failed", err);
      }
    } else {
      alert("MetaMask browser extension not detected. Using built-in local Hardhat test account switcher.");
    }
  };

  const loginWithGoogle = () => {
    setAuthSession({
      isAuthenticated: true,
      provider: "google",
      userName: "Alex Johnson (Google User)",
      email: "alex.johnson@gmail.com",
    });
    setRole("CUSTOMER");
  };

  const loginWithApple = () => {
    setAuthSession({
      isAuthenticated: true,
      provider: "apple",
      userName: "Taylor Smith (Apple ID)",
      email: "t.smith@icloud.com",
    });
    setRole("CUSTOMER");
  };

  const loginWithMicrosoft = () => {
    setAuthSession({
      isAuthenticated: true,
      provider: "microsoft",
      userName: "Jordan Lee (Microsoft 365)",
      email: "jordan.lee@microsoft.com",
    });
    setRole("CUSTOMER");
  };

  const loginWithEmail = (email: string) => {
    setAuthSession({
      isAuthenticated: true,
      provider: "email",
      userName: email.split("@")[0],
      email: email,
    });
    setRole("CUSTOMER");
  };

  const logout = () => {
    setAuthSession({
      isAuthenticated: false,
      provider: null,
      userName: undefined,
      email: undefined,
    });
  };

  const switchAccount = (key: string, newRole: string) => {
    const acc = TEST_ACCOUNTS.find((a) => a.key === key);
    if (acc) {
      setAccount(acc.address);
      setActiveAccountKey(acc.key);
      setRole(newRole);
      setIsMetaMaskConnected(false);
      setAuthSession({
        isAuthenticated: true,
        provider: "wallet",
        userName: acc.name,
        email: `${acc.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@trustchain.io`,
      });
    }
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        role,
        isMetaMaskConnected,
        activeAccountKey,
        txStatus,
        authSession,
        themeMode,
        connectMetaMask,
        switchAccount,
        setTxStatus,
        resetTxStatus,
        loginWithGoogle,
        loginWithApple,
        loginWithMicrosoft,
        loginWithEmail,
        logout,
        toggleThemeMode,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
