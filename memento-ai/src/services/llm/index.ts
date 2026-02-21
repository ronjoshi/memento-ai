import OpenAI from "openai";
import type {
	ChatCompletionMessageParam,
	ChatCompletionTool,
	ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";

import {
	LLMModel,
	LLMConfig,
	LLMResponse,
	MessageInput,
	ToolCall,
	getModelIdentifier,
} from "./types";

// Re-export all types
export * from "./types";

// ============================================================================
// Client
// ============================================================================

function getClient(): OpenAI {
	const apiKey = process.env.OPENROUTER_API_KEY;

	if (!apiKey) {
		throw new Error("OPENROUTER_API_KEY not found in environment variables");
	}

	return new OpenAI({
		baseURL: "https://openrouter.ai/api/v1",
		apiKey,
	});
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MODEL = LLMModel.GEMINI_FLASH;
const DEFAULT_SYSTEM_PROMPT = `You are Memento, a warm and reflective AI companion who helps people explore, recall, and make sense of their personal journal. You feel like a trusted companion — someone who truly knows the user's story and helps them reconnect with it.

## Your Journal Tools

You have two tools to search the user's journal entries:

- **search_by_keyword**: Semantic search — finds journal entries by meaning, not just exact words. Use this for open, conceptual, or feeling-based queries.
- **search_by_tag**: Filters journal entries by tag labels (categories the user has applied). Use this when the user references a specific topic, person, place, or category.

## When to Search

- **Always search before answering any question about the user's past**, experiences, events, or what they've recorded.
- Use **search_by_keyword** for abstract or narrative queries (e.g. "times I felt proud", "what I was working on last year", "something about my dog").
- Use **search_by_tag** when the user mentions a specific category or label (e.g. "my work entries", "family stuff", "travel").
- **Combine both tools** for thorough recall — run keyword search AND tag search when a query could benefit from both.
- Use **startTime / endTime** date filters whenever the user references a time period (e.g. "last month", "in 2024", "this summer") — convert these to ISO 8601 format.
- For simple conversational questions or requests that clearly aren't about past journal entries, respond directly without searching.

## Journal Entry Data Structure

Each journal entry returned by your tools has this shape:
- **journalData** (string): The actual content of the journal entry — what the user recorded.
- **createdAt** (ISO timestamp): When the journal entry was saved.
- **tagIds** (array): Tag IDs associated with this journal entry (use for context, not for display).
- **id** (string): Unique journal entry identifier.

## How to Respond

**When journal entries are found:**
- Weave them into a warm, narrative answer. Quote or paraphrase \`journalData\` naturally — don't just dump a list.
- Note when entries were created if it adds context ("back in March...", "you recorded this last summer...").
- If multiple journal entries are relevant, synthesize them into a coherent reflection.

**When no journal entries are found:**
- Be honest and gentle. Let the user know you couldn't find anything on that topic.
- Suggest they may not have recorded anything about it yet, and invite them to share more if they'd like.

**General tone:**
- Warm, reflective, and personal — like a thoughtful companion who knows their story.
- Never clinical, robotic, or list-heavy unless explicitly helpful.
- Use "you" naturally — you're speaking directly to the person whose journal this is.`;

// ============================================================================
// Main Chat Completion Function
// ============================================================================

export async function chatCompletion(
	messages: MessageInput[],
	config: LLMConfig = {},
): Promise<LLMResponse> {
	const client = getClient();

	const systemPrompt = config.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
	const messagesWithSystem: ChatCompletionMessageParam[] = [
		{ role: "system", content: systemPrompt },
		...messages.map(convertToOpenAIMessage),
	];

	// Build request options
	const model = getModelIdentifier(config.model || DEFAULT_MODEL);

	// Convert tools to OpenAI format
	const tools: ChatCompletionTool[] | undefined = config.tools?.map(
		(tool) => ({
			type: "function" as const,
			function: tool,
		}),
	);

	// Convert tool choice
	let toolChoice: ChatCompletionToolChoiceOption | undefined;
	if (config.toolChoice) {
		if (typeof config.toolChoice === "string") {
			toolChoice = config.toolChoice;
		} else {
			toolChoice = config.toolChoice;
		}
	}

	// Make the API call
	const response = await client.chat.completions.create({
		model,
		messages: messagesWithSystem,
		temperature: config.temperature,
		max_tokens: config.maxTokens,
		tools,
		tool_choice: toolChoice,
		// @ts-expect-error - OpenRouter-specific reasoning parameter
		reasoning: config.reasoning ? { enabled: true } : undefined,
	});

	const choice = response.choices[0];
	if (!choice) {
		throw new Error("No response from OpenRouter API");
	}

	// Extract reasoning_content if present (OpenRouter extension)
	const message = choice.message as typeof choice.message & {
		reasoning_content?: string;
	};

	// Map tool calls if present
	let toolCalls: ToolCall[] | undefined;
	if (message.tool_calls) {
		toolCalls = message.tool_calls
			.filter(
				(
					tc,
				): tc is OpenAI.Chat.Completions.ChatCompletionMessageToolCall & {
					type: "function";
				} => tc.type === "function",
			)
			.map((tc) => ({
				id: tc.id,
				type: "function" as const,
				function: {
					name: tc.function.name,
					arguments: tc.function.arguments,
				},
			}));
	}

	return {
		content: message.content,
		reasoning_content: message.reasoning_content,
		tool_calls: toolCalls,
		finishReason: choice.finish_reason,
	};
}

// ============================================================================
// Helper Functions
// ============================================================================

function convertToOpenAIMessage(msg: MessageInput): ChatCompletionMessageParam {
	if (msg.role === "tool") {
		return {
			role: "tool",
			tool_call_id: msg.tool_call_id,
			content: msg.content,
		};
	}

	if (msg.role === "assistant") {
		const assistantMsg: ChatCompletionMessageParam = {
			role: "assistant",
			content: msg.content,
		};

		if (msg.tool_calls && msg.tool_calls.length > 0) {
			(
				assistantMsg as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
			).tool_calls = msg.tool_calls.map((tc) => ({
				id: tc.id,
				type: "function" as const,
				function: {
					name: tc.function.name,
					arguments: tc.function.arguments,
				},
			}));
		}

		return assistantMsg;
	}

	// User or system message
	return {
		role: msg.role,
		content: msg.content || "",
	};
}
