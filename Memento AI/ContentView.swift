//
//  ContentView.swift
//  Memento AI
//
//  Created by Ron Joshi on 9/2/25.
//

import SwiftUI
import Functions
import Supabase

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
                                        Text(memory.createdAt, formatter: dateFormatter)
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
                let _ = try await databaseService.insertMemory(
                    memoryData: memoryText,
                    tag: tagText
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

            let response: String = try await SupabaseManager.shared.client.functions
                .invoke("memory-fetch", options: FunctionInvokeOptions(body: requestBody))

            print("Edge function response: \(response)")
            edgeFunctionResponse = "Status: Success\n\nResponse:\n\(response)"
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
