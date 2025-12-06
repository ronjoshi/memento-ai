//
//  ChatView.swift
//  Memento AI
//

import SwiftUI

struct ChatView: View {
    @State private var messageText = ""
    @State private var messages: [ConversationMessage] = []
    @State private var isLoading = false
    @State private var conversationId = UUID()
    
    private let databaseService = DatabaseService.shared
    
    var body: some View {
        NavigationView {
            VStack {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 12) {
                        ForEach(messages) { message in
                            MessageBubble(message: message)
                        }
                    }
                    .padding()
                }
                
                Divider()
                
                HStack {
                    TextField("Type a message...", text: $messageText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .disabled(isLoading)
                    
                    Button(action: sendMessage) {
                        if isLoading {
                            ProgressView()
                        } else {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.title2)
                        }
                    }
                    .disabled(messageText.isEmpty || isLoading)
                }
                .padding()
            }
            .navigationTitle("Chat")
            .task {
                await loadMessages()
            }
        }
    }
    
    private func loadMessages() async {
        do {
            messages = try await databaseService.fetchConversationMessages(conversationId: conversationId)
        } catch {
            print("Error loading messages: \(error)")
        }
    }
    
    private func sendMessage() {
        guard !messageText.isEmpty else { return }
        
        let userMessage = messageText
        messageText = ""
        
        Task {
            isLoading = true
            do {
                // Insert user message
                let message = try await databaseService.insertConversationMessage(
                    conversationId: conversationId,
                    role: "user",
                    content: userMessage
                )
                messages.append(message)
                
                // TODO: Call AI service to get response
                // For now, just echo back
                let aiResponse = try await databaseService.insertConversationMessage(
                    conversationId: conversationId,
                    role: "assistant",
                    content: "Echo: \(userMessage)"
                )
                messages.append(aiResponse)
                
            } catch {
                print("Error sending message: \(error)")
            }
            isLoading = false
        }
    }
}

struct MessageBubble: View {
    let message: ConversationMessage
    
    private var isUser: Bool {
        message.role == "user"
    }
    
    var body: some View {
        HStack {
            if isUser { Spacer() }
            
            VStack(alignment: isUser ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .padding(12)
                    .background(isUser ? Color.blue : Color.gray.opacity(0.2))
                    .foregroundColor(isUser ? .white : .primary)
                    .cornerRadius(16)
                
                Text(message.createdAt, formatter: dateFormatter)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            if !isUser { Spacer() }
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
    ChatView()
}
