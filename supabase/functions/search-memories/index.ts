// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { Memory, SearchRequest, RawSearchResult } from "../common/types.ts";

// Initialize OpenAI client for embeddings
const OPENROUTER_OPENAI_EMBEDDINGS_KEY =
	Deno.env.get("OPENROUTER_OPENAI_EMBEDDINGS_KEY") || "";

const embeddingsClient = new OpenAI({
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: OPENROUTER_OPENAI_EMBEDDINGS_KEY,
	defaultHeaders: {},
});

async function generateEmbedding(text: string): Promise<number[]> {
	const embedding = await embeddingsClient.embeddings.create({
		model: "openai/text-embedding-3-small",
		input: text,
		encoding_format: "float",
	});

	return embedding.data[0].embedding;
}

Deno.serve(async (req) => {
	try {
		// Get authorization header
		const authHeader = req.headers.get("Authorization");
		if (!authHeader) {
			return new Response(
				JSON.stringify({ error: "Missing authorization header" }),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Create Supabase client
		const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
		const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
		const supabase = createClient(supabaseUrl, supabaseKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
			global: {
				headers: { Authorization: authHeader },
			},
		});

		// Get authenticated user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		if (userError || !user) {
			return new Response(
				JSON.stringify({ error: "User not authenticated" }),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Parse request body
		const {
			query,
			matchCount = 5,
			startTime,
			endTime,
		}: SearchRequest = await req.json();

		if (!query || query.trim().length === 0) {
			return new Response(
				JSON.stringify({ error: "Query text is required" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Generate embedding for the query text
		let queryEmbedding: number[];
		try {
			queryEmbedding = await generateEmbedding(query);
		} catch (embeddingError) {
			console.error("Embedding generation error:", embeddingError);
			return new Response(
				JSON.stringify({
					error: "Failed to generate query embedding",
					details: embeddingError,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Build RPC parameters
		const rpcParams: {
			query_text: string;
			query_embedding: number[];
			match_count: number;
			input_user_id: string;
			start_time?: string;
			end_time?: string;
		} = {
			query_text: query,
			query_embedding: queryEmbedding,
			match_count: matchCount,
			input_user_id: user.id,
		};

		// Add optional time filters if provided
		if (startTime) {
			rpcParams.start_time = startTime;
		}
		if (endTime) {
			rpcParams.end_time = endTime;
		}

		// Call hybrid_search RPC function
		const { data, error } = await supabase.rpc(
			"hybrid_memory_search",
			rpcParams,
		);

		if (error) {
			console.error("RPC error:", error);
			return new Response(
				JSON.stringify({
					error: "Search failed",
					details: error,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Map and clean the search results to match the expected format
		const cleanedResults: Memory[] = (data || []).map(
			(result: RawSearchResult): Memory => ({
				id: result.id,
				user_id: result.user_id,
				memory_data: result.memory_data,
				tag: result.tag,
				created_at: result.created_at,
				embedding: result.embedding,
			}),
		);

		// Return search results
		return new Response(
			JSON.stringify({
				data: cleanedResults,
				query,
				matchCount,
			}),
			{
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("Error:", error);
		return new Response(
			JSON.stringify({
				error: "Internal server error",
				details: error,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
});
