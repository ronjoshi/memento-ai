"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationMessage } from "@/types";
import ChatMessageList from "@/components/chat/ChatMessageList";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
	const router = useRouter();
	const [messages, setMessages] = useState<ConversationMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [conversationId] = useState(() => crypto.randomUUID());

	const sendMessage = async (content: string) => {
		setIsLoading(true);

		// Add user message locally
		const userMessage: ConversationMessage = {
			id: crypto.randomUUID(),
			conversationId,
			userId: null,
			role: "user",
			content,
			createdAt: new Date().toISOString(),
		};

		// Update state with user message
		const updatedMessages = [...messages, userMessage];
		setMessages(updatedMessages);

		try {
			// Prepare messages for LLM (only role and content needed)
			const chatMessages = updatedMessages.map((msg) => ({
				role: msg.role,
				content: msg.content,
			}));

			// Call completion API
			const response = await fetch("/api/chat/completion", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ messages: chatMessages }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to get response");
			}

			const data = await response.json();

			// Add assistant response
			const assistantMessage: ConversationMessage = {
				id: crypto.randomUUID(),
				conversationId,
				userId: null,
				role: "assistant",
				content: data.content,
				createdAt: new Date().toISOString(),
			};
			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error("Error sending message:", error);
			// Show error message to user
			const errorMessage: ConversationMessage = {
				id: crypto.randomUUID(),
				conversationId,
				userId: null,
				role: "assistant",
				content: "Sorry, I encountered an error. Please try again.",
				createdAt: new Date().toISOString(),
			};
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
