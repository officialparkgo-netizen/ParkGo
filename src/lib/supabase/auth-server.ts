import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cookie-bound Supabase client for server components / server actions. Reads the
 * signed-in user's session from cookies and runs queries as that user (RLS
 * applies). Use this for auth; use supabaseAdmin() for privileged writes.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll was called from a Server Component (read-only cookies);
            // the middleware refreshes the session cookie instead.
          }
        },
      },
    }
  );
}
