import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { JournalSearchParams } from "@/types";

// POST: Search journal entries using semantic search
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

		const {
			query,
			matchCount = 5,
			startTime,
			endTime,
		} = await request.json();

		if (!query || query.trim() === "") {
			return NextResponse.json(
				{ error: "Query cannot be empty" },
				{ status: 400 },
			);
		}

		const requestBody: JournalSearchParams = {
			query,
			matchCount,
			startTime,
			endTime,
		};

		// Call the search-memories edge function
		const { data, error } = await supabase.functions.invoke(
			"search-memories",
			{
				body: requestBody,
			},
		);

		if (error) {
			console.error("Search edge function error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// Transform results to camelCase
		const journals = (data?.data || []).map((item: any) => ({
			id: item.id,
			userId: item.user_id,
			journalData: item.memory_data,
			tagIds: item.tag_ids || [],
			createdAt: item.created_at,
		}));

		return NextResponse.json({
			journals,
			query: data?.query || query,
			matchCount: data?.matchCount || journals.length,
		});
	} catch (error) {
		console.error("Error searching journal entries:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Internal server error",
			},
			{ status: 500 },
		);
	}
}
