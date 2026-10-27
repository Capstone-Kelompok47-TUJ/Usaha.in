import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Helper: Verifikasi status Owner dengan auto-healing jika data public.users belum ada
async function getAuthenticatedOwner(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const adminClient = createAdminClient();

  // 1. Coba baca dari tabel public.users (via admin, bypass RLS)
  const { data: profile } = await adminClient
    .from("users")
    .select("tenant_id, is_owner")
    .eq("id", user.id)
    .maybeSingle();

  if (profile && profile.is_owner === true) {
    return { user, tenant_id: profile.tenant_id, is_owner: true };
  }

  // 2. Fallback: Cek metadata akun Auth
  const isEmployee = user.user_metadata?.is_owner === false;
  if (!isEmployee) {
    let tenantId = profile?.tenant_id || user.user_metadata?.tenant_id;
    if (!tenantId) {
      const { data: t } = await adminClient.from("tenants").select("id").limit(1);
      tenantId = t?.[0]?.id;
    }

    // Pastikan profil Owner tersimpan di public.users
    if (tenantId) {
      await adminClient.from("users").upsert({
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

    const adminClient = createAdminClient();
    const { data: members, error: membersErr } = await adminClient
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

    const adminClient = createAdminClient();

    const { data: tenant } = await adminClient
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

    // Gunakan Admin API untuk membuat user baru (bypass email konfirmasi)
    const { data: newAuth, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Langsung konfirmasi, tidak perlu verifikasi email
      user_metadata: {
        tenant_id: owner.tenant_id,
        name: name.trim(),
        username: cleanUsername,
        template: template || "Staf Penjualan",
        permissions: permissions || {},
        is_owner: false,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const newUserId = newAuth?.user?.id;

    if (newUserId) {
      await adminClient.from("users").upsert({
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

    const adminClient = createAdminClient();
    const body = await req.json();
    const { userId, active, permissions, template } = body;

    const updates: Record<string, any> = {};
    if (typeof active === "boolean") updates.active = active;
    if (permissions) updates.permissions = permissions;
    if (template) updates.template = template;

    const { error: updateErr } = await adminClient
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

    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const username = searchParams.get("username");

    if (!userId) {
      const body = await req.json().catch(() => ({}));
      userId = body?.userId ?? null;
    }

    if (!userId && !email && !username) {
      return NextResponse.json({ error: "Identitas Karyawan wajib disertakan." }, { status: 400 });
    }

    // Larang Owner menghapus dirinya sendiri
    if (userId === owner.user.id || (email && email.toLowerCase() === owner.user.email?.toLowerCase())) {
      return NextResponse.json({ error: "Pemilik usaha tidak dapat menghapus akunnya sendiri." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Cari user ID target jika yang dikirim bukan UUID
    let targetUserId: string | null = userId;
    const isUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    if (!isUuid) {
      // Cari berdasarkan email atau username di tabel public.users
      let query = adminClient.from("users").select("id").eq("is_owner", false);
      if (email) {
        query = query.eq("contact_email", email.toLowerCase());
      } else if (username) {
        query = query.ilike("username", username);
      }
      const { data: found } = await query.maybeSingle();
      targetUserId = found?.id ?? null;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "Akun karyawan tidak ditemukan." }, { status: 404 });
    }

    // Pastikan bukan Owner yang akan dihapus
    const { data: targetProfile } = await adminClient
      .from("users")
      .select("is_owner, tenant_id")
      .eq("id", targetUserId)
      .maybeSingle();

    if (targetProfile?.is_owner === true) {
      return NextResponse.json({ error: "Pemilik usaha tidak dapat dihapus." }, { status: 400 });
    }

    if (targetProfile?.tenant_id !== owner.tenant_id) {
      return NextResponse.json({ error: "Karyawan bukan bagian dari usaha Anda." }, { status: 403 });
    }

    // 1. Hapus dari public.users terlebih dahulu
    await adminClient
      .from("users")
      .delete()
      .eq("id", targetUserId)
      .eq("is_owner", false);

    // 2. Hapus dari auth.users menggunakan Admin API (Service Role)
    const { error: authDeleteErr } = await adminClient.auth.admin.deleteUser(targetUserId);

    if (authDeleteErr) {
      console.warn("Peringatan saat hapus dari auth.users:", authDeleteErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
