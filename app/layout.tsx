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
    "Sistem internal manajemen UMKM yang mengintegrasikan pesanan marketplace, chat, dan offline dalam satu sistem terpadu.",
  keywords: ["UMKM", "manajemen toko", "dashboard bisnis", "stok", "penjualan"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`${inter.variable} min-h-screen`}>{children}</body>
    </html>
  );
}
