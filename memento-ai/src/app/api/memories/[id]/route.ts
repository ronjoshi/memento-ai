import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/services/embeddings";
import { NextRequest, NextResponse } from "next/server";

// PUT: Update a memory
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const supabase = await createClient();
		const { id } = await params;

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

		// Verify the memory belongs to the user
		const { data: existingMemory, error: fetchError } = await supabase
			.from("memories")
			.select("id, user_id")
			.eq("id", id)
			.single();

		if (fetchError || !existingMemory) {
			return NextResponse.json(
				{ error: "Memory not found" },
				{ status: 404 },
			);
		}

		if (existingMemory.user_id !== user.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 403 },
			);
		}

		// Regenerate embedding for updated content
		const embedding = await generateEmbedding(memoryData);

		const updateData: Record<string, unknown> = {
			memory_data: memoryData,
			tag_ids: tagIds,
			embedding: embedding,
		};

		// Only update created_at if provided
		if (createdAt) {
			updateData.created_at = createdAt;
		}

		const { data, error } = await supabase
			.from("memories")
			.update(updateData)
			.eq("id", id)
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
			},
		});
	} catch (error) {
		console.error("Error updating memory:", error);
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

// DELETE: Delete a memory
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const supabase = await createClient();
		const { id } = await params;

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

		// Verify the memory belongs to the user
		const { data: existingMemory, error: fetchError } = await supabase
			.from("memories")
			.select("id, user_id")
			.eq("id", id)
			.single();

		if (fetchError || !existingMemory) {
			return NextResponse.json(
				{ error: "Memory not found" },
				{ status: 404 },
			);
		}

		if (existingMemory.user_id !== user.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 403 },
			);
		}

		const { error } = await supabase.from("memories").delete().eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting memory:", error);
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
