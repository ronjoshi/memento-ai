import {
	ChatMessage,
	ToolResultMessage,
	LLMModel,
	ToolCall,
	MessageInput,
} from "./types";

// ============================================================================
// Raw message type (unvalidated input)
// ============================================================================

export interface RawMessage {
	role?: string;
	content?: string | null;
	tool_call_id?: string;
	tool_calls?: ToolCall[];
	reasoning_content?: string;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a single message and returns a strongly typed MessageInput
 * @throws Error if message is invalid
 */
export function validateMessage(msg: RawMessage): MessageInput {
	if (!msg.role) {
		throw new Error("Each message must have a role");
	}

	// Tool result message
	if (msg.role === "tool") {
		if (!msg.tool_call_id || msg.content === undefined) {
			throw new Error("Tool messages must have tool_call_id and content");
		}
		const toolMessage: ToolResultMessage = {
			role: "tool",
			tool_call_id: msg.tool_call_id,
			content: String(msg.content),
		};
		return toolMessage;
	}

	// Regular chat message
	if (!["user", "assistant", "system"].includes(msg.role)) {
		throw new Error(
			`Invalid message role: ${msg.role}. Must be user, assistant, system, or tool`,
		);
	}

	const chatMsg: ChatMessage = {
		role: msg.role as "user" | "assistant" | "system",
		content: msg.content ?? null,
	};

	// Preserve tool_calls for assistant messages
	if (msg.role === "assistant" && msg.tool_calls) {
		chatMsg.tool_calls = msg.tool_calls;
	}

	// Preserve reasoning_content for assistant messages
	if (msg.role === "assistant" && msg.reasoning_content) {
		chatMsg.reasoning_content = msg.reasoning_content;
	}

	return chatMsg;
}

/**
 * Validates an array of messages
 * @throws Error if messages array is invalid or any message is invalid
 */
export function validateMessages(messages: unknown): MessageInput[] {
	if (!messages || !Array.isArray(messages)) {
		throw new Error("messages must be an array");
	}

	if (messages.length === 0) {
		throw new Error("messages array cannot be empty");
	}

	return messages.map((msg, index) => {
		try {
			return validateMessage(msg as RawMessage);
		} catch (error) {
			throw new Error(
				`Invalid message at index ${index}: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	});
}

/**
 * Validates and returns a model, or undefined if not provided
 * @throws Error if model is provided but invalid
 */
export function validateModel(model: unknown): LLMModel | undefined {
	if (model === undefined || model === null) {
		return undefined;
	}

	if (typeof model !== "string") {
		throw new Error("model must be a string");
	}

	if (!Object.values(LLMModel).includes(model as LLMModel)) {
		throw new Error(
			`Invalid model: ${model}. Valid options: ${Object.values(LLMModel).join(", ")}`,
		);
	}

	return model as LLMModel;
}
