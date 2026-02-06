//
//  KeyboardShortcuts.swift
//  MedSpaAI
//
//  Keyboard shortcuts for Mac (via Mac Catalyst)
//

import SwiftUI

// MARK: - Keyboard Shortcut Modifiers
extension View {
    /// Adds common keyboard shortcuts for the app
    func withAppKeyboardShortcuts() -> some View {
        self
            .keyboardShortcut("f", modifiers: [.command]) // Search
            .onKeyPress(.return) {
                // Handle enter key
                return .handled
            }
    }
}

// MARK: - App Keyboard Commands
struct AppCommands: Commands {
    @Binding var showingSearch: Bool
    @Binding var showingNewClient: Bool
    @Binding var showingNudge: Bool
    
    var body: some Commands {
        // File Menu
        CommandGroup(replacing: .newItem) {
            Button("New Client") {
                showingNewClient = true
            }
            .keyboardShortcut("n", modifiers: .command)
            
            Button("Send Nudge") {
                showingNudge = true
            }
            .keyboardShortcut("u", modifiers: .command)
            
            Divider()
            
            Button("Import Clients...") {
                // Import action
            }
            .keyboardShortcut("i", modifiers: [.command, .shift])
            
            Button("Export Report...") {
                // Export action
            }
            .keyboardShortcut("e", modifiers: [.command, .shift])
        }
        
        // Edit Menu - Search
        CommandGroup(after: .textEditing) {
            Button("Search Clients") {
                showingSearch = true
            }
            .keyboardShortcut("k", modifiers: .command)
        }
        
        // View Menu
        CommandMenu("Navigation") {
            Button("Go to Dashboard") {
                NotificationCenter.default.post(name: .navigateToDashboard, object: nil)
            }
            .keyboardShortcut("1", modifiers: .command)
            
            Button("Go to Clients") {
                NotificationCenter.default.post(name: .navigateToClients, object: nil)
            }
            .keyboardShortcut("2", modifiers: .command)
            
            Button("Go to Analytics") {
                NotificationCenter.default.post(name: .navigateToAnalytics, object: nil)
            }
            .keyboardShortcut("3", modifiers: .command)
            
            Button("Go to Communications") {
                NotificationCenter.default.post(name: .navigateToCommunications, object: nil)
            }
            .keyboardShortcut("4", modifiers: .command)
            
            Button("Go to Settings") {
                NotificationCenter.default.post(name: .navigateToSettings, object: nil)
            }
            .keyboardShortcut(",", modifiers: .command)
        }
        
        // Tools Menu
        CommandMenu("Tools") {
            Button("Refresh Data") {
                NotificationCenter.default.post(name: .refreshData, object: nil)
            }
            .keyboardShortcut("r", modifiers: .command)
            
            Divider()
            
            Button("Run Churn Analysis") {
                NotificationCenter.default.post(name: .runChurnAnalysis, object: nil)
            }
            .keyboardShortcut("a", modifiers: [.command, .option])
            
            Button("Generate AI Suggestions") {
                NotificationCenter.default.post(name: .generateAISuggestions, object: nil)
            }
            .keyboardShortcut("g", modifiers: [.command, .option])
        }
    }
}

// MARK: - Navigation Notifications
extension Notification.Name {
    static let navigateToDashboard = Notification.Name("navigateToDashboard")
    static let navigateToClients = Notification.Name("navigateToClients")
    static let navigateToAnalytics = Notification.Name("navigateToAnalytics")
    static let navigateToCommunications = Notification.Name("navigateToCommunications")
    static let navigateToSettings = Notification.Name("navigateToSettings")
    static let refreshData = Notification.Name("refreshData")
    static let runChurnAnalysis = Notification.Name("runChurnAnalysis")
    static let generateAISuggestions = Notification.Name("generateAISuggestions")
}

// MARK: - Quick Actions (3D Touch / Force Touch)
struct QuickAction: Identifiable {
    let id: String
    let type: QuickActionType
    let title: String
    let subtitle: String?
    let icon: String
    
    enum QuickActionType: String {
        case newClient = "com.medspaai.newclient"
        case sendNudge = "com.medspaai.sendnudge"
        case checkAtRisk = "com.medspaai.checkatrisk"
        case logVisit = "com.medspaai.logvisit"
    }
}

class QuickActionManager {
    static let shared = QuickActionManager()
    
    func configureQuickActions() {
        UIApplication.shared.shortcutItems = [
            UIApplicationShortcutItem(
                type: QuickAction.QuickActionType.newClient.rawValue,
                localizedTitle: "New Client",
                localizedSubtitle: "Add a new client",
                icon: UIApplicationShortcutIcon(systemImageName: "person.badge.plus"),
                userInfo: nil
            ),
            UIApplicationShortcutItem(
                type: QuickAction.QuickActionType.sendNudge.rawValue,
                localizedTitle: "Send Nudge",
                localizedSubtitle: "Message a client",
                icon: UIApplicationShortcutIcon(systemImageName: "paperplane"),
                userInfo: nil
            ),
            UIApplicationShortcutItem(
                type: QuickAction.QuickActionType.checkAtRisk.rawValue,
                localizedTitle: "At-Risk Clients",
                localizedSubtitle: "View clients needing attention",
                icon: UIApplicationShortcutIcon(systemImageName: "exclamationmark.triangle"),
                userInfo: nil
            )
        ]
    }
    
    func handleQuickAction(_ shortcutItem: UIApplicationShortcutItem) -> Bool {
        guard let actionType = QuickAction.QuickActionType(rawValue: shortcutItem.type) else {
            return false
        }
        
        switch actionType {
        case .newClient:
            NotificationCenter.default.post(name: .openNewClientSheet, object: nil)
        case .sendNudge:
            NotificationCenter.default.post(name: .openNudgeSheet, object: nil)
        case .checkAtRisk:
            NotificationCenter.default.post(name: .navigateToClients, object: nil)
        case .logVisit:
            NotificationCenter.default.post(name: .openLogVisitSheet, object: nil)
        }
        
        return true
    }
}

extension Notification.Name {
    static let openNewClientSheet = Notification.Name("openNewClientSheet")
    static let openLogVisitSheet = Notification.Name("openLogVisitSheet")
}
