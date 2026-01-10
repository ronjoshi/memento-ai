//
//  SearchView.swift
//  Memento AI
//
//  Created by Claude on 12/21/25.
//

import SwiftUI

private let dateFormatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.dateStyle = .short
    formatter.timeStyle = .short
    return formatter
}()

struct SearchView: View {
    @State private var searchQuery = ""
    @State private var searchResults: [Memory] = []
    @State private var isSearching = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            VStack {
                HStack {
                    TextField("Search memories...", text: $searchQuery)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .padding()

                    Button(action: performSearch) {
                        if isSearching {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                        } else {
                            Image(systemName: "magnifyingglass")
                        }
                    }
                    .disabled(searchQuery.isEmpty || isSearching)
                    .padding(.trailing)
                }

                if searchResults.isEmpty && !searchQuery.isEmpty && !isSearching {
                    Text("No results found")
                        .foregroundColor(.secondary)
                        .padding()
                    Spacer()
                } else if !searchResults.isEmpty {
                    List {
                        ForEach(searchResults, id: \.id) { memory in
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
                } else {
                    Spacer()
                }
            }
            .navigationTitle("Search Memories")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }

    private func performSearch() {
        guard !searchQuery.isEmpty else { return }

        Task {
            isSearching = true
            do {
                let response = try await EdgeFunctionService.shared.searchMemories(
                    query: searchQuery,
                    matchCount: 5
                )
                searchResults = response.data
            } catch {
                print("Error searching memories: \(error)")
                searchResults = []
            }
            isSearching = false
        }
    }
}
