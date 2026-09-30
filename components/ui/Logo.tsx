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
 * MAKNA & FILOSOFI LOGO:
 * 1. Monogram "U" yang Kokoh (Fondasi UMKM):
 *    Lengkungan bawah huruf U melambangkan fondasi operasional internal yang solid,
 *    mengayomi tata kelola stok barang, pesanan, dan keuangan secara terpusat.
 * 
 * 2. Panah Pertumbuhan Melambung ke Kanan Atas (Growth Trajectory):
 *    Sayap kanan bertransformasi menjadi panah dinamis 45°, melambangkan akselerasi
 *    penjualan, lompatan omzet, dan kemajuan UMKM menuju skala bisnis yang lebih besar.
 * 
 * 3. Titik Sinkronisasi Pusat (Hub Kendali & AI Copilot):
 *    Titik inti di tengah melambangkan integrasi satu pintu untuk multi-kanal
 *    (Marketplace, Chat, Toko Offline) yang didukung kecerdasan buatan AI Copilot.
 * 
 * 4. Harmoni Warna:
 *    Gradasi Royal Blue (#1D4ED8) -> Indigo (#4F46E5) -> Violet (#7C3AED)
 *    dengan aksen Cyan Electric (#38BDF8) untuk energi modern, profesional, dan elegan.
 */
export function LogoIcon({ className = "w-8 h-8", size }: LogoIconProps) {
  const sizeStyle = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${className}`}
      style={sizeStyle}
    >
      <defs>
        {/* Background Squircle Gradient */}
        <linearGradient id="uBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="50%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>

        {/* Outer Highlight Border */}
        <linearGradient id="uBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#A5B4FC" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
        </linearGradient>

        {/* Foundation "U" Gradient */}
        <linearGradient id="uFoundationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Growth Arrow Gradient */}
        <linearGradient id="uArrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>

        {/* Subtle Drop Shadow for Badge */}
        <filter id="uDropShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* 1. Base Squircle Container */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="12"
        fill="url(#uBadgeGrad)"
        filter="url(#uDropShadow)"
      />

      {/* 2. Sleek Glass Border */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="12"
        stroke="url(#uBorderGrad)"
        strokeWidth="1.2"
      />

      {/* 3. Subtle Ambient Light Reflection */}
      <path
        d="M3 14C3 8.47715 7.47715 4 13 4H35C40.5228 4 45 8.47715 45 14V16C31 16 17 19 3 26V14Z"
        fill="white"
        fillOpacity="0.07"
      />

      {/* 4. The Foundation "U" Curve (Geometric, Clean & Balanced) */}
      <path
        d="M14 14V25C14 30.5228 18.4772 35 24 35C29.5228 35 34 30.5228 34 25V21"
        stroke="url(#uFoundationGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 5. Ascending Growth Dynamic Arrow (45-degree angle pointing top-right) */}
      {/* Arrow Stem */}
      <path
        d="M24 23L34.5 12.5"
        stroke="url(#uArrowGrad)"
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      {/* Arrow Head */}
      <path
        d="M27.5 12.5H34.5V19.5"
        stroke="url(#uArrowGrad)"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 6. Central Synchronization Hub Node (AI Copilot & Multi-channel Core) */}
      <circle cx="24" cy="23" r="2.4" fill="#FFFFFF" />
      <circle cx="24" cy="23" r="3.8" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.8" />
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
      <LogoIcon className={`${conf.icon} group-hover:scale-105 transition-all duration-300 shadow-md shadow-blue-500/20`} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight ${conf.title} bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:opacity-95 transition-opacity`}>
            Usaha<span className="text-blue-500">.in</span>
          </span>
          {badge && (
            <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 leading-none">
              {badge}
            </span>
          )}
        </div>
        {showSubtitle && (
          <span className={`${conf.sub} text-[hsl(var(--muted-fg))] font-medium leading-tight`}>
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
