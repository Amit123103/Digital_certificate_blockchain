"use client";

import React, { useEffect, useState } from "react";

const BACKGROUND_IMAGES = [
  "/backgrounds/bg-1-blockchain-mesh.svg",
  "/backgrounds/bg-2-digital-certificate.svg",
  "/backgrounds/bg-3-supply-chain-globe.svg",
  "/backgrounds/bg-4-nft-tokenization.svg",
  "/backgrounds/bg-5-nft-marketplace.svg",
  "/backgrounds/bg-6-defi-lending.svg",
  "/backgrounds/bg-7-dao-governance.svg",
  "/backgrounds/bg-8-evm-smart-contracts.svg",
  "/backgrounds/bg-9-cyber-security.svg",
  "/backgrounds/bg-10-web3-ecosystem.svg",
];

export function BackgroundSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Rotate background image every 2 seconds (2000ms)
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden select-none">
      {BACKGROUND_IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            i === index ? "opacity-20 dark:opacity-30 scale-105" : "opacity-0 scale-100"
          }`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
    </div>
  );
}
