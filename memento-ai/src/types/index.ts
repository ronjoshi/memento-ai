/**
 * Client-side types for the Memento AI application.
 *
 * NOTE: These types use camelCase for JavaScript conventions.
 * The edge function types in supabase/functions/common/types.ts use snake_case
 * to match database column names. Keep these in sync when making changes.
 */

// Notion-style tag colors
export type TagColor =
	| "gray"
	| "brown"
	| "orange"
	| "yellow"
	| "green"
	| "blue"
	| "purple"
	| "pink"
	| "red";

// Tag color configuration for UI styling (dark mode optimized)
export const TAG_COLOR_CONFIG: Record<
	TagColor,
	{ bg: string; text: string }
> = {
	gray: {
		bg: "#374151",
		text: "#f3f4f6",
	},
	brown: {
		bg: "#78350f",
		text: "#fef3c7",
	},
	orange: {
		bg: "#c2410c",
		text: "#fff7ed",
	},
	yellow: {
		bg: "#a16207",
		text: "#fefce8",
	},
	green: {
		bg: "#15803d",
		text: "#f0fdf4",
	},
	blue: {
		bg: "#1d4ed8",
		text: "#eff6ff",
	},
	purple: {
		bg: "#7c3aed",
		text: "#f5f3ff",
	},
	pink: {
		bg: "#be185d",
		text: "#fdf2f8",
	},
	red: {
		bg: "#dc2626",
		text: "#fef2f2",
	},
};

export const TAG_COLORS: TagColor[] = [
	"gray",
	"brown",
	"orange",
	"yellow",
	"green",
	"blue",
	"purple",
	"pink",
	"red",
];

export interface Tag {
	id: number;
	userId: string;
	name: string;
	color: TagColor;
	createdAt: string;
}

export interface JournalEntry {
	id: string;
	userId: string;
	journalData: string;
	tagIds: number[]; // Array of tag IDs stored in database
	createdAt: string;
	embedding?: number[];
	tags?: Tag[]; // Resolved tag objects (populated from tagIds)
}

export interface JournalEntryWithTag {
	id: string;
	userId: string;
	journalData: string;
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

// ============================================================================
// LLM Types (shared between client and server)
// ============================================================================

export interface LLMResponse {
	content: string | null;
	reasoning_content?: string;
	tool_calls?: ToolCall[];
	finishReason: string | null;
}

export interface JournalSummaryResponse {
	data: {
		summary: string;
		totalJournals: number;
	};
}

export interface JournalSearchParams {
	query: string;
	matchCount?: number;
	startTime?: string;
	endTime?: string;
}

export interface SearchJournalsResponse {
	data: JournalEntry[];
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

// Journal reference extracted from tool results for display
export interface JournalReference {
	id: string;
	journalData: string;
	createdAt: string;
}

// Processed message for display (enriched ConversationMessage)
export interface DisplayMessage extends ConversationMessage {
	attachedJournals?: JournalReference[];
}
