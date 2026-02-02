"use client";

import { useState, KeyboardEvent } from "react";

interface ChatInputProps {
	onSend: (content: string) => void;
	isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
	const [message, setMessage] = useState("");

	const handleSend = () => {
		if (message.trim() && !isLoading) {
			onSend(message.trim());
			setMessage("");
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex items-center gap-3 p-4 border-t border-border bg-card">
			<input
				type="text"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Type a message..."
				disabled={isLoading}
				className="flex-1 px-4 py-2 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
			/>
			<button
				onClick={handleSend}
				disabled={!message.trim() || isLoading}
				className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{isLoading ? (
					<svg
						className="w-5 h-5 animate-spin"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				) : (
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
							d="M5 10l7-7m0 0l7 7m-7-7v18"
						/>
					</svg>
				)}
			</button>
		</div>
	);
}
