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

// Tag color configuration for UI styling (light and dark mode)
export const TAG_COLOR_CONFIG: Record<
	TagColor,
	{ bg: string; text: string; bgDark: string; textDark: string }
> = {
	gray: {
		bg: "#f1f5f9",
		text: "#475569",
		bgDark: "#334155",
		textDark: "#cbd5e1",
	},
	brown: {
		bg: "#fef3c7",
		text: "#92400e",
		bgDark: "#422006",
		textDark: "#fbbf24",
	},
	orange: {
		bg: "#ffedd5",
		text: "#c2410c",
		bgDark: "#431407",
		textDark: "#fb923c",
	},
	yellow: {
		bg: "#fef9c3",
		text: "#a16207",
		bgDark: "#422006",
		textDark: "#facc15",
	},
	green: {
		bg: "#dcfce7",
		text: "#166534",
		bgDark: "#14532d",
		textDark: "#4ade80",
	},
	blue: {
		bg: "#dbeafe",
		text: "#1d4ed8",
		bgDark: "#1e3a8a",
		textDark: "#60a5fa",
	},
	purple: {
		bg: "#f3e8ff",
		text: "#7c3aed",
		bgDark: "#4c1d95",
		textDark: "#a78bfa",
	},
	pink: {
		bg: "#fce7f3",
		text: "#be185d",
		bgDark: "#831843",
		textDark: "#f472b6",
	},
	red: {
		bg: "#fee2e2",
		text: "#dc2626",
		bgDark: "#7f1d1d",
		textDark: "#f87171",
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

export interface Memory {
	id: string;
	userId: string;
	memoryData: string;
	tagIds: number[]; // Array of tag IDs stored in database
	createdAt: string;
	embedding?: number[];
	tags?: Tag[]; // Resolved tag objects (populated from tagIds)
}

export interface MemoryWithTag {
	id: string;
	userId: string;
	memoryData: string;
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
