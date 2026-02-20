"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
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

	const sendMessage = useCallback(
		async (content: string) => {
			setIsLoading(true);

			const userMessage = createConversationMessage(
				conversationId,
				"user",
				content,
			);

			let currentMessages: ConversationMessage[] = [];
			setMessages((prev) => {
				currentMessages = [...prev, userMessage];
				return currentMessages;
			});

			try {
				const maxToolIterations = 5;
				let iterations = 0;

				while (iterations < maxToolIterations) {
					iterations++;

					const response = await fetch("/api/chat/completion", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							messages: prepareMessagesForAPI(currentMessages),
						}),
					});

					if (!response.ok) {
						const error = await response.json();
						throw new Error(error.error || "Failed to get response");
					}

					const data: LLMResponse = await response.json();

					const assistantMessage = createConversationMessage(
						conversationId,
						"assistant",
						data.content,
						{
							tool_calls: data.tool_calls,
							reasoning_content: data.reasoning_content,
						},
					);
					currentMessages = [...currentMessages, assistantMessage];
					setMessages(currentMessages);

					if (!data.tool_calls || data.tool_calls.length === 0) {
						break;
					}

					console.log(
						`Tool call iteration ${iterations}:`,
						data.tool_calls.map((tc) => tc.function.name),
					);

					for (const toolCall of data.tool_calls) {
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
						setMessages(currentMessages);
					}
				}

				if (iterations >= maxToolIterations) {
					console.warn("Max tool iterations reached");
				}
			} catch (error) {
				console.error("Error sending message:", error);
				const errorMessage = createConversationMessage(
					conversationId,
					"assistant",
					"Sorry, I encountered an error. Please try again.",
				);
				setMessages((prev) => [...prev, errorMessage]);
			} finally {
				setIsLoading(false);
			}
		},
		[conversationId],
	);

	const clearChat = useCallback(() => {
		setMessages([]);
		setConversationId(crypto.randomUUID());
	}, []);

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
