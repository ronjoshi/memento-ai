import { FunctionDefinition } from "@/services/llm/types";

/**
 * Tool definition for searching user journal entries by keyword (semantic search)
 */
export const SEARCH_BY_KEYWORD_TOOL: FunctionDefinition = {
	name: "search_by_keyword",
	description:
		"Search the user's journal entries using semantic (embedding-based) search. This finds journal entries by meaning and concept, not just exact word matches — making it ideal for open-ended, feeling-based, or narrative queries like 'times I felt proud', 'what I was working on last year', or 'something about my dog'. Prefer this tool for abstract or exploratory questions. Use startTime/endTime when the user mentions a time period (convert natural language like 'last month' or 'in 2024' to ISO 8601).",
	parameters: {
		type: "object",
		properties: {
			query: {
				type: "string",
				description:
					"A natural language query describing what you're looking for. Should capture the concept or meaning of what the user is asking about — not necessarily their exact words.",
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
