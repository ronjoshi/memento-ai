"use client";

import { ConversationMessage } from "@/types";
import { formatDate } from "@/utils/date";

interface ChatMessageProps {
	message: ConversationMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
	const isUser = message.role === "user";

	return (
		<div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
			<div
				className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}
			>
				<div
					className={`px-4 py-2 rounded-2xl ${
						isUser
							? "bg-primary text-primary-foreground"
							: "bg-muted text-foreground"
					}`}
				>
					<p className="text-sm whitespace-pre-wrap">{message.content}</p>
				</div>
				<span className="text-xs text-muted-foreground mt-1">
					{formatDate(message.createdAt)}
				</span>
			</div>
		</div>
	);
}
