"use client";

import { useEffect, useRef, useMemo } from "react";
import { ConversationMessage } from "@/types";
import { processMessagesForDisplay } from "@/utils/messageProcessor";
import ChatMessage from "./ChatMessage";

interface ChatMessageListProps {
	messages: ConversationMessage[];
	isLoading: boolean;
}

export default function ChatMessageList({
	messages,
	isLoading,
}: ChatMessageListProps) {
	const bottomRef = useRef<HTMLDivElement>(null);

	// Process messages: filter out tool messages and empty assistant messages,
	// attach memory references to assistant responses
	const displayMessages = useMemo(
		() => processMessagesForDisplay(messages),
		[messages],
	);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	if (displayMessages.length === 0 && !isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center">
					<svg
						className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
					<p className="text-muted-foreground">No messages yet</p>
					<p className="text-sm text-muted-foreground/70 mt-1">
						Start a conversation below
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto p-4 space-y-4">
			{displayMessages.map((message) => (
				<ChatMessage key={message.id} message={message} />
			))}
			{isLoading && (
				<div className="flex justify-start">
					<div className="bg-muted px-4 py-2 rounded-2xl">
						<div className="flex space-x-1">
							<div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
							<div
								className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
								style={{ animationDelay: "0.1s" }}
							/>
							<div
								className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
								style={{ animationDelay: "0.2s" }}
							/>
						</div>
					</div>
				</div>
			)}
			<div ref={bottomRef} />
		</div>
	);
}
