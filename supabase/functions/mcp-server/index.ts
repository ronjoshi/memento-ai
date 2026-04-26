// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// --- Structured logger ---
// All logs go to stderr so they appear in `supabase functions serve` output
// and in the Supabase dashboard edge function logs.
function log(
	level: "INFO" | "WARN" | "ERROR",
	msg: string,
	extra?: Record<string, unknown>,
) {
	const entry: Record<string, unknown> = {
		ts: new Date().toISOString(),
		level,
		msg,
		...extra,
	};
	console.error(JSON.stringify(entry));
}

// --- Embedding client ---
const embeddingsClient = new OpenAI({
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: Deno.env.get("OPENROUTER_OPENAI_EMBEDDINGS_KEY") || "",
	defaultHeaders: {},
});

async function generateEmbedding(text: string): Promise<number[]> {
	log("INFO", "generating embedding", { text_length: text.length });
	const t0 = Date.now();
	const result = await embeddingsClient.embeddings.create({
		model: "openai/text-embedding-3-small",
		input: text,
		encoding_format: "float",
	});
	log("INFO", "embedding generated", {
		dimensions: result.data[0].embedding.length,
		elapsed_ms: Date.now() - t0,
	});
	return result.data[0].embedding;
}

function formatTimestampForPostgres(iso: string): string {
	const d = new Date(iso);
	if (isNaN(d.getTime())) throw new Error(`Invalid timestamp: ${iso}`);
	return d.toISOString().replace("T", " ").replace("Z", "").split(".")[0];
}

// --- JSON-RPC helpers ---
interface JsonRpcRequest {
	jsonrpc: "2.0";
	id: string | number | null;
	method: string;
	params?: Record<string, unknown>;
}

function ok(id: string | number | null, result: unknown) {
	return JSON.stringify({ jsonrpc: "2.0", id, result });
}

function rpcErr(id: string | number | null, code: number, message: string) {
	return JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
}

// --- MCP tool definitions ---
const TOOLS = [
	{
		name: "search_memories",
		description:
			"Search journal memories using hybrid semantic + full-text search (vector similarity + keyword matching). Accepts 1–5 parallel queries — results are combined, deduplicated, and ranked by how many queries each entry matched. Use multiple focused queries to cover different angles of the same topic (e.g. for 'exercise', send ['going to the gym, feeling energized after a workout', 'running outside, tracking fitness goals', 'sore muscles, physical activity, body feeling strong']). Write each query as a descriptive statement that resembles journal content — NOT a question. Include emotions, events, names, places, and concrete details. Do NOT write analytical questions like 'when did I exercise?' — write what the entry would say, not what you want to know.",
		inputSchema: {
			type: "object",
			properties: {
				queries: {
					type: "array",
					items: { type: "string" },
					description:
						"1–5 search queries to run in parallel. Each must be a descriptive statement resembling journal content, not a question. Break complex topics into narrow, focused queries targeting different retrievable experiences. Include emotional cues, sensory details, names, and concrete anchors. Example for 'workout': ['going to the gym, lifting weights, feeling strong and accomplished', 'running outside, cardio session, tired but satisfied', 'skipping exercise, feeling guilty about not working out'].",
				},
				max_results_per_query: {
					type: "number",
					description: "Max results per individual query (1–20, default 10). Use lower values for broad queries, higher for specific ones.",
				},
				total_max_results: {
					type: "number",
					description: "Max total unique results after combining all queries (1–50, default 30). Entries matching more queries rank higher.",
				},
				start_time: {
					type: "string",
					description: "ISO 8601 start of optional date range filter",
				},
				end_time: {
					type: "string",
					description: "ISO 8601 end of optional date range filter",
				},
			},
			required: ["queries"],
		},
	},
	{
		name: "add_memory",
		description: "Create a new journal memory entry.",
		inputSchema: {
			type: "object",
			properties: {
				memory_data: {
					type: "string",
					description: "The journal entry content to save",
				},
				tag_ids: {
					type: "array",
					items: { type: "number" },
					description:
						"Array of tag IDs to attach (at least one required)",
				},
				created_at: {
					type: "string",
					description:
						"ISO 8601 timestamp for the entry (defaults to now)",
				},
			},
			required: ["memory_data", "tag_ids"],
		},
	},
	{
		name: "filter_by_tag",
		description:
			"Filter journal memories by tag IDs (OR logic — matches any tag). Supports optional date range and pagination.",
		inputSchema: {
			type: "object",
			properties: {
				tag_ids: {
					type: "array",
					items: { type: "number" },
					description: "Tag IDs to filter by",
				},
				start_time: {
					type: "string",
					description: "ISO 8601 start of optional date range",
				},
				end_time: {
					type: "string",
					description: "ISO 8601 end of optional date range",
				},
				limit: {
					type: "number",
					description: "Max entries to return (default 20)",
				},
				offset: {
					type: "number",
					description: "Pagination offset (default 0)",
				},
			},
			required: ["tag_ids"],
		},
	},
	{
		name: "filter_by_date",
		description: "Retrieve all journal memories within a date range.",
		inputSchema: {
			type: "object",
			properties: {
				start_time: {
					type: "string",
					description: "ISO 8601 start of date range (required)",
				},
				end_time: {
					type: "string",
					description: "ISO 8601 end of date range",
				},
				limit: {
					type: "number",
					description: "Max entries to return (default 20)",
				},
				offset: {
					type: "number",
					description: "Pagination offset (default 0)",
				},
			},
			required: ["start_time"],
		},
	},
	{
		name: "get_tags",
		description:
			"List all tags available to the authenticated user, including their IDs, names, and colors. Call this before filter_by_tag to discover valid tag IDs.",
		inputSchema: {
			type: "object",
			properties: {},
			required: [],
		},
	},
];

