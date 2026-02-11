"use client";

import { DisplayMessage } from "@/types";
import { formatDate } from "@/utils/date";
import MemoryPill from "./MemoryPill";

interface ChatMessageProps {
	message: DisplayMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
	const isUser = message.role === "user";
	const hasMemories =
		message.attachedMemories && message.attachedMemories.length > 0;

	return (
		<div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
			<div
				className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}
			>
				{/* Memory pills above assistant message */}
				{!isUser && hasMemories && (
					<div className="flex flex-col gap-1 mb-1">
						{message.attachedMemories!.map((memory) => (
							<MemoryPill key={memory.id} memory={memory} />
						))}
					</div>
				)}

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
