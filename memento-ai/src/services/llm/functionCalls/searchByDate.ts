import { FunctionDefinition } from "@/services/llm/types";

/**
 * Tool definition for searching user journal entries by date range
 */
export const SEARCH_BY_DATE_TOOL: FunctionDefinition = {
	name: "search_by_date",
	description:
		"List all journal entries within a date range. Use this when the user asks about entries from a specific time period without mentioning keywords or tags — e.g. 'what did I write last week?', 'show me my entries from January', 'anything from yesterday?'. Convert natural language time references ('last month', 'this week', 'in 2024') to ISO 8601 datetimes. At least one of startTime or endTime is required.",
	parameters: {
		type: "object",
		properties: {
			startTime: {
				type: "string",
				description:
					"ISO 8601 datetime for the start of the date range (e.g., '2025-01-01T00:00:00Z'). Infer from natural language time references like 'last month', 'in 2024', 'this week'.",
			},
			endTime: {
				type: "string",
				description:
					"ISO 8601 datetime for the end of the date range (e.g., '2025-12-31T23:59:59Z'). Infer from natural language time references like 'last month', 'in 2024', 'this week'.",
			},
		},
		required: ["startTime"],
	},
};

/**
 * Arguments for the search_by_date function
 */
export interface SearchByDateArgs {
	startTime: string;
	endTime?: string;
}

/**
 * Execute the search_by_date tool
 * @param args - The parsed arguments from the tool call
 * @returns A string representation of the search results
 */
export async function executeSearchByDate(
	args: SearchByDateArgs,
): Promise<string> {
	try {
		const body: { startTime?: string; endTime?: string } = {};
		if (args.startTime) body.startTime = args.startTime;
		if (args.endTime) body.endTime = args.endTime;

		const response = await fetch("/api/search/tag", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Search by date failed");
		}

		const data = await response.json();
		const journals = data.journals || [];

		if (journals.length === 0) {
			return JSON.stringify({
				success: true,
				message: "No journal entries found in the given date range.",
				journals: [],
			});
		}

		const formattedJournals = journals.map((entry: any) => ({
			id: entry.id,
			journalData: entry.journalData,
			tagIds: entry.tagIds || [],
			createdAt: entry.createdAt,
			userId: entry.userId,
		}));

		return JSON.stringify({
			success: true,
			message: `Found ${journals.length} journal entries in the given date range.`,
			journals: formattedJournals,
		});
	} catch (error) {
		console.error("Error executing search_by_date:", error);
		return JSON.stringify({
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to search journal entries by date",
			journals: [],
		});
	}
}
