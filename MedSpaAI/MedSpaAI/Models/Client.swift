//
//  Client.swift
//  MedSpaAI
//
//  Client data model with Codable conformance
//

import Foundation
import SwiftUI

// MARK: - Client Model
struct Client: Identifiable, Codable, Hashable {
    let id: String
    var firstName: String
    var lastName: String
    var email: String
    var phone: String
    var avatarColor: String
    var healthScore: Int
    var churnRisk: Int
    var lastVisit: Date?
    var nextAppointment: Date?
    var membershipType: MembershipType
    var totalSpend: Double
    var visitCount: Int
    var memberSince: Date
    var preferredTreatments: [String]
    var notes: String?
    var visits: [Visit]
    
    // Computed Properties
    var fullName: String {
        "\(firstName) \(lastName)"
    }
    
    var initials: String {
        let first = firstName.prefix(1).uppercased()
        let last = lastName.prefix(1).uppercased()
        return "\(first)\(last)"
    }
    
    var healthScoreCategory: HealthCategory {
        if healthScore >= 70 { return .healthy }
        if healthScore >= 40 { return .needsAttention }
        return .atRisk
    }
    
    var churnRiskCategory: ChurnRiskCategory {
        if churnRisk >= 60 { return .high }
        if churnRisk >= 30 { return .medium }
        return .low
    }
    
    var avatarSwiftColor: Color {
        Color(hex: avatarColor)
    }
}

// MARK: - Membership Type
enum MembershipType: String, Codable, CaseIterable {
    case none = "None"
    case basic = "Basic"
    case premium = "Premium"
    case vip = "VIP"
    
    var displayName: String {
        switch self {
        case .none: return "No Membership"
        case .basic: return "Basic"
        case .premium: return "💎 Premium"
        case .vip: return "⭐ VIP"
        }
    }
    
    var color: Color {
        switch self {
        case .none: return Theme.Colors.textMuted
        case .basic: return Color(hex: "6B7280")
        case .premium: return Color(hex: "F59E0B")
        case .vip: return Color(hex: "8B5CF6")
        }
    }
    
    var backgroundColor: Color {
        switch self {
        case .none: return Color(hex: "F3F4F6")
        case .basic: return Color(hex: "F3F4F6")
        case .premium: return Color(hex: "FEF3C7")
        case .vip: return Color(hex: "EDE9FE")
        }
    }
}

// MARK: - Health Category
enum HealthCategory {
    case healthy
    case needsAttention
    case atRisk
    
    var color: Color {
        switch self {
        case .healthy: return Theme.Colors.success
        case .needsAttention: return Theme.Colors.warning
        case .atRisk: return Theme.Colors.danger
        }
    }
    
    var label: String {
        switch self {
        case .healthy: return "Healthy"
        case .needsAttention: return "Needs Attention"
        case .atRisk: return "At Risk"
        }
    }
}

// MARK: - Churn Risk Category
enum ChurnRiskCategory {
    case low
    case medium
    case high
    
    var color: Color {
        switch self {
        case .low: return Theme.Colors.success
        case .medium: return Theme.Colors.warning
        case .high: return Theme.Colors.danger
        }
    }
    
    var backgroundColor: Color {
        switch self {
        case .low: return Theme.Colors.successLight
        case .medium: return Theme.Colors.warningLight
        case .high: return Theme.Colors.dangerLight
        }
    }
    
    var label: String {
        switch self {
        case .low: return "Low Risk"
        case .medium: return "Medium Risk"
        case .high: return "High Risk"
        }
    }
}

// MARK: - Visit Model
struct Visit: Identifiable, Codable, Hashable {
    let id: String
    let date: Date
    let treatment: String
    let amount: Double
    let status: VisitStatus
    var notes: String?
    var duration: Int? // minutes
    
    enum VisitStatus: String, Codable {
        case completed
        case scheduled
        case cancelled
        case noShow = "no_show"
    }
}

