// Browser-side Supabase client for client components
import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./config";

export function createClient() {
	return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton instance for browser usage
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
	if (!supabaseInstance) {
		supabaseInstance = createClient();
	}
	return supabaseInstance;
}
