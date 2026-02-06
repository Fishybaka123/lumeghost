//
//  LoginView.swift
//  MedSpaAI
//
//  Beautiful login screen with ocean gradient and animations
//

import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var isShowingSignUp = false
    @State private var isShowingForgotPassword = false
    @State private var showPassword = false
    @State private var animateWave = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Ocean gradient background
                Theme.Colors.oceanGradient
                    .ignoresSafeArea()
                
                // Animated wave circles
                WaveAnimationView(animate: $animateWave)
                    .ignoresSafeArea()
                
                // Content
                ScrollView {
                    VStack(spacing: Theme.Spacing.xl) {
                        Spacer()
                            .frame(height: geometry.size.height * 0.08)
                        
                        // Logo and branding
                        VStack(spacing: Theme.Spacing.md) {
                            // Logo icon
                            ZStack {
                                Circle()
                                    .fill(.white.opacity(0.2))
                                    .frame(width: 80, height: 80)
                                
                                Image(systemName: "waveform.path.ecg")
                                    .font(.system(size: 36, weight: .medium))
                                    .foregroundColor(.white)
                            }
                            
                            Text("MedSpa AI")
                                .font(.system(size: 36, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            
                            Text("Illuminate Your Client Retention")
                                .font(Theme.Typography.subheadline)
                                .foregroundColor(.white.opacity(0.9))
                        }
                        .padding(.bottom, Theme.Spacing.lg)
                        
                        // Login card
                        VStack(spacing: Theme.Spacing.lg) {
                            // Header
                            VStack(spacing: Theme.Spacing.xs) {
                                Text("Welcome back")
                                    .font(Theme.Typography.title2)
                                    .foregroundColor(Theme.Colors.textPrimary)
                                
                                Text("Sign in to your account")
                                    .font(Theme.Typography.subheadline)
                                    .foregroundColor(Theme.Colors.textSecondary)
                            }
                            
                            // Form
                            VStack(spacing: Theme.Spacing.md) {
                                // Email field
                                VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                                    Text("Email")
                                        .font(Theme.Typography.caption)
                                        .fontWeight(.medium)
                                        .foregroundColor(Theme.Colors.textSecondary)
                                    
                                    HStack {
                                        Image(systemName: "envelope")
                                            .foregroundColor(Theme.Colors.textMuted)
                                        
                                        TextField("you@medspa.com", text: $authViewModel.email)
                                            .textContentType(.emailAddress)
                                            .keyboardType(.emailAddress)
                                            .autocapitalization(.none)
                                            .disableAutocorrection(true)
                                    }
                                    .padding()
                                    .background(Color(hex: "F9FAFB"))
                                    .cornerRadius(Theme.CornerRadius.medium)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: Theme.CornerRadius.medium)
                                            .stroke(Color(hex: "E5E7EB"), lineWidth: 1)
                                    )
                                }
                                
                                // Password field
                                VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                                    Text("Password")
                                        .font(Theme.Typography.caption)
                                        .fontWeight(.medium)
                                        .foregroundColor(Theme.Colors.textSecondary)
                                    
                                    HStack {
                                        Image(systemName: "lock")
                                            .foregroundColor(Theme.Colors.textMuted)
                                        
                                        if showPassword {
                                            TextField("••••••••", text: $authViewModel.password)
                                        } else {
                                            SecureField("••••••••", text: $authViewModel.password)
                                        }
                                        
                                        Button {
                                            showPassword.toggle()
                                            HapticManager.shared.selection()
                                        } label: {
                                            Image(systemName: showPassword ? "eye.slash" : "eye")
                                                .foregroundColor(Theme.Colors.textMuted)
                                        }
                                    }
                                    .padding()
                                    .background(Color(hex: "F9FAFB"))
                                    .cornerRadius(Theme.CornerRadius.medium)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: Theme.CornerRadius.medium)
                                            .stroke(Color(hex: "E5E7EB"), lineWidth: 1)
                                    )
                                }
                                
                                // Remember me & Forgot password
                                HStack {
                                    Toggle(isOn: $authViewModel.rememberMe) {
                                        Text("Remember me")
                                            .font(Theme.Typography.caption)
                                            .foregroundColor(Theme.Colors.textSecondary)
                                    }
                                    .toggleStyle(CheckboxToggleStyle())
                                    
                                    Spacer()
                                    
                                    Button("Forgot password?") {
                                        isShowingForgotPassword = true
                                    }
                                    .font(Theme.Typography.caption)
                                    .foregroundColor(Theme.Colors.turquoise)
                                }
                            }
                            
                            // Error message
                            if let error = authViewModel.errorMessage {
                                Text(error)
                                    .font(Theme.Typography.caption)
                                    .foregroundColor(error.contains("✨") || error.contains("📧") ? Theme.Colors.success : Theme.Colors.danger)
                                    .multilineTextAlignment(.center)
                            }
                            
                            // Sign in button
                            Button {
                                Task {
                                    await authViewModel.signIn()
                                }
                            } label: {
                                HStack {
                                    if authViewModel.isLoading {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    } else {
                                        Text("Sign In")
                                    }
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Theme.Colors.primaryGradient)
                                .foregroundColor(.white)
                                .font(Theme.Typography.headline)
                                .cornerRadius(Theme.CornerRadius.medium)
                            }
                            .disabled(authViewModel.isLoading)
                            
                            // Divider
                            HStack {
                                Rectangle()
                                    .fill(Color(hex: "E5E7EB"))
                                    .frame(height: 1)
                                
                                Text("or continue with")
                                    .font(Theme.Typography.caption)
                                    .foregroundColor(Theme.Colors.textMuted)
                                
                                Rectangle()
                                    .fill(Color(hex: "E5E7EB"))
                                    .frame(height: 1)
                            }
                            
                            // Alternative sign-in options
                            VStack(spacing: Theme.Spacing.sm) {
                                // Magic Link
                                Button {
                                    Task {
                                        await authViewModel.sendMagicLink()
                                    }
                                } label: {
                                    HStack {
                                        Image(systemName: "envelope.badge")
                                        Text("Send Magic Link")
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.white)
                                    .foregroundColor(Theme.Colors.textPrimary)
                                    .font(Theme.Typography.subheadline)
                                    .cornerRadius(Theme.CornerRadius.medium)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: Theme.CornerRadius.medium)
                                            .stroke(Color(hex: "E5E7EB"), lineWidth: 1)
                                    )
                                }
                                
                                // Biometric
                                if authViewModel.isBiometricAvailable {
                                    Button {
                                        Task {
                                            await authViewModel.authenticateWithBiometrics()
                                        }
                                    } label: {
                                        HStack {
                                            Image(systemName: authViewModel.biometricType == .faceID ? "faceid" : "touchid")
                                            Text(authViewModel.biometricType == .faceID ? "Sign in with Face ID" : "Sign in with Touch ID")
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color.white)
                                        .foregroundColor(Theme.Colors.textPrimary)
                                        .font(Theme.Typography.subheadline)
                                        .cornerRadius(Theme.CornerRadius.medium)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: Theme.CornerRadius.medium)
                                                .stroke(Color(hex: "E5E7EB"), lineWidth: 1)
                                        )
                                    }
                                }
                            }
                            
                            // Sign up link
                            HStack {
                                Text("Don't have an account?")
                                    .font(Theme.Typography.caption)
                                    .foregroundColor(Theme.Colors.textSecondary)
                                
                                Button("Sign up") {
                                    isShowingSignUp = true
                                }
                                .font(Theme.Typography.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(Theme.Colors.turquoise)
                            }
                        }
                        .padding(Theme.Spacing.lg)
                        .background(Color.white)
                        .cornerRadius(Theme.CornerRadius.xl)
                        .shadow(color: .black.opacity(0.15), radius: 20, y: 10)
                        .padding(.horizontal, Theme.Spacing.lg)
                        
                        Spacer()
                    }
                }
            }
        }
        .onAppear {
            animateWave = true
        }
        .sheet(isPresented: $isShowingSignUp) {
            SignUpView()
                .environmentObject(authViewModel)
        }
        .sheet(isPresented: $isShowingForgotPassword) {
            ForgotPasswordView()
                .environmentObject(authViewModel)
        }
    }
}

