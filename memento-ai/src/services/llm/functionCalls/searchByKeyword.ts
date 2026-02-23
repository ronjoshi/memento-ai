import { FunctionDefinition } from "@/services/llm/types";

/**
 * Tool definition for searching user journal entries by keyword (semantic search)
 */
export const SEARCH_BY_KEYWORD_TOOL: FunctionDefinition = {
	name: "search_by_keyword",
	description:
		"Search the user's journal entries using hybrid RAG (semantic vector similarity + lexical keyword matching). This combines meaning-based retrieval with exact text matching (e.g., names, phrases, unique terms). Use this for most recall tasks — especially when the user provides specific wording, names, events, emotions, or quotes. You can provide MULTIPLE queries in a single call to search for different retrievable content in parallel — results are combined and deduplicated. Write each query as a descriptive, content-rich statement that resembles the journal entry you expect to find. Include both conceptual themes and concrete details. Do NOT create queries for analytical or synthesis questions (e.g., 'how do I cope', 'what patterns emerge', 'what do I do afterward') — the Messenger agent will handle those after reviewing the retrieved entries. Use startTime/endTime when the user references a time period (convert natural language like 'last month' or 'in 2024' to ISO 8601 using the user's timezone). If results are too broad or off-target, call again with refined or more specific queries.",
	parameters: {
		type: "object",
		properties: {
			queries: {
				type: "array",
				items: {
					type: "string",
				},
				description:
					"Array of hybrid search queries to execute in parallel (1-5 queries). Each query is used for both semantic embedding similarity and lexical keyword matching. Write each as a descriptive, keyword-rich statement that resembles journal content — NOT as a question. Each query must sound like something the user would actually write in a journal entry. Include emotions, events, names, relationships, places, beliefs, and body sensations when relevant. If the user provides an exact phrase, include it verbatim (e.g., I can't do this anymore, Dr. Patel, Barcelona trip). Avoid vague questions like 'when did I feel sad?'. Instead write: 'feeling sad and rejected after argument with my partner, wanting reassurance'. For complex questions, break the topic into narrow, focused queries targeting different retrievable events or experiences — NOT to rephrase the same topic from analytical angles. Drop any part of the user's question that asks for analysis, patterns, or 'what happens next' — those are answered by the Messenger from the entries you retrieve.",
			},
			maxResultsPerQuery: {
				type: "number",
				description:
					"Maximum number of results to retrieve per individual query (1-20, default: 10). Use lower values (5-7) when queries are broad, higher values (10-15) when queries are very specific.",
			},
			totalMaxResults: {
				type: "number",
				description:
					"Maximum total number of unique journal entries to return after combining and deduplicating results from all queries (1-50, default: 30). The tool will return up to this many entries, prioritizing entries that match multiple queries.",
			},
			startTime: {
				type: "string",
				description:
					"Optional ISO 8601 datetime for the start of the search range (e.g., '2025-01-01T00:00:00Z'). Infer from natural language time references like 'last month', 'in 2024', 'this summer'.",
			},
			endTime: {
				type: "string",
				description:
					"Optional ISO 8601 datetime for the end of the search range (e.g., '2025-12-31T23:59:59Z'). Infer from natural language time references like 'last month', 'in 2024', 'this summer'.",
			},
		},
		required: ["queries"],
	},
};

/**
 * Arguments for the search_by_keyword function
 */
export interface SearchByKeywordArgs {
	queries: string[];
	maxResultsPerQuery?: number;
	totalMaxResults?: number;
	startTime?: string;
	endTime?: string;
}

/**
 * Execute the search_by_keyword tool
 * @param args - The parsed arguments from the tool call
 * @returns A string representation of the search results
 */
export async function executeSearchByKeyword(
	args: SearchByKeywordArgs,
): Promise<string> {
	try {
		const {
			queries,
			maxResultsPerQuery = 10,
			totalMaxResults = 30,
			startTime,
			endTime,
		} = args;

		// Validate queries array
		if (!queries || queries.length === 0) {
			return JSON.stringify({
				success: false,
				message: "At least one query is required",
				journals: [],
			});
		}

		if (queries.length > 5) {
			return JSON.stringify({
				success: false,
				message: "Maximum 5 queries allowed per call",
				journals: [],
			});
		}

		// Execute all queries in parallel
		const searchPromises = queries.map((query) =>
			fetch("/api/search/keyword", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					query,
					matchCount: maxResultsPerQuery,
					startTime,
					endTime,
				}),
			}).then(async (response) => {
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						errorData.error || "Failed to search journal entries",
					);
				}
				return response.json();
			}),
		);

		const results = await Promise.all(searchPromises);

		// Combine and deduplicate results by journal ID
		const seenIds = new Set<string>();
		const journalMatchCounts = new Map<string, number>();
		const allJournals: any[] = [];

		for (const result of results) {
			const journals = result.journals || [];
			for (const journal of journals) {
				if (!seenIds.has(journal.id)) {
					seenIds.add(journal.id);
					allJournals.push(journal);
					journalMatchCounts.set(journal.id, 1);
				} else {
					// Increment match count for journals that appear in multiple queries
					journalMatchCounts.set(
						journal.id,
						(journalMatchCounts.get(journal.id) || 0) + 1,
					);
				}
			}
		}

		// Sort by match count (descending) to prioritize journals matching multiple queries
		allJournals.sort((a, b) => {
			const countA = journalMatchCounts.get(a.id) || 0;
			const countB = journalMatchCounts.get(b.id) || 0;
			return countB - countA;
		});

		// Limit total results
		const limitedJournals = allJournals.slice(0, totalMaxResults);

		if (limitedJournals.length === 0) {
			return JSON.stringify({
				success: true,
				message: `No journal entries found matching ${queries.length} ${queries.length === 1 ? "query" : "queries"}.`,
				journals: [],
				queriesExecuted: queries,
			});
		}

		return JSON.stringify({
			success: true,
			message: `Found ${limitedJournals.length} unique journal entries from ${queries.length} ${queries.length === 1 ? "query" : "queries"}${allJournals.length > limitedJournals.length ? ` (limited from ${allJournals.length} total matches)` : ""}.`,
			journals: limitedJournals,
			queriesExecuted: queries,
		});
	} catch (error) {
		console.error("Error executing search_by_keyword:", error);
		return JSON.stringify({
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to search journal entries",
			journals: [],
		});
	}
}
