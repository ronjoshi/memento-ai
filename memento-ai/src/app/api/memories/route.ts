import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/services/embeddings";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all memories for authenticated user (with tags)
export async function GET() {
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

		// Fetch memories and tags
		const [memoriesResult, tagsResult] = await Promise.all([
			supabase
				.from("memories")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false }),
			supabase.from("tags").select("*").eq("user_id", user.id),
		]);

		if (memoriesResult.error) {
			console.error("Error fetching memories:", memoriesResult.error);
			return NextResponse.json(
				{ error: memoriesResult.error.message },
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
		const memories = (memoriesResult.data || []).map((item) => ({
			id: item.id,
			userId: item.user_id,
			memoryData: item.memory_data,
			createdAt: item.created_at,
			tagIds: item.tag_ids || [],
			tags: (item.tag_ids || [])
				.map((id: number) => tagMap.get(id))
				.filter(Boolean),
		}));

		return NextResponse.json({ memories });
	} catch (error) {
		console.error("Error fetching memories:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// POST: Create new memory with embedding and tags
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

		const { memoryData, tagIds, createdAt } = await request.json();

		if (!memoryData) {
			return NextResponse.json(
				{ error: "Memory content is required" },
				{ status: 400 },
			);
		}

		if (!tagIds || tagIds.length === 0) {
			return NextResponse.json(
				{ error: "At least one tag is required" },
				{ status: 400 },
			);
		}

		// Generate embedding for the memory content
		const embedding = await generateEmbedding(memoryData);
		console.log(`Generated embedding with ${embedding.length} dimensions`);

		const { data, error } = await supabase
			.from("memories")
			.insert({
				user_id: user.id,
				memory_data: memoryData,
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
			memory: {
				id: data.id,
				userId: data.user_id,
				memoryData: data.memory_data,
				createdAt: data.created_at,
				tagIds: data.tag_ids || [],
				tags: [],
			},
		});
	} catch (error) {
		console.error("Error creating memory:", error);
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