// --- Tool handlers ---

// Fetches all tags for a user and attaches resolved {id, name, color} objects
// to each result row. tag_ids is kept for reference.
async function resolveTags(
	supabase: ReturnType<typeof createClient>,
	userId: string,
	results: Array<Record<string, unknown>>,
): Promise<Array<Record<string, unknown>>> {
	if (results.length === 0) return results;

	const { data: tagsData, error } = await supabase
		.from("tags")
		.select("id, name, color")
		.eq("user_id", userId);

	if (error) {
		log("WARN", "resolveTags: failed to fetch tags, returning without names", {
			error_message: error.message,
		});
		return results;
	}

	const tagMap = new Map<number, { id: number; name: string; color: string }>();
	for (const tag of tagsData || []) {
		tagMap.set(tag.id, { id: tag.id, name: tag.name, color: tag.color || "gray" });
	}

	return results.map((r) => ({
		...r,
		tags: ((r.tag_ids as number[]) || [])
			.map((id) => tagMap.get(id))
			.filter(Boolean),
	}));
}

async function searchMemories(
	args: Record<string, unknown>,
	supabase: ReturnType<typeof createClient>,
	userId: string,
) {
	const {
		queries,
		max_results_per_query = 10,
		total_max_results = 30,
		start_time,
		end_time,
	} = args as {
		queries: string[];
		max_results_per_query?: number;
		total_max_results?: number;
		start_time?: string;
		end_time?: string;
	};

	if (!queries || queries.length === 0) throw new Error("At least one query is required");
	if (queries.length > 5) throw new Error("Maximum 5 queries allowed");

	const matchCount = Math.min(Number(max_results_per_query), 20);
	const totalMax = Math.min(Number(total_max_results), 50);

	log("INFO", "search_memories: start", {
		query_count: queries.length,
		queries,
		match_count_per_query: matchCount,
		total_max_results: totalMax,
		start_time,
		end_time,
		user_id: userId,
	});

	// Build shared time filter params
	const timeParams: Record<string, string> = {};
	if (start_time) {
		timeParams.start_time = formatTimestampForPostgres(start_time);
		log("INFO", "search_memories: start_time filter", { raw: start_time, formatted: timeParams.start_time });
	}
	if (end_time) {
		timeParams.end_time = formatTimestampForPostgres(end_time);
		log("INFO", "search_memories: end_time filter", { raw: end_time, formatted: timeParams.end_time });
	}

	// Run all queries in parallel
	const t0 = Date.now();
	const queryResults = await Promise.all(
		queries.map(async (query, i) => {
			const embedding = await generateEmbedding(query);
			const rpcParams: Record<string, unknown> = {
				query_text: query,
				query_embedding: embedding,
				match_count: matchCount,
				input_user_id: userId,
				...timeParams,
			};
			const { data, error } = await supabase.rpc("hybrid_memory_search", rpcParams);
			if (error) {
				log("ERROR", `search_memories: RPC failed for query ${i}`, {
					query,
					error_message: error.message,
					error_code: error.code,
				});
				throw new Error(`Search failed for query "${query}": ${error.message}`);
			}
			log("INFO", `search_memories: query ${i} returned ${(data || []).length} results`, { query });
			return (data || []) as Record<string, unknown>[];
		}),
	);

	// Deduplicate by id, track match counts, sort by match count desc
	const seenIds = new Set<string>();
	const matchCounts = new Map<string, number>();
	const combined: Record<string, unknown>[] = [];

	for (const rows of queryResults) {
		for (const r of rows) {
			const id = r.id as string;
			if (!seenIds.has(id)) {
				seenIds.add(id);
				combined.push({ id, memory_data: r.memory_data, tag_ids: r.tag_ids, created_at: r.created_at });
				matchCounts.set(id, 1);
			} else {
				matchCounts.set(id, (matchCounts.get(id) || 0) + 1);
			}
		}
	}

	combined.sort((a, b) => (matchCounts.get(b.id as string) || 0) - (matchCounts.get(a.id as string) || 0));
	const limited = combined.slice(0, totalMax);

	log("INFO", "search_memories: dedup + rank done", {
		total_before_limit: combined.length,
		total_after_limit: limited.length,
		elapsed_ms: Date.now() - t0,
	});

	return resolveTags(supabase, userId, limited);
}

