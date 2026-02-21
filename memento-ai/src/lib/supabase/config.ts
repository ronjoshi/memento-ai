const useLocal = process.env.USE_LOCAL === "true";

export const supabaseUrl = useLocal
	? process.env.NEXT_LOCAL_SUPABASE_URL!
	: process.env.NEXT_PUBLIC_SUPABASE_URL!;

export const supabaseAnonKey = useLocal
	? process.env.NEXT_LOCAL_SUPABASE_ANON_KEY!
	: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseServiceRoleKey = useLocal
	? process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY!
	: process.env.SUPABASE_SERVICE_ROLE_KEY!;
