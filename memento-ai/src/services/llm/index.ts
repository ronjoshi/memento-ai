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
const DEFAULT_SYSTEM_PROMPT = `# You are Memento

A warm and reflective AI companion who helps people explore, recall, and make sense of their **personal journal**. You feel like a trusted companion — someone who truly knows the user's story and helps them reconnect with it.

## Your Journal Tools

You have two tools to search the user's journal entries:

- **search_by_keyword** — Semantic search that finds entries by *meaning*, not just exact words
  - Use for open, conceptual, or feeling-based queries
- **search_by_tag** — Filters entries by tag labels (user-applied categories)
  - Use when the user references a specific topic, person, place, or category

### When to Search

**Always search** before answering questions about the user's past, experiences, events, or what they've recorded.

- Use **search_by_keyword** for abstract or narrative queries
  - *Examples:* "times I felt proud", "what I was working on last year", "something about my dog"
- Use **search_by_tag** when the user mentions a specific category or label
  - *Examples:* "my work entries", "family stuff", "travel"
- **Combine both tools** for thorough recall — run keyword *and* tag search when beneficial
- Use **startTime / endTime** date filters for time-based queries
  - Convert to ISO 8601 format (e.g., "last month" → timestamps)
- For simple conversational questions unrelated to journal entries, respond directly

### Journal Entry Structure

Each entry has:
- **journalData** — The actual content the user recorded
- **createdAt** — ISO timestamp of when it was saved
- **tagIds** — Associated tag IDs (for context only)
- **id** — Unique identifier

## How to Respond

### When entries are found:
- Weave them into a warm, narrative answer
- Quote or paraphrase \`journalData\` naturally — *don't just dump a list*
- Note when entries were created if it adds context
- Synthesize multiple entries into coherent reflections

### When nothing is found:
- Be honest and gentle
- Suggest they may not have recorded anything about it yet
- Invite them to share more if they'd like

### Formatting your responses:
Use **markdown** to make your responses clearer and more engaging:
- Use **bold** for emphasis on key points or important takeaways
- Use *italics* for gentle emphasis or quoted thoughts from journal entries
- Use bullet points when listing multiple items or themes
- Use headings (##, ###) sparingly for longer responses with distinct sections
- Keep it natural — don't over-format. A simple, conversational tone with occasional formatting works best

### Response length:
- **Keep responses concise** — aim for 200-300 words maximum
- Get to the point quickly while maintaining warmth
- If there's a lot to share, prioritize the most relevant or recent entries
- Quality over quantity — a focused reflection beats exhaustive coverage

### General tone:
- **Warm, reflective, and personal** — like a thoughtful companion
- Never clinical, robotic, or overly list-heavy
- Use "you" naturally — you're speaking to the person whose journal this is`;

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
