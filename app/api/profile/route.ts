import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/profile — Mengambil profil user yang sedang login
export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir." }, { status: 401 });
    }

    // Ambil data detail profil dari tabel public.users menggunakan admin client
    const adminClient = createAdminClient();
    const { data: dbUser } = await adminClient
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    return NextResponse.json({
      user: {
        id: authUser.id,
        email: authUser.email,
        name: dbUser?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
        username: dbUser?.username || authUser.user_metadata?.username || authUser.email?.split("@")[0] || "",
        isOwner: dbUser?.is_owner ?? (authUser.user_metadata?.is_owner ?? true),
        template: dbUser?.template || (dbUser?.is_owner ? "Pemilik Usaha" : "Karyawan"),
        tenantId: dbUser?.tenant_id || authUser.user_metadata?.tenant_id,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/profile — Memperbarui profil (nama, username) dan kata sandi
export async function PATCH(req: NextRequest) {
  try {
    // 1. Verifikasi sesi pengguna yang sedang login
    const supabase = await createServerSupabase();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir." }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, newPassword } = body;

    // Admin client untuk operasi yang memerlukan Service Role (bypass RLS + akses auth.users)
    const adminClient = createAdminClient();

    const metaUpdates: Record<string, any> = {};
    const dbUpdates: Record<string, any> = {};

    if (name && typeof name === "string" && name.trim()) {
      metaUpdates.name = name.trim();
      dbUpdates.name = name.trim();
    }

    if (username && typeof username === "string" && username.trim()) {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._@]/g, "");
      metaUpdates.username = cleanUsername;
      dbUpdates.username = cleanUsername;
    }

    // 2. Update nama dan username jika ada perubahan
    if (Object.keys(metaUpdates).length > 0) {
      // 2a. Update metadata di auth.users via Admin API (Service Role)
      const { error: adminMetaErr } = await adminClient.auth.admin.updateUserById(
        authUser.id,
        { user_metadata: { ...authUser.user_metadata, ...metaUpdates } }
      );

      if (adminMetaErr) {
        console.warn("Admin metadata update error:", adminMetaErr.message);
      }

      // 2b. Update tabel public.users (bypass RLS via Service Role)
      const { data: updatedRows, error: dbErr } = await adminClient
        .from("users")
        .update(dbUpdates)
        .eq("id", authUser.id)
        .select();

      if (dbErr) {
        console.warn("Gagal update public.users:", dbErr.message);
      }

      // 2c. Jika profil belum ada di public.users, buat dengan upsert
      if (!updatedRows || updatedRows.length === 0) {
        let tenantId = authUser.user_metadata?.tenant_id;
        if (!tenantId) {
          const { data: t } = await adminClient.from("tenants").select("id").limit(1);
          tenantId = t?.[0]?.id;
        }

        await adminClient.from("users").upsert({
          id: authUser.id,
          tenant_id: tenantId,
          username: dbUpdates.username || authUser.user_metadata?.username || "user",
          name: dbUpdates.name || authUser.user_metadata?.name || "User",
          contact_email: authUser.email,
          is_owner: authUser.user_metadata?.is_owner ?? true,
          active: true,
          template: authUser.user_metadata?.template || "Owner",
        });
      }
    }

    // 3. Update password jika ada
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { error: "Kata sandi baru minimal harus 6 karakter." },
          { status: 400 }
        );
      }

      // Gunakan Admin API untuk update password (tidak perlu sesi aktif user)
      const { error: passErr } = await adminClient.auth.admin.updateUserById(
        authUser.id,
        { password: newPassword }
      );

      if (passErr) {
        return NextResponse.json({ error: passErr.message }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui.",
      user: {
        id: authUser.id,
        name: dbUpdates.name || authUser.user_metadata?.name,
        username: dbUpdates.username || authUser.user_metadata?.username,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Gagal memperbarui profil." }, { status: 500 });
  }
}
