"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
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
					<div className="flex items-center">
						{/* Left: Logo (links to journals) */}
						<div className="flex-1">
							<button
								onClick={() => router.push("/app/journals")}
								className="flex items-center gap-2"
							>
								<Image
									src="/memento_logo.svg"
									alt="Memento"
									width={40}
									height={40}
									className="logo-cyan"
								/>
							</button>
						</div>

						{/* Center: Page title */}
						<h1 className="text-xl font-bold text-primary">Chat</h1>

						{/* Right: Clear button */}
						<div className="flex-1 flex justify-end">
						<button
							onClick={clearChat}
							className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-foreground transition-colors"
							title="Clear chat"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							<span className="text-[9px] leading-none">Clear</span>
						</button>
						</div>
					</div>
				</div>
			</header>

			{/* Messages */}
			<div className="flex-1 overflow-hidden max-w-7xl mx-auto w-full flex flex-col">
				<ChatMessageList messages={messages} isLoading={isLoading} />
			</div>

			{/* Input */}
			<div className="max-w-7xl mx-auto w-full">
				<ChatInput onSend={sendMessage} isLoading={isLoading} />
			</div>
		</div>
	);
}
