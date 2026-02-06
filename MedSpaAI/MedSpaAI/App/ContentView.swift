//
//  ContentView.swift
//  MedSpaAI
//
//  Root navigation view with tab bar for iPhone and sidebar for Mac
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        Group {
            if authViewModel.isAuthenticated {
                MainTabView()
            } else {
                LoginView()
            }
        }
        .animation(.easeInOut, value: authViewModel.isAuthenticated)
    }
}

// MARK: - Main Tab View
struct MainTabView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        #if os(iOS)
        TabView(selection: $appState.selectedTab) {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: AppState.Tab.dashboard.icon)
                }
                .tag(AppState.Tab.dashboard)
            
            ClientsListView()
                .tabItem {
                    Label("Clients", systemImage: AppState.Tab.clients.icon)
                }
                .tag(AppState.Tab.clients)
            
            AnalyticsView()
                .tabItem {
                    Label("Analytics", systemImage: AppState.Tab.analytics.icon)
                }
                .tag(AppState.Tab.analytics)
            
            CommunicationsView()
                .tabItem {
                    Label("Comms", systemImage: AppState.Tab.communications.icon)
                }
                .tag(AppState.Tab.communications)
            
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: AppState.Tab.settings.icon)
                }
                .tag(AppState.Tab.settings)
        }
        .tint(Theme.Colors.turquoise)
        #else
        // Mac Sidebar Navigation
        NavigationSplitView {
            List(AppState.Tab.allCases, id: \.self, selection: $appState.selectedTab) { tab in
                Label(tab.rawValue, systemImage: tab.icon)
                    .tag(tab)
            }
            .navigationTitle("MedSpa AI")
            .listStyle(.sidebar)
        } detail: {
            switch appState.selectedTab {
            case .dashboard:
                DashboardView()
            case .clients:
                ClientsListView()
            case .analytics:
                AnalyticsView()
            case .communications:
                CommunicationsView()
            case .settings:
                SettingsView()
            }
        }
        #endif
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthViewModel())
        .environmentObject(AppState())
}
