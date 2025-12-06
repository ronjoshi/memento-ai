import Foundation
import Supabase

struct Memory: Codable {
    let id: UUID
    let userId: UUID
    let memoryData: String
    let tag: String
    let createdAt: Date
    
    private enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case memoryData = "memory_data"
        case tag
        case createdAt = "created_at"
    }
}

struct Tag: Codable {
    let id: Int
    let userId: UUID
    let name: String
    let createdAt: Date
    
    private enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case name
        case createdAt = "created_at"
    }
}

struct MemoryWithTag: Codable {
    let id: UUID
    let userId: UUID
    let memoryData: String
    let tag: String
    let createdAt: Date
    let tags: [Tag]

    private enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case memoryData = "memory_data"
        case tag
        case createdAt = "created_at"
        case tags
    }
}

struct ConversationMessage: Codable, Identifiable {
    let id: UUID
    let conversationId: UUID
    let userId: UUID?
    let role: String
    let content: String
    let createdAt: Date

    private enum CodingKeys: String, CodingKey {
        case id
        case conversationId = "conversation_id"
        case userId = "user_id"
        case role
        case content
        case createdAt = "created_at"
    }
}

class DatabaseService {
    static let shared = DatabaseService()
    private let supabase = SupabaseManager.shared.client
    
    private init() {}
    
    func fetchMemories() async throws -> [Memory] {
        guard let userId = supabase.auth.currentUser?.id else {
            throw NSError(domain: "AuthError", code: 401, userInfo: [NSLocalizedDescriptionKey: "User not authenticated"])
        }
        
        let memories: [Memory] = try await supabase
            .from("memories")
            .select()
            .eq("user_id", value: userId.uuidString)
            .execute()
            .value
        return memories
    }
    
    func fetchMemoriesWithTags() async throws -> [MemoryWithTag] {
        guard let userId = supabase.auth.currentUser?.id else {
            throw NSError(domain: "AuthError", code: 401, userInfo: [NSLocalizedDescriptionKey: "User not authenticated"])
        }
        
        let memoriesWithTags: [MemoryWithTag] = try await supabase
            .from("memories")
            .select(
                """
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
                """
            )
            .eq("user_id", value: userId.uuidString)
            .execute()
            .value
        return memoriesWithTags
    }
    
    func insertMemory(memoryData: String, tag: String) async throws {
        guard let userId = supabase.auth.currentUser?.id else {
            throw NSError(domain: "AuthError", code: 401, userInfo: [NSLocalizedDescriptionKey: "User not authenticated"])
        }
        
        let response = try await supabase
            .from("memories")
            .insert([
                "user_id": userId.uuidString,
                "memory_data": memoryData,
                "tag": tag
            ])
            .single()
            .execute()
//            .value
//        return memory
        print("asdf")
        print(String(data: response.data, encoding: .utf8))
    }
    
    func fetchTags() async throws -> [Tag] {
        guard let userId = supabase.auth.currentUser?.id else {
            throw NSError(domain: "AuthError", code: 401, userInfo: [NSLocalizedDescriptionKey: "User not authenticated"])
        }

        let tags: [Tag] = try await supabase
            .from("tags")
            .select()
            .eq("user_id", value: userId.uuidString)
            .execute()
            .value
        return tags
    }

    func fetchConversationMessages(conversationId: UUID) async throws -> [ConversationMessage] {
        let messages: [ConversationMessage] = try await supabase
            .from("chat_entries")
            .select()
            .eq("conversation_id", value: conversationId.uuidString)
            .order("created_at", ascending: true)
            .execute()
            .value
        return messages
    }

    func insertConversationMessage(conversationId: UUID, role: String, content: String) async throws -> ConversationMessage {
        guard let userId = supabase.auth.currentUser?.id else {
            throw NSError(domain: "AuthError", code: 401, userInfo: [NSLocalizedDescriptionKey: "User not authenticated"])
        }

        let message: ConversationMessage = try await supabase
            .from("chat_entries")
            .insert([
                "conversation_id": conversationId.uuidString,
                "user_id": userId.uuidString,
                "role": role,
                "content": content
            ])
            .select()
            .single()
            .execute()
            .value
        return message
    }
}
