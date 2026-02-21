"use client";

import { JournalEntry } from "@/types";
import JournalEntryCard from "@/components/journals/JournalEntryCard";

interface SearchResultsProps {
	entries: JournalEntry[];
	query: string;
	isLoading: boolean;
	hasSearched: boolean;
}

export default function SearchResults({
	entries,
	query,
	isLoading,
	hasSearched,
}: SearchResultsProps) {
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

	if (!hasSearched) {
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
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-medium text-foreground mb-1">
					Search your journal
				</h3>
				<p className="text-muted-foreground">
					Enter a query to find relevant journal entries using AI-powered
					semantic search.
				</p>
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
							d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-medium text-foreground mb-1">
					No results found
				</h3>
				<p className="text-muted-foreground">
					No journal entries matched &quot;{query}&quot;. Try a different
					search term.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground">
				Found {entries.length} result{entries.length !== 1 ? "s" : ""}{" "}
				for &quot;{query}&quot;
			</div>
			{entries.map((entry) => (
				<JournalEntryCard key={entry.id} entry={entry} />
			))}
		</div>
	);
}