async function addMemory(
	args: Record<string, unknown>,
	supabase: ReturnType<typeof createClient>,
	userId: string,
) {
	const { memory_data, tag_ids, created_at } = args as {
		memory_data: string;
		tag_ids: number[];
		created_at?: string;
	};

	log("INFO", "add_memory: start", {
		memory_length: memory_data?.length,
		tag_ids,
		created_at,
		user_id: userId,
	});

	if (!tag_ids || tag_ids.length === 0) {
		log("WARN", "add_memory: rejected — no tag_ids provided");
		throw new Error("At least one tag_id is required");
	}

	const embedding = await generateEmbedding(memory_data);

	const insertPayload = {
		user_id: userId,
		memory_data,
		tag_ids,
		embedding,
		created_at: created_at || new Date().toISOString(),
	};

	log("INFO", "add_memory: inserting row", {
		tag_ids,
		created_at: insertPayload.created_at,
		embedding_dims: embedding.length,
	});

	const t0 = Date.now();
	const { data, error } = await supabase
		.from("memories")
		.insert(insertPayload)
		.select("id, memory_data, tag_ids, created_at")
		.single();

	if (error) {
		log("ERROR", "add_memory: insert failed", {
			error_message: error.message,
			error_code: error.code,
			error_details: error.details,
			elapsed_ms: Date.now() - t0,
		});
		throw new Error(`Insert failed: ${error.message}`);
	}

	log("INFO", "add_memory: done", {
		inserted_id: data?.id,
		elapsed_ms: Date.now() - t0,
	});

	return data;
}

