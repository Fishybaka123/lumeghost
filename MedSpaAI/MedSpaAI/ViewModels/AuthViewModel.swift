//
//  AuthViewModel.swift
//  MedSpaAI
//
//  Authentication view model with Firebase-ready stubs
//

import Foundation
import SwiftUI
import LocalAuthentication

@MainActor
class AuthViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var currentUser: User?
    
    // Form state
    @Published var email = ""
    @Published var password = ""
    @Published var confirmPassword = ""
    @Published var rememberMe = false
    
    // Biometric
    @Published var isBiometricAvailable = false
    @Published var biometricType: LABiometryType = .none
    
    // MARK: - User Model
    struct User: Codable {
        let id: String
        let email: String
        let displayName: String?
        var initials: String {
            if let name = displayName, !name.isEmpty {
                let parts = name.split(separator: " ")
                let first = parts.first?.prefix(1).uppercased() ?? ""
                let last = parts.count > 1 ? parts.last?.prefix(1).uppercased() ?? "" : ""
                return "\(first)\(last)"
            }
            return email.prefix(2).uppercased()
        }
    }
    
    // MARK: - Initialization
    init() {
        checkBiometricAvailability()
    }
    
    // MARK: - Authentication Methods
    func checkAuthState() {
        // Check for stored session
        if let userData = UserDefaults.standard.data(forKey: "currentUser"),
           let user = try? JSONDecoder().decode(User.self, from: userData) {
            self.currentUser = user
            self.isAuthenticated = true
        }
    }
    
    func signIn() async {
        guard validateEmail(), validatePassword() else { return }
        
        isLoading = true
        errorMessage = nil
        
        // Simulate network delay
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        
        // In production, this would call Firebase Auth
        // For now, simulate successful login
        let user = User(
            id: UUID().uuidString,
            email: email,
            displayName: email.components(separatedBy: "@").first?.capitalized
        )
        
        // Store session
        if let userData = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(userData, forKey: "currentUser")
        }
        
        currentUser = user
        isAuthenticated = true
        isLoading = false
        
        // Haptic feedback
        HapticManager.shared.notification(type: .success)
    }
    
    func signUp() async {
        guard validateEmail(), validatePassword(), validateConfirmPassword() else { return }
        
        isLoading = true
        errorMessage = nil
        
        // Simulate network delay
        try? await Task.sleep(nanoseconds: 1_500_000_000)
        
        // In production, this would call Firebase Auth
        let user = User(
            id: UUID().uuidString,
            email: email,
            displayName: email.components(separatedBy: "@").first?.capitalized
        )
        
        if let userData = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(userData, forKey: "currentUser")
        }
        
        currentUser = user
        isAuthenticated = true
        isLoading = false
        
        HapticManager.shared.notification(type: .success)
    }
    
    func signOut() {
        UserDefaults.standard.removeObject(forKey: "currentUser")
        currentUser = nil
        isAuthenticated = false
        email = ""
        password = ""
        
        HapticManager.shared.notification(type: .warning)
    }
    
    func sendMagicLink() async {
        guard validateEmail() else { return }
        
        isLoading = true
        errorMessage = nil
        
        // Simulate sending magic link
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        
        isLoading = false
        // Show success message
        errorMessage = "✨ Magic link sent to \(email)!"
        
        HapticManager.shared.notification(type: .success)
    }
    
    func sendPasswordReset() async {
        guard validateEmail() else { return }
        
        isLoading = true
        errorMessage = nil
        
        // Simulate password reset
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        
        isLoading = false
        errorMessage = "📧 Password reset email sent!"
        
        HapticManager.shared.notification(type: .success)
    }
    
    // MARK: - Biometric Authentication
    func checkBiometricAvailability() {
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            isBiometricAvailable = true
            biometricType = context.biometryType
        }
    }
    
    func authenticateWithBiometrics() async {
        let context = LAContext()
        let reason = "Sign in to MedSpa AI"
        
        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: reason
            )
            
            if success {
                // Check for stored credentials
                if let userData = UserDefaults.standard.data(forKey: "currentUser"),
                   let user = try? JSONDecoder().decode(User.self, from: userData) {
                    currentUser = user
                    isAuthenticated = true
                    HapticManager.shared.notification(type: .success)
                }
            }
        } catch {
            errorMessage = "Biometric authentication failed"
            HapticManager.shared.notification(type: .error)
        }
    }
    
    // MARK: - Validation
    private func validateEmail() -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        
        if !emailPredicate.evaluate(with: email) {
            errorMessage = "Please enter a valid email address"
            HapticManager.shared.notification(type: .error)
            return false
        }
        return true
    }
    
    private func validatePassword() -> Bool {
        if password.count < 6 {
            errorMessage = "Password must be at least 6 characters"
            HapticManager.shared.notification(type: .error)
            return false
        }
        return true
    }
    
    private func validateConfirmPassword() -> Bool {
        if password != confirmPassword {
            errorMessage = "Passwords do not match"
            HapticManager.shared.notification(type: .error)
            return false
        }
        return true
    }
}

// MARK: - Haptic Manager
class HapticManager {
    static let shared = HapticManager()
    
    private init() {}
    
    func notification(type: UINotificationFeedbackGenerator.FeedbackType) {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(type)
    }
    
    func impact(style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.impactOccurred()
    }
    
    func selection() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }
}
