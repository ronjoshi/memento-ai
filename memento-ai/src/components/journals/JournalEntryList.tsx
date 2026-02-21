"use client";

import { JournalEntry } from "@/types";
import JournalEntryCard from "./JournalEntryCard";

interface JournalEntryListProps {
	entries: JournalEntry[];
	isLoading: boolean;
	isLoadingMore?: boolean;
	hasMore?: boolean;
	onLoadMore?: () => void;
	onEdit?: (entry: JournalEntry) => void;
	onDelete?: (entry: JournalEntry) => void;
}

export default function JournalEntryList({
	entries,
	isLoading,
	isLoadingMore = false,
	hasMore = false,
	onLoadMore,
	onEdit,
	onDelete,
}: JournalEntryListProps) {
	if (isLoading) {
		return (
			<div className="space-y-4">
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className="bg-card rounded-xl shadow-sm border border-card-border p-4 animate-pulse"
					>
						<div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
						<div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
						<div className="flex justify-between">
							<div className="h-5 bg-muted rounded w-16"></div>
							<div className="h-4 bg-muted rounded w-24"></div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (entries.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="text-muted-foreground mb-4">
					<svg
						className="mx-auto h-12 w-12"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-medium text-foreground mb-1">
					No journal entries yet
				</h3>
				<p className="text-muted-foreground">
					Create your first journal entry to get started.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{entries.map((entry) => (
				<JournalEntryCard
					key={entry.id}
					entry={entry}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			))}
			{hasMore && onLoadMore && (
				<div className="flex justify-center pt-4">
					<button
						onClick={onLoadMore}
						disabled={isLoadingMore}
						className="px-6 py-2 text-sm font-medium text-muted-foreground bg-card border border-card-border rounded-lg hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-50"
					>
						{isLoadingMore ? "Loading..." : "Load more"}
					</button>
				</div>
			)}
		</div>
	);
}
