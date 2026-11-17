import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OLLAMA_CHAT_URL = "http://127.0.0.1:11434/api/chat";
const MODEL_NAME = "qwen3:4b-instruct";
const MAX_MESSAGE_LENGTH = 3000;

type SafeSnapshot = {
  note?: string;
  weeklyRevenue?: number;
  weeklyProfit?: number;
  monthlyRevenue?: number;
  monthlyProfit?: number;
  lowStockProducts?: string[];
  topProducts?: string[];
  slowProducts?: string[];
  topExpenseCategories?: Array<{ name: string; amount: number; limit?: number; pctOfLimit?: number }>;
  healthScore?: number;
  healthStatus?: string;
  safeWithdrawAmount?: number;
  currentCash?: number;
  mandatoryExpenses30?: number;
  cashReserve?: number;
  overdueReceivablesCount?: number;
  overdueReceivablesTotal?: number;
  topMarginProducts?: Array<{ name: string; sellPrice: number; marginPct: number }>;
  channelMargins?: Record<string, number>;
  pendingOrdersCount?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function safeStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((item): item is string => typeof item === "string")
    .slice(0, 10)
    .map((item) => item.slice(0, 80));
}

function sanitizeSnapshot(value: unknown): SafeSnapshot | null {
  if (!isRecord(value)) return null;

  const snapshot: SafeSnapshot = {};
  if (typeof value.note === "string") snapshot.note = value.note.slice(0, 300);

  const numericKeys = [
    "weeklyRevenue",
    "weeklyProfit",
    "monthlyRevenue",
    "monthlyProfit",
    "healthScore",
    "safeWithdrawAmount",
    "currentCash",
    "mandatoryExpenses30",
    "cashReserve",
    "overdueReceivablesCount",
    "overdueReceivablesTotal",
    "pendingOrdersCount",
  ] as const;

  for (const key of numericKeys) {
    const amount = finiteNumber(value[key]);
    if (amount !== undefined) snapshot[key] = amount;
  }

  if (typeof value.healthStatus === "string") {
    snapshot.healthStatus = value.healthStatus.slice(0, 50);
  }

  const lowStockProducts = safeStringList(value.lowStockProducts);
  const topProducts = safeStringList(value.topProducts);
  const slowProducts = safeStringList(value.slowProducts);
  if (lowStockProducts) snapshot.lowStockProducts = lowStockProducts;
  if (topProducts) snapshot.topProducts = topProducts;
  if (slowProducts) snapshot.slowProducts = slowProducts;

  if (Array.isArray(value.topMarginProducts)) {
    snapshot.topMarginProducts = value.topMarginProducts
      .filter(isRecord)
      .slice(0, 5)
      .flatMap((item) => {
        if (typeof item.name !== "string") return [];
        const sellPrice = finiteNumber(item.sellPrice) ?? 0;
        const marginPct = finiteNumber(item.marginPct) ?? 0;
        return [{ name: item.name.slice(0, 80), sellPrice, marginPct }];
      });
  }

  if (Array.isArray(value.topExpenseCategories)) {
    snapshot.topExpenseCategories = value.topExpenseCategories
      .filter(isRecord)
      .slice(0, 6)
      .flatMap((item) => {
        if (typeof item.name !== "string") return [];
        const amount = finiteNumber(item.amount);
        if (amount === undefined) return [];
        const limit = finiteNumber(item.limit);
        const pctOfLimit = finiteNumber(item.pctOfLimit);
        return [{ name: item.name.slice(0, 80), amount, limit, pctOfLimit }];
      });
  }
  return snapshot;
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Ollama lokal hanya tersedia saat website dijalankan di laptop (mode development)." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  if (!isRecord(body) || typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "Pertanyaan belum diisi." }, { status: 400 });
  }
  const message = body.message.trim();
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Pertanyaan terlalu panjang (maksimal 3.000 karakter)." }, { status: 413 });
  }

  const snapshot = sanitizeSnapshot(body.context);
  const systemPrompt = [
    "Kamu adalah AI Business Copilot Usaha.in dan selalu menjawab dalam Bahasa Indonesia.",
    "Perkenalkan dirimu sebagai AI Business Copilot Usaha.in. Jangan menyebut nama model, platform, runtime, atau lokasi pemrosesan kecuali pengguna bertanya langsung tentang implementasi teknis; jika ditanya, jawab jujur dan singkat.",
    "Gunakan hanya angka yang tercantum pada ringkasan data aplikasi. Jangan menghitung ulang, menebak angka, atau mengarang penyebab.",
    "Jika ditanya tentang penarikan uang pribadi (prive) atau uang aman diambil, jelaskan nominal safeWithdrawAmount serta rincian kas, biaya wajib, dan cadangan darurat yang tercantum.",
    "Jika ditanya tentang kondisi atau kesehatan usaha, rujuk ke healthScore (skor 0-100) dan healthStatus.",
    "Jika ditanya tentang piutang, sebutkan jumlah invoice overdueReceivablesCount dan total nilai overdueReceivablesTotal.",
    "Jika ditanya tentang stok atau produk, sebutkan produk pada lowStockProducts (hampir habis) atau slowProducts (perputaran lambat).",
    "Jika data untuk menjawab tidak tersedia, katakan dengan jelas bahwa data belum cukup dan sebutkan data yang diperlukan.",
    "Bedakan fakta dari kemungkinan, berikan saran praktis sebagai opsi, jelaskan risiko atau keterbatasan, dan jangan menjanjikan hasil pasti.",
    "Gunakan pemformatan teks yang rapi dan mudah dibaca oleh pemilik UMKM (poin-poin tebal untuk angka penting).",
  ].join(" ");
  const userPrompt = `Pertanyaan pemilik usaha:\n${message}\n\nRingkasan data aplikasi saat ini:\n${JSON.stringify(snapshot ?? { status: "Belum ada ringkasan data yang diberikan." })}`;

  try {
    const ollamaResponse = await fetch(OLLAMA_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        stream: false,
        think: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        options: { temperature: 0.2, num_predict: 500 },
      }),
      signal: AbortSignal.timeout(180_000),
      cache: "no-store",
    });

    if (!ollamaResponse.ok) {
      return NextResponse.json(
        { error: `Ollama memberi respons HTTP ${ollamaResponse.status}. Pastikan model ${MODEL_NAME} sudah terpasang.` },
        { status: 502 }
      );
    }

    const result: unknown = await ollamaResponse.json();
    const answer = isRecord(result) && isRecord(result.message) && typeof result.message.content === "string"
      ? result.message.content.trim()
      : "";
    if (!answer) {
      return NextResponse.json({ error: "Ollama tidak mengembalikan jawaban." }, { status: 502 });
    }
    return NextResponse.json({ answer, model: MODEL_NAME });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      {
        error: timedOut
          ? "Ollama terlalu lama merespons. Coba pertanyaan yang lebih singkat atau tutup aplikasi lain."
          : "Tidak dapat terhubung ke Ollama lokal. Pastikan Ollama sedang berjalan di laptop ini.",
      },
      { status: timedOut ? 504 : 503 }
    );
  }
}
