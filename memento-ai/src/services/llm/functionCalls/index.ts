import { FunctionDefinition } from "@/services/llm";
import {
	SEARCH_BY_KEYWORD_TOOL,
	executeSearchByKeyword,
	SearchByKeywordArgs,
} from "./searchByKeyword";
import {
	SEARCH_BY_TAG_TOOL,
	executeSearchByTag,
	SearchByTagArgs,
} from "./searchByTag";
import {
	SEARCH_BY_DATE_TOOL,
	executeSearchByDate,
	SearchByDateArgs,
} from "./searchByDate";

// Re-export individual tools
export { SEARCH_BY_KEYWORD_TOOL, executeSearchByKeyword };
export type { SearchByKeywordArgs };
export { SEARCH_BY_TAG_TOOL, executeSearchByTag };
export type { SearchByTagArgs };
export { SEARCH_BY_DATE_TOOL, executeSearchByDate };
export type { SearchByDateArgs };

/**
 * All available tools for the chat completion
 */
export const ALL_TOOLS: FunctionDefinition[] = [
	SEARCH_BY_KEYWORD_TOOL,
	SEARCH_BY_TAG_TOOL,
	SEARCH_BY_DATE_TOOL,
];

/**
 * Tool executor map - maps tool names to their executor functions
 */
export type ToolExecutor = (args: unknown) => Promise<string>;

export const TOOL_EXECUTORS: Record<string, ToolExecutor> = {
	search_by_keyword: (args) =>
		executeSearchByKeyword(args as SearchByKeywordArgs),
	search_by_tag: (args) => executeSearchByTag(args as SearchByTagArgs),
	search_by_date: (args) => executeSearchByDate(args as SearchByDateArgs),
};

/**
 * Execute a tool by name with the given arguments
 * @param toolName - The name of the tool to execute
 * @param args - The arguments for the tool (as a JSON string)
 * @returns The result of the tool execution
 */
export async function executeTool(
	toolName: string,
	args: string,
): Promise<string> {
	const executor = TOOL_EXECUTORS[toolName];

	if (!executor) {
		return JSON.stringify({
			success: false,
			message: `Unknown tool: ${toolName}`,
		});
	}

	try {
		const parsedArgs = JSON.parse(args);
		return await executor(parsedArgs);
	} catch (error) {
		console.error(`Error executing tool ${toolName}:`, error);
		return JSON.stringify({
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to execute tool",
		});
	}
}
