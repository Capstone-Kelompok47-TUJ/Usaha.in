"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { Hint } from "@/components/ui/Hint";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { formatRp } from "@/lib/finance";
import { redirect } from "next/navigation";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Clock, ShieldAlert, Zap, MessageSquare, Copy, ArrowRight,
  Activity, BarChart3, AlertOctagon, RefreshCw, Check, Sparkles,
  ChevronRight, XCircle, Filter, Info, ChevronDown
} from "lucide-react";
import Link from "next/link";

type AnalitikTab = "pvm" | "health" | "anomali" | "repeat_order" | "tindakan";

export default function AnalitikPage() {
  const user = useCurrentUser();
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const expenses = useStore((s) => s.expenses);
  const expenseCategories = useStore((s) => s.expenseCategories);
  const budgets = useStore((s) => s.budgets);
  const customers = useStore((s) => s.customers);

  const [activeTab, setActiveTab] = useState<AnalitikTab>("pvm");
  const [pvmPeriod, setPvmPeriod] = useState<"weekly" | "monthly">("weekly");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [dismissedActions, setDismissedActions] = useState<Record<string, boolean>>({});

  // Owner guard
  if (user && !user.isOwner) {
    redirect("/tidak-ada-akses");
  }

  // ==========================================
  // I1: PVM (Price-Volume-Mix) Decomposition
  // ==========================================
  const pvmData = useMemo(() => {
    const now = new Date();
    const days = pvmPeriod === "weekly" ? 7 : 30;

    const curStart = new Date(now);
    curStart.setDate(now.getDate() - days);

    const prevStart = new Date(now);
    prevStart.setDate(now.getDate() - days * 2);

    const curOrders = orders.filter((o) => {
      if (o.voided) return false;
      const d = new Date(o.date);
      return d >= curStart && d <= now && o.paymentStatus === "lunas";
    });

    const prevOrders = orders.filter((o) => {
      if (o.voided) return false;
      const d = new Date(o.date);
      return d >= prevStart && d < curStart && o.paymentStatus === "lunas";
    });

    type ProdStat = {
      name: string;
      sku: string;
      q0: number;
      q1: number;
      rev0: number;
      rev1: number;
      cogs0: number;
      cogs1: number;
    };

    const prodStats: Record<string, ProdStat> = {};

    products.forEach((p) => {
      prodStats[p.id] = {
        name: p.name,
        sku: p.sku,
        q0: 0,
        q1: 0,
        rev0: 0,
        rev1: 0,
        cogs0: 0,
        cogs1: 0,
      };
    });

    prevOrders.forEach((o) => {
      o.items.forEach((it) => {
        const prod = products.find((p) => p.id === it.productId);
        const name = prod ? prod.name : `Produk #${it.productId.slice(0, 5)}`;
        const sku = prod ? prod.sku : "-";
        if (!prodStats[it.productId]) {
          prodStats[it.productId] = {
            name,
            sku,
            q0: 0,
            q1: 0,
            rev0: 0,
            rev1: 0,
            cogs0: 0,
            cogs1: 0,
          };
        }
        const unitCost = it.cogsUnit ?? prod?.avgCost ?? prod?.buyPrice ?? 0;
        prodStats[it.productId].q0 += it.qty;
        prodStats[it.productId].rev0 += it.unitPrice * it.qty;
        prodStats[it.productId].cogs0 += unitCost * it.qty;
      });
    });

    curOrders.forEach((o) => {
      o.items.forEach((it) => {
        const prod = products.find((p) => p.id === it.productId);
        const name = prod ? prod.name : `Produk #${it.productId.slice(0, 5)}`;
        const sku = prod ? prod.sku : "-";
        if (!prodStats[it.productId]) {
          prodStats[it.productId] = {
            name,
            sku,
            q0: 0,
            q1: 0,
            rev0: 0,
            rev1: 0,
            cogs0: 0,
            cogs1: 0,
          };
        }
        const unitCost = it.cogsUnit ?? prod?.avgCost ?? prod?.buyPrice ?? 0;
        prodStats[it.productId].q1 += it.qty;
        prodStats[it.productId].rev1 += it.unitPrice * it.qty;
        prodStats[it.productId].cogs1 += unitCost * it.qty;
      });
    });

    let Q0 = 0;
    let Q1 = 0;
    let totalRev0 = 0;
    let totalRev1 = 0;
    let totalCogs0 = 0;
    let totalCogs1 = 0;

    Object.values(prodStats).forEach((p) => {
      Q0 += p.q0;
      Q1 += p.q1;
      totalRev0 += p.rev0;
      totalRev1 += p.rev1;
      totalCogs0 += p.cogs0;
      totalCogs1 += p.cogs1;
    });

    const curExpenses = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d >= curStart && d <= now && e.paid;
      })
      .reduce((s, e) => s + e.amount, 0);

    const prevExpenses = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d >= prevStart && d < curStart && e.paid;
      })
      .reduce((s, e) => s + e.amount, 0);

    let priceEffect = 0;
    let cogsEffect = 0;
    let mixSum = 0;
    let volMarginSum = 0;

    const rows = Object.entries(prodStats).map(([id, p]) => {
      const p0 = p.q0 > 0 ? p.rev0 / p.q0 : 0;
      const p1 = p.q1 > 0 ? p.rev1 / p.q1 : p0;
      const c0 = p.q0 > 0 ? p.cogs0 / p.q0 : 0;
      const c1 = p.q1 > 0 ? p.cogs1 / p.q1 : c0;

      const m0 = p0 - c0;
      const s0 = Q0 > 0 ? p.q0 / Q0 : 0;
      const s1 = Q1 > 0 ? p.q1 / Q1 : 0;

      const itemPriceEffect = p.q1 * (p1 - p0);
      const itemCogsEffect = -1 * p.q1 * (c1 - c0);
      const itemMixContrib = (s1 - s0) * m0;
      const itemVolMargin = s0 * m0;

      priceEffect += itemPriceEffect;
      cogsEffect += itemCogsEffect;
      mixSum += itemMixContrib;
      volMarginSum += itemVolMargin;

      return {
        id,
        name: p.name,
        sku: p.sku,
        q0: p.q0,
        q1: p.q1,
        p0,
        p1,
        c0,
        c1,
        itemPriceEffect,
        itemCogsEffect,
      };
    });

    const volumeEffect = (Q1 - Q0) * volMarginSum;
    const mixEffect = Q1 * mixSum;
    const expenseEffect = -(curExpenses - prevExpenses);

    const profit0 = totalRev0 - totalCogs0 - prevExpenses;
    const profit1 = totalRev1 - totalCogs1 - curExpenses;
    const totalProfitChange = profit1 - profit0;

    const effects = [
      { name: "Efek Volume (Jumlah Unit)", value: volumeEffect, desc: "Dampak perubahan total kuantitas unit produk yang terjual" },
      { name: "Efek Harga Jual Rata-rata", value: priceEffect, desc: "Dampak fluktuasi harga jual per unit produk" },
      { name: "Efek Bauran Produk (Mix)", value: mixEffect, desc: "Dampak pergeseran proporsi penjualan produk ber-margin tebal vs tipis" },
      { name: "Efek Harga Pokok (HPP)", value: cogsEffect, desc: "Dampak perubahan biaya beli/modal per unit produk dari supplier" },
      { name: "Efek Beban Operasional", value: expenseEffect, desc: "Dampak efisiensi atau kenaikan beban pengeluaran operasional" },
    ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

    return {
      periodLabel: pvmPeriod === "weekly" ? "7 Hari Terakhir vs 7 Hari Sebelumnya" : "30 Hari Terakhir vs 30 Hari Sebelumnya",
      profit0,
      profit1,
      totalProfitChange,
      effects,
      rows: rows.filter((r) => r.q0 > 0 || r.q1 > 0),
    };
  }, [orders, products, expenses, pvmPeriod]);

  // ==========================================
  // I2: Health Score Breakdown
  // ==========================================
  const healthData = useMemo(() => {
    const now = new Date();
    const d30 = new Date(now);
    d30.setDate(now.getDate() - 30);

    const orders30 = orders.filter((o) => !o.voided && new Date(o.date) >= d30 && o.paymentStatus === "lunas");
    const rev30 = orders30.reduce((s, o) => s + o.subtotal, 0);
    const cogs30 = orders30.reduce((s, o) => {
      return (
        s +
        o.items.reduce((sum, it) => {
          const prod = products.find((p) => p.id === it.productId);
          const cost = it.cogsUnit ?? prod?.avgCost ?? prod?.buyPrice ?? 0;
          return sum + cost * it.qty;
        }, 0)
      );
    }, 0);

    const exp30 = expenses.filter((e) => new Date(e.date) >= d30 && e.paid).reduce((s, e) => s + e.amount, 0);
    const net30 = rev30 - cogs30 - exp30;

    // 1. Margin Bersih (30%)
    const netMarginRatio = rev30 > 0 ? net30 / rev30 : 0;
    const marginScore = Math.min(Math.max(netMarginRatio / 0.20, 0), 1) * 100;

    // 2. Perputaran Stok DIO (20%)
    const totalInventoryValue = products.reduce((s, p) => s + (p.stock * (p.avgCost ?? p.buyPrice ?? 0)), 0);
    const dailyHpp = cogs30 > 0 ? cogs30 / 30 : 1;
    const dioDays = dailyHpp > 0 ? totalInventoryValue / dailyHpp : 0;
    let dioScore = 100;
    if (dioDays > 120) dioScore = 0;
    else if (dioDays > 30) dioScore = Math.max(0, 100 - ((dioDays - 30) / 90) * 100);

    // 3. Umur Piutang (20%)
    const overdueReceivables = orders
      .filter((o) => !o.voided && (o.paymentStatus === "belum" || o.paymentStatus === "sebagian"))
      .reduce((s, o) => {
        const paid = o.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
        return s + (o.subtotal - paid);
      }, 0);
    const overdueRatio = rev30 > 0 ? overdueReceivables / rev30 : 0;
    const receivableScore = Math.min(Math.max(1 - (overdueRatio / 0.20), 0), 1) * 100;

    // 4. Kas Runway (30%)
    const totalRevenueAll = orders
      .filter((o) => !o.voided && o.paymentStatus === "lunas")
      .reduce((s, o) => s + o.subtotal, 0);
    const totalExpensesAll = expenses.filter((e) => e.paid).reduce((s, e) => s + e.amount, 0);
    const estimatedCash = Math.max(0, 15_000_000 + (totalRevenueAll - totalExpensesAll));
    const dailyBurn = exp30 > 0 ? exp30 / 30 : 50_000;
    const runwayDays = estimatedCash / dailyBurn;
    const runwayScore = Math.min(Math.max(runwayDays / 60, 0), 1) * 100;

    const totalScore = Math.round(
      marginScore * 0.30 +
      dioScore * 0.20 +
      receivableScore * 0.20 +
      runwayScore * 0.30
    );

    let statusLabel = "Sehat";
    let statusBadge = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
    if (totalScore < 60) {
      statusLabel = "Perlu Perhatian";
      statusBadge = "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-300 dark:border-red-800";
    } else if (totalScore < 80) {
      statusLabel = "Cukup / Waspada";
      statusBadge = "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    }

    const components = [
      {
        name: "Margin Bersih",
        weight: "30%",
        score: Math.round(marginScore),
        actual: `${(netMarginRatio * 100).toFixed(1)}%`,
        benchmark: "Target: ≥ 20.0%",
        status: marginScore >= 80 ? "Baik" : marginScore >= 50 ? "Sedang" : "Kritis",
        advice: marginScore < 80 ? "Evaluasi harga jual produk tidak sensitif harga atau tekan biaya beli dari supplier." : "Profitabilitas margin bersih sangat baik.",
      },
      {
        name: "Perputaran Persediaan (DIO)",
        weight: "20%",
        score: Math.round(dioScore),
        actual: `${Math.round(dioDays)} hari`,
        benchmark: "Target: ≤ 30 hari",
        status: dioScore >= 80 ? "Baik" : dioScore >= 50 ? "Sedang" : "Kritis",
        advice: dioDays > 45 ? "Adakan bundling diskon untuk item lambat bergerak agar dana modal tidak tertahan di gudang." : "Kecepatan perputaran stok optimal.",
      },
      {
        name: "Kelancaran Piutang",
        weight: "20%",
        score: Math.round(receivableScore),
        actual: formatRp(overdueReceivables),
        benchmark: "Target: < 5% omzet",
        status: receivableScore >= 80 ? "Baik" : receivableScore >= 50 ? "Sedang" : "Kritis",
        advice: overdueReceivables > 0 ? "Kirimkan penagihan teratur via WhatsApp dan tetapkan DP sebelum pesanan diproses." : "Piutang terkendali sangat baik.",
      },
      {
        name: "Ketahanan Kas (Runway)",
        weight: "30%",
        score: Math.round(runwayScore),
        actual: `${Math.round(runwayDays)} hari (${formatRp(estimatedCash)})`,
        benchmark: "Target: ≥ 60 hari",
        status: runwayScore >= 80 ? "Baik" : runwayScore >= 50 ? "Sedang" : "Kritis",
        advice: runwayDays < 60 ? "Tahan penarikan dana pribadi (prive) dan simpan cadangan dana darurat minimal 30 hari." : "Cadangan kas sangat solid.",
      },
    ];

    return { totalScore, statusLabel, statusBadge, components, estimatedCash, net30, rev30 };
  }, [orders, products, expenses]);

  // ==========================================
  // I3: Anomaly Detection
  // ==========================================
  const anomalies = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      description: string;
      severity: "high" | "medium" | "low";
      category: string;
      actionUrl: string;
      actionLabel: string;
    }> = [];

    // 1. Negative margin products
    products.forEach((p) => {
      const margin = p.sellPrice - (p.avgCost ?? p.buyPrice ?? 0);
      if (margin <= 0) {
        list.push({
          id: `margin-${p.id}`,
          title: `Margin Negatif: ${p.name}`,
          description: `Harga jual (${formatRp(p.sellPrice)}) lebih rendah atau sama dengan HPP modal (${formatRp(p.avgCost ?? p.buyPrice ?? 0)}). Usaha rugi di setiap penjualan.`,
          severity: "high",
          category: "Harga & HPP",
          actionUrl: "/produk",
          actionLabel: "Perbaiki Harga",
        });
      }
    });

    // 2. Budget exceeded expenses
    const now = new Date();
    const d30 = new Date(now);
    d30.setDate(now.getDate() - 30);
    const curExp = expenses.filter((e) => new Date(e.date) >= d30 && e.paid);

    expenseCategories.forEach((cat) => {
      const limit = budgets[cat.id] ?? 0;
      if (limit > 0) {
        const spent = curExp.filter((e) => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0);
        if (spent > limit) {
          list.push({
            id: `budget-${cat.id}`,
            title: `Anggaran Terlampaui: ${cat.name}`,
            description: `Realisasi biaya ${formatRp(spent)} melebihi batas anggaran bulanan (${formatRp(limit)}) sebesar +${Math.round(((spent - limit) / limit) * 100)}%.`,
            severity: "high",
            category: "Pengeluaran",
            actionUrl: "/pengeluaran",
            actionLabel: "Audit Pengeluaran",
          });
        }
      }
    });

    // 3. Deadstock check
    products.forEach((p) => {
      if (p.stock > 40) {
        const sold30 = orders
          .filter((o) => !o.voided && new Date(o.date) >= d30)
          .reduce((sum, o) => sum + o.items.filter((i) => i.productId === p.id).reduce((s, it) => s + it.qty, 0), 0);
        if (sold30 === 0) {
          list.push({
            id: `deadstock-${p.id}`,
            title: `Potensi Stok Mati: ${p.name}`,
            description: `Ada ${p.stock} unit senilai ${formatRp(p.stock * (p.avgCost ?? p.buyPrice ?? 0))} tanpa penjualan dalam 30 hari terakhir.`,
            severity: "medium",
            category: "Persediaan",
            actionUrl: "/stok",
            actionLabel: "Buat Promo Bundling",
          });
        }
      }
    });

    // 4. Overdue receivables
    const overdueOrders = orders.filter((o) => {
      if (o.voided || o.paymentStatus === "lunas") return false;
      const orderDate = new Date(o.date);
      const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 14;
    });

    if (overdueOrders.length > 0) {
      const totalOverdue = overdueOrders.reduce((s, o) => {
        const paid = o.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
        return s + (o.subtotal - paid);
      }, 0);
      list.push({
        id: "receivables-overdue",
        title: `${overdueOrders.length} Tagihan Piutang Menunggak`,
        description: `Total ${formatRp(totalOverdue)} piutang belum dibayar melebihi batas tempo 14 hari. Berpotensi mengganggu likuiditas kas operasional.`,
        severity: "high",
        category: "Piutang",
        actionUrl: "/pembayaran",
        actionLabel: "Kirim Tagihan",
      });
    }

    return list;
  }, [products, expenses, expenseCategories, budgets, orders]);

  // ==========================================
  // I4: Repeat Order Delay
  // ==========================================
  const repeatOrderAlerts = useMemo(() => {
    const now = new Date();
    const result: Array<{
      customerId: string;
      customerName: string;
      phone: string;
      orderCount: number;
      avgIntervalDays: number;
      daysSinceLastOrder: number;
      delayDays: number;
      totalSpend: number;
      messageTemplate: string;
    }> = [];

    customers.forEach((cust) => {
      const custOrders = orders
        .filter((o) => !o.voided && o.customerId === cust.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (custOrders.length >= 2) {
        let totalInterval = 0;
        for (let i = 1; i < custOrders.length; i++) {
          const diff = Math.floor(
            (new Date(custOrders[i].date).getTime() - new Date(custOrders[i - 1].date).getTime()) / (1000 * 60 * 60 * 24)
          );
          totalInterval += diff;
        }
        const avgInterval = Math.round(totalInterval / (custOrders.length - 1));

        const lastOrderDate = new Date(custOrders[custOrders.length - 1].date);
        const daysSinceLast = Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceLast > avgInterval * 1.25 && avgInterval > 0) {
          const delay = Math.max(0, daysSinceLast - avgInterval);
          const totalSpend = custOrders.reduce((s, o) => s + o.subtotal, 0);
          const msg = `Halo Kak ${cust.name}! 😊 Kami dari Usaha.in mau menyapa nih. Kebetulan minggu ini kami ada produk segar dan penawaran khusus untuk pelanggan setia seperti Kakak. Mau kami bantu siapkan pesanan seperti biasanya?`;

          result.push({
            customerId: cust.id,
            customerName: cust.name,
            phone: cust.phone || "08123456789",
            orderCount: custOrders.length,
            avgIntervalDays: avgInterval,
            daysSinceLastOrder: daysSinceLast,
            delayDays: delay,
            totalSpend,
            messageTemplate: msg,
          });
        }
      }
    });

    return result.sort((a, b) => b.delayDays - a.delayDays);
  }, [customers, orders]);

  // ==========================================
  // I5: Weekly Prioritized Action List
  // ==========================================
  const weeklyActions = useMemo(() => {
    const actions: Array<{
      id: string;
      priority: number;
      tag: string;
      title: string;
      description: string;
      impact: string;
      link: string;
    }> = [];

    // 1. Tagih piutang >30 hari
    const overdue30 = orders.filter((o) => {
      if (o.voided || o.paymentStatus === "lunas") return false;
      const diff = Math.floor((Date.now() - new Date(o.date).getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 30;
    });
    if (overdue30.length > 0) {
      const sum = overdue30.reduce((s, o) => {
        const paid = o.payments?.reduce((sumP, p) => sumP + p.amount, 0) ?? 0;
        return s + (o.subtotal - paid);
      }, 0);
      actions.push({
        id: "act-receivable-30",
        priority: 1,
        tag: "PIUTANG & KAS",
        title: `Tagih ${overdue30.length} Tagihan Piutang Menunggak >30 Hari`,
        description: `Ada piutang sebesar ${formatRp(sum)} yang melewati jatuh tempo 1 bulan. Hubungi pelanggan terkait untuk konfirmasi pembayaran.`,
        impact: `Potensi kas masuk: +${formatRp(sum)}`,
        link: "/pembayaran",
      });
    }

    // 2. Restock produk kritis
    const criticalStock = products.filter((p) => p.stock <= p.minStock);
    if (criticalStock.length > 0) {
      actions.push({
        id: "act-stock-critical",
        priority: 2,
        tag: "STOK KRITIS",
        title: `Restock ${criticalStock.length} SKU yang Mendekati Batas Minimum`,
        description: `Stok produk ${criticalStock.slice(0, 2).map((p) => p.name).join(", ")} berada di bawah batas aman. Lakukan pemesanan ke supplier.`,
        impact: "Mencegah lost sales dan menjaga kepuasan pelanggan.",
        link: "/stok",
      });
    }

    // 3. Evaluasi kategori biaya merah
    const overBudgetCats = expenseCategories.filter((cat) => {
      const limit = budgets[cat.id] ?? 0;
      if (limit <= 0) return false;
      const now = new Date();
      const d30 = new Date(now);
      d30.setDate(now.getDate() - 30);
      const spent = expenses
        .filter((e) => e.categoryId === cat.id && new Date(e.date) >= d30 && e.paid)
        .reduce((s, e) => s + e.amount, 0);
      return spent > limit;
    });
    if (overBudgetCats.length > 0) {
      actions.push({
        id: "act-expense-red",
        priority: 3,
        tag: "EFISIENSI BIAYA",
        title: `Audit ${overBudgetCats.length} Kategori Biaya yang Melebihi Anggaran`,
        description: `Kategori: ${overBudgetCats.map((c) => c.name).join(", ")} melampaui batas bulanan. Lakukan audit nota dan penyesuaian belanja.`,
        impact: "Mengamankan laba bersih akhir bulan dari kebocoran biaya.",
        link: "/pengeluaran",
      });
    }

    // 4. Follow-up pelanggan repeat order
    if (repeatOrderAlerts.length > 0) {
      actions.push({
        id: "act-repeat-order",
        priority: 4,
        tag: "RETENSI PELANGGAN",
        title: `Hubungi ${Math.min(5, repeatOrderAlerts.length)} Pelanggan yang Terlambat Order`,
        description: `Pelanggan setia belum melakukan pemesanan ulang sesuai siklus belanjanya. Sapa via WhatsApp untuk menawarkan stok terbaru.`,
        impact: "Meningkatkan omzet repeat order dengan biaya akuisisi Rp0.",
        link: "/pelanggan",
      });
    }

    // 5. Cadangan Kas Runway
    if (healthData.totalScore < 75) {
      actions.push({
        id: "act-cash-buffer",
        priority: 5,
        tag: "PROTEKSI KAS",
        title: "Tahan Penarikan Prive & Perkuat Cadangan Kas",
        description: "Skor kesehatan mengindikasikan perlunya kehati-hatian likuiditas. Prioritaskan kas untuk kebutuhan operasional pokok.",
        impact: "Memperkuat ketahanan usaha menghadapi fluktuasi pasar.",
        link: "/keuangan",
      });
    }

    return actions;
  }, [orders, products, expenseCategories, budgets, expenses, repeatOrderAlerts, healthData]);

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <DashboardLayout
      title="Saran dan Analisis"
      subtitle="Diagnosis penyebab perubahan laba, audit skor kesehatan, deteksi anomali operasional, dan rekomendasi aksi"
    >
      <div className="space-y-6 max-w-7xl pb-16">
        {/* Page Intro with Help Tips */}
        <PageIntro
          title="Saran & Analisis Usaha"
          description="Wawasan mendalam khusus Pemilik Usaha: Cari tahu kenapa laba usahamu berubah, pantau 4 indikator kesehatan toko, serta ambil tindakan perbaikan mingguan."
          badge="Khusus Pemilik"
          helpTips={[
            {
              title: "Kenapa Laba Berubah? (Analisis PVM)",
              description: "Mengurai secara presisi apakah kenaikan/penurunan laba tokomu disebabkan oleh naik-turunnya harga jual, modal pokok barang, atau banyaknya jumlah transaksi.",
            },
            {
              title: "Skor Kesehatan Usaha",
              description: "Menghitung nilai kesehatan tokomu (0-100) dari 4 faktor kunci: Margin Bersih, Perputaran Stok, Umur Piutang, dan Ketahanan Kas.",
            },
            {
              title: "Deteksi Anomali",
              description: "Peringatan otomatis saat ada lonjakan biaya tidak wajar, harga beli barang naik drastis dari supplier, atau pesanan anjlok.",
            },
            {
              title: "Peluang Belanja Ulang (Repeat Order)",
              description: "Daftar pelanggan setia yang sudah melewati siklus belanja biasanya lengkap dengan draf pesan sapaan WA siap kirim.",
            },
          ]}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("pvm")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "pvm"
                ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs"
                : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
            Kenapa Laba Berubah? (PVM)
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "health"
                ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs"
                : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            Skor Kesehatan Usaha
          </button>
          <button
            onClick={() => setActiveTab("anomali")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "anomali"
                ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
                : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />
            Deteksi Anomali
            {anomalies.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                {anomalies.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("repeat_order")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "repeat_order"
                ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
                : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
            Repeat Order Terlambat
            {repeatOrderAlerts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                {repeatOrderAlerts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("tindakan")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "tindakan"
                ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
                : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-500" />
            Tindakan Mingguan
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {weeklyActions.filter((a) => !completedActions[a.id] && !dismissedActions[a.id]).length}
            </span>
          </button>
        </div>

        {/* TAB 1: PVM DIAGNOSIS */}
        {activeTab === "pvm" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Dekomposisi Laba PVM (Price - Volume - Mix)
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mt-1">
                  Perubahan Laba Bersih:{" "}
                  <span className={pvmData.totalProfitChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                    {pvmData.totalProfitChange >= 0 ? "+" : ""}{formatRp(pvmData.totalProfitChange)}
                  </span>
                </h3>
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">
                  {pvmData.periodLabel} • Laba Periode Lalu: {formatRp(pvmData.profit0)} → Kini: {formatRp(pvmData.profit1)}
                </p>
              </div>

              {/* Period toggle */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] self-start md:self-auto">
                <button
                  onClick={() => setPvmPeriod("weekly")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    pvmPeriod === "weekly"
                      ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
                      : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  Minggu Ini vs Lalu
                </button>
                <button
                  onClick={() => setPvmPeriod("monthly")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    pvmPeriod === "monthly"
                      ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
                      : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  Bulan Ini vs Lalu
                </button>
              </div>
            </div>

            {/* Effects Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pvmData.effects.map((eff, idx) => {
                const isPositive = eff.value >= 0;
                const totalAbs = pvmData.effects.reduce((s, e) => s + Math.abs(e.value), 0);
                const pct = totalAbs > 0 ? Math.round((Math.abs(eff.value) / totalAbs) * 100) : 0;

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[hsl(var(--muted-fg))]">{eff.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPositive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                          }`}
                        >
                          {pct}% Bobot
                        </span>
                      </div>
                      <div
                        className={`text-xl font-bold mt-2 ${
                          isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}{formatRp(eff.value)}
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-fg))] mt-1 leading-relaxed">{eff.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between text-[11px]">
                      <span className="text-[hsl(var(--muted-fg))]">Kontribusi</span>
                      <span
                        className={`font-semibold ${
                          isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {isPositive ? "Meningkatkan Laba" : "Menurunkan Laba"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SKU Level Breakdown Table */}
            <div className="rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">Rincian Efek per Produk (SKU)</h4>
                  <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                    Dampak perubahan harga jual dan fluktuasi biaya modal (HPP) per barang
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] uppercase font-semibold border-b border-[hsl(var(--border))]">
                    <tr>
                      <th className="px-4 py-3">Nama Produk</th>
                      <th className="px-4 py-3 text-right">Qty Terjual</th>
                      <th className="px-4 py-3 text-right">Harga Jual Rata-rata</th>
                      <th className="px-4 py-3 text-right">Efek Harga</th>
                      <th className="px-4 py-3 text-right">Efek HPP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {pvmData.rows.map((r) => (
                      <tr key={r.id} className="hover:bg-[hsl(var(--muted))]/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-[hsl(var(--foreground))]">
                          {r.name}
                          <span className="text-[10px] text-[hsl(var(--muted-fg))] ml-1.5 font-normal">({r.sku})</span>
                        </td>
                        <td className="px-4 py-3 text-right text-[hsl(var(--muted-fg))]">
                          {r.q0} → <span className="font-semibold text-[hsl(var(--foreground))]">{r.q1} unit</span>
                        </td>
                        <td className="px-4 py-3 text-right text-[hsl(var(--muted-fg))]">
                          {formatRp(r.p0)} → <span className="font-semibold text-[hsl(var(--foreground))]">{formatRp(r.p1)}</span>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            r.itemPriceEffect >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {r.itemPriceEffect >= 0 ? "+" : ""}{formatRp(r.itemPriceEffect)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            r.itemCogsEffect >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {r.itemCogsEffect >= 0 ? "+" : ""}{formatRp(r.itemCogsEffect)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HEALTH SCORE */}
        {activeTab === "health" && (
          <div className="space-y-6 animate-fade-in">
            {/* Overall Score Banner */}
            <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="text-[hsl(var(--muted))] stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className={`${
                      healthData.totalScore >= 80
                        ? "text-emerald-500"
                        : healthData.totalScore >= 60
                        ? "text-amber-500"
                        : "text-red-500"
                    } stroke-current`}
                    strokeWidth="8"
                    strokeDasharray={238.76}
                    strokeDashoffset={238.76 - (238.76 * healthData.totalScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-[hsl(var(--foreground))]">{healthData.totalScore}</span>
                  <span className="text-[10px] font-bold uppercase text-[hsl(var(--muted-fg))]">dari 100</span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-2 uppercase tracking-wide">
                  <span className={healthData.statusBadge}>{healthData.statusLabel}</span>
                </div>
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">Audit Kesehatan Finansial & Operasional</h3>
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-1 leading-relaxed">
                  Skor dihitung secara otomatis dari 4 pilar bisnis: Margin Bersih (30%), Perputaran Stok DIO (20%), Kelancaran Piutang (20%), dan Ketahanan Kas Runway (30%).
                </p>
              </div>
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthData.components.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-[hsl(var(--foreground))]">{comp.name}</span>
                      <span className="text-[11px] text-[hsl(var(--muted-fg))] ml-2">Bobot {comp.weight}</span>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        comp.score >= 80
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : comp.score >= 50
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                      }`}
                    >
                      Skor {comp.score}/100
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-[hsl(var(--muted-fg))]">
                      Aktual: <strong className="text-[hsl(var(--foreground))] font-semibold">{comp.actual}</strong>
                    </span>
                    <span className="text-[hsl(var(--muted-fg))]">{comp.benchmark}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        comp.score >= 80 ? "bg-emerald-500" : comp.score >= 50 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${comp.score}%` }}
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[hsl(var(--muted))] text-xs text-[hsl(var(--foreground))] flex items-start gap-2 border border-[hsl(var(--border))]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{comp.advice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ANOMALY DETECTION */}
        {activeTab === "anomali" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">Deteksi Anomali & Risiko Aktif</h4>
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                  Sistem memantau secara berkala ketidakwajaran harga/margin, lonjakan biaya di atas batas anggaran, dan piutang macet.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] border border-[hsl(var(--border))]">
                {anomalies.length} Anomali Terdeteksi
              </span>
            </div>

            {anomalies.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-base font-bold text-[hsl(var(--foreground))]">Tidak Ada Anomali</h4>
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">
                  Semua indikator operasional, persediaan, dan keuangan berada dalam batas wajar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {anomalies.map((ano) => (
                  <div
                    key={ano.id}
                    className={`p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                      ano.severity === "high"
                        ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40"
                        : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          ano.severity === "high"
                            ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                            : "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
                            {ano.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              ano.severity === "high"
                                ? "bg-red-600 text-white"
                                : "bg-amber-500 text-black"
                            }`}
                          >
                            {ano.severity === "high" ? "Prioritas Tinggi" : "Perhatian"}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[hsl(var(--foreground))] mt-1.5">{ano.title}</h4>
                        <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5 leading-relaxed">{ano.description}</p>
                      </div>
                    </div>

                    <Link
                      href={ano.actionUrl}
                      className="px-3.5 py-2 rounded-lg bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] text-xs font-semibold flex items-center gap-1.5 shrink-0 self-end sm:self-auto transition-colors border border-[hsl(var(--border))] shadow-sm"
                    >
                      {ano.actionLabel}
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REPEAT ORDER ALERTS */}
        {activeTab === "repeat_order" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm">
              <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">Pelanggan Terlambat Repeat Order</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                Daftar pelanggan setia yang telah melewati interval belanja rutinnya. Hubungi via WhatsApp untuk re-engagement.
              </p>
            </div>

            {repeatOrderAlerts.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-base font-bold text-[hsl(var(--foreground))]">Semua Pelanggan Aktif Sesuai Jadwal</h4>
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">
                  Tidak ada pelanggan berulang yang mengalami keterlambatan siklus pesanan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repeatOrderAlerts.map((cust) => (
                  <div
                    key={cust.customerId}
                    className="p-5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">{cust.customerName}</h4>
                          <span className="text-xs text-[hsl(var(--muted-fg))]">{cust.phone}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
                          Terlambat {cust.delayDays} hari
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[hsl(var(--muted))] mt-3 text-center text-xs">
                        <div>
                          <div className="text-[hsl(var(--muted-fg))] text-[10px]">Siklus Belanja</div>
                          <div className="font-semibold text-[hsl(var(--foreground))] mt-0.5">Tiap {cust.avgIntervalDays} hr</div>
                        </div>
                        <div>
                          <div className="text-[hsl(var(--muted-fg))] text-[10px]">Hari Terakhir</div>
                          <div className="font-semibold text-[hsl(var(--foreground))] mt-0.5">{cust.daysSinceLastOrder} hr lalu</div>
                        </div>
                        <div>
                          <div className="text-[hsl(var(--muted-fg))] text-[10px]">Total Belanja</div>
                          <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {formatRp(cust.totalSpend)}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] mt-3 text-xs text-[hsl(var(--muted-fg))] italic leading-relaxed">
                        &quot;{cust.messageTemplate}&quot;
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[hsl(var(--border))]">
                      <button
                        onClick={() => handleCopy(cust.customerId, cust.messageTemplate)}
                        className="flex-1 px-3 py-2 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedId === cust.customerId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[hsl(var(--muted-fg))]" />
                            Salin Pesan WA
                          </>
                        )}
                      </button>
                      <a
                        href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          cust.messageTemplate
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Buka WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WEEKLY ACTIONS */}
        {activeTab === "tindakan" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">Daftar Tindakan Mingguan Prioritas</h4>
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                  Langkah taktis yang direkomendasikan untuk mengamankan kas, menggenjot omzet, dan mencegah pemborosan biaya.
                </p>
              </div>
              <div className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 self-start sm:self-auto">
                {Object.values(completedActions).filter(Boolean).length} dari {weeklyActions.length} Selesai
              </div>
            </div>

            <div className="space-y-3">
              {weeklyActions.map((act) => {
                const isCompleted = !!completedActions[act.id];
                const isDismissed = !!dismissedActions[act.id];

                if (isDismissed) return null;

                return (
                  <div
                    key={act.id}
                    className={`p-5 rounded-xl border shadow-sm transition-all ${
                      isCompleted
                        ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30 opacity-70"
                        : "bg-[hsl(var(--card))] border-[hsl(var(--card-border))] hover:border-[hsl(var(--border))]"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
                            #{act.priority} {act.tag}
                          </span>
                          {isCompleted && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                            </span>
                          )}
                        </div>
                        <h4
                          className={`text-base font-bold ${
                            isCompleted ? "text-[hsl(var(--muted-fg))] line-through" : "text-[hsl(var(--foreground))]"
                          }`}
                        >
                          {act.title}
                        </h4>
                        <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">{act.description}</p>
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          {act.impact}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                        <Link
                          href={act.link}
                          className="px-3 py-2 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          Buka Menu <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        {!isCompleted ? (
                          <button
                            onClick={() => setCompletedActions((prev) => ({ ...prev, [act.id]: true }))}
                            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Tandai Selesai
                          </button>
                        ) : (
                          <button
                            onClick={() => setCompletedActions((prev) => ({ ...prev, [act.id]: false }))}
                            className="px-3 py-2 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--muted-fg))] text-xs font-semibold transition-colors"
                          >
                            Batalkan
                          </button>
                        )}
                        <button
                          onClick={() => setDismissedActions((prev) => ({ ...prev, [act.id]: true }))}
                          title="Abaikan"
                          className="p-2 rounded-lg text-[hsl(var(--muted-fg))] hover:text-red-500 hover:bg-[hsl(var(--muted))] transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
