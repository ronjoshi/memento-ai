import { FunctionDefinition } from "@/services/llm/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { EdgeFunctionService } from "@/services/edgeFunction";

// Raw memory type from edge function (snake_case)
interface RawMemory {
	id: string;
	user_id: string;
	memory_data: string;
	tag_ids: number[];
	created_at: string;
	embedding?: number[];
}

/**
 * Tool definition for searching user memories by keyword (semantic search)
 */
export const SEARCH_BY_KEYWORD_TOOL: FunctionDefinition = {
	name: "search_by_keyword",
	description:
		"Search the user's memories using semantic/keyword search. Use this when the user asks about their past experiences, events, or stored information using natural language queries.",
	parameters: {
		type: "object",
		properties: {
			query: {
				type: "string",
				description: "The search query to find relevant memories",
			},
			startTime: {
				type: "string",
				description:
					"Optional ISO 8601 date string for the start of the search range (e.g., '2025-01-01T00:00:00Z')",
			},
			endTime: {
				type: "string",
				description:
					"Optional ISO 8601 date string for the end of the search range (e.g., '2025-12-31T23:59:59Z')",
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

		const response = await edgeFunctionService.searchMemories(
			args.query,
			5, // matchCount
			args.startTime,
			args.endTime,
		);

		// Cast to unknown first, then to RawMemory[] since edge function returns snake_case
		const rawData = response.data as unknown as RawMemory[];

		if (!rawData || rawData.length === 0) {
			return JSON.stringify({
				success: true,
				message: "No memories found matching the search query.",
				memories: [],
			});
		}

		// Format memories for the LLM - include all fields except embedding
		// Note: EdgeFunctionService returns snake_case from the edge function
		const formattedMemories = rawData.map((memory) => ({
			id: memory.id,
			memoryData: memory.memory_data,
			tagIds: memory.tag_ids || [],
			createdAt: memory.created_at,
			userId: memory.user_id,
		}));

		return JSON.stringify({
			success: true,
			message: `Found ${rawData.length} relevant memories.`,
			memories: formattedMemories,
		});
	} catch (error) {
		console.error("Error executing search_by_keyword:", error);
		return JSON.stringify({
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to search memories",
			memories: [],
		});
	}
}
