"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
	ReactNode,
} from "react";
import { ConversationMessage, ToolCall, LLMResponse } from "@/types";
import { executeTool } from "@/services/llm/functionCalls";

function createConversationMessage(
	conversationId: string,
	role: "user" | "assistant" | "tool",
	content: string | null,
	options?: {
		tool_calls?: ToolCall[];
		tool_call_id?: string;
		reasoning_content?: string;
		isPlanner?: boolean;
	},
): ConversationMessage {
	return {
		id: crypto.randomUUID(),
		conversationId,
		userId: null,
		role,
		content,
		createdAt: new Date().toISOString(),
		tool_calls: options?.tool_calls,
		tool_call_id: options?.tool_call_id,
		reasoning_content: options?.reasoning_content,
		isPlanner: options?.isPlanner,
	};
}

function prepareMessagesForAPI(messages: ConversationMessage[]) {
	return messages.map((msg) => ({
		role: msg.role,
		content: msg.content,
		tool_calls: msg.tool_calls,
		tool_call_id: msg.tool_call_id,
		reasoning_content: msg.reasoning_content,
	}));
}

interface ChatContextType {
	messages: ConversationMessage[];
	isLoading: boolean;
	sendMessage: (content: string) => Promise<void>;
	clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
	const [messages, setMessages] = useState<ConversationMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [conversationId, setConversationId] = useState(() =>
		crypto.randomUUID(),
	);
	const messagesRef = useRef<ConversationMessage[]>([]);

	// Helper to update both state and ref in sync
	const updateMessages = useCallback((msgs: ConversationMessage[]) => {
		// Log the newly added message(s)
		if (msgs.length > messagesRef.current.length) {
			const newMessages = msgs.slice(messagesRef.current.length);
			newMessages.forEach((msg) => {
				console.log("📨 New chat message:", {
					role: msg.role,
					content: msg.content,
					tool_calls: msg.tool_calls,
					tool_call_id: msg.tool_call_id,
					createdAt: msg.createdAt,
					id: msg.id,
				});
			});
		}
		messagesRef.current = msgs;
		setMessages(msgs);
	}, []);

	const sendMessage = useCallback(
		async (content: string) => {
			setIsLoading(true);

			const userMessage = createConversationMessage(
				conversationId,
				"user",
				content,
			);

			let currentMessages = [...messagesRef.current, userMessage];
			updateMessages(currentMessages);

			try {
				// ============================================================
				// Step 1: Planner agent — retrieves memories via tool calls
				// ============================================================
				const maxToolIterations = 5;
				let iterations = 0;

				while (iterations < maxToolIterations) {
					iterations++;

					const plannerResponse = await fetch("/api/chat/planner", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							messages: prepareMessagesForAPI(currentMessages),
						}),
					});

					if (!plannerResponse.ok) {
						const error = await plannerResponse.json();
						throw new Error(error.error || "Planner failed");
					}

					const plannerData: LLMResponse = await plannerResponse.json();

					// Add planner's assistant message (may contain tool_calls)
					const plannerMessage = createConversationMessage(
						conversationId,
						"assistant",
						plannerData.content,
						{
							tool_calls: plannerData.tool_calls,
							reasoning_content: plannerData.reasoning_content,
							isPlanner: true,
						},
					);
					currentMessages = [...currentMessages, plannerMessage];
					updateMessages(currentMessages);

					// If no tool calls, planner is done
					if (!plannerData.tool_calls || plannerData.tool_calls.length === 0) {
						break;
					}

					console.log(
						`Planner tool call iteration ${iterations}:`,
						plannerData.tool_calls.map((tc) => tc.function.name),
					);

					// Execute each tool call
					for (const toolCall of plannerData.tool_calls) {
						console.log(
							`Executing tool: ${toolCall.function.name}`,
							toolCall.function.arguments,
						);

						const result = await executeTool(
							toolCall.function.name,
							toolCall.function.arguments,
						);

						console.log(
							`Tool result for ${toolCall.function.name}:`,
							result,
						);

						const toolResultMessage = createConversationMessage(
							conversationId,
							"tool",
							result,
							{ tool_call_id: toolCall.id },
						);
						currentMessages = [...currentMessages, toolResultMessage];
						updateMessages(currentMessages);
					}
				}

				if (iterations >= maxToolIterations) {
					console.warn("Max planner tool iterations reached");
				}

				// ============================================================
				// Step 2: Messenger agent — generates final user-facing response
				// ============================================================
				const messengerResponse = await fetch("/api/chat/messenger", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						messages: prepareMessagesForAPI(currentMessages),
					}),
				});

				if (!messengerResponse.ok) {
					const error = await messengerResponse.json();
					throw new Error(error.error || "Messenger failed");
				}

				const messengerData: LLMResponse = await messengerResponse.json();

				const messengerMessage = createConversationMessage(
					conversationId,
					"assistant",
					messengerData.content?.trim() ?? null,
					{
						reasoning_content: messengerData.reasoning_content,
					},
				);
				currentMessages = [...currentMessages, messengerMessage];
				updateMessages(currentMessages);
			} catch (error) {
				console.error("Error sending message:", error);
				const errorMessage = createConversationMessage(
					conversationId,
					"assistant",
					"Sorry, I encountered an error. Please try again.",
				);
				updateMessages([...messagesRef.current, errorMessage]);
			} finally {
				setIsLoading(false);
			}
		},
		[conversationId, updateMessages],
	);

	const clearChat = useCallback(() => {
		updateMessages([]);
		setConversationId(crypto.randomUUID());
	}, [updateMessages]);

	return (
		<ChatContext.Provider
			value={{ messages, isLoading, sendMessage, clearChat }}
		>
			{children}
		</ChatContext.Provider>
	);
}

export function useChat() {
	const context = useContext(ChatContext);
	if (context === undefined) {
		throw new Error("useChat must be used within a ChatProvider");
	}
	return context;
}
