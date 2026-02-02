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

export interface ConversationMessage {
	id: string;
	conversationId: string;
	userId: string | null;
	role: "user" | "assistant";
	content: string;
	createdAt: string;
}

export interface MemorySummaryResponse {
	data: {
		summary: string;
		totalMemories: number;
	};
}

export interface SearchMemoriesRequest {
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
