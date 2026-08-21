// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

// =========================================================================
// SUPABASE CONFIGURATION
// Replace SUPABASE_URL and SUPABASE_PUBLIC_KEY below with your actual credentials:
// =========================================================================
const RAW_SUPABASE_URL = "nymhyiggbyshvylhhcni";
const RAW_SUPABASE_PUBLIC_KEY = "https://nymhyiggbyshvylhhcni.supabase.co/rest/v1/";

// Helper to ensure URL format is valid (e.g. converts "myproject" to "https://myproject.supabase.co")
function formatSupabaseUrl(urlStr) {
  if (!urlStr) return "https://placeholder.supabase.co";
  const trimmed = urlStr.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}.supabase.co`;
}

const SUPABASE_URL = formatSupabaseUrl(RAW_SUPABASE_URL);
const SUPABASE_PUBLIC_KEY = RAW_SUPABASE_PUBLIC_KEY || "placeholder-key";

// Safe creation wrapper to prevent unhandled top-level crashes
function createSafeSupabaseClient() {
  try {
    return createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
  } catch (err) {
    console.warn("Supabase client initialization warning:", err);
    // Dummy client fallback to keep React UI rendering smoothly
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signUp: async () => ({ data: null, error: new Error("Supabase credentials required") }),
        signInWithPassword: async () => ({ data: null, error: new Error("Supabase credentials required") }),
        signInWithOAuth: async () => ({ data: null, error: new Error("Supabase credentials required") }),
        signOut: async () => ({ error: null })
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        eq: function() { return this; }
      })
    };
  }
}

// Export single Supabase client instance
export const supabase = createSafeSupabaseClient();


