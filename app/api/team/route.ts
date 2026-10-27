import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Helper: Verifikasi status Owner dengan auto-healing jika data public.users belum ada
async function getAuthenticatedOwner(supabase: any, req?: NextRequest) {
  let user: any = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (e) {
    user = null;
  }

  const adminClient = createAdminClient();

  // Jika session cookie tidak terdeteksi, coba cek dari header x-owner-email
  if (!user && req) {
    const headerEmail = req.headers.get("x-owner-email")?.trim().toLowerCase();
    if (headerEmail) {
      try {
        const { data: userList } = await adminClient.auth.admin.listUsers();
        user = userList?.users?.find(
          (u) =>
            u.email?.toLowerCase() === headerEmail ||
            u.user_metadata?.username?.toLowerCase() === headerEmail ||
            u.user_metadata?.email?.toLowerCase() === headerEmail
        );
      } catch (e) {
        console.error("Gagal verifikasi owner via header:", e);
      }
    }
  }

  // Jika tetap tidak ada user sama sekali, return null (unauthorized)
  if (!user) return null;

  // 1. Coba baca dari tabel public.users (via admin, bypass RLS)
  let profile: any = null;
  try {
    const { data } = await adminClient
      .from("users")
      .select("tenant_id, is_owner")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  } catch (e) {
    profile = null;
  }

  if (profile && profile.is_owner === true) {
    return { user, tenant_id: profile.tenant_id, is_owner: true };
  }

  // 2. Fallback: Cek metadata akun Auth
  const isEmployee = user.user_metadata?.is_owner === false;
  if (!isEmployee) {
    let tenantId = profile?.tenant_id || user.user_metadata?.tenant_id;

    if (!tenantId) {
      try {
        const { data: t } = await adminClient.from("tenants").select("id").limit(1);
        tenantId = t?.[0]?.id;
      } catch (e) {
        // Table permission might be restricted
      }
    }

    // Jika tenant belum ada atau query gagal, gunakan user.id sebagai tenant_id default
    if (!tenantId) {
      tenantId = user.id;
    }

    // Coba pastikan tenant dan user terdaftar di tabel public (auto-healing)
    try {
      await adminClient.from("tenants").upsert({
        id: tenantId,
        name: user.user_metadata?.business_name || "Usaha Saya",
        slug:
          user.user_metadata?.username ||
          user.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9]/g, "-") ||
          "usaha",
        business_type: "dagang",
      }, { onConflict: "id" });

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
      }, { onConflict: "id" });
    } catch (e) {
      // Abaikan jika permission SQL belum di-grant
    }

    return { user, tenant_id: tenantId, is_owner: true };
  }

  return null;
}

// GET /api/team — Ambil semua anggota tim untuk tenant aktif
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const owner = await getAuthenticatedOwner(supabase, req);

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
      // Jika tabel belum memiliki grant permission, return list kosong
      return NextResponse.json({ members: [] });
    }

    return NextResponse.json({ members: members || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/team — Tambah akun karyawan baru ke Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createServerSupabase();
    const owner = await getAuthenticatedOwner(supabase, req);

    if (!owner) {
      return NextResponse.json(
        { error: "Hanya Pemilik Usaha (Owner) yang berhak menambahkan karyawan." },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    let tenantSlug = "usaha";
    try {
      const { data: tenant } = await adminClient
        .from("tenants")
        .select("slug")
        .eq("id", owner.tenant_id)
        .maybeSingle();
      if (tenant?.slug) tenantSlug = tenant.slug;
    } catch (e) {
      // Fallback slug
    }

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
      : `${cleanUsername}@${tenantSlug}.usaha.in`;

    // Gunakan Admin API untuk membuat user baru di Supabase Auth (bypass konfirmasi email)
    const { data: newAuth, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
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
      try {
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
        }, { onConflict: "id" });
      } catch (dbErr: any) {
        console.warn("Gagal simpan ke public.users (cek permission):", dbErr);
      }
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
    const owner = await getAuthenticatedOwner(supabase, req);

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

    try {
      await adminClient
        .from("users")
        .update(updates)
        .eq("id", userId)
        .eq("tenant_id", owner.tenant_id);
    } catch (e) {
      // Ignored if table permission restricted
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
    const owner = await getAuthenticatedOwner(supabase, req);

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

    const adminClient = createAdminClient();

    // Jika userId belum didapat, cari berdasarkan email atau username
    if (!userId && (email || username)) {
      try {
        const { data: userList } = await adminClient.auth.admin.listUsers();
        const found = userList?.users?.find(
          (u) =>
            (email && u.email?.toLowerCase() === email.toLowerCase()) ||
            (username &&
              (u.user_metadata?.username?.toLowerCase() === username.toLowerCase() ||
                u.email?.toLowerCase().startsWith(username.toLowerCase())))
        );
        if (found) {
          userId = found.id;
        }
      } catch (e) {
        console.error("Gagal mencari user di auth.admin:", e);
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID atau email karyawan yang ingin dihapus tidak ditemukan." },
        { status: 400 }
      );
    }

    // 1. Hapus dari public.users terlebih dahulu (jika ada)
    try {
      await adminClient.from("users").delete().eq("id", userId);
    } catch (dbErr) {
      console.warn("Gagal hapus dari public.users (mungkin sudah terhapus):", dbErr);
    }

    // 2. Hapus dari auth.users via Admin API (bypass semua proteksi RLS)
    const { error: authErr } = await adminClient.auth.admin.deleteUser(userId);
    if (authErr) {
      return NextResponse.json(
        { error: `Gagal menghapus user dari Supabase Auth: ${authErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Akun karyawan berhasil dihapus secara permanen.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Gagal menghapus akun karyawan." },
      { status: 500 }
    );
  }
}
