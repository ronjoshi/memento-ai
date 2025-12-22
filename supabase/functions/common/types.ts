export interface Memory {
	id: string;
	user_id: string;
	memory_data: string;
	tag: string;
	created_at: string | null;
	embedding?: number[];
}

export interface Tag {
	id: number;
	user_id: string;
	name: string;
	created_at: string;
}

export interface SearchRequest {
	query: string;
	matchCount?: number;
	startTime?: string;
	endTime?: string;
}

export interface RawSearchResult {
	id: string;
	user_id: string;
	memory_data: string;
	tag: string;
	created_at: string | null;
	embedding?: number[];
	fts?: string;
	similarity?: number;
	rank?: number;
	score?: number;
}
