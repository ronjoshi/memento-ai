import { SupabaseClient } from "@supabase/supabase-js";
import {
	Memory,
	Tag,
	TagColor,
	MemoryWithTag,
	ConversationMessage,
} from "@/types";

export class DatabaseService {
	private supabase: SupabaseClient;

	constructor(supabase: SupabaseClient) {
		this.supabase = supabase;
	}

	async fetchMemories(): Promise<Memory[]> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			throw new Error("User not authenticated");
		}

		const { data, error } = await this.supabase
			.from("memories")
			.select("*")
			.eq("user_id", user.id)
			.order("created_at", { ascending: false });

		if (error) {
			throw error;
		}

		return (data || []).map((item) => ({
			id: item.id,
			userId: item.user_id,
			memoryData: item.memory_data,
			tagIds: item.tag_ids || [],
			createdAt: item.created_at,
			embedding: item.embedding,
		}));
	}

	async filterMemories(opts: {
		tagIds?: number[];
		startTime?: string;
		endTime?: string;
	}): Promise<Memory[]> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			throw new Error("User not authenticated");
		}

		let query = this.supabase
			.from("memories")
			.select("id, user_id, memory_data, tag_ids, created_at, embedding")
			.eq("user_id", user.id);

		if (opts.startTime) {
			query = query.gte("created_at", opts.startTime);
		}
		if (opts.endTime) {
			query = query.lte("created_at", opts.endTime);
		}
		if (opts.tagIds && opts.tagIds.length > 0) {
			query = query.overlaps("tag_ids", opts.tagIds);
		}

		const { data, error } = await query.order("created_at", {
			ascending: false,
		});

		if (error) {
			throw error;
		}

		return (data || []).map((item: any) => ({
			id: item.id,
			userId: item.user_id,
			memoryData: item.memory_data,
			tagIds: item.tag_ids || [],
			createdAt: item.created_at,
			embedding: item.embedding,
		}));
	}

	async fetchMemoriesWithTags(): Promise<MemoryWithTag[]> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			throw new Error("User not authenticated");
		}

		// Fetch memories and tags
		const [memoriesResult, tagsResult] = await Promise.all([
			this.supabase
				.from("memories")
				.select("id, user_id, memory_data, tag_ids, created_at")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false }),
			this.supabase
				.from("tags")
				.select("id, user_id, name, color, created_at")
				.eq("user_id", user.id),
		]);

		if (memoriesResult.error) {
			throw memoriesResult.error;
		}

		// Build a map of tag id -> tag for quick lookup
		const tagMap = new Map<number, Tag>();
		if (tagsResult.data) {
			for (const tag of tagsResult.data) {
				tagMap.set(tag.id, {
					id: tag.id,
					userId: tag.user_id,
					name: tag.name,
					color: tag.color || "gray",
					createdAt: tag.created_at,
				});
			}
		}

		return (memoriesResult.data || []).map((item) => ({
			id: item.id,
			userId: item.user_id,
			memoryData: item.memory_data,
			createdAt: item.created_at,
			tags: (item.tag_ids || [])
				.map((id: number) => tagMap.get(id))
				.filter((t: Tag | undefined): t is Tag => t !== undefined),
		}));
	}

	async insertMemory(
		memoryData: string,
		embedding: number[],
		tagIds: number[],
	): Promise<string> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			throw new Error("User not authenticated");
		}

		const { data, error } = await this.supabase
			.from("memories")
			.insert({
				user_id: user.id,
				memory_data: memoryData,
				tag_ids: tagIds,
				embedding: embedding,
				created_at: new Date().toISOString(),
			})
			.select("id")
			.single();

		if (error) {
			throw error;
		}

		return data.id;
	}

	async fetchTags(): Promise<Tag[]> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			throw new Error("User not authenticated");
		}

		const { data, error } = await this.supabase
			.from("tags")
			.select("*")
			.eq("user_id", user.id)
			.order("name", { ascending: true });

		if (error) {
			throw error;
		}

		return (data || []).map((item) => ({
			id: item.id,
			userId: item.user_id,
			name: item.name,
			color: item.color || "gray",
			createdAt: item.created_at,
		}));
	}

	async createTag(name: string, color: TagColor): Promise<Tag> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			throw new Error("User not authenticated");
		}

		const { data, error } = await this.supabase
			.from("tags")
			.insert({
				user_id: user.id,
				name: name,
				color: color,
			})
			.select()
			.single();

		if (error) {
			throw error;
		}

		return {
			id: data.id,
			userId: data.user_id,
			name: data.name,
			color: data.color || "gray",
			createdAt: data.created_at,
		};
	}

	async updateTag(
		id: number,
		updates: { name?: string; color?: TagColor },
	): Promise<Tag> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			throw new Error("User not authenticated");
		}

		const updateData: Record<string, unknown> = {};
		if (updates.name !== undefined) updateData.name = updates.name;
		if (updates.color !== undefined) updateData.color = updates.color;

		const { data, error } = await this.supabase
			.from("tags")
			.update(updateData)
			.eq("id", id)
			.eq("user_id", user.id)
			.select()
			.single();

		if (error) {
			throw error;
		}

		return {
			id: data.id,
			userId: data.user_id,
			name: data.name,
			color: data.color || "gray",
			createdAt: data.created_at,
		};
	}

	async deleteTag(id: number): Promise<void> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			throw new Error("User not authenticated");
		}

		const { error } = await this.supabase
			.from("tags")
			.delete()
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}
	}

	async setMemoryTags(memoryId: string, tagIds: number[]): Promise<void> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			throw new Error("User not authenticated");
		}

		const { error } = await this.supabase
			.from("memories")
			.update({ tag_ids: tagIds })
			.eq("id", memoryId)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}
	}

	async fetchConversationMessages(
		conversationId: string,
	): Promise<ConversationMessage[]> {
		const { data, error } = await this.supabase
			.from("chat_entries")
			.select("*")
			.eq("conversation_id", conversationId)
			.order("created_at", { ascending: true });

		if (error) {
			throw error;
		}

		return (data || []).map((item) => ({
			id: item.id,
			conversationId: item.conversation_id,
			userId: item.user_id,
			role: item.role as "user" | "assistant",
			content: item.content,
			createdAt: item.created_at,
		}));
	}

	async insertConversationMessage(
		conversationId: string,
		role: "user" | "assistant",
		content: string,
		userId: string | null = null,
	): Promise<ConversationMessage> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user && !userId) {
			throw new Error("User not authenticated");
		}

		const { data, error } = await this.supabase
			.from("chat_entries")
			.insert({
				conversation_id: conversationId,
				user_id: userId || user?.id,
				role: role,
				content: content,
			})
			.select()
			.single();

		if (error) {
			throw error;
		}

		return {
			id: data.id,
			conversationId: data.conversation_id,
			userId: data.user_id,
			role: data.role as "user" | "assistant",
			content: data.content,
			createdAt: data.created_at,
		};
	}
}
