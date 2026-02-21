import { SupabaseClient } from "@supabase/supabase-js";
import {
	JournalSummaryResponse,
	SearchJournalsResponse,
	JournalSearchParams,
} from "@/types";

export class EdgeFunctionService {
	private supabase: SupabaseClient;

	constructor(supabase: SupabaseClient) {
		this.supabase = supabase;
	}

	async summarizeJournals(): Promise<JournalSummaryResponse> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			throw new Error("User not authenticated");
		}

		const { data, error } = await this.supabase.functions.invoke(
			"memory-fetch",
			{
				body: {
					action: "summarizeMemories",
				},
			},
		);

		if (error) {
			throw error;
		}

		return data as JournalSummaryResponse;
	}

	async searchJournals(
		query: string,
		matchCount: number = 5,
		startTime?: string,
		endTime?: string,
	): Promise<SearchJournalsResponse> {
		if (!query || query.trim() === "") {
			throw new Error("Query cannot be empty");
		}

		const requestBody: JournalSearchParams = {
			query,
			matchCount,
			startTime,
			endTime,
		};

		const { data, error } = await this.supabase.functions.invoke(
			"search-memories",
			{
				body: requestBody,
			},
		);

		if (error) {
			throw error;
		}

		return data as SearchJournalsResponse;
	}
}