async function filterByTag(
	args: Record<string, unknown>,
	supabase: ReturnType<typeof createClient>,
	userId: string,
) {
	const {
		tag_ids,
		start_time,
		end_time,
		limit = 20,
		offset = 0,
	} = args as {
		tag_ids: number[];
		start_time?: string;
		end_time?: string;
		limit?: number;
		offset?: number;
	};

	const lim = Number(limit);
	const off = Number(offset);

	log("INFO", "filter_by_tag: start", {
		tag_ids,
		start_time,
		end_time,
		limit: lim,
		offset: off,
		user_id: userId,
	});

	let query = supabase
		.from("memories")
		.select("id, memory_data, tag_ids, created_at")
		.eq("user_id", userId)
		.overlaps("tag_ids", tag_ids)
		.order("created_at", { ascending: false })
		.range(off, off + lim - 1);

	if (start_time) query = query.gte("created_at", start_time);
	if (end_time) query = query.lte("created_at", end_time);

	const t0 = Date.now();
	const { data, error } = await query;

	if (error) {
		log("ERROR", "filter_by_tag: query failed", {
			error_message: error.message,
			error_code: error.code,
			error_details: error.details,
			elapsed_ms: Date.now() - t0,
		});
		throw new Error(`Filter failed: ${error.message}`);
	}

	log("INFO", "filter_by_tag: done", {
		result_count: (data || []).length,
		elapsed_ms: Date.now() - t0,
	});

	return resolveTags(supabase, userId, data || []);
}

async function filterByDate(
	args: Record<string, unknown>,
	supabase: ReturnType<typeof createClient>,
	userId: string,
) {
	const {
		start_time,
		end_time,
		limit = 20,
		offset = 0,
	} = args as {
		start_time: string;
		end_time?: string;
		limit?: number;
		offset?: number;
	};

	const lim = Number(limit);
	const off = Number(offset);

	log("INFO", "filter_by_date: start", {
		start_time,
		end_time,
		limit: lim,
		offset: off,
		user_id: userId,
	});

	let query = supabase
		.from("memories")
		.select("id, memory_data, tag_ids, created_at")
		.eq("user_id", userId)
		.gte("created_at", start_time)
		.order("created_at", { ascending: false })
		.range(off, off + lim - 1);

	if (end_time) query = query.lte("created_at", end_time);

	const t0 = Date.now();
	const { data, error } = await query;

	if (error) {
		log("ERROR", "filter_by_date: query failed", {
			error_message: error.message,
			error_code: error.code,
			error_details: error.details,
			elapsed_ms: Date.now() - t0,
		});
		throw new Error(`Date filter failed: ${error.message}`);
	}

	log("INFO", "filter_by_date: done", {
		result_count: (data || []).length,
		elapsed_ms: Date.now() - t0,
	});

	return resolveTags(supabase, userId, data || []);
}

async function getTags(
	supabase: ReturnType<typeof createClient>,
	userId: string,
) {
	log("INFO", "get_tags: start", { user_id: userId });

	const t0 = Date.now();
	const { data, error } = await supabase
		.from("tags")
		.select("id, name, color, created_at")
		.eq("user_id", userId)
		.order("name", { ascending: true });

	if (error) {
		log("ERROR", "get_tags: query failed", {
			error_message: error.message,
			error_code: error.code,
			error_details: error.details,
			elapsed_ms: Date.now() - t0,
		});
		throw new Error(`Failed to fetch tags: ${error.message}`);
	}

	log("INFO", "get_tags: done", {
		tag_count: (data || []).length,
		elapsed_ms: Date.now() - t0,
	});

	return data || [];
}

// --- CORS headers ---
const CORS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Authorization, Content-Type",
};

