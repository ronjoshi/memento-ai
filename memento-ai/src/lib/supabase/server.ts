// Server-side Supabase client for API routes and server components
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } from "./config";

export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) =>
						cookieStore.set(name, value, options),
					);
				} catch {
					// The `setAll` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			},
		},
	});
}

// Service role client for admin operations (only use in API routes, never expose to client)
export function createServiceRoleClient() {
	return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
		cookies: {
			getAll() {
				return [];
			},
			setAll() {},
		},
	});
}
