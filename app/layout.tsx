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
      { url: "/logo-icon.png", type: "image/png" },
    ],
    shortcut: "/logo-icon.png",
    apple: "/logo-icon.png",
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
        <link rel="icon" href="/logo-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo-icon.png" />
      </head>
      <body className={`${inter.variable} min-h-screen`}>{children}</body>
    </html>
  );
}