// MARK: - Sample Data
extension Client {
    static let sampleClients: [Client] = [
        Client(
            id: "1",
            firstName: "Sarah",
            lastName: "Mitchell",
            email: "sarah.mitchell@email.com",
            phone: "(555) 234-5678",
            avatarColor: "8B5CF6",
            healthScore: 85,
            churnRisk: 12,
            lastVisit: Calendar.current.date(byAdding: .day, value: -6, to: Date()),
            nextAppointment: Calendar.current.date(byAdding: .day, value: 7, to: Date()),
            membershipType: .premium,
            totalSpend: 4250,
            visitCount: 18,
            memberSince: Calendar.current.date(byAdding: .month, value: -20, to: Date())!,
            preferredTreatments: ["Botox", "HydraFacial", "Microneedling"],
            notes: "Prefers morning appointments. Sensitive to retinol products.",
            visits: [
                Visit(id: "v1", date: Calendar.current.date(byAdding: .day, value: -6, to: Date())!, treatment: "HydraFacial Deluxe", amount: 250, status: .completed),
                Visit(id: "v2", date: Calendar.current.date(byAdding: .day, value: -20, to: Date())!, treatment: "Botox - Forehead", amount: 450, status: .completed),
                Visit(id: "v3", date: Calendar.current.date(byAdding: .day, value: -45, to: Date())!, treatment: "Chemical Peel", amount: 175, status: .completed)
            ]
        ),
        Client(
            id: "2",
            firstName: "Jennifer",
            lastName: "Adams",
            email: "j.adams@email.com",
            phone: "(555) 345-6789",
            avatarColor: "10B981",
            healthScore: 72,
            churnRisk: 28,
            lastVisit: Calendar.current.date(byAdding: .day, value: -14, to: Date()),
            nextAppointment: nil,
            membershipType: .basic,
            totalSpend: 1850,
            visitCount: 8,
            memberSince: Calendar.current.date(byAdding: .month, value: -11, to: Date())!,
            preferredTreatments: ["Laser Hair Removal", "Facials"],
            notes: nil,
            visits: [
                Visit(id: "v4", date: Calendar.current.date(byAdding: .day, value: -14, to: Date())!, treatment: "Laser Hair Removal - Legs", amount: 300, status: .completed)
            ]
        ),
        Client(
            id: "3",
            firstName: "Michael",
            lastName: "Chen",
            email: "m.chen@email.com",
            phone: "(555) 456-7890",
            avatarColor: "F59E0B",
            healthScore: 45,
            churnRisk: 65,
            lastVisit: Calendar.current.date(byAdding: .day, value: -55, to: Date()),
            nextAppointment: nil,
            membershipType: .basic,
            totalSpend: 980,
            visitCount: 4,
            memberSince: Calendar.current.date(byAdding: .month, value: -6, to: Date())!,
            preferredTreatments: ["CoolSculpting"],
            notes: "Interested in body contouring treatments.",
            visits: [
                Visit(id: "v5", date: Calendar.current.date(byAdding: .day, value: -55, to: Date())!, treatment: "CoolSculpting Consultation", amount: 0, status: .completed)
            ]
        ),
        Client(
            id: "4",
            firstName: "Emily",
            lastName: "Rodriguez",
            email: "emily.r@email.com",
            phone: "(555) 567-8901",
            avatarColor: "EF4444",
            healthScore: 32,
            churnRisk: 78,
            lastVisit: Calendar.current.date(byAdding: .day, value: -90, to: Date()),
            nextAppointment: nil,
            membershipType: .none,
            totalSpend: 425,
            visitCount: 2,
            memberSince: Calendar.current.date(byAdding: .month, value: -5, to: Date())!,
            preferredTreatments: ["Facials"],
            notes: "Had a minor reaction to a product - follow up needed.",
            visits: [
                Visit(id: "v6", date: Calendar.current.date(byAdding: .day, value: -90, to: Date())!, treatment: "Signature Facial", amount: 175, status: .completed)
            ]
        ),
        Client(
            id: "5",
            firstName: "Lisa",
            lastName: "Thompson",
            email: "lisa.t@email.com",
            phone: "(555) 678-9012",
            avatarColor: "3B82F6",
            healthScore: 92,
            churnRisk: 5,
            lastVisit: Calendar.current.date(byAdding: .day, value: -2, to: Date()),
            nextAppointment: Calendar.current.date(byAdding: .day, value: 12, to: Date()),
            membershipType: .vip,
            totalSpend: 12500,
            visitCount: 42,
            memberSince: Calendar.current.date(byAdding: .year, value: -3, to: Date())!,
            preferredTreatments: ["Botox", "Fillers", "PRP Therapy", "LED Light Therapy"],
            notes: "VIP client - always offer premium time slots. Refers many new clients.",
            visits: [
                Visit(id: "v7", date: Calendar.current.date(byAdding: .day, value: -2, to: Date())!, treatment: "Botox - Full Face", amount: 750, status: .completed),
                Visit(id: "v8", date: Calendar.current.date(byAdding: .day, value: -16, to: Date())!, treatment: "PRP Hair Therapy", amount: 450, status: .completed)
            ]
        )
    ]
}
