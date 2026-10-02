"use client";

import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: number;
}

/**
 * Logo Resmi WhatsApp (Vektor Asli Internet)
 */
export function WhatsAppLogo({ className = "h-9 w-auto", size }: BrandLogoProps) {
  const style = size ? { height: size } : undefined;
  return (
    <img
      src="/whatsapp.svg"
      alt="WhatsApp Logo"
      style={style}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

/**
 * Logo Resmi Shopee (Vektor Asli Internet)
 */
export function ShopeeLogo({ className = "h-9 w-auto", size }: BrandLogoProps) {
  const style = size ? { height: size } : undefined;
  return (
    <img
      src="/shopee.svg"
      alt="Shopee Logo"
      style={style}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

/**
 * Logo Resmi Tokopedia (Vektor Asli Internet)
 */
export function TokopediaLogo({ className = "h-9 w-auto", size }: BrandLogoProps) {
  const style = size ? { height: size } : undefined;
  return (
    <img
      src="/tokopedia.svg"
      alt="Tokopedia Logo"
      style={style}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
