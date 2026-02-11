import {
	ConversationMessage,
	DisplayMessage,
	MemoryReference,
} from "@/types";

const MEMORY_SEARCH_TOOLS = ["search_by_keyword", "search_by_tag"];

interface ParsedToolResult {
	success: boolean;
	message: string;
	memories?: Array<{
		id: string;
		memoryData: string;
		createdAt: string;
	}>;
}

/**
 * Process messages for display:
 * - Filter out tool messages
 * - Filter out assistant messages without content
 * - Extract memories from tool results and attach to following assistant messages
 */
export function processMessagesForDisplay(
	messages: ConversationMessage[],
): DisplayMessage[] {
	const result: DisplayMessage[] = [];
	const pendingMemories: MemoryReference[] = [];

	for (const message of messages) {
		// Skip tool messages (they won't be rendered directly)
		if (message.role === "tool") {
			const memories = extractMemoriesFromToolResult(message, messages);
			pendingMemories.push(...memories);
			continue;
		}

		// Skip assistant messages with no content
		if (message.role === "assistant") {
			const hasContent = message.content && message.content.trim() !== "";

			if (!hasContent) {
				continue;
			}

			// Attach any pending memories to this assistant message
			const displayMessage: DisplayMessage = {
				...message,
				attachedMemories:
					pendingMemories.length > 0 ? [...pendingMemories] : undefined,
			};

			// Clear pending memories after attaching
			pendingMemories.length = 0;
			result.push(displayMessage);
			continue;
		}

		// User messages pass through unchanged
		result.push({ ...message });
	}

	return result;
}

function extractMemoriesFromToolResult(
	toolMessage: ConversationMessage,
	allMessages: ConversationMessage[],
): MemoryReference[] {
	if (!toolMessage.tool_call_id || !toolMessage.content) {
		return [];
	}

	// Find the parent assistant message with the matching tool call
	const parentMessage = allMessages.find(
		(m) =>
			m.role === "assistant" &&
			m.tool_calls?.some((tc) => tc.id === toolMessage.tool_call_id),
	);

	if (!parentMessage) return [];

	// Check if this tool call was a memory search
	const toolCall = parentMessage.tool_calls?.find(
		(tc) => tc.id === toolMessage.tool_call_id,
	);

	if (!toolCall || !MEMORY_SEARCH_TOOLS.includes(toolCall.function.name)) {
		return [];
	}

	// Parse the tool result
	try {
		const parsed: ParsedToolResult = JSON.parse(toolMessage.content);
		if (parsed.success && parsed.memories && parsed.memories.length > 0) {
			return parsed.memories.map((m) => ({
				id: m.id,
				memoryData: m.memoryData,
				createdAt: m.createdAt,
			}));
		}
	} catch (e) {
		console.error("Failed to parse tool result:", e);
	}

	return [];
}
