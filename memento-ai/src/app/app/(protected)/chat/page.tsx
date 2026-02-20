"use client";

import { useRouter } from "next/navigation";
import { useChat } from "@/contexts/ChatContext";
import ChatMessageList from "@/components/chat/ChatMessageList";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
	const router = useRouter();
	const { messages, isLoading, sendMessage, clearChat } = useChat();

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Header */}
			<header className="bg-card shadow-sm border-b border-card-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<button
							onClick={() => router.push("/app/memories")}
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

						<h1 className="text-xl font-bold text-primary">Chat</h1>

						<button
							onClick={clearChat}
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Clear chat
						</button>
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
