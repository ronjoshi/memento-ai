import { createClient } from "@/lib/supabase/server";
import { DatabaseService } from "@/services/database";
import { NextRequest, NextResponse } from "next/server";

// POST: Search memories by tag IDs (any overlap) and/or date range
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

		const { tagIds, startTime, endTime } = await request.json();

		const hasTagIds = Array.isArray(tagIds) && tagIds.length > 0;
		const hasStart = typeof startTime === "string" && startTime.trim() !== "";
		const hasEnd = typeof endTime === "string" && endTime.trim() !== "";

		if (!hasTagIds && !hasStart && !hasEnd) {
			return NextResponse.json(
				{
					error:
						"Provide at least one filter: tagIds, startTime, or endTime",
				},
				{ status: 400 },
			);
		}

		const databaseService = new DatabaseService(supabase);
		const memories = await databaseService.filterMemories({
			tagIds: hasTagIds ? tagIds : undefined,
			startTime: hasStart ? startTime : undefined,
			endTime: hasEnd ? endTime : undefined,
		});

		return NextResponse.json({ memories });
	} catch (error) {
		console.error("Error searching memories by tag/date:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Internal server error",
			},
			{ status: 500 },
		);
	}
}
