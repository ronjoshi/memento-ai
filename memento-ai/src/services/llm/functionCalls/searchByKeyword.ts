import { FunctionDefinition } from "@/services/llm/types";

/**
 * Tool definition for searching user journal entries by keyword (semantic search)
 */
export const SEARCH_BY_KEYWORD_TOOL: FunctionDefinition = {
	name: "search_by_keyword",
	description:
		"Search the user's journal entries using hybrid RAG (semantic vector similarity + lexical keyword matching). This combines meaning-based retrieval with exact text matching (e.g., names, phrases, unique terms). Use this for most recall tasks — especially when the user provides specific wording, names, events, emotions, or quotes. Write the query as a descriptive, content-rich statement that resembles the journal entry you expect to find. Include both conceptual themes and concrete details. Use startTime/endTime when the user references a time period (convert natural language like 'last month' or 'in 2024' to ISO 8601 using the user's timezone). If results are too broad or off-target, call again with a refined or more specific query.",
	parameters: {
		type: "object",
		properties: {
			query: {
				type: "string",
				description:
					"A hybrid search query used for both semantic embedding similarity and lexical keyword matching. Write this as a descriptive, keyword-rich statement that resembles journal content — NOT as a question. Include emotions, events, names, relationships, places, beliefs, conflicts, outcomes, and body sensations when relevant. If the user provides an exact phrase, include it verbatim in the query (e.g., I can't do this anymore, Dr. Patel, Barcelona trip). Avoid vague questions like 'when did I feel sad?'. Instead write: 'feeling sad and rejected after argument with my partner, wanting reassurance'. Pack the query with meaningful terms to maximize both semantic and keyword overlap.",
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
		required: ["query"],
	},
};

/**
 * Arguments for the search_by_keyword function
 */
export interface SearchByKeywordArgs {
	query: string;
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
		const response = await fetch("/api/search/keyword", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				query: args.query,
				matchCount: 5,
				startTime: args.startTime,
				endTime: args.endTime,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.error || "Failed to search journal entries",
			);
		}

		const data = await response.json();
		const journals = data.journals || [];

		if (journals.length === 0) {
			return JSON.stringify({
				success: true,
				message: "No journal entries found matching the search query.",
				journals: [],
			});
		}

		return JSON.stringify({
			success: true,
			message: `Found ${journals.length} relevant journal entries.`,
			journals,
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
