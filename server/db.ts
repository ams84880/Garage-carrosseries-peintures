import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { InsertUser, InsertAppointment, InsertReview } from "../drizzle/schema";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[Supabase] Credentials not configured (SUPABASE_URL / key missing)");
    return null;
  }
  _supabase = createClient(url, key, { auth: { persistSession: false } });
  return _supabase;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const sb = getSupabase();
  if (!sb) {
    console.warn("[Supabase] Cannot upsert user: not configured");
    return;
  }
  const payload: Record<string, unknown> = { openId: user.openId };
  if (user.name !== undefined) payload.name = user.name ?? null;
  if (user.email !== undefined) payload.email = user.email ?? null;
  if (user.loginMethod !== undefined) payload.loginMethod = user.loginMethod ?? null;
  if (user.role !== undefined) payload.role = user.role;
  payload.lastSignedIn = (user.lastSignedIn ?? new Date()).toISOString();

  const { error } = await sb.from("users").upsert(payload, { onConflict: "openId" });
  if (error) {
    console.error("[Supabase] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const sb = getSupabase();
  if (!sb) return undefined;
  const { data, error } = await sb.from("users").select("*").eq("openId", openId).maybeSingle();
  if (error) {
    console.warn("[Supabase] getUserByOpenId failed:", error);
    return undefined;
  }
  return data ?? undefined;
}

export async function createAppointment(data: InsertAppointment) {
  const sb = getSupabase();
  if (!sb) throw new Error("Database not available");
  const { data: result, error } = await sb.from("appointments").insert(data).select().single();
  if (error) throw new Error(`Insert appointment failed: ${error.message}`);
  return result;
}

export async function getAppointments() {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("appointments").select("*").order("createdAt", { ascending: false });
  if (error) {
    console.warn("[Supabase] getAppointments failed:", error);
    return [];
  }
  return data ?? [];
}

export async function createReview(data: InsertReview) {
  const sb = getSupabase();
  if (!sb) throw new Error("Database not available");
  const { data: result, error } = await sb.from("reviews").insert(data).select().single();
  if (error) throw new Error(`Insert review failed: ${error.message}`);
  return result;
}

export async function getApprovedReviews() {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("reviews")
    .select("*")
    .eq("status", "approved")
    .order("createdAt", { ascending: false });
  if (error) {
    console.warn("[Supabase] getApprovedReviews failed:", error);
    return [];
  }
  return data ?? [];
}

export async function getAllReviews() {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("reviews").select("*").order("createdAt", { ascending: false });
  if (error) {
    console.warn("[Supabase] getAllReviews failed:", error);
    return [];
  }
  return data ?? [];
}
