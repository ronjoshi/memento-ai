import { createClient } from "@/lib/supabase/server";
import { DatabaseService } from "@/services/database";
import { NextRequest, NextResponse } from "next/server";

// POST: Search journal entries by tag IDs (any overlap) and/or date range
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

		const { tagIds, startTime, endTime, limit, offset } = await request.json();

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

		const pageLimit = limit || 50;
		const pageOffset = offset || 0;

		const databaseService = new DatabaseService(supabase);
		// Fetch one extra to check if there are more results
		const journals = await databaseService.filterJournals({
			tagIds: hasTagIds ? tagIds : undefined,
			startTime: hasStart ? startTime : undefined,
			endTime: hasEnd ? endTime : undefined,
			limit: pageLimit + 1,
			offset: pageOffset,
		});

		// Check if there are more results
		const hasMore = journals.length > pageLimit;
		const resultJournals = hasMore ? journals.slice(0, pageLimit) : journals;

		// Fetch all user tags to populate tag objects
		const { data: tagsData } = await supabase
			.from("tags")
			.select("*")
			.eq("user_id", user.id);

		// Build tag map for quick lookup
		const tagMap = new Map<number, any>();
		if (tagsData) {
			for (const tag of tagsData) {
				tagMap.set(tag.id, {
					id: tag.id,
					userId: tag.user_id,
					name: tag.name,
					color: tag.color || "gray",
					createdAt: tag.created_at,
				});
			}
		}

		// Populate tags in journals
		const journalsWithTags = resultJournals.map((journal) => ({
			...journal,
			tags: (journal.tagIds || [])
				.map((id: number) => tagMap.get(id))
				.filter(Boolean),
		}));

		return NextResponse.json({ journals: journalsWithTags, hasMore });
	} catch (error) {
		console.error("Error searching journal entries by tag/date:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Internal server error",
			},
			{ status: 500 },
		);
	}
}
