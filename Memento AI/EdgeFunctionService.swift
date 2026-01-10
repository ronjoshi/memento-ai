//
//  EdgeFunctionService.swift
//  Memento AI
//
//  Created by Claude on 12/21/25.
//

import Foundation
import Functions
import Supabase

struct MemorySummaryResponse: Codable {
    let data: SummaryData

    struct SummaryData: Codable {
        let summary: String
        let totalMemories: Int
    }
}

struct SearchMemoriesResponse: Codable {
    let data: [Memory]
    let query: String
    let matchCount: Int
}

struct SearchMemoriesRequest: Codable {
    let query: String
    let matchCount: Int
    let startTime: String?
    let endTime: String?

    init(query: String, matchCount: Int = 5, startTime: String? = nil, endTime: String? = nil) {
        self.query = query
        self.matchCount = matchCount
        self.startTime = startTime
        self.endTime = endTime
    }
}

class EdgeFunctionService {
    static let shared = EdgeFunctionService()
    private let supabase = SupabaseManager.shared.client

    private init() {}

    func summarizeMemories() async throws -> MemorySummaryResponse {
        guard supabase.auth.currentUser != nil else {
            throw NSError(domain: "AuthError", code: 401, userInfo: [NSLocalizedDescriptionKey: "User not authenticated"])
        }

        let requestBody = [
            "action": "summarizeMemories"
        ]

        let response: MemorySummaryResponse = try await supabase.functions
            .invoke("memory-fetch", options: FunctionInvokeOptions(body: requestBody))

        return response
    }

    func searchMemories(query: String, matchCount: Int = 5) async throws -> SearchMemoriesResponse {
        guard !query.isEmpty else {
            throw NSError(domain: "SearchError", code: 400, userInfo: [NSLocalizedDescriptionKey: "Query cannot be empty"])
        }

        let requestBody = SearchMemoriesRequest(
            query: query,
            matchCount: matchCount
        )

        let response: SearchMemoriesResponse = try await supabase.functions
            .invoke("search-memories", options: FunctionInvokeOptions(body: requestBody))

        return response
    }
}
