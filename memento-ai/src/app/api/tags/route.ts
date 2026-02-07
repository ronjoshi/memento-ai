import { createClient } from "@/lib/supabase/server";
import { TagColor } from "@/types";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all tags for authenticated user
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
			.from("tags")
			.select("*")
			.eq("user_id", user.id)
			.order("name", { ascending: true });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		const tags = (data || []).map((item) => ({
			id: item.id,
			userId: item.user_id,
			name: item.name,
			color: item.color || "gray",
			createdAt: item.created_at,
		}));

		return NextResponse.json({ tags });
	} catch (error) {
		console.error("Error fetching tags:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// POST: Create new tag with name and color
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

		const { name, color } = await request.json();

		if (!name || typeof name !== "string" || !name.trim()) {
			return NextResponse.json(
				{ error: "Tag name is required" },
				{ status: 400 },
			);
		}

		const validColors: TagColor[] = [
			"gray",
			"brown",
			"orange",
			"yellow",
			"green",
			"blue",
			"purple",
			"pink",
			"red",
		];

		const tagColor: TagColor = validColors.includes(color) ? color : "gray";

		const { data, error } = await supabase
			.from("tags")
			.insert({
				user_id: user.id,
				name: name.trim(),
				color: tagColor,
			})
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
		console.error("Error creating tag:", error);
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
