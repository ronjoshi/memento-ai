//
//  AuthView.swift
//  Memento AI
//

import SwiftUI

struct AuthView: View {
    @ObservedObject var authService: AuthService
    @State private var email = ""
    @State private var password = ""
    @State private var isSignUp = false
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Memento AI")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .padding(.bottom, 40)
                
                TextField("Email", text: $email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .textContentType(.emailAddress)
                    .autocapitalization(.none)
                    .keyboardType(.emailAddress)
                
                SecureField("Password", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .textContentType(isSignUp ? .newPassword : .password)
                
                if authService.isLoading {
                    ProgressView()
                        .padding()
                } else {
                    Button(action: handleAuth) {
                        Text(isSignUp ? "Sign Up" : "Sign In")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                    }
                    
                    Button(action: { isSignUp.toggle() }) {
                        Text(isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up")
                            .foregroundColor(.blue)
                    }
                    .padding(.top, 10)
                }
            }
            .padding()
            .navigationTitle(isSignUp ? "Sign Up" : "Sign In")
            .alert("Error", isPresented: $showingAlert) {
                Button("OK") { }
            } message: {
                Text(alertMessage)
            }
        }
    }
    
    private func handleAuth() {
        guard !email.isEmpty, !password.isEmpty else {
            alertMessage = "Please enter both email and password"
            showingAlert = true
            return
        }
        
        Task {
            do {
                if isSignUp {
                    try await authService.signUp(email: email, password: password)
                } else {
                    try await authService.signIn(email: email, password: password)
                }
            } catch {
                alertMessage = error.localizedDescription
                showingAlert = true
            }
        }
    }
}

#Preview {
    AuthView(authService: AuthService())
}
