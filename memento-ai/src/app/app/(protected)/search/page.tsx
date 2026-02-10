"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Memory } from "@/types";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";

export default function SearchPage() {
	const router = useRouter();
	const [memories, setMemories] = useState<Memory[]>([]);
	const [query, setQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [error, setError] = useState("");

	const handleSearch = async (searchQuery: string) => {
		setIsLoading(true);
		setError("");
		setQuery(searchQuery);

		try {
			const response = await fetch("/api/search/keyword", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query: searchQuery, matchCount: 5 }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Search failed");
			}

			setMemories(data.memories);
			setHasSearched(true);
		} catch (err) {
			console.error("Search error:", err);
			setError(err instanceof Error ? err.message : "Search failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background">
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

						<h1 className="text-xl font-bold text-primary">
							Search
						</h1>

						<div className="w-16"></div>
					</div>
				</div>
			</header>

			{/* Search Bar */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<SearchBar onSearch={handleSearch} isLoading={isLoading} />
			</div>

			{/* Error Display */}
			{error && (
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
					<div className="rounded-xl bg-error-light p-4 border border-error/20">
						<p className="text-sm text-error">{error}</p>
					</div>
				</div>
			)}

			{/* Results */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
				<SearchResults
					memories={memories}
					query={query}
					isLoading={isLoading}
					hasSearched={hasSearched}
				/>
			</main>
		</div>
	);
}
