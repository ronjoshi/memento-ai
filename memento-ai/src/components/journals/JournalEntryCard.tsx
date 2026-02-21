"use client";

import { useState, useRef, useEffect } from "react";
import { JournalEntry } from "@/types";
import { formatDate } from "@/utils/date";
import TagBadge from "@/components/tags/TagBadge";

interface JournalEntryCardProps {
	entry: JournalEntry;
	onEdit?: (entry: JournalEntry) => void;
	onDelete?: (entry: JournalEntry) => void;
}

export default function JournalEntryCard({
	entry,
	onEdit,
	onDelete,
}: JournalEntryCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [showExpandButton, setShowExpandButton] = useState(false);
	const textRef = useRef<HTMLParagraphElement>(null);
	const hasTags = entry.tags && entry.tags.length > 0;

	useEffect(() => {
		const el = textRef.current;
		if (!el) return;

		// Check if text is clamped in collapsed mode
		const isOverflowing = el.scrollHeight > el.clientHeight;

		// Check if whitespace-pre-wrap would make it taller than 3 lines
		const originalWhiteSpace = el.style.whiteSpace;
		const originalWebkitLineClamp = el.style.webkitLineClamp;
		const originalOverflow = el.style.overflow;
		const originalDisplay = el.style.display;

		el.style.whiteSpace = "pre-wrap";
		el.style.webkitLineClamp = "unset";
		el.style.overflow = "visible";
		el.style.display = "block";
		const expandedHeight = el.scrollHeight;

		el.style.whiteSpace = originalWhiteSpace;
		el.style.webkitLineClamp = originalWebkitLineClamp;
		el.style.overflow = originalOverflow;
		el.style.display = originalDisplay;

		const clampedHeight = el.clientHeight;
		setShowExpandButton(isOverflowing || expandedHeight > clampedHeight);
	}, [entry.journalData]);

	return (
		<div className="bg-card rounded-xl shadow-sm border border-card-border p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 group">
			<div className="mb-3">
				{(onEdit || onDelete) && (
					<div className="float-right flex items-center gap-1 ml-2">
						{onEdit && (
							<button
								onClick={() => onEdit(entry)}
								className="p-1.5 text-muted-foreground hover:text-primary rounded-lg transition-colors"
								title="Edit"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</button>
						)}
						{onDelete && (
							<button
								onClick={() => onDelete(entry)}
								className="p-1.5 text-muted-foreground hover:text-error rounded-lg transition-colors"
								title="Delete"
							>
								<svg
									className="w-4 h-4"
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
							</button>
						)}
					</div>
				)}
				<p
					ref={textRef}
					className={`text-card-foreground text-base leading-relaxed ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-3"}`}
				>
					{entry.journalData}
				</p>
			</div>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{showExpandButton && (
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="p-1 text-muted-foreground hover:text-primary rounded-md transition-colors flex items-center gap-1 text-xs shrink-0"
							title={isExpanded ? "Collapse" : "Expand"}
						>
							<svg
								className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
							<span>{isExpanded ? "Collapse" : "Expand"}</span>
						</button>
					)}
					<div className="flex flex-wrap gap-1">
						{hasTags
							? entry.tags!.map((tag) => (
									<TagBadge
										key={tag.id}
										tag={tag}
										size="sm"
									/>
								))
							: null}
					</div>
				</div>
				<span className="text-xs text-muted-foreground">
					{formatDate(entry.createdAt)}
				</span>
			</div>
		</div>
	);
}
