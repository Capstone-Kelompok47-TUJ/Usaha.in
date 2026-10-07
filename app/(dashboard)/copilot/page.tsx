"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { calcChannelFinance, calcFinanceSummary } from "@/lib/finance";
import { findCopilotResponse, QUICK_QUESTIONS } from "@/lib/copilot-scenarios";
import type { CopilotContext } from "@/lib/copilot-scenarios";
import type { CopilotMessage } from "@/types";
import { redirect } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-[hsl(var(--muted))] w-fit">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: CopilotMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
            : "bg-gradient-to-br from-purple-600 to-blue-600"
        }`}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-none"
            : "bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] rounded-tl-none text-[hsl(var(--foreground))]"
        }`}
      >
        <div className="whitespace-pre-wrap space-y-1.5">
          {msg.content.split("\n").map((line, i) => {
            if (line.startsWith("# ")) {
              return (
                <h3 key={i} className="text-lg font-black text-emerald-600 dark:text-emerald-400 my-2">
                  {line.slice(2)}
                </h3>
              );
            }
            if (line.startsWith("## ")) {
              return (
                <h4 key={i} className="text-sm font-bold text-[hsl(var(--foreground))] my-1.5">
                  {line.slice(3)}
                </h4>
              );
            }
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={i} className="font-bold text-[hsl(var(--foreground))]">
                  {line.slice(2, -2)}
                </p>
              );
            }
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <p key={i} className={line.startsWith("|") ? "font-mono text-xs overflow-x-auto py-0.5" : ""}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="font-bold text-[hsl(var(--foreground))]">
                      {part}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </p>
            );
          })}
        </div>
        <p className={`text-[10px] mt-2 text-right ${isUser ? "text-blue-100" : "text-[hsl(var(--muted-fg))]"}`}>
          {new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

export default function CopilotPage() {
  const user = useCurrentUser();
  const orders = useStore((s) => s.orders);
  const purchases = useStore((s) => s.purchases);
  const products = useStore((s) => s.products);
  const expenses = useStore((s) => s.expenses);
  const expenseCategories = useStore((s) => s.expenseCategories);
  const budgets = useStore((s) => s.budgets);
  const customers = useStore((s) => s.customers);

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Halo! Saya **AI Business Copilot** Usaha.in 👋\n\nSaya menganalisis data real-time penjualan, pengeluaran, stok, piutang, dan kas bisnis Anda untuk memberikan saran finansial strategis.\n\nPilih pertanyaan cepat di bawah atau ketik pertanyaan Anda!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Guard: strictly Owner only
  if (user && !user.isOwner) {
    redirect("/tidak-ada-akses");
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function buildContext(): CopilotContext {
    const monthly = calcChannelFinance(orders, purchases, "monthly");
    const weekly = calcFinanceSummary(orders, purchases, "weekly");
    const monthlySum = calcFinanceSummary(orders, purchases, "monthly");

    const marketplaceA = monthly.find((c) => c.channel === "marketplace_a");
    const marketplaceB = monthly.find((c) => c.channel === "marketplace_b");
    const chat = monthly.find((c) => c.channel === "chat");
    const offline = monthly.find((c) => c.channel === "offline");

    const productSales: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.voided || o.paymentStatus !== "lunas") return;
      o.items.forEach((item) => {
        productSales[item.productId] = (productSales[item.productId] ?? 0) + item.qty;
      });
    });
    const sortedProducts = [...products].sort(
      (a, b) => (productSales[b.id] ?? 0) - (productSales[a.id] ?? 0)
    );

    const totalRevAll = orders
      .filter((o) => !o.voided && o.paymentStatus === "lunas")
      .reduce((s, o) => s + o.subtotal, 0);
    const totalExpAll = expenses.filter((e) => e.paid).reduce((s, e) => s + e.amount, 0);
    const currentCash = Math.max(0, 15_000_000 + (totalRevAll - totalExpAll));

    const now = new Date();
    const d30 = new Date(now);
    d30.setDate(now.getDate() - 30);
    const rev30 = orders
      .filter((o) => !o.voided && new Date(o.date) >= d30 && o.paymentStatus === "lunas")
      .reduce((s, o) => s + o.subtotal, 0);

    const mandatoryExpenses30 = 2_500_000;
    const cashReserve = Math.round(rev30 * 0.1);
    const safeWithdrawAmount = Math.max(0, currentCash - mandatoryExpenses30 - cashReserve);

    const overdueReceivables: Array<{ customerName: string; amount: number; days: number }> = [];
    orders.forEach((o) => {
      if (o.voided || o.paymentStatus === "lunas") return;
      const orderDate = new Date(o.date);
      const days = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 7) {
        const paid = o.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;
        const cust = customers.find((c) => c.id === o.customerId);
        overdueReceivables.push({
          customerName: cust ? cust.name : `Pelanggan #${o.customerId.slice(0, 5)}`,
          amount: o.subtotal - paid,
          days,
        });
      }
    });

    const curMonthExp = expenses.filter((e) => new Date(e.date) >= d30 && e.paid);
    const topExpenseCategories = expenseCategories
      .map((cat) => {
        const sum = curMonthExp.filter((e) => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0);
        const limit = budgets[cat.id];
        const pct = limit && limit > 0 ? Math.round((sum / limit) * 100) : undefined;
        return {
          name: cat.name,
          amount: sum,
          limit,
          pctOfLimit: pct,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      weeklyRevenue: weekly.revenue,
      weeklyProfit: weekly.netProfit,
      monthlyRevenue: monthlySum.revenue,
      monthlyProfit: monthlySum.netProfit,
      marketplaceAMargin: marketplaceA?.margin ?? 0,
      marketplaceBMargin: marketplaceB?.margin ?? 0,
      chatMargin: chat?.margin ?? 0,
      offlineMargin: offline?.margin ?? 0,
      marketplaceARevenue: marketplaceA?.revenue ?? 0,
      marketplaceBRevenue: marketplaceB?.revenue ?? 0,
      lowStockProducts: products.filter((p) => p.stock <= p.minStock).map((p) => p.name),
      slowProducts: sortedProducts.slice(-3).map((p) => p.name),
      topProducts: sortedProducts.slice(0, 3).map((p) => p.name),
      safeWithdrawAmount,
      currentCash,
      mandatoryExpenses30,
      cashReserve,
      overdueReceivables,
      topExpenseCategories,
      healthScore: 82,
      healthStatus: "Sehat",
    };
  }

  async function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));

    const ctx = buildContext();
    const response = findCopilotResponse(text, ctx);

    const assistantMsg: CopilotMessage = {
      id: `msg-${Date.now()}-ai`,
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsTyping(false);
  }

  return (
    <DashboardLayout title="AI Business Copilot" subtitle="Asisten finansial cerdas khusus Owner">
      <div className="space-y-4 max-w-3xl mx-auto pb-4">
        <PageIntro
          title="Tanya AI (Business Copilot)"
          description="Konsultasikan performa penjualan, kondisi kas saat ini, evaluasi pos pengeluaran, dan strategi bisnis secara instan."
          guideTitle="Panduan Tanya AI"
          guideSteps={[
            "Pilih tombol pertanyaan cepat (seperti laba bulan ini atau produk terlaris) atau ketik pertanyaan langsung.",
            "Jawaban dihitung secara real-time dari seluruh data transaksi, stok, dan kas usaha Anda.",
            "Tanyakan berapa 'Uang Aman Ditarik' sebelum mengambil dividen/prive pribadi.",
            "Karyawan tidak memiliki akses ke fitur Tanya AI untuk menjaga kerahasiaan margin dan laba.",
          ]}
        />

        <div className="flex flex-col h-[calc(100vh-14rem)] space-y-3">
          {/* Header badge */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 shrink-0">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-xs">
              Dihasilkan dari data internal penjualan, stok, pengeluaran, dan kas Usaha.in.
            </p>
          </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <TypingIndicator />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[hsl(var(--border))]">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={isTyping}
              className="text-xs px-3 py-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] transition-all disabled:opacity-50 shadow-xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2 pt-1"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan analisis keuangan, kas, stok, atau laba..."
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-fg))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60 shadow-xs"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
