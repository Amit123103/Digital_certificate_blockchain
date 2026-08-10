import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function CertiChainLogo({ className = "", iconOnly = false, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-7",
    md: "h-10",
    lg: "h-14",
    xl: "h-20",
  };

  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* CertiChain Shield + Interlocking Chain Link SVG */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          {/* Shield Outline */}
          <path
            d="M50 10L18 24V48C18 69.5 31.8 89.2 50 95C68.2 89.2 82 69.5 82 48V24L50 10Z"
            fill="#042f2e"
            stroke="#10b981"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Checkmark inside Shield */}
          <path
            d="M32 50L44 62L68 38"
            stroke="#10b981"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Interlocking Chain Link Overlay */}
          <rect
            x="32"
            y="32"
            width="36"
            height="36"
            rx="12"
            transform="rotate(-45 50 50)"
            stroke="#ffffff"
            strokeWidth="7"
            fill="none"
          />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex items-center tracking-tight font-extrabold font-grotesk text-2xl">
          <span className="text-slate-900 dark:text-white">Certi</span>
          <span className="text-emerald-600 dark:text-emerald-400">Chain</span>
        </div>
      )}
    </div>
  );
}
