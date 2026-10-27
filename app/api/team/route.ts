import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createIsolatedClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://tgmaxlijbvqjjjgzxcdl.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbWF4bGlqYnZxampqZ3p4Y2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTQxNDAsImV4cCI6MjEwODY3MDE0MH0.mg7XdwiCmFThivrRissyuivCQep_bHTDbRrqySMwbp0";

// GET /api/team — Fetch all employees for the current tenant
export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user profile
    const { data: userProfile, error: profileErr } = await supabase
      .from("users")
      .select("tenant_id, is_owner")
      .eq("id", user.id)
      .single();

    if (profileErr || !userProfile) {
      return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
    }

    // Fetch team members
    const { data: members, error: membersErr } = await supabase
      .from("users")
      .select("*")
      .eq("tenant_id", userProfile.tenant_id)
      .order("created_at", { ascending: true });

    if (membersErr) {
      return NextResponse.json({ error: membersErr.message }, { status: 500 });
    }

    return NextResponse.json({ members });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/team — Add new employee account to Supabase
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify current user is Owner
    const { data: ownerProfile, error: ownerErr } = await supabase
      .from("users")
      .select("tenant_id, is_owner")
      .eq("id", user.id)
      .single();

    if (ownerErr || !ownerProfile || !ownerProfile.is_owner) {
      return NextResponse.json(
        { error: "Hanya Pemilik Usaha (Owner) yang berhak menambahkan karyawan." },
        { status: 403 }
      );
    }

    // Get tenant info for email domain formatting if needed
    const { data: tenant } = await supabase
      .from("tenants")
      .select("slug")
      .eq("id", ownerProfile.tenant_id)
      .single();

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

    // Use an isolated client without session persistence so owner's login cookie is never modified
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
          tenant_id: ownerProfile.tenant_id,
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

    // Fallback direct upsert in public.users in case database trigger hasn't finished
    if (newUserId) {
      await supabase.from("users").upsert({
        id: newUserId,
        tenant_id: ownerProfile.tenant_id,
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
        tenantId: ownerProfile.tenant_id,
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

// PATCH /api/team — Update employee status or permissions
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: ownerProfile } = await supabase
      .from("users")
      .select("tenant_id, is_owner")
      .eq("id", user.id)
      .single();

    if (!ownerProfile?.is_owner) {
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
      .eq("tenant_id", ownerProfile.tenant_id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
