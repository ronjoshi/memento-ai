import { FunctionDefinition } from "@/services/llm/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { EdgeFunctionService } from "@/services/edgeFunction";

// Raw journal entry type from edge function (snake_case)
interface RawJournalEntry {
	id: string;
	user_id: string;
	memory_data: string;
	tag_ids: number[];
	created_at: string;
	embedding?: number[];
}

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
		const supabase = getSupabaseBrowserClient();
		const edgeFunctionService = new EdgeFunctionService(supabase);

		const response = await edgeFunctionService.searchJournals(
			args.query,
			5, // matchCount
			args.startTime,
			args.endTime,
		);

		// Cast to unknown first, then to RawJournalEntry[] since edge function returns snake_case
		const rawData = response.data as unknown as RawJournalEntry[];

		if (!rawData || rawData.length === 0) {
			return JSON.stringify({
				success: true,
				message: "No journal entries found matching the search query.",
				journals: [],
			});
		}

		// Format journal entries for the LLM - include all fields except embedding
		// Note: EdgeFunctionService returns snake_case from the edge function
		const formattedJournals = rawData.map((entry) => ({
			id: entry.id,
			journalData: entry.memory_data,
			tagIds: entry.tag_ids || [],
			createdAt: entry.created_at,
			userId: entry.user_id,
		}));

		return JSON.stringify({
			success: true,
			message: `Found ${rawData.length} relevant journal entries.`,
			journals: formattedJournals,
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
