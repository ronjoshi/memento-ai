"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationMessage, ToolCall } from "@/types";
import ChatMessageList from "@/components/chat/ChatMessageList";
import ChatInput from "@/components/chat/ChatInput";
import { executeTool } from "@/services/llm/functionCalls";

// LLM Response type from the API
interface LLMResponse {
	content: string | null;
	reasoning_content?: string;
	tool_calls?: ToolCall[];
	finishReason: string | null;
}

// Helper to convert LLM message format to ConversationMessage
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

// Helper to prepare messages for LLM API
function prepareMessagesForAPI(messages: ConversationMessage[]) {
	return messages.map((msg) => ({
		role: msg.role,
		content: msg.content,
		tool_calls: msg.tool_calls,
		tool_call_id: msg.tool_call_id,
		reasoning_content: msg.reasoning_content,
	}));
}

export default function ChatPage() {
	const router = useRouter();
	const [messages, setMessages] = useState<ConversationMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [conversationId] = useState(() => crypto.randomUUID());

	const sendMessage = async (content: string) => {
		setIsLoading(true);

		// Add user message locally
		const userMessage = createConversationMessage(
			conversationId,
			"user",
			content,
		);

		// Start with current messages + new user message
		let currentMessages = [...messages, userMessage];
		setMessages(currentMessages);

		try {
			const maxToolIterations = 5;
			let iterations = 0;

			// Tool execution loop - continues until LLM returns without tool calls
			while (iterations < maxToolIterations) {
				iterations++;

				// Call completion API
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

				// Add assistant response to messages
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

				// If no tool calls, we're done
				if (!data.tool_calls || data.tool_calls.length === 0) {
					break;
				}

				// Execute each tool call client-side
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

					console.log(`Tool result for ${toolCall.function.name}:`, result);

					// Add tool result message
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
			// Show error message to user
			const errorMessage = createConversationMessage(
				conversationId,
				"assistant",
				"Sorry, I encountered an error. Please try again.",
			);
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Header */}
			<header className="bg-card shadow-sm border-b border-card-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<button
							onClick={() => router.push("/memories")}
							className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
						>
							<svg
								className="w-5 h-5 mr-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							Back
						</button>

						<h1 className="text-xl font-bold text-foreground">Chat</h1>

						<div className="w-16"></div>
					</div>
				</div>
			</header>

			{/* Messages */}
			<ChatMessageList messages={messages} isLoading={isLoading} />

			{/* Input */}
			<ChatInput onSend={sendMessage} isLoading={isLoading} />
		</div>
	);
}
