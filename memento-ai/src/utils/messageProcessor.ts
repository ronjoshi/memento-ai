import {
	ConversationMessage,
	DisplayMessage,
	JournalReference,
} from "@/types";

const JOURNAL_SEARCH_TOOLS = ["search_by_keyword", "search_by_tag", "search_by_date"];

interface ParsedToolResult {
	success: boolean;
	message: string;
	journals?: Array<{
		id: string;
		journalData: string;
		createdAt: string;
	}>;
}

/**
 * Process messages for display:
 * - Filter out tool messages
 * - Filter out assistant messages without content
 * - Extract journal entries from tool results and attach to following assistant messages
 */
export function processMessagesForDisplay(
	messages: ConversationMessage[],
): DisplayMessage[] {
	const result: DisplayMessage[] = [];
	const pendingJournals: JournalReference[] = [];

	for (const message of messages) {
		// Skip tool messages (they won't be rendered directly)
		if (message.role === "tool") {
			const journals = extractJournalsFromToolResult(message, messages);
			pendingJournals.push(...journals);
			continue;
		}

		// Skip assistant messages with no content
		if (message.role === "assistant") {
			const hasContent = message.content && message.content.trim() !== "";

			if (!hasContent) {
				continue;
			}

			// Attach any pending journals to this assistant message
			const displayMessage: DisplayMessage = {
				...message,
				attachedJournals:
					pendingJournals.length > 0 ? [...pendingJournals] : undefined,
			};

			// Clear pending journals after attaching
			pendingJournals.length = 0;
			result.push(displayMessage);
			continue;
		}

		// User messages pass through unchanged
		result.push({ ...message });
	}

	return result;
}

function extractJournalsFromToolResult(
	toolMessage: ConversationMessage,
	allMessages: ConversationMessage[],
): JournalReference[] {
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

	// Check if this tool call was a journal search
	const toolCall = parentMessage.tool_calls?.find(
		(tc) => tc.id === toolMessage.tool_call_id,
	);

	if (!toolCall || !JOURNAL_SEARCH_TOOLS.includes(toolCall.function.name)) {
		return [];
	}

	// Parse the tool result
	try {
		const parsed: ParsedToolResult = JSON.parse(toolMessage.content);
		if (parsed.success && parsed.journals && parsed.journals.length > 0) {
			return parsed.journals.map((j) => ({
				id: j.id,
				journalData: j.journalData,
				createdAt: j.createdAt,
			}));
		}
	} catch (e) {
		console.error("Failed to parse tool result:", e);
	}

	return [];
}