// MARK: - Wave Animation View
struct WaveAnimationView: View {
    @Binding var animate: Bool
    
    var body: some View {
        ZStack {
            // Multiple wave circles
            ForEach(0..<3) { index in
                Circle()
                    .stroke(.white.opacity(0.1 - Double(index) * 0.03), lineWidth: 1)
                    .frame(width: 300 + CGFloat(index * 150), height: 300 + CGFloat(index * 150))
                    .offset(x: 100, y: -200)
                    .scaleEffect(animate ? 1.2 : 1.0)
                    .animation(
                        .easeInOut(duration: 4 + Double(index))
                            .repeatForever(autoreverses: true)
                            .delay(Double(index) * 0.5),
                        value: animate
                    )
            }
            
            ForEach(0..<2) { index in
                Circle()
                    .stroke(.white.opacity(0.08 - Double(index) * 0.02), lineWidth: 1)
                    .frame(width: 200 + CGFloat(index * 100), height: 200 + CGFloat(index * 100))
                    .offset(x: -150, y: 300)
                    .scaleEffect(animate ? 1.15 : 1.0)
                    .animation(
                        .easeInOut(duration: 5 + Double(index))
                            .repeatForever(autoreverses: true)
                            .delay(Double(index) * 0.3),
                        value: animate
                    )
            }
        }
    }
}

