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
		setMessages((prev) => [...prev, userMessage]);

		// Simulate a delay then add fake assistant response
		await new Promise((resolve) => setTimeout(resolve, 500));

		const assistantMessage: ConversationMessage = {
			id: crypto.randomUUID(),
			conversationId,
			userId: null,
			role: "assistant",
			content: "Automated message",
			createdAt: new Date().toISOString(),
		};
		setMessages((prev) => [...prev, assistantMessage]);

		setIsLoading(false);
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
