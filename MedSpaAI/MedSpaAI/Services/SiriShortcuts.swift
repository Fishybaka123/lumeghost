//
//  SiriShortcuts.swift
//  MedSpaAI
//
//  Siri Shortcuts integration with App Intents
//

import AppIntents
import SwiftUI

// MARK: - Log Visit Intent
struct LogVisitIntent: AppIntent {
    static var title: LocalizedStringResource = "Log Client Visit"
    static var description = IntentDescription("Log a treatment visit for a client")
    
    @Parameter(title: "Client Name")
    var clientName: String
    
    @Parameter(title: "Treatment")
    var treatment: String
    
    @Parameter(title: "Amount")
    var amount: Double?
    
    static var parameterSummary: some ParameterSummary {
        Summary("Log \(\.$treatment) for \(\.$clientName)")
    }
    
    func perform() async throws -> some IntentResult & ProvidesDialog {
        // In production, this would save to Core Data and sync
        let amountStr = amount.map { String(format: "$%.0f", $0) } ?? ""
        
        return .result(dialog: "Logged \(treatment) visit for \(clientName) \(amountStr)")
    }
}

// MARK: - Send Nudge Intent
struct SendNudgeIntent: AppIntent {
    static var title: LocalizedStringResource = "Send Client Nudge"
    static var description = IntentDescription("Send a personalized message to a client")
    
    @Parameter(title: "Client Name")
    var clientName: String
    
    @Parameter(title: "Message Type", default: .reengagement)
    var messageType: NudgeMessageType
    
    static var parameterSummary: some ParameterSummary {
        Summary("Send \(\.$messageType) nudge to \(\.$clientName)")
    }
    
    func perform() async throws -> some IntentResult & ProvidesDialog {
        // Generate appropriate message based on type
        let message = messageType.sampleMessage(for: clientName)
        
        // In production, would queue for sending
        return .result(dialog: "Nudge queued for \(clientName): \"\(message.prefix(50))...\"")
    }
}

enum NudgeMessageType: String, AppEnum {
    case reengagement = "Re-engagement"
    case followup = "Follow-up"
    case appointment = "Appointment Reminder"
    case promotion = "Promotion"
    
    static var typeDisplayRepresentation: TypeDisplayRepresentation {
        "Nudge Type"
    }
    
    static var caseDisplayRepresentations: [NudgeMessageType: DisplayRepresentation] {
        [
            .reengagement: "Re-engagement",
            .followup: "Follow-up",
            .appointment: "Appointment Reminder",
            .promotion: "Promotion"
        ]
    }
    
    func sampleMessage(for name: String) -> String {
        switch self {
        case .reengagement:
            return "Hi \(name)! We've missed you at the spa. Book this week for 15% off!"
        case .followup:
            return "Hi \(name)! How are you feeling after your treatment? Let us know!"
        case .appointment:
            return "Hi \(name)! Just a reminder about your upcoming appointment."
        case .promotion:
            return "Hi \(name)! We have a special offer just for you this month!"
        }
    }
}

// MARK: - Check At-Risk Clients Intent
struct CheckAtRiskIntent: AppIntent {
    static var title: LocalizedStringResource = "Check At-Risk Clients"
    static var description = IntentDescription("Get a count of clients at risk of churning")
    
    func perform() async throws -> some IntentResult & ProvidesDialog {
        // In production, would fetch from Core Data
        let atRiskCount = 5 // Placeholder
        
        return .result(dialog: "You have \(atRiskCount) clients at risk of churning. Open MedSpa AI to take action.")
    }
}

// MARK: - Schedule Appointment Intent
struct ScheduleAppointmentIntent: AppIntent {
    static var title: LocalizedStringResource = "Schedule Appointment"
    static var description = IntentDescription("Schedule a treatment appointment for a client")
    
    @Parameter(title: "Client Name")
    var clientName: String
    
    @Parameter(title: "Treatment")
    var treatment: String
    
    @Parameter(title: "Date")
    var date: Date
    
    static var parameterSummary: some ParameterSummary {
        Summary("Schedule \(\.$treatment) for \(\.$clientName) on \(\.$date)")
    }
    
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        
        return .result(dialog: "Scheduled \(treatment) for \(clientName) on \(formatter.string(from: date))")
    }
}

// MARK: - App Shortcuts Provider
struct MedSpaShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: CheckAtRiskIntent(),
            phrases: [
                "Check at-risk clients in \(.applicationName)",
                "How many clients are at risk in \(.applicationName)",
                "Show churn risk in \(.applicationName)"
            ],
            shortTitle: "Check At-Risk",
            systemImageName: "exclamationmark.triangle"
        )
        
        AppShortcut(
            intent: LogVisitIntent(),
            phrases: [
                "Log a visit in \(.applicationName)",
                "Record treatment in \(.applicationName)",
                "Log \(\.$treatment) for \(\.$clientName) in \(.applicationName)"
            ],
            shortTitle: "Log Visit",
            systemImageName: "calendar.badge.plus"
        )
        
        AppShortcut(
            intent: SendNudgeIntent(),
            phrases: [
                "Send nudge in \(.applicationName)",
                "Message client in \(.applicationName)",
                "Send \(\.$messageType) to \(\.$clientName) in \(.applicationName)"
            ],
            shortTitle: "Send Nudge",
            systemImageName: "paperplane"
        )
    }
}

// MARK: - Spotlight Donation
extension Client {
    func donateToSpotlight() {
        // Donate client to Spotlight for better Siri suggestions
        let activity = NSUserActivity(activityType: "com.medspaai.viewclient")
        activity.title = "View \(fullName)"
        activity.userInfo = ["clientId": id]
        activity.isEligibleForSearch = true
        activity.isEligibleForPrediction = true
        
        // Keywords for search
        activity.keywords = Set([firstName, lastName, email, membershipType.rawValue])
        
        activity.becomeCurrent()
    }
}