// MARK: - Checkbox Toggle Style
struct CheckboxToggleStyle: ToggleStyle {
    func makeBody(configuration: Configuration) -> some View {
        Button {
            configuration.isOn.toggle()
        } label: {
            HStack(spacing: Theme.Spacing.xs) {
                Image(systemName: configuration.isOn ? "checkmark.square.fill" : "square")
                    .foregroundColor(configuration.isOn ? Theme.Colors.turquoise : Theme.Colors.textMuted)
                configuration.label
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Sign Up View
struct SignUpView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.Spacing.lg) {
                    Text("Create Account")
                        .font(Theme.Typography.title2)
                    
                    VStack(spacing: Theme.Spacing.md) {
                        // Email
                        TextField("Email", text: $authViewModel.email)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(.emailAddress)
                        
                        // Password
                        SecureField("Password", text: $authViewModel.password)
                            .textFieldStyle(.roundedBorder)
                        
                        // Confirm Password
                        SecureField("Confirm Password", text: $authViewModel.confirmPassword)
                            .textFieldStyle(.roundedBorder)
                    }
                    
                    if let error = authViewModel.errorMessage {
                        Text(error)
                            .foregroundColor(Theme.Colors.danger)
                            .font(Theme.Typography.caption)
                    }
                    
                    Button("Create Account") {
                        Task {
                            await authViewModel.signUp()
                            if authViewModel.isAuthenticated {
                                dismiss()
                            }
                        }
                    }
                    .primaryButtonStyle()
                    .disabled(authViewModel.isLoading)
                }
                .padding()
            }
            .navigationTitle("Sign Up")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Forgot Password View
struct ForgotPasswordView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            VStack(spacing: Theme.Spacing.lg) {
                Image(systemName: "lock.rotation")
                    .font(.system(size: 60))
                    .foregroundColor(Theme.Colors.turquoise)
                
                Text("Reset Password")
                    .font(Theme.Typography.title2)
                
                Text("Enter your email and we'll send you a reset link")
                    .font(Theme.Typography.subheadline)
                    .foregroundColor(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                
                TextField("Email", text: $authViewModel.email)
                    .textFieldStyle(.roundedBorder)
                    .textContentType(.emailAddress)
                
                if let error = authViewModel.errorMessage {
                    Text(error)
                        .foregroundColor(error.contains("📧") ? Theme.Colors.success : Theme.Colors.danger)
                        .font(Theme.Typography.caption)
                }
                
                Button("Send Reset Link") {
                    Task {
                        await authViewModel.sendPasswordReset()
                    }
                }
                .primaryButtonStyle()
                .disabled(authViewModel.isLoading)
                
                Spacer()
            }
            .padding()
            .navigationTitle("Forgot Password")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthViewModel())
}
