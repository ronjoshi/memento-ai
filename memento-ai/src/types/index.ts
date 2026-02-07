/**
 * Client-side types for the Memento AI application.
 *
 * NOTE: These types use camelCase for JavaScript conventions.
 * The edge function types in supabase/functions/common/types.ts use snake_case
 * to match database column names. Keep these in sync when making changes.
 */

export interface Memory {
	id: string;
	userId: string;
	memoryData: string;
	tag: string;
	createdAt: string;
	embedding?: number[];
}

export interface Tag {
	id: number;
	userId: string;
	name: string;
	createdAt: string;
}

export interface MemoryWithTag {
	id: string;
	userId: string;
	memoryData: string;
	tag: string;
	createdAt: string;
	tags: Tag[];
}

export interface ToolCall {
	id: string;
	type: "function";
	function: {
		name: string;
		arguments: string;
	};
}

export interface ConversationMessage {
	id: string;
	conversationId: string;
	userId: string | null;
	role: "user" | "assistant" | "tool";
	content: string | null;
	createdAt: string;
	tool_calls?: ToolCall[];
	tool_call_id?: string;
	reasoning_content?: string;
}

export interface MemorySummaryResponse {
	data: {
		summary: string;
		totalMemories: number;
	};
}

export interface MemorySearchParams {
	query: string;
	matchCount?: number;
	startTime?: string;
	endTime?: string;
}

export interface SearchMemoriesResponse {
	data: Memory[];
	query: string;
	matchCount: number;
}

export interface User {
	id: string;
	email?: string;
}

export interface AuthState {
	user: User | null;
	isLoading: boolean;
	isSignedIn: boolean;
}
