import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

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

    // Ambil data detail profil dari tabel public.users
    const { data: dbUser } = await supabase
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

    // 1. Jika ada perubahan password
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { error: "Kata sandi baru minimal harus 6 karakter." },
          { status: 400 }
        );
      }

      const { error: passErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passErr) {
        return NextResponse.json({ error: passErr.message }, { status: 400 });
      }
    }

    // 2. Jika ada perubahan nama atau username
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

    if (Object.keys(metaUpdates).length > 0) {
      // Update auth user metadata
      await supabase.auth.updateUser({
        data: metaUpdates,
      });

      // Update tabel public.users
      const { error: dbErr } = await supabase
        .from("users")
        .update(dbUpdates)
        .eq("id", authUser.id);

      if (dbErr) {
        console.error("Gagal update tabel public.users:", dbErr);
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
