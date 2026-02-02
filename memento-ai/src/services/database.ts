import { SupabaseClient } from "@supabase/supabase-js";
import { Memory, Tag, MemoryWithTag, ConversationMessage } from "@/types";

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
			tag: item.tag,
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

		const { data, error } = await this.supabase
			.from("memories")
			.select(
				`
        id,
        user_id,
        memory_data,
        tag,
        created_at,
        tags (
          id,
          user_id,
          name,
          created_at
        )
      `,
			)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		return (data || []).map((item) => ({
			id: item.id,
			userId: item.user_id,
			memoryData: item.memory_data,
			tag: item.tag,
			createdAt: item.created_at,
			tags: (item.tags || []).map((tag: any) => ({
				id: tag.id,
				userId: tag.user_id,
				name: tag.name,
				createdAt: tag.created_at,
			})),
		}));
	}

	async insertMemory(
		memoryData: string,
		tag: string,
		embedding: number[],
	): Promise<void> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			throw new Error("User not authenticated");
		}

		const { error } = await this.supabase.from("memories").insert({
			user_id: user.id,
			memory_data: memoryData,
			tag: tag,
			embedding: embedding,
			created_at: new Date().toISOString(),
		});

		if (error) {
			throw error;
		}
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
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		return (data || []).map((item) => ({
			id: item.id,
			userId: item.user_id,
			name: item.name,
			createdAt: item.created_at,
		}));
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
