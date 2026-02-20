import { FunctionDefinition } from "@/services/llm/types";
import { Memory } from "@/types";

/**
 * Tool definition for searching user memories by tag names and optional date range
 */
export const SEARCH_BY_TAG_TOOL: FunctionDefinition = {
	name: "search_by_tag",
	description:
		"Search the user's memories by tag labels — categories the user has applied to their memories. Use this when the user references a specific topic, person, place, or category (e.g. 'work memories', 'family stuff', 'travel', 'fitness'). Guess tag names from context — for 'family trip' try ['family', 'travel']; for 'work stuff' try ['work']. Unmatched tag names are handled gracefully, so don't be conservative. Can be combined with keyword search for thorough recall.",
	parameters: {
		type: "object",
		properties: {
			tagNames: {
				type: "array",
				items: { type: "string" },
				description:
					"List of tag names to search for. Infer these from the user's query — use lowercase, single-word or short labels (e.g. ['work', 'travel', 'family']). Memories matching at least one tag will be returned. It's safe to include multiple guesses.",
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
		required: ["tagNames"],
	},
};

/**
 * Arguments for the search_by_tag function
 */
export interface SearchByTagArgs {
	tagNames: string[];
	startTime?: string;
	endTime?: string;
}

/**
 * Execute the search_by_tag tool
 * @param args - The parsed arguments from the tool call
 * @returns A string representation of the search results
 */
export async function executeSearchByTag(
	args: SearchByTagArgs,
): Promise<string> {
	try {
		// 1. Fetch all tags for the user
		const tagsResponse = await fetch("/api/tags");
		if (!tagsResponse.ok) {
			throw new Error("Failed to fetch tags");
		}
		const tagsData = await tagsResponse.json();
		const allTags: { id: number; name: string }[] = tagsData.tags || [];

		// 2. Match tagNames to tag IDs (case-insensitive)
		const lowerNames = args.tagNames.map((n) => n.toLowerCase());
		const matchedTagIds = allTags
			.filter((tag) => lowerNames.includes(tag.name.toLowerCase()))
			.map((tag) => tag.id);

		if (matchedTagIds.length === 0) {
			return JSON.stringify({
				success: true,
				message: `No tags found matching: ${args.tagNames.join(", ")}`,
				memories: [],
			});
		}

		// 3. Call /api/search/tag with matched tag IDs and optional date range
		const body: { tagIds: number[]; startTime?: string; endTime?: string } =
			{ tagIds: matchedTagIds };
		if (args.startTime) body.startTime = args.startTime;
		if (args.endTime) body.endTime = args.endTime;

		const searchResponse = await fetch("/api/search/tag", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		if (!searchResponse.ok) {
			const errorData = await searchResponse.json();
			throw new Error(errorData.error || "Search by tag failed");
		}

		const searchData = await searchResponse.json();
		const memories: Memory[] = searchData.memories || [];

		if (memories.length === 0) {
			return JSON.stringify({
				success: true,
				message: "No memories found matching the given tags and date range.",
				memories: [],
			});
		}

		// Format memories for the LLM
		const formattedMemories = memories.map((memory) => ({
			id: memory.id,
			memoryData: memory.memoryData,
			tagIds: memory.tagIds || [],
			createdAt: memory.createdAt,
			userId: memory.userId,
		}));

		return JSON.stringify({
			success: true,
			message: `Found ${memories.length} memories matching tags: ${args.tagNames.join(", ")}`,
			memories: formattedMemories,
		});
	} catch (error) {
		console.error("Error executing search_by_tag:", error);
		return JSON.stringify({
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to search memories by tag",
			memories: [],
		});
	}
}
