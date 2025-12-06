//
//  AddMemoryView.swift
//  Memento AI
//

import SwiftUI

struct AddMemoryView: View {
    @Binding var memoryText: String
    @Binding var tagText: String
    @Binding var isLoading: Bool
    var onSave: () -> Void
    
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Memory")) {
                    TextEditor(text: $memoryText)
                        .frame(minHeight: 100)
                }
                
                Section(header: Text("Tag")) {
                    TextField("Tag", text: $tagText)
                }
            }
            .navigationTitle("Add Memory")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    if isLoading {
                        ProgressView()
                    } else {
                        Button("Save") {
                            onSave()
                        }
                        .disabled(memoryText.isEmpty || tagText.isEmpty)
                    }
                }
            }
        }
    }
}

#Preview {
    AddMemoryView(
        memoryText: .constant(""),
        tagText: .constant(""),
        isLoading: .constant(false),
        onSave: {}
    )
}
