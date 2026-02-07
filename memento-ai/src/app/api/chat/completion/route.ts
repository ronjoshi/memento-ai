import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatCompletion } from "@/services/llm";
import { validateMessages, validateModel } from "@/services/llm/validation";
import { ALL_TOOLS } from "@/services/llm/functionCalls";

export async function POST(request: NextRequest) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { messages, model, temperature, maxTokens, reasoning } =
			await request.json();

		// Validate messages using shared validation utility
		const validatedMessages = validateMessages(messages);

		// Validate model using shared validation utility
		const validatedModel = validateModel(model);

		// Make single LLM call with tools - client handles the tool execution loop
		const response = await chatCompletion(validatedMessages, {
			model: validatedModel,
			temperature,
			maxTokens,
			reasoning,
			tools: ALL_TOOLS,
			toolChoice: "auto",
		});

		return NextResponse.json(response);
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
