"use client";

import React from "react";
import Link from "next/link";

interface LogoIconProps {
  className?: string;
  size?: number | string;
}

/**
 * LogoIcon - Simbol Resmi Usaha.in
 *
 * MAKNA & FILOSOFI:
 * 1. Huruf "U" Solid Putih — Fondasi UMKM
 *    Bentuk U yang tebal, besar, dan solid melambangkan fondasi bisnis
 *    yang kuat: manajemen stok, pesanan, keuangan, dan tim dalam satu ekosistem.
 *
 * 2. Titik Cyan — Satu Pusat Kendali (AI Copilot Hub)
 *    Titik tunggal berwarna cyan di atas chevron melambangkan satu titik
 *    integrasi cerdas yang menyatukan semua kanal penjualan (marketplace,
 *    chat, offline) melalui AI Copilot.
 *
 * 3. Chevron "^" Cyan — Pertumbuhan dari Dalam
 *    Simbol ^ (upward chevron) di dalam rongga U melambangkan pertumbuhan
 *    yang lahir dari dalam fondasi bisnis itu sendiri — bukan dari luar.
 *    Semakin kuat fondasi, semakin tinggi lompatan.
 *
 * 4. Background Indigo Solid — Kepercayaan & Profesionalisme
 *    Warna indigo (#4338CA) yang vivid dan solid tanpa gradien berlebihan
 *    mencerminkan kepercayaan, stabilitas, dan profesionalisme platform SaaS.
 */
export function LogoIcon({ className = "w-8 h-8", size }: LogoIconProps) {
  const sizeStyle = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      style={sizeStyle}
    >
      <defs>
        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1.5"
            stdDeviation="2"
            floodColor="#312E81"
            floodOpacity="0.4"
          />
        </filter>
      </defs>

      {/* Background — vivid indigo, solid */}
      <rect
        x="0.5"
        y="0.5"
        width="47"
        height="47"
        rx="13"
        fill="#4338CA"
        filter="url(#logoShadow)"
      />

      {/* Subtle top-left gloss highlight */}
      <path
        d="M0.5 13.5C0.5 6.32 6.32 0.5 13.5 0.5H34.5C41.68 0.5 47.5 6.32 47.5 13.5V18C35 18 13 22 0.5 30V13.5Z"
        fill="white"
        fillOpacity="0.06"
      />

      {/* U — solid white, filled shape */}
      {/* Drawn as a filled path: two arms + rounded bottom */}
      <path
        d="
          M11 9
          L11 30
          Q11 39 24 39
          Q37 39 37 30
          L37 9
          L30 9
          L30 30
          Q30 33.5 24 33.5
          Q18 33.5 18 30
          L18 9
          Z
        "
        fill="white"
      />

      {/* Cyan dot — floating above the chevron inside the U hollow */}
      <circle cx="24" cy="18.5" r="2.5" fill="#22D3EE" />

      {/* Cyan chevron "^" — upward growth from within */}
      <path
        d="M18.5 28 L24 22 L29.5 28"
        stroke="#22D3EE"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  subtitleText?: string;
  badge?: string;
  href?: string;
  className?: string;
}

export function Logo({
  size = "md",
  showSubtitle = false,
  subtitleText = "Manajemen UMKM Terpadu",
  badge,
  href,
  className = "",
}: LogoProps) {
  const sizeMap = {
    sm: { icon: "w-7 h-7", title: "text-sm", sub: "text-[9px]" },
    md: { icon: "w-8 h-8", title: "text-base", sub: "text-[10px]" },
    lg: { icon: "w-10 h-10", title: "text-lg sm:text-xl", sub: "text-xs" },
    xl: { icon: "w-12 h-12", title: "text-2xl", sub: "text-xs" },
  };

  const conf = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <LogoIcon
        className={`${conf.icon} group-hover:scale-105 transition-all duration-300`}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight ${conf.title} bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent`}
          >
            Usaha<span className="text-indigo-400">.in</span>
          </span>
          {badge && (
            <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 leading-none">
              {badge}
            </span>
          )}
        </div>
        {showSubtitle && (
          <span
            className={`${conf.sub} text-[hsl(var(--muted-fg))] font-medium leading-tight`}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
}
