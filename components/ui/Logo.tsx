"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoIconProps {
  className?: string;
  size?: number;
}

/**
 * LogoIcon - Simbol Resmi Usaha.in
 * Menggunakan file PNG asli untuk tampilan yang presisi dan konsisten.
 */
export function LogoIcon({ className = "w-9 h-9", size = 36 }: LogoIconProps) {
  return (
    <Image
      src="/logo-icon.png"
      alt="Usaha.in Logo"
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      priority
    />
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
    sm: { icon: "w-8 h-8", px: 32, title: "text-sm", sub: "text-[9px]" },
    md: { icon: "w-9 h-9", px: 36, title: "text-base", sub: "text-[10px]" },
    lg: { icon: "w-10 h-10", px: 40, title: "text-lg sm:text-xl", sub: "text-xs" },
    xl: { icon: "w-12 h-12", px: 48, title: "text-2xl", sub: "text-xs" },
  };

  const conf = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <LogoIcon
        className={`${conf.icon} group-hover:scale-105 transition-all duration-300 shadow-md shadow-indigo-500/20`}
        size={conf.px}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight ${conf.title} bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 bg-clip-text text-transparent`}
          >
            Usaha<span className="text-indigo-500">.in</span>
          </span>
          {badge && (
            <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 leading-none">
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
