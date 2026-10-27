import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createIsolatedClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://tgmaxlijbvqjjjgzxcdl.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbWF4bGlqYnZxampqZ3p4Y2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTQxNDAsImV4cCI6MjEwODY3MDE0MH0.mg7XdwiCmFThivrRissyuivCQep_bHTDbRrqySMwbp0";

// Helper: Verifikasi status Owner dengan auto-healing jika data public.users belum ada
async function getAuthenticatedOwner(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Coba baca dari tabel public.users
  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id, is_owner")
    .eq("id", user.id)
    .maybeSingle();

  if (profile && profile.is_owner === true) {
    return { user, tenant_id: profile.tenant_id, is_owner: true };
  }

  // 2. Fallback: Cek metadata akun Supabase Auth
  const isEmployee = user.user_metadata?.is_owner === false;
  if (!isEmployee) {
    // Akun ini adalah Owner utama
    let tenantId = profile?.tenant_id || user.user_metadata?.tenant_id;
    if (!tenantId) {
      const { data: t } = await supabase.from("tenants").select("id").limit(1);
      tenantId = t?.[0]?.id;
    }

    // Pastikan profil Owner tersimpan di public.users
    if (tenantId) {
      await supabase.from("users").upsert({
        id: user.id,
        tenant_id: tenantId,
        username: user.user_metadata?.username || user.email?.split("@")[0] || "owner",
        name: user.user_metadata?.name || "Pemilik Usaha",
        contact_email: user.email,
        is_owner: true,
        active: true,
        template: "Owner",
        permissions: {
          dashboard: "manage",
          penjualan: "manage",
          produk: "manage",
          stok: "manage",
          pengeluaran: "manage",
          pembayaran: "manage",
          pengiriman: "manage",
          pelanggan: "manage",
          laporan_keuangan: "manage",
          laporan_periodik: "manage",
          analitik: "manage",
          copilot: "manage",
        },
      });
    }

    return { user, tenant_id: tenantId, is_owner: true };
  }

  return null;
}

// GET /api/team — Ambil semua anggota tim untuk tenant aktif
export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const owner = await getAuthenticatedOwner(supabase);

    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: members, error: membersErr } = await supabase
      .from("users")
      .select("*")
      .eq("tenant_id", owner.tenant_id)
      .order("created_at", { ascending: true });

    if (membersErr) {
      return NextResponse.json({ error: membersErr.message }, { status: 500 });
    }

    return NextResponse.json({ members });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/team — Tambah akun karyawan baru ke Supabase
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const owner = await getAuthenticatedOwner(supabase);

    if (!owner) {
      return NextResponse.json(
        { error: "Hanya Pemilik Usaha (Owner) yang berhak menambahkan karyawan." },
        { status: 403 }
      );
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("slug")
      .eq("id", owner.tenant_id)
      .maybeSingle();

    const body = await req.json();
    const { name, username, password, template, permissions } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Nama lengkap, username, dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._@]/g, "");
    const email = cleanUsername.includes("@")
      ? cleanUsername
      : `${cleanUsername}@${tenant?.slug || "usaha"}.usaha.in`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

    // Gunakan client terisolasi agar cookie sesi login Owner di browser tidak berubah
    const tempSupabase = createIsolatedClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: newAuth, error: authError } = await tempSupabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          tenant_id: owner.tenant_id,
          name: name.trim(),
          username: cleanUsername,
          template: template || "Staf Penjualan",
          permissions: permissions || {},
          is_owner: false,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const newUserId = newAuth?.user?.id;

    if (newUserId) {
      await supabase.from("users").upsert({
        id: newUserId,
        tenant_id: owner.tenant_id,
        username: cleanUsername,
        name: name.trim(),
        contact_email: email,
        is_owner: false,
        active: true,
        template: template || "Staf Penjualan",
        permissions: permissions || {},
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUserId,
        tenantId: owner.tenant_id,
        username: cleanUsername,
        loginEmail: email,
        name: name.trim(),
        isOwner: false,
        active: true,
        template: template || "Staf Penjualan",
        permissions: permissions || {},
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Gagal menambahkan karyawan." }, { status: 500 });
  }
}

// PATCH /api/team — Ubah hak akses atau aktifkan/nonaktifkan akun
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const owner = await getAuthenticatedOwner(supabase);

    if (!owner) {
      return NextResponse.json({ error: "Hanya Owner yang dapat mengubah data karyawan." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, active, permissions, template } = body;

    const updates: Record<string, any> = {};
    if (typeof active === "boolean") updates.active = active;
    if (permissions) updates.permissions = permissions;
    if (template) updates.template = template;

    const { error: updateErr } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .eq("tenant_id", owner.tenant_id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/team — Hapus akun karyawan dari database
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const owner = await getAuthenticatedOwner(supabase);

    if (!owner) {
      return NextResponse.json({ error: "Hanya Owner yang berhak menghapus akun karyawan." }, { status: 403 });
    }

    let userId: string | null = null;
    const { searchParams } = new URL(req.url);
    userId = searchParams.get("userId");

    if (!userId) {
      const body = await req.json().catch(() => ({}));
      userId = body?.userId ?? null;
    }

    if (!userId) {
      return NextResponse.json({ error: "ID Karyawan wajib disertakan." }, { status: 400 });
    }

    // Larang Owner menghapus dirinya sendiri
    if (userId === owner.user.id) {
      return NextResponse.json({ error: "Pemilik usaha (Owner) tidak dapat menghapus akunnya sendiri." }, { status: 400 });
    }

    // Hapus record karyawan dari tabel public.users dan auth.users
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (isUuid) {
      const { error: rpcErr } = await supabase.rpc("fn_delete_employee", { p_user_id: userId });
      if (rpcErr) {
        await supabase
          .from("users")
          .delete()
          .eq("id", userId)
          .eq("is_owner", false);
      }
    } else {
      await supabase
        .from("users")
        .delete()
        .eq("username", userId)
        .eq("is_owner", false);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
