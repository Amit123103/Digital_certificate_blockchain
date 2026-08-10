import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TxModal } from "@/components/TxModal";
import { BackgroundSlider } from "@/components/BackgroundSlider";

export const metadata: Metadata = {
  title: "CertiChain | Blockchain Certificate, Supply Chain, NFT, DeFi & DAO Platform",
  description:
    "Production-style decentralized platform combining digital certificate verification, supply chain tracking, NFT minting & marketplace, NFT-collateralized DeFi lending, and token-weighted DAO governance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-emerald-500 selection:text-white flex flex-col min-h-screen relative">
        <WalletProvider>
          <BackgroundSlider />
          <Navbar />
          <TxModal />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
