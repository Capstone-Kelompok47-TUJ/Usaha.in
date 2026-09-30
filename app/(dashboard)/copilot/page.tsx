"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePermission } from "@/hooks/usePermission";
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
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: CopilotMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
        isUser
          ? "bg-gradient-to-br from-blue-500 to-purple-600"
          : "bg-gradient-to-br from-indigo-500 to-blue-600"
      }`}>
        {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className={`max-w-[80%] rounded-xl p-3 text-sm leading-relaxed ${
        isUser
          ? "bg-blue-600 text-white rounded-tr-none"
          : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-tl-none"
      }`}>
        {/* Render markdown-like formatting */}
        <div className="whitespace-pre-wrap prose-sm">
          {msg.content.split("\n").map((line, i) => {
            if (line.startsWith("**") && line.endsWith("**")) {
              return <p key={i} className="font-bold">{line.slice(2, -2)}</p>;
            }
            // Bold inline text
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <p key={i} className={line.startsWith("|") ? "font-mono text-[11px]" : ""}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
              </p>
            );
          })}
        </div>
        <p className={`text-[10px] mt-2 ${isUser ? "text-blue-200" : "text-[hsl(var(--muted-fg))]"}`}>
          {new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

export default function CopilotPage() {
  const { canView } = usePermission("copilot");
  const user = useCurrentUser();
  const orders = useStore((s) => s.orders);
  const purchases = useStore((s) => s.purchases);
  const products = useStore((s) => s.products);

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Halo! Saya **AI Business Copilot** Usaha.in 👋\n\nSaya siap membantu Anda menganalisis performa bisnis berdasarkan data penjualan, stok, dan keuangan Anda.\n\nCoba tanyakan sesuatu, atau gunakan tombol pertanyaan cepat di bawah!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  if (!canView) redirect("/tidak-ada-akses");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Build context dari data store
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
      if (o.paymentStatus !== "lunas") return;
      o.items.forEach((item) => {
        productSales[item.productId] = (productSales[item.productId] ?? 0) + item.qty;
      });
    });
    const sortedProducts = [...products].sort(
      (a, b) => (productSales[b.id] ?? 0) - (productSales[a.id] ?? 0)
    );

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
      arabikaBuyPriceOld: 52000,
      arabikaBuyPriceNew: 62000,
      marketplaceAAdminFeeOld: 5,
      marketplaceAAdminFeeNew: 7.5,
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

    // Delay proses AI
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

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
    <DashboardLayout title="AI Business Copilot" subtitle="Tanya apa saja tentang bisnis Anda">
      <div className="flex flex-col h-[calc(100vh-10rem)] max-w-2xl mx-auto">
        {/* Header badge */}
        <div className="flex items-center gap-2 mb-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-900/30">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <em>Jawaban dianalisis langsung dari data internal penjualan, stok, dan keuangan.</em>
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <TypingIndicator />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={isTyping}
              className="text-xs px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan sesuatu tentang bisnis Anda..."
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
