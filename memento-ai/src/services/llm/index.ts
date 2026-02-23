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

// ============================================================================
// Main Chat Completion Function
// ============================================================================

export async function chatCompletion(
	messages: MessageInput[],
	config: LLMConfig = {},
): Promise<LLMResponse> {
	const client = getClient();

	if (!config.systemPrompt) {
		throw new Error("systemPrompt is required in config");
	}

	const messagesWithSystem: ChatCompletionMessageParam[] = [
		{ role: "system", content: config.systemPrompt },
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
