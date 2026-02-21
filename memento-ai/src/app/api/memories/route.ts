import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/services/embeddings";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch journal entries for authenticated user (with tags), paginated
export async function GET(request: NextRequest) {
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

		const { searchParams } = new URL(request.url);
		const limit = Math.min(
			parseInt(searchParams.get("limit") || "50", 10),
			100,
		);
		const offset = parseInt(searchParams.get("offset") || "0", 10);

		// Fetch paginated journal entries, total count, and tags
		const [journalsResult, countResult, tagsResult] = await Promise.all([
			supabase
				.from("memories")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false })
				.range(offset, offset + limit - 1),
			supabase
				.from("memories")
				.select("*", { count: "exact", head: true })
				.eq("user_id", user.id),
			supabase.from("tags").select("*").eq("user_id", user.id),
		]);

		if (journalsResult.error) {
			console.error("Error fetching journal entries:", journalsResult.error);
			return NextResponse.json(
				{ error: journalsResult.error.message },
				{ status: 500 },
			);
		}

		// Build a map of tag id -> tag for quick lookup
		const tagMap = new Map<number, any>();
		if (tagsResult.data) {
			for (const tag of tagsResult.data) {
				tagMap.set(tag.id, {
					id: tag.id,
					userId: tag.user_id,
					name: tag.name,
					color: tag.color || "gray",
					createdAt: tag.created_at,
				});
			}
		}

		// Transform to camelCase and resolve tag_ids to full tag objects
		const journals = (journalsResult.data || []).map((item) => ({
			id: item.id,
			userId: item.user_id,
			journalData: item.memory_data,
			createdAt: item.created_at,
			tagIds: item.tag_ids || [],
			tags: (item.tag_ids || [])
				.map((id: number) => tagMap.get(id))
				.filter(Boolean),
		}));

		const total = countResult.count ?? 0;

		return NextResponse.json({
			journals,
			total,
			hasMore: offset + limit < total,
		});
	} catch (error) {
		console.error("Error fetching journal entries:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// POST: Create new journal entry with embedding and tags
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

		const { journalData, tagIds, createdAt } = await request.json();

		if (!journalData) {
			return NextResponse.json(
				{ error: "Journal entry content is required" },
				{ status: 400 },
			);
		}

		if (!tagIds || tagIds.length === 0) {
			return NextResponse.json(
				{ error: "At least one tag is required" },
				{ status: 400 },
			);
		}

		// Generate embedding for the journal entry content
		const embedding = await generateEmbedding(journalData);
		console.log(`Generated embedding with ${embedding.length} dimensions`);

		const { data, error } = await supabase
			.from("memories")
			.insert({
				user_id: user.id,
				memory_data: journalData,
				tag_ids: tagIds,
				embedding: embedding,
				created_at: createdAt || new Date().toISOString(),
			})
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({
			journal: {
				id: data.id,
				userId: data.user_id,
				journalData: data.memory_data,
				createdAt: data.created_at,
				tagIds: data.tag_ids || [],
				tags: [],
			},
		});
	} catch (error) {
		console.error("Error creating journal entry:", error);
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
