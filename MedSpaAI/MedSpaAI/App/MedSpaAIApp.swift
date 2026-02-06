//
//  MedSpaAIApp.swift
//  MedSpaAI
//
//  Main entry point for the MedSpa AI iOS/Mac application
//

import SwiftUI

@main
struct MedSpaAIApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    @StateObject private var appState = AppState()
    @AppStorage("isDarkMode") private var isDarkMode = false
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false
    
    init() {
        // Configure appearance
        configureAppearance()
        
        // Initialize services
        initializeServices()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authViewModel)
                .environmentObject(appState)
                .preferredColorScheme(isDarkMode ? .dark : .light)
                .onAppear {
                    // Check authentication state
                    authViewModel.checkAuthState()
                }
        }
        #if os(macOS)
        .commands {
            // Mac-specific menu commands
            CommandGroup(replacing: .newItem) {
                Button("New Client") {
                    appState.showNewClientSheet = true
                }
                .keyboardShortcut("n", modifiers: .command)
                
                Button("Send Nudge") {
                    appState.showNudgeSheet = true
                }
                .keyboardShortcut("u", modifiers: .command)
            }
            
            CommandGroup(after: .toolbar) {
                Button("Search Clients") {
                    appState.isSearchActive = true
                }
                .keyboardShortcut("k", modifiers: .command)
            }
        }
        #endif
    }
    
    private func configureAppearance() {
        // Configure navigation bar appearance
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(Theme.Colors.deepBlue)
        appearance.titleTextAttributes = [
            .foregroundColor: UIColor.white,
            .font: UIFont.systemFont(ofSize: 18, weight: .semibold)
        ]
        appearance.largeTitleTextAttributes = [
            .foregroundColor: UIColor.white,
            .font: UIFont.systemFont(ofSize: 34, weight: .bold)
        ]
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        
        // Configure tab bar appearance
        let tabAppearance = UITabBarAppearance()
        tabAppearance.configureWithOpaqueBackground()
        UITabBar.appearance().standardAppearance = tabAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabAppearance
    }
    
    private func initializeServices() {
        // Initialize Firebase (uncomment when Firebase is configured)
        // FirebaseApp.configure()
        
        // Initialize notification service
        NotificationService.shared.requestPermission()
        
        // Initialize analytics (placeholder)
        print("🌟 MedSpa AI initialized")
    }
}

// MARK: - App State
class AppState: ObservableObject {
    @Published var selectedTab: Tab = .dashboard
    @Published var isSearchActive = false
    @Published var showNewClientSheet = false
    @Published var showNudgeSheet = false
    @Published var isLoading = false
    
    enum Tab: String, CaseIterable {
        case dashboard = "Dashboard"
        case clients = "Clients"
        case analytics = "Analytics"
        case communications = "Communications"
        case settings = "Settings"
        
        var icon: String {
            switch self {
            case .dashboard: return "square.grid.2x2.fill"
            case .clients: return "person.2.fill"
            case .analytics: return "chart.bar.fill"
            case .communications: return "message.fill"
            case .settings: return "gearshape.fill"
            }
        }
    }
}
