"use client";

import { useEffect, useState } from "react";
import { DisplayMessage } from "@/types";
import { formatDate } from "@/utils/date";
import JournalPill from "./JournalPill";

interface ChatMessageProps {
	message: DisplayMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
	const isUser = message.role === "user";
	const hasJournals =
		message.attachedJournals && message.attachedJournals.length > 0;
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Trigger animation on mount
		const timer = setTimeout(() => setIsVisible(true), 10);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			className={`flex ${isUser ? "justify-end" : "justify-start"} transition-all duration-200 ease-out`}
			style={{
				opacity: isVisible ? 1 : 0,
				transform: isVisible ? "translateY(0)" : "translateY(5px)",
			}}
		>
			<div
				className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}
			>
				{/* Journal pills above assistant message */}
				{!isUser && hasJournals && (
					<div className="flex flex-col gap-1 mb-1">
						{message.attachedJournals!.map((entry) => (
							<JournalPill key={entry.id} entry={entry} />
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
