import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST: Search memories using semantic search
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json(
				{ error: "Not authenticated" },
				{ status: 401 },
			);
		}

		const { query, matchCount = 5 } = await request.json();

		if (!query || query.trim() === "") {
			return NextResponse.json(
				{ error: "Query cannot be empty" },
				{ status: 400 },
			);
		}

		// Call the search-memories edge function
		const { data, error } = await supabase.functions.invoke(
			"search-memories",
			{
				body: {
					query,
					matchCount,
				},
			},
		);

		if (error) {
			console.error("Search edge function error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// Transform results to camelCase
		const memories = (data?.data || []).map((item: any) => ({
			id: item.id,
			userId: item.user_id,
			memoryData: item.memory_data,
			tagIds: item.tag_ids || [],
			createdAt: item.created_at,
		}));

		return NextResponse.json({
			memories,
			query: data?.query || query,
			matchCount: data?.matchCount || memories.length,
		});
	} catch (error) {
		console.error("Error searching memories:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Internal server error",
			},
			{ status: 500 },
		);
	}
}
