import { FunctionDefinition } from "@/services/llm";
import {
	SEARCH_MEMORIES_TOOL,
	executeSearchMemories,
	SearchMemoriesArgs,
} from "./searchMemories";

// Re-export individual tools
export { SEARCH_MEMORIES_TOOL, executeSearchMemories };
export type { SearchMemoriesArgs };

/**
 * All available tools for the chat completion
 */
export const ALL_TOOLS: FunctionDefinition[] = [SEARCH_MEMORIES_TOOL];

/**
 * Tool executor map - maps tool names to their executor functions
 */
export type ToolExecutor = (args: unknown) => Promise<string>;

export const TOOL_EXECUTORS: Record<string, ToolExecutor> = {
	search_memories: (args) =>
		executeSearchMemories(args as SearchMemoriesArgs),
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
				error instanceof Error ? error.message : "Failed to execute tool",
		});
	}
}
