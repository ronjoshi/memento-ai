//
//  ContentView.swift
//  Memento AI
//
//  Created by Ron Joshi on 9/2/25.
//

import SwiftUI
import Functions
import Supabase

struct MemorySummaryResponse: Codable {
    let data: SummaryData

    struct SummaryData: Codable {
        let summary: String
        let totalMemories: Int
    }
}

struct ContentView: View {
    @StateObject private var authService = AuthService()
    @State private var memories: [Memory] = []
    @State private var memoryText = ""
    @State private var tagText = ""
    @State private var isLoading = false
    @State private var showingAddMemory = false
    @State private var edgeFunctionResponse = ""
    @State private var showingEdgeResponse = false
    @State private var selectedTab = 0

    private let databaseService = DatabaseService.shared
    
    var body: some View {
        if authService.isSignedIn {
            TabView(selection: $selectedTab) {
                NavigationView {
                    VStack {
                        List {
                            ForEach(memories, id: \.id) { memory in
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(memory.memoryData)
                                        .font(.body)
                                    HStack {
                                        Text(memory.tag)
                                            .font(.caption)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 4)
                                            .background(Color.blue.opacity(0.2))
                                            .cornerRadius(8)
                                        Spacer()
                                        Text(memory.createdAt ?? Date(), formatter: dateFormatter)
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }
                                .padding(.vertical, 4)
                            }
                        }
                        .refreshable {
                            await loadMemories()
                        }
                    }
                    .navigationTitle("Memories")
                    .toolbar {
                        ToolbarItem(placement: .navigationBarLeading) {
                            Button("Sign Out") {
                                Task {
                                    try? await authService.signOut()
                                }
                            }
                        }
                        ToolbarItem(placement: .topBarTrailing) {
                            HStack {
                                Button("Test Edge") {
                                    Task {
                                        await callEdgeFunction()
                                    }
                                }
                                .foregroundColor(.green)

                                Button(action: { showingAddMemory = true }) {
                                    Image(systemName: "plus")
                                }
                            }
                        }
                    }
                    .sheet(isPresented: $showingAddMemory) {
                        AddMemoryView(
                            memoryText: $memoryText,
                            tagText: $tagText,
                            isLoading: $isLoading,
                            onSave: saveMemory
                        )
                    }
                    .task {
                        await loadMemories()
                    }
                    .alert("Edge Function Response", isPresented: $showingEdgeResponse) {
                        Button("OK") { }
                    } message: {
                        Text(edgeFunctionResponse)
                    }
                }
                .tabItem {
                    Image(systemName: "brain.head.profile")
                    Text("Memories")
                }
                .tag(0)

                ChatView()
                    .tabItem {
                        Image(systemName: "message.circle")
                        Text("Chat")
                    }
                    .tag(1)
            }
        } else {
            AuthView(authService: authService)
        }
    }
    
    private func loadMemories() async {
        do {
            memories = try await databaseService.fetchMemories()
        } catch {
            print("Error loading memories: \(error)")
        }
    }
    
    private func saveMemory() {
        guard !memoryText.isEmpty, !tagText.isEmpty else { return }

        Task {
            isLoading = true
            do {
                // Generate embedding for the memory content
                let embedding = try await generateEmbedding(for: memoryText)
                print("Generated embedding with \(embedding.count) dimensions")

                try await databaseService.insertMemory(
                    memoryData: memoryText,
                    tag: tagText,
                    embedding: embedding
                )
                await loadMemories()
                memoryText = ""
                tagText = ""
                showingAddMemory = false
            } catch {
                print("Error saving memory: \(error)")
            }
            isLoading = false
        }
    }

    private func generateEmbedding(for text: String) async throws -> [Double] {
        guard let apiKey = ProcessInfo.processInfo.environment["OPENROUTER_OPENAI_EMBEDDINGS_KEY"] else {
            throw NSError(domain: "EmbeddingError", code: 1, userInfo: [NSLocalizedDescriptionKey: "API key not found"])
        }

        let url = URL(string: "https://openrouter.ai/api/v1/embeddings")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        let requestBody: [String: Any] = [
            "model": "openai/text-embedding-3-small",
            "input": text,
            "encoding_format": "float"
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw NSError(domain: "EmbeddingError", code: 2, userInfo: [NSLocalizedDescriptionKey: "Invalid response from API"])
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        guard let dataArray = json?["data"] as? [[String: Any]],
              let firstResult = dataArray.first,
              let embedding = firstResult["embedding"] as? [Double] else {
            throw NSError(domain: "EmbeddingError", code: 3, userInfo: [NSLocalizedDescriptionKey: "Failed to parse embedding response"])
        }

        return embedding
    }

    private func callEdgeFunction() async {
        guard SupabaseManager.shared.client.auth.currentUser != nil else {
            edgeFunctionResponse = "User not authenticated"
            showingEdgeResponse = true
            return
        }

        do {
            let requestBody = [
                "action": "summarizeMemories"
            ]

            let response: MemorySummaryResponse = try await SupabaseManager.shared.client.functions
                .invoke("memory-fetch", options: FunctionInvokeOptions(body: requestBody))

            print("Edge function response: \(response)")
            edgeFunctionResponse = "Status: Success\n\nTotal Memories: \(response.data.totalMemories)\n\nSummary:\n\(response.data.summary)"
            showingEdgeResponse = true

        } catch {
            print("Error calling edge function: \(error)")
            edgeFunctionResponse = "Error: \(error.localizedDescription)"
            showingEdgeResponse = true
        }
    }
}

private let dateFormatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.dateStyle = .short
    formatter.timeStyle = .short
    return formatter
}()

#Preview {
    ContentView()
}
