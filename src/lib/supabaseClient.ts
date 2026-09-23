import { createClient, type SupabaseClient, type User, type Session } from "@supabase/supabase-js";

// Read public environment variables safely, with hardcoded fallback for production builds.
// The anon key is a public/publishable key — safe to embed in client code.
const SUPABASE_URL = "https://rlyeaalxbzuunythwglc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qL2eLtfpn7ObtAV84ls_BA_ABt8t3-z";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL).trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("http") &&
  supabaseAnonKey.length > 10 &&
  !supabaseUrl.includes("your-project-id")
);

// Create the Supabase client safely with fallback dummy to prevent runtime crash when not configured
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient("https://placeholder-url.supabase.co", "placeholder-anon-key", {
      auth: { persistSession: false },
    });

/**
 * Sign in as administrator using Supabase Auth (Email + Password).
 * Successful authentication yields an authenticated JWT role required by RLS to modify tables.
 */
export async function signInAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User | null; session?: Session | null; error?: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: "Supabase credentials are not configured in environment variables.",
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (err) {
    return { success: false, error: (err as Error).message || "An unexpected error occurred." };
  }
}

/**
 * Sign out administrator
 */
export async function signOutAdmin(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentAdminUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!isSupabaseConfigured) return () => {};
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => subscription.unsubscribe();
}
