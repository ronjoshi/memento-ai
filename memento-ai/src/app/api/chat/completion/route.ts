import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatCompletion, ChatMessage, LLMModel } from "@/services/llm";

export async function POST(request: NextRequest) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { messages, model, temperature, maxTokens } = await request.json();

		if (!messages || !Array.isArray(messages) || messages.length === 0) {
			return NextResponse.json(
				{ error: "messages array is required" },
				{ status: 400 },
			);
		}

		// Validate message format
		const validatedMessages: ChatMessage[] = messages.map(
			(msg: { role?: string; content?: string }) => {
				if (!msg.role || !msg.content) {
					throw new Error("Each message must have role and content");
				}
				if (!["user", "assistant", "system"].includes(msg.role)) {
					throw new Error("Invalid message role");
				}
				return {
					role: msg.role as "user" | "assistant" | "system",
					content: String(msg.content),
				};
			},
		);

		// Validate model if provided
		let validatedModel: LLMModel | undefined;
		if (model) {
			if (!Object.values(LLMModel).includes(model)) {
				return NextResponse.json(
					{ error: `Invalid model. Valid options: ${Object.values(LLMModel).join(", ")}` },
					{ status: 400 },
				);
			}
			validatedModel = model as LLMModel;
		}

		const response = await chatCompletion(validatedMessages, {
			model: validatedModel,
			temperature,
			maxTokens,
		});

		return NextResponse.json({ content: response });
	} catch (error) {
		console.error("Chat completion error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to get response",
			},
			{ status: 500 },
		);
	}
}