// --- Main serve ---
Deno.serve(async (req) => {
	const reqId = crypto.randomUUID().slice(0, 8); // short ID to correlate logs for a single request
	const method = req.method;
	const url = new URL(req.url);

	log("INFO", "request received", {
		req_id: reqId,
		http_method: method,
		path: url.pathname,
		has_auth: !!req.headers.get("Authorization"),
		content_type: req.headers.get("Content-Type"),
	});

	if (method === "OPTIONS") {
		log("INFO", "responding to CORS preflight", { req_id: reqId });
		return new Response(null, { headers: CORS });
	}

	const jsonHeaders = { ...CORS, "Content-Type": "application/json" };

	// GET — OAuth Protected Resource Metadata (RFC 9728).
	// mcp-remote probes this before every connection; returning it tells the
	// client "bearer token only, no OAuth server needed" so it skips the OAuth
	// dance and uses the Authorization header you already provided.
	if (method === "GET") {
		const resource = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mcp-server`;
		log("INFO", "serving OAuth protected resource metadata", {
			req_id: reqId,
			resource,
		});
		return new Response(
			JSON.stringify({
				resource,
				bearer_methods_supported: ["header"],
			}),
			{ headers: jsonHeaders },
		);
	}

	// Parse JSON body
	let body: JsonRpcRequest;
	try {
		body = await req.json();
	} catch (e) {
		log("WARN", "failed to parse request body as JSON", {
			req_id: reqId,
			error: String(e),
		});
		return new Response(rpcErr(null, -32700, "Parse error"), {
			status: 400,
			headers: jsonHeaders,
		});
	}

	// If the body isn't JSON-RPC it's likely an OAuth client registration
	// attempt. Return an OAuth-format error (string `error` field) so
	// mcp-remote throws OAuthError instead of the fatal ServerError it throws
	// when it sees a JSON-RPC error object.
	if (body.jsonrpc !== "2.0" || typeof body.method !== "string") {
		log("WARN", "request is not valid JSON-RPC — possible OAuth probe", {
			req_id: reqId,
			jsonrpc: body.jsonrpc,
			method_type: typeof body.method,
			body_keys: Object.keys(body),
		});
		return new Response(
			JSON.stringify({
				error: "registration_not_supported",
				error_description:
					"Dynamic client registration is not supported. Provide a bearer token via the Authorization header.",
			}),
			{ status: 400, headers: jsonHeaders },
		);
	}

	const { id: rpcId, method: rpcMethod } = body;

	log("INFO", "JSON-RPC request", {
		req_id: reqId,
		rpc_id: rpcId,
		rpc_method: rpcMethod,
	});

	// initialize — no auth required (MCP handshake)
	if (rpcMethod === "initialize") {
		log("INFO", "handling initialize", {
			req_id: reqId,
			client_info: (body.params as Record<string, unknown>)?.clientInfo,
			protocol_version: (body.params as Record<string, unknown>)
				?.protocolVersion,
		});
		return new Response(
			ok(rpcId, {
				protocolVersion: "2024-11-05",
				capabilities: { tools: {} },
				serverInfo: { name: "memento-mcp", version: "1.0.0" },
			}),
			{ headers: jsonHeaders },
		);
	}

	// tools/list — no auth required
	if (rpcMethod === "tools/list") {
		log("INFO", "handling tools/list", {
			req_id: reqId,
			tool_count: TOOLS.length,
		});
		return new Response(ok(rpcId, { tools: TOOLS }), {
			headers: jsonHeaders,
		});
	}

	// All other methods require a valid Supabase JWT
	const authHeader = req.headers.get("Authorization");
	if (!authHeader) {
		log("WARN", "missing Authorization header", {
			req_id: reqId,
			rpc_method: rpcMethod,
		});
		return new Response(rpcErr(rpcId, -32001, "Missing Authorization header"), {
			status: 401,
			headers: jsonHeaders,
		});
	}

	// Extract the raw token from "Bearer <token>"
	const token = authHeader.startsWith("Bearer ")
		? authHeader.slice(7).trim()
		: authHeader.trim();

	log("INFO", "verifying Supabase JWT", {
		req_id: reqId,
		auth_scheme: authHeader.split(" ")[0],
		token_segment_count: token.split(".").length, // valid JWT always has 3
		token_prefix: token.slice(0, 20) + "...",
	});

	const supabase = createClient(
		Deno.env.get("SUPABASE_URL")!,
		Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
		{
			auth: { autoRefreshToken: false, persistSession: false },
		},
	);

	const t0Auth = Date.now();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser(token);

	if (userError || !user) {
		log("WARN", "JWT verification failed", {
			req_id: reqId,
			error_message: userError?.message,
			error_code: userError?.code,
			elapsed_ms: Date.now() - t0Auth,
		});
		return new Response(rpcErr(rpcId, -32001, "Not authenticated"), {
			status: 401,
			headers: jsonHeaders,
		});
	}

	log("INFO", "JWT verified", {
		req_id: reqId,
		user_id: user.id,
		user_email: user.email,
		elapsed_ms: Date.now() - t0Auth,
	});

	// notifications/initialized — client acknowledgement, no body needed
	if (rpcMethod === "notifications/initialized") {
		log("INFO", "handling notifications/initialized", {
			req_id: reqId,
			user_id: user.id,
		});
		return new Response(null, { status: 204, headers: CORS });
	}

	// tools/call
	if (rpcMethod === "tools/call") {
		const { name: toolName, arguments: args = {} } = (
			body.params || {}
		) as {
			name: string;
			arguments?: Record<string, unknown>;
		};

		log("INFO", "tools/call dispatching", {
			req_id: reqId,
			tool: toolName,
			user_id: user.id,
			args_keys: Object.keys(args),
		});

		const t0Tool = Date.now();

		try {
			let result: unknown;

			if (toolName === "search_memories") {
				result = await searchMemories(args, supabase, user.id);
			} else if (toolName === "add_memory") {
				result = await addMemory(args, supabase, user.id);
			} else if (toolName === "filter_by_tag") {
				result = await filterByTag(args, supabase, user.id);
			} else if (toolName === "filter_by_date") {
				result = await filterByDate(args, supabase, user.id);
			} else if (toolName === "get_tags") {
				result = await getTags(supabase, user.id);
			} else {
				log("WARN", "tools/call: unknown tool", {
					req_id: reqId,
					tool: toolName,
				});
				return new Response(rpcErr(rpcId, -32601, `Unknown tool: ${toolName}`), {
					status: 404,
					headers: jsonHeaders,
				});
			}

			log("INFO", "tools/call succeeded", {
				req_id: reqId,
				tool: toolName,
				elapsed_ms: Date.now() - t0Tool,
			});

			return new Response(
				ok(rpcId, {
					content: [
						{ type: "text", text: JSON.stringify(result, null, 2) },
					],
				}),
				{ headers: jsonHeaders },
			);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			log("ERROR", "tools/call threw an exception", {
				req_id: reqId,
				tool: toolName,
				error: msg,
				stack: e instanceof Error ? e.stack : undefined,
				elapsed_ms: Date.now() - t0Tool,
			});
			return new Response(rpcErr(rpcId, -32000, msg), {
				status: 500,
				headers: jsonHeaders,
			});
		}
	}

	log("WARN", "unhandled JSON-RPC method", {
		req_id: reqId,
		rpc_method: rpcMethod,
	});
	return new Response(
		rpcErr(rpcId, -32601, `Method not found: ${rpcMethod}`),
		{ status: 404, headers: jsonHeaders },
	);
});

/* To invoke locally:

  1. Run `supabase start`
  2. Get a JWT by signing in:
     curl -s -X POST 'http://127.0.0.1:54321/auth/v1/token?grant_type=password' \
       -H 'apikey: <anon_key>' -H 'Content-Type: application/json' \
       -d '{"email":"you@example.com","password":"yourpassword"}' | jq '.access_token'

  3. List available tools (no auth needed):
     curl -s -X POST 'http://127.0.0.1:54321/functions/v1/mcp-server' \
       -H 'Content-Type: application/json' \
       -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

  4. Search memories:
     curl -s -X POST 'http://127.0.0.1:54321/functions/v1/mcp-server' \
       -H 'Authorization: Bearer <access_token>' \
       -H 'Content-Type: application/json' \
       -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_memories","arguments":{"query":"feeling anxious about work"}}}'

  Claude Desktop config (~/.claude/claude_desktop_config.json):
  {
    "mcpServers": {
      "memento": {
        "command": "npx",
        "args": [
          "mcp-remote",
          "https://rsdtnuvfgiymexncbsot.supabase.co/functions/v1/mcp-server",
          "--header",
          "Authorization:Bearer <your_supabase_access_token>"
        ]
      }
    }
  }
*/
