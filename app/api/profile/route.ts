import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/profile — Mengambil profil user yang sedang login
export async function GET(req: NextRequest) {
  try {
    let authUser: any = null;
    try {
      const supabase = await createServerSupabase();
      const { data } = await supabase.auth.getUser();
      authUser = data?.user ?? null;
    } catch (e) {
      authUser = null;
    }

    const adminClient = createAdminClient();

    // Fallback pencarian user dari header / list
    if (!authUser) {
      const headerEmail = req.headers.get("x-user-email")?.trim().toLowerCase();
      if (headerEmail) {
        const { data: userList } = await adminClient.auth.admin.listUsers();
        authUser = userList?.users?.find(
          (u) =>
            u.email?.toLowerCase() === headerEmail ||
            u.user_metadata?.username?.toLowerCase() === headerEmail
        );
      }
    }

    if (!authUser) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir." }, { status: 401 });
    }

    // Ambil data detail profil dari tabel public.users menggunakan admin client
    let dbUser: any = null;
    try {
      const { data } = await adminClient
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();
      dbUser = data;
    } catch (e) {
      dbUser = null;
    }

    const username =
      dbUser?.username || authUser.user_metadata?.username || authUser.email?.split("@")[0] || "";
    const email = authUser.email || dbUser?.contact_email;

    return NextResponse.json({
      user: {
        id: authUser.id,
        email,
        loginEmail: email,
        name: dbUser?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
        username,
        isOwner: dbUser?.is_owner ?? (authUser.user_metadata?.is_owner ?? true),
        template: dbUser?.template || (dbUser?.is_owner ? "Pemilik Usaha" : "Karyawan"),
        tenantId: dbUser?.tenant_id || authUser.user_metadata?.tenant_id,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/profile — Memperbarui profil (nama, username, email otomatis) dan kata sandi
export async function PATCH(req: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const body = await req.json();
    const { name, username, newPassword, userId, currentEmail } = body;

    // 1. Identifikasi user: Coba dari sesi cookies
    let authUser: any = null;
    try {
      const supabase = await createServerSupabase();
      const { data } = await supabase.auth.getUser();
      authUser = data?.user ?? null;
    } catch (e) {
      authUser = null;
    }

    // Fallback: Jika cookie tidak terbawa, cari via userId atau email dari body / header
    if (!authUser) {
      const targetId = userId || req.headers.get("x-user-id");
      if (targetId) {
        try {
          const { data: u } = await adminClient.auth.admin.getUserById(targetId);
          authUser = u?.user ?? null;
        } catch (e) {}
      }
    }

    if (!authUser) {
      const targetEmail = (currentEmail || req.headers.get("x-user-email") || "").trim().toLowerCase();
      if (targetEmail) {
        try {
          const { data: userList } = await adminClient.auth.admin.listUsers();
          authUser = userList?.users?.find(
            (u) =>
              u.email?.toLowerCase() === targetEmail ||
              u.user_metadata?.username?.toLowerCase() === targetEmail ||
              u.user_metadata?.email?.toLowerCase() === targetEmail
          );
        } catch (e) {}
      }
    }

    if (!authUser) {
      return NextResponse.json({ error: "Sesi tidak valid atau pengguna tidak ditemukan." }, { status: 401 });
    }

    const metaUpdates: Record<string, any> = {};
    const dbUpdates: Record<string, any> = {};
    let newCalculatedEmail: string | null = null;

    if (name && typeof name === "string" && name.trim()) {
      metaUpdates.name = name.trim();
      dbUpdates.name = name.trim();
    }

    if (username && typeof username === "string" && username.trim()) {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._@]/g, "");
      metaUpdates.username = cleanUsername;
      dbUpdates.username = cleanUsername;

      // ATURAN PENTING: Email login otomatis mengikuti perubahan username
      // Contoh: lisna@tokotesting.usaha.in -> lisnuy@tokotesting.usaha.in
      const currentEmailStr = authUser.email || (authUser.user_metadata?.email as string) || "";
      if (currentEmailStr && currentEmailStr.includes("@")) {
        const domain = currentEmailStr.split("@")[1];
        newCalculatedEmail = `${cleanUsername}@${domain}`;
        metaUpdates.email = newCalculatedEmail;
        dbUpdates.contact_email = newCalculatedEmail;
      }
    }

    // 2. Update data profil ke Supabase Auth & public.users
    const authAdminUpdates: Record<string, any> = {
      user_metadata: { ...authUser.user_metadata, ...metaUpdates },
    };

    if (newCalculatedEmail) {
      authAdminUpdates.email = newCalculatedEmail;
      authAdminUpdates.email_confirm = true;
    }

    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { error: "Kata sandi baru minimal harus 6 karakter." },
          { status: 400 }
        );
      }
      authAdminUpdates.password = newPassword;
    }

    // 2a. Update Supabase Auth (Auth API bypasses RLS)
    const { data: updatedAuthUser, error: authUpdateErr } = await adminClient.auth.admin.updateUserById(
      authUser.id,
      authAdminUpdates
    );

    if (authUpdateErr) {
      console.warn("Gagal update user di Supabase Auth:", authUpdateErr.message);
    }

    // 2b. Update tabel public.users
    if (Object.keys(dbUpdates).length > 0) {
      try {
        const { data: updatedRows } = await adminClient
          .from("users")
          .update(dbUpdates)
          .eq("id", authUser.id)
          .select();

        // Jika row belum ada di public.users, lakukan upsert
        if (!updatedRows || updatedRows.length === 0) {
          let tenantId = authUser.user_metadata?.tenant_id;
          if (!tenantId) {
            const { data: t } = await adminClient.from("tenants").select("id").limit(1);
            tenantId = t?.[0]?.id || authUser.id;
          }

          await adminClient.from("users").upsert({
            id: authUser.id,
            tenant_id: tenantId,
            username: dbUpdates.username || authUser.user_metadata?.username || "user",
            name: dbUpdates.name || authUser.user_metadata?.name || "User",
            contact_email: newCalculatedEmail || authUser.email,
            is_owner: authUser.user_metadata?.is_owner ?? false,
            active: true,
            template: authUser.user_metadata?.template || "Karyawan",
          }, { onConflict: "id" });
        }
      } catch (dbErr: any) {
        console.warn("Update public.users database error (cek permissions):", dbErr.message);
      }
    }

    const finalEmail =
      newCalculatedEmail || updatedAuthUser?.user?.email || authUser.email;

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui. Email login telah disesuaikan dengan username Anda.",
      user: {
        id: authUser.id,
        name: dbUpdates.name || authUser.user_metadata?.name,
        username: dbUpdates.username || authUser.user_metadata?.username,
        email: finalEmail,
        loginEmail: finalEmail,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Gagal memperbarui profil." }, { status: 500 });
  }
}
