import { FunctionDefinition } from "@/services/llm/types";
import { JournalEntry } from "@/types";

/**
 * Tool definition for searching user journal entries by tag names and optional date range
 */
export const SEARCH_BY_TAG_TOOL: FunctionDefinition = {
	name: "search_by_tag",
	description:
		"Search the user's journal entries by tag labels — categories the user has applied to their journal entries. Use this when the user references a specific topic, person, place, or category (e.g. 'work entries', 'family stuff', 'travel', 'fitness'). Guess tag names from context — for 'family trip' try ['family', 'travel']; for 'work stuff' try ['work']. Unmatched tag names are handled gracefully, so don't be conservative. Can be combined with keyword search for thorough recall.",
	parameters: {
		type: "object",
		properties: {
			tagNames: {
				type: "array",
				items: { type: "string" },
				description:
					"List of tag names to search for. Infer these from the user's query — use lowercase, single-word or short labels (e.g. ['work', 'travel', 'family']). Journal entries matching at least one tag will be returned. It's safe to include multiple guesses.",
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
				journals: [],
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
		const entries: JournalEntry[] = searchData.journals || [];

		if (entries.length === 0) {
			return JSON.stringify({
				success: true,
				message: "No journal entries found matching the given tags and date range.",
				journals: [],
			});
		}

		// Format journal entries for the LLM
		const formattedJournals = entries.map((entry) => ({
			id: entry.id,
			journalData: entry.journalData,
			tagIds: entry.tagIds || [],
			createdAt: entry.createdAt,
			userId: entry.userId,
		}));

		return JSON.stringify({
			success: true,
			message: `Found ${entries.length} journal entries matching tags: ${args.tagNames.join(", ")}`,
			journals: formattedJournals,
		});
	} catch (error) {
		console.error("Error executing search_by_tag:", error);
		return JSON.stringify({
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to search journal entries by tag",
			journals: [],
		});
	}
}
