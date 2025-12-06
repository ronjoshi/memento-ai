import Foundation
import AuthenticationServices
import Supabase
import Combine

@MainActor
class AuthService: ObservableObject {
    @Published var user: User?
    @Published var isLoading = false
    @Published var isSignedIn = false
    
    private let client = SupabaseManager.shared.client
    
    init() {
        Task {
            await getCurrentUser()
        }
    }
    
    func getCurrentUser() async {
        do {
            user = try await client.auth.user()
            isSignedIn = user != nil
        } catch {
            user = nil
            isSignedIn = false
        }
    }
    
    func signUp(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }
        
        let response = try await client.auth.signUp(email: email, password: password)
        user = response.user
        isSignedIn = user != nil
    }
    
    func signIn(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }
        
        let response = try await client.auth.signIn(email: email, password: password)
        user = response.user
        isSignedIn = user != nil
    }
    
    func signOut() async throws {
        isLoading = true
        defer { isLoading = false }
        
        try await client.auth.signOut()
        user = nil
        isSignedIn = false
    }
    
    func resetPassword(email: String) async throws {
        try await client.auth.resetPasswordForEmail(email)
    }
}
