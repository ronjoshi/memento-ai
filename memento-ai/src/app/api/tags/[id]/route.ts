import { createClient } from "@/lib/supabase/server";
import { TAG_COLORS } from "@/types";
import { NextRequest, NextResponse } from "next/server";

// PUT: Update tag name or color
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

		const tagId = parseInt(id, 10);
		if (isNaN(tagId)) {
			return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
		}

		const { name, color } = await request.json();

		const updateData: Record<string, unknown> = {};
		if (name !== undefined && typeof name === "string" && name.trim()) {
			updateData.name = name.trim();
		}
		if (color !== undefined && TAG_COLORS.includes(color)) {
			updateData.color = color;
		}

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json(
				{ error: "No valid fields to update" },
				{ status: 400 },
			);
		}

		const { data, error } = await supabase
			.from("tags")
			.update(updateData)
			.eq("id", tagId)
			.eq("user_id", user.id)
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({
			tag: {
				id: data.id,
				userId: data.user_id,
				name: data.name,
				color: data.color || "gray",
				createdAt: data.created_at,
			},
		});
	} catch (error) {
		console.error("Error updating tag:", error);
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

// DELETE: Delete tag
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

		const tagId = parseInt(id, 10);
		if (isNaN(tagId)) {
			return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
		}

		const { error } = await supabase
			.from("tags")
			.delete()
			.eq("id", tagId)
			.eq("user_id", user.id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting tag:", error);
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
