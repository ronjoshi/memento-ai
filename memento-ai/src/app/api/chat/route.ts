import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DatabaseService } from "@/services/database";

export async function GET(request: NextRequest) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const conversationId = searchParams.get("conversationId");

	if (!conversationId) {
		return NextResponse.json(
			{ error: "conversationId is required" },
			{ status: 400 },
		);
	}

	try {
		const databaseService = new DatabaseService(supabase);
		const messages =
			await databaseService.fetchConversationMessages(conversationId);

		return NextResponse.json({ messages });
	} catch (error) {
		console.error("Error fetching messages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { conversationId, role, content } = await request.json();

		if (!conversationId || !role || !content) {
			return NextResponse.json(
				{ error: "conversationId, role, and content are required" },
				{ status: 400 },
			);
		}

		if (role !== "user" && role !== "assistant") {
			return NextResponse.json(
				{ error: "role must be 'user' or 'assistant'" },
				{ status: 400 },
			);
		}

		const databaseService = new DatabaseService(supabase);
		const message = await databaseService.insertConversationMessage(
			conversationId,
			role,
			content,
			user.id,
		);

		return NextResponse.json({ message });
	} catch (error) {
		console.error("Error inserting message:", error);
		return NextResponse.json(
			{ error: "Failed to send message" },
			{ status: 500 },
		);
	}
}
