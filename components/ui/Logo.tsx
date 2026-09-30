"use client";

import React from "react";
import Link from "next/link";

interface LogoIconProps {
  className?: string;
  size?: number | string;
}

/**
 * Elegant SVG Logo Icon for Usaha.in
 * Represents the letter "U", multi-channel connectivity, and upward growth.
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
        {/* Background Gradient */}
        <linearGradient id="usahaBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="45%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        {/* Glow / Border Gradient */}
        <linearGradient id="usahaBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#C4B5FD" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
        </linearGradient>

        {/* Inner Symbol Stroke Gradient */}
        <linearGradient id="usahaStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>

        {/* Sparkle Accent Gradient */}
        <linearGradient id="usahaSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>

        {/* Subtle Drop Shadow */}
        <filter id="usahaShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1e1b4b" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Main Rounded Squircle Container */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="13"
        fill="url(#usahaBadgeGrad)"
        filter="url(#usahaShadow)"
      />

      {/* Glossy Inner Border */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="12.5"
        stroke="url(#usahaBorderGrad)"
        strokeWidth="1.2"
      />

      {/* Background Micro Light Accent */}
      <path
        d="M6 14C6 8.47715 10.4772 4 16 4H32C37.5228 4 42 8.47715 42 14V17C30 17 14 20 6 27V14Z"
        fill="white"
        fillOpacity="0.08"
      />

      {/* Stylized Modern "U" with Growth Arrow & Connecting Channels */}
      {/* Left Vertical Bar */}
      <path
        d="M14 13.5C14 12.3954 14.8954 11.5 16 11.5C17.1046 11.5 18 12.3954 18 13.5V25.5C18 28.8137 20.6863 31.5 24 31.5C27.3137 31.5 30 28.8137 30 25.5V17.5"
        stroke="url(#usahaStrokeGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Growth Arrow Tip / Accent on Right Wing of 'U' */}
      <path
        d="M26 13.5L34 13.5L34 21.5"
        stroke="#67E8F9"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Dynamic diagonal connection to arrow tip */}
      <path
        d="M30 22L33.2 14.3"
        stroke="#67E8F9"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Glowing Center Sync Pulse Dot */}
      <circle cx="24" cy="22" r="2.2" fill="white" />
      <circle cx="24" cy="22" r="3.6" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
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
      <LogoIcon className={`${conf.icon} group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 shadow-md shadow-blue-500/20`} />
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
