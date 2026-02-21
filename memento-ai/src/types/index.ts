/**
 * Client-side types for the Memento AI application.
 *
 * NOTE: These types use camelCase for JavaScript conventions.
 * The edge function types in supabase/functions/common/types.ts use snake_case
 * to match database column names. Keep these in sync when making changes.
 */

// Tag colors — expanded palette
export type TagColor =
	| "gray"
	| "slate"
	| "zinc"
	| "stone"
	| "brown"
	| "amber"
	| "orange"
	| "tangerine"
	| "coral"
	| "salmon"
	| "red"
	| "crimson"
	| "rose"
	| "pink"
	| "magenta"
	| "fuchsia"
	| "plum"
	| "purple"
	| "violet"
	| "indigo"
	| "blue"
	| "sky"
	| "cyan"
	| "teal"
	| "emerald"
	| "green"
	| "lime"
	| "mint"
	| "yellow"
	| "mauve"
	| "wine"
	| "lavender"
	| "peach"
	| "olive"
	| "navy"
	| "charcoal";

// Tag color configuration for UI styling (dark mode optimized)
export const TAG_COLOR_CONFIG: Record<
	TagColor,
	{ bg: string; text: string }
> = {
	// Neutrals
	gray: { bg: "#374151", text: "#f3f4f6" },
	slate: { bg: "#475569", text: "#f1f5f9" },
	zinc: { bg: "#52525b", text: "#fafafa" },
	stone: { bg: "#57534e", text: "#fafaf9" },

	// Warm earth tones
	brown: { bg: "#78350f", text: "#fef3c7" },
	amber: { bg: "#b45309", text: "#fffbeb" },
	orange: { bg: "#c2410c", text: "#fff7ed" },
	tangerine: { bg: "#ea580c", text: "#fff7ed" },

	// Warm reds / pinks
	coral: { bg: "#dc4a3a", text: "#fff1f0" },
	salmon: { bg: "#e06b60", text: "#fff5f4" },
	red: { bg: "#dc2626", text: "#fef2f2" },
	crimson: { bg: "#b91c3a", text: "#fff1f3" },
	rose: { bg: "#e11d48", text: "#fff1f2" },
	pink: { bg: "#be185d", text: "#fdf2f8" },
	magenta: { bg: "#c026d3", text: "#fdf4ff" },
	fuchsia: { bg: "#a21caf", text: "#fdf4ff" },

	// Purples / violets
	plum: { bg: "#86198f", text: "#fdf4ff" },
	purple: { bg: "#7c3aed", text: "#f5f3ff" },
	violet: { bg: "#6d28d9", text: "#f5f3ff" },
	indigo: { bg: "#4338ca", text: "#eef2ff" },

	// Blues
	blue: { bg: "#1d4ed8", text: "#eff6ff" },
	sky: { bg: "#0284c7", text: "#f0f9ff" },
	cyan: { bg: "#0891b2", text: "#ecfeff" },

	// Greens / teals
	teal: { bg: "#0d9488", text: "#f0fdfa" },
	emerald: { bg: "#059669", text: "#ecfdf5" },
	green: { bg: "#15803d", text: "#f0fdf4" },
	lime: { bg: "#4d7c0f", text: "#f7fee7" },
	mint: { bg: "#10b981", text: "#ecfdf5" },

	// Yellow
	yellow: { bg: "#a16207", text: "#fefce8" },

	// Rich accents
	mauve: { bg: "#7e5a8e", text: "#f9f0fc" },
	wine: { bg: "#7f1d4e", text: "#fdf2f8" },
	lavender: { bg: "#7c6ecd", text: "#f0eeff" },
	peach: { bg: "#d97756", text: "#fff5f0" },
	olive: { bg: "#556b2f", text: "#f5f7e8" },
	navy: { bg: "#1e3a5f", text: "#e8f0fc" },
	charcoal: { bg: "#2d2d2d", text: "#e5e5e5" },
};

export const TAG_COLORS: TagColor[] = [
	"gray",
	"slate",
	"zinc",
	"stone",
	"brown",
	"amber",
	"orange",
	"tangerine",
	"coral",
	"salmon",
	"red",
	"crimson",
	"rose",
	"pink",
	"magenta",
	"fuchsia",
	"plum",
	"purple",
	"violet",
	"indigo",
	"blue",
	"sky",
	"cyan",
	"teal",
	"emerald",
	"green",
	"lime",
	"mint",
	"yellow",
	"mauve",
	"wine",
	"lavender",
	"peach",
	"olive",
	"navy",
	"charcoal",
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
