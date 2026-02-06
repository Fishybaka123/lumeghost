//
//  SettingsView.swift
//  MedSpaAI
//
//  App settings with preferences and account management
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @AppStorage("isDarkMode") private var isDarkMode = false
    @AppStorage("notificationsEnabled") private var notificationsEnabled = true
    @AppStorage("hapticFeedback") private var hapticFeedback = true
    @State private var showingLogoutAlert = false
    
    var body: some View {
        NavigationStack {
            List {
                // Account Section
                Section {
                    if let user = authViewModel.currentUser {
                        HStack(spacing: Theme.Spacing.md) {
                            Text(user.initials)
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.white)
                                .frame(width: 56, height: 56)
                                .background(Theme.Colors.turquoise)
                                .clipShape(Circle())
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(user.displayName ?? "User")
                                    .font(Theme.Typography.headline)
                                
                                Text(user.email)
                                    .font(Theme.Typography.caption)
                                    .foregroundColor(Theme.Colors.textSecondary)
                            }
                            
                            Spacer()
                            
                            Image(systemName: "chevron.right")
                                .foregroundColor(Theme.Colors.textMuted)
                        }
                        .padding(.vertical, Theme.Spacing.xs)
                    }
                } header: {
                    Text("Account")
                }
                
                // Preferences
                Section {
                    Toggle(isOn: $isDarkMode) {
                        Label("Dark Mode", systemImage: "moon.fill")
                    }
                    
                    Toggle(isOn: $notificationsEnabled) {
                        Label("Push Notifications", systemImage: "bell.fill")
                    }
                    
                    Toggle(isOn: $hapticFeedback) {
                        Label("Haptic Feedback", systemImage: "waveform")
                    }
                } header: {
                    Text("Preferences")
                }
                
                // Security
                Section {
                    NavigationLink {
                        Text("Change Password")
                    } label: {
                        Label("Change Password", systemImage: "lock.fill")
                    }
                    
                    NavigationLink {
                        Text("Two-Factor Authentication")
                    } label: {
                        Label("Two-Factor Auth", systemImage: "lock.shield.fill")
                    }
                    
                    if authViewModel.isBiometricAvailable {
                        NavigationLink {
                            Text("Biometric Settings")
                        } label: {
                            Label(
                                authViewModel.biometricType == .faceID ? "Face ID" : "Touch ID",
                                systemImage: authViewModel.biometricType == .faceID ? "faceid" : "touchid"
                            )
                        }
                    }
                } header: {
                    Text("Security")
                }
                
                // Data & Privacy
                Section {
                    NavigationLink {
                        Text("Export Data")
                    } label: {
                        Label("Export My Data", systemImage: "square.and.arrow.up")
                    }
                    
                    NavigationLink {
                        Text("Privacy Policy")
                    } label: {
                        Label("Privacy Policy", systemImage: "hand.raised.fill")
                    }
                    
                    NavigationLink {
                        Text("Terms of Service")
                    } label: {
                        Label("Terms of Service", systemImage: "doc.text.fill")
                    }
                } header: {
                    Text("Data & Privacy")
                }
                
                // Support
                Section {
                    NavigationLink {
                        Text("Help Center")
                    } label: {
                        Label("Help Center", systemImage: "questionmark.circle.fill")
                    }
                    
                    NavigationLink {
                        Text("Contact Support")
                    } label: {
                        Label("Contact Support", systemImage: "envelope.fill")
                    }
                    
                    Link(destination: URL(string: "https://medspaai.com")!) {
                        Label("Website", systemImage: "globe")
                    }
                } header: {
                    Text("Support")
                }
                
                // About
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0 (1)")
                            .foregroundColor(Theme.Colors.textSecondary)
                    }
                    
                    HStack {
                        Text("Build")
                        Spacer()
                        Text("2026.02.03")
                            .foregroundColor(Theme.Colors.textSecondary)
                    }
                } header: {
                    Text("About")
                }
                
                // Sign Out
                Section {
                    Button(role: .destructive) {
                        showingLogoutAlert = true
                    } label: {
                        HStack {
                            Spacer()
                            Text("Sign Out")
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Settings")
            .alert("Sign Out", isPresented: $showingLogoutAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Sign Out", role: .destructive) {
                    authViewModel.signOut()
                }
            } message: {
                Text("Are you sure you want to sign out?")
            }
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthViewModel())
}
