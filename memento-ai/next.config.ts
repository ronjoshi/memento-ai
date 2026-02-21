import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	env: {
		USE_LOCAL: process.env.USE_LOCAL,
		NEXT_LOCAL_SUPABASE_URL: process.env.NEXT_LOCAL_SUPABASE_URL,
		NEXT_LOCAL_SUPABASE_ANON_KEY: process.env.NEXT_LOCAL_SUPABASE_ANON_KEY,
	},
};

export default nextConfig;
