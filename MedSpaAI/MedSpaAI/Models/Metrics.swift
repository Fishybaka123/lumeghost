//
//  Metrics.swift
//  MedSpaAI
//
//  Dashboard metrics data models
//

import Foundation

// MARK: - Dashboard Metrics
struct DashboardMetrics: Codable {
    var totalClients: MetricData
    var activeLeads: MetricData
    var atRiskClients: MetricData
    var leadConversion: MetricData
    var revenueSaved: MetricData
    var healthScore: MetricData
}

struct MetricData: Codable, Identifiable {
    let id: String
    var value: Double
    var change: Double
    var trend: Trend
    var label: String
    var prefix: String?
    var suffix: String?
    
    enum Trend: String, Codable {
        case positive
        case negative
        case neutral
    }
    
    var formattedValue: String {
        if let prefix = prefix, prefix == "$" {
            return "$\(formatNumber(value))"
        }
        if let suffix = suffix, suffix == "%" {
            return "\(Int(value))%"
        }
        return "\(Int(value))"
    }
    
    var formattedChange: String {
        let sign = change >= 0 ? "+" : ""
        return "\(sign)\(Int(change))%"
    }
    
    private func formatNumber(_ num: Double) -> String {
        if num >= 1_000_000 {
            return String(format: "%.1fM", num / 1_000_000)
        }
        if num >= 1_000 {
            return String(format: "%.1fK", num / 1_000)
        }
        return String(format: "%.0f", num)
    }
}

// MARK: - Sample Metrics
extension DashboardMetrics {
    static let sample = DashboardMetrics(
        totalClients: MetricData(
            id: "totalClients",
            value: 247,
            change: 12,
            trend: .positive,
            label: "Total Clients"
        ),
        activeLeads: MetricData(
            id: "activeLeads",
            value: 34,
            change: 18,
            trend: .positive,
            label: "Active Leads"
        ),
        atRiskClients: MetricData(
            id: "atRiskClients",
            value: 18,
            change: -8,
            trend: .positive, // Decreasing is good for at-risk
            label: "At-Risk Clients"
        ),
        leadConversion: MetricData(
            id: "leadConversion",
            value: 68,
            change: 12,
            trend: .positive,
            label: "Lead Conversion",
            suffix: "%"
        ),
        revenueSaved: MetricData(
            id: "revenueSaved",
            value: 24500,
            change: 23,
            trend: .positive,
            label: "Revenue Saved",
            prefix: "$"
        ),
        healthScore: MetricData(
            id: "healthScore",
            value: 74,
            change: 15,
            trend: .positive,
            label: "Health Score"
        )
    )
}

// MARK: - AI Insight
struct AIInsight: Identifiable {
    let id = UUID()
    let type: InsightType
    let title: String
    let message: String
    let action: String?
    
    enum InsightType {
        case warning
        case opportunity
        case success
        case info
    }
}
