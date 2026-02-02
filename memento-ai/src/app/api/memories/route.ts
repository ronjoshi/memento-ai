import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/services/embeddings";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all memories for authenticated user
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

		const { data, error } = await supabase
			.from("memories")
			.select("*")
			.eq("user_id", user.id)
			.order("created_at", { ascending: false });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// Transform to camelCase for frontend
		const memories = (data || []).map((item) => ({
			id: item.id,
			userId: item.user_id,
			memoryData: item.memory_data,
			tag: item.tag,
			createdAt: item.created_at,
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

// POST: Create new memory with embedding
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

		const { memoryData, tag } = await request.json();

		if (!memoryData || !tag) {
			return NextResponse.json(
				{ error: "Memory content and tag are required" },
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
				tag: tag,
				embedding: embedding,
				created_at: new Date().toISOString(),
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
				tag: data.tag,
				createdAt: data.created_at,
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
