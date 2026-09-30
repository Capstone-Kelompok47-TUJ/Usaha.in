import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Usaha.in — Manajemen UMKM Terpadu",
    template: "%s | Usaha.in",
  },
  description:
    "Platform manajemen UMKM yang mengintegrasikan semua kanal penjualan — Shopee, Tokopedia, WhatsApp, dan Offline — dalam satu dashboard terpadu.",
  keywords: ["UMKM", "manajemen toko", "dashboard bisnis", "stok", "penjualan"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen`}>{children}</body>
    </html>
  );
}
