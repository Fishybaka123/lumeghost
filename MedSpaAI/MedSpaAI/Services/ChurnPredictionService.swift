//
//  ChurnPredictionService.swift
//  MedSpaAI
//
//  Core ML-powered churn prediction with on-device inference
//

import Foundation
import CoreML

class ChurnPredictionService {
    static let shared = ChurnPredictionService()
    
    // In production, this would be a trained ML model
    // For now, we use a rule-based algorithm that mimics ML behavior
    
    private init() {}
    
    // MARK: - Churn Prediction
    
    /// Predicts churn probability for a client based on their data
    /// - Parameter client: The client to analyze
    /// - Returns: ChurnPrediction with probability and contributing factors
    func predictChurn(for client: Client) -> ChurnPrediction {
        var riskScore: Double = 0
        var factors: [ChurnFactor] = []
        
        // Factor 1: Days since last visit (weight: 30%)
        let daysSinceVisit = daysSince(client.lastVisit)
        let visitRisk = min(daysSinceVisit / 90.0, 1.0) * 30
        riskScore += visitRisk
        if daysSinceVisit > 30 {
            factors.append(ChurnFactor(
                name: "Inactivity",
                impact: .high,
                description: "No visit in \(Int(daysSinceVisit)) days",
                recommendation: "Send a personalized re-engagement message"
            ))
        }
        
        // Factor 2: Health score inverse (weight: 25%)
        let healthRisk = (100.0 - Double(client.healthScore)) / 100.0 * 25
        riskScore += healthRisk
        if client.healthScore < 50 {
            factors.append(ChurnFactor(
                name: "Low Health Score",
                impact: .high,
                description: "Health score is \(client.healthScore)/100",
                recommendation: "Schedule a check-in call to understand concerns"
            ))
        }
        
        // Factor 3: Visit frequency decline (weight: 20%)
        let frequencyRisk = calculateFrequencyDecline(client) * 20
        riskScore += frequencyRisk
        if frequencyRisk > 10 {
            factors.append(ChurnFactor(
                name: "Declining Visits",
                impact: .medium,
                description: "Visit frequency has decreased",
                recommendation: "Offer a loyalty discount or package deal"
            ))
        }
        
        // Factor 4: No upcoming appointment (weight: 15%)
        if client.nextAppointment == nil {
            riskScore += 15
            factors.append(ChurnFactor(
                name: "No Scheduled Appointment",
                impact: .medium,
                description: "Client has no upcoming appointments",
                recommendation: "Proactively reach out to schedule"
            ))
        }
        
        // Factor 5: Membership status (weight: 10%)
        if client.membershipType == .none {
            riskScore += 10
            factors.append(ChurnFactor(
                name: "No Membership",
                impact: .low,
                description: "Client has no loyalty membership",
                recommendation: "Promote membership benefits"
            ))
        }
        
        // Ensure score is within bounds
        riskScore = min(max(riskScore, 0), 100)
        
        return ChurnPrediction(
            clientId: client.id,
            probability: riskScore / 100.0,
            riskLevel: riskLevel(from: riskScore),
            factors: factors,
            confidence: calculateConfidence(factors: factors.count),
            generatedAt: Date()
        )
    }
    
    /// Batch prediction for multiple clients
    func predictChurnBatch(for clients: [Client]) async -> [String: ChurnPrediction] {
        var predictions: [String: ChurnPrediction] = [:]
        
        // Process in parallel for performance
        await withTaskGroup(of: (String, ChurnPrediction).self) { group in
            for client in clients {
                group.addTask {
                    let prediction = self.predictChurn(for: client)
                    return (client.id, prediction)
                }
            }
            
            for await (clientId, prediction) in group {
                predictions[clientId] = prediction
            }
        }
        
        return predictions
    }
    
    /// Get AI-recommended nudge message based on churn prediction
    func generateNudgeRecommendation(for prediction: ChurnPrediction, client: Client) -> NudgeRecommendation {
        let topFactor = prediction.factors.first
        
        // Generate personalized message based on main risk factor
        var message: String
        var tone: NudgeTone
        
        switch topFactor?.name {
        case "Inactivity":
            message = "Hi \(client.firstName)! We've missed you at our spa. It's been a while since your last visit, and we'd love to see you again. Book this week and enjoy 15% off your next treatment! 💆‍♀️"
            tone = .friendly
            
        case "Low Health Score":
            message = "Hi \(client.firstName), we noticed it's been some time since we connected. We care about your experience with us - is there anything we can do to help? We're here for you!"
            tone = .caring
            
        case "No Scheduled Appointment":
            message = "Hi \(client.firstName)! Ready for your next treatment? Based on your history, you might be due for a \(client.preferredTreatments.first ?? "refresh"). Let us help you schedule!"
            tone = .proactive
            
        default:
            message = "Hi \(client.firstName)! Just checking in to see how you're doing. We have some exciting new treatments we think you'll love. Would you like to learn more?"
            tone = .informative
        }
        
        return NudgeRecommendation(
            clientId: client.id,
            message: message,
            tone: tone,
            suggestedChannel: prediction.probability > 0.6 ? .sms : .email,
            urgency: prediction.riskLevel,
            expiresAt: Calendar.current.date(byAdding: .day, value: 3, to: Date())
        )
    }
    
    // MARK: - Helper Methods
    
    private func daysSince(_ date: Date?) -> Double {
        guard let date = date else { return 365 } // No visit = max risk
        return max(0, Date().timeIntervalSince(date) / 86400)
    }
    
    private func calculateFrequencyDecline(_ client: Client) -> Double {
        // Simplified: compare expected vs actual visits
        let monthsSinceMember = max(1, Calendar.current.dateComponents([.month], from: client.memberSince, to: Date()).month ?? 1)
        let expectedMonthlyVisits = Double(client.visitCount) / Double(monthsSinceMember)
        
        // If less than 1 visit per 2 months, consider declining
        if expectedMonthlyVisits < 0.5 {
            return 1.0
        } else if expectedMonthlyVisits < 1.0 {
            return 0.5
        }
        return 0.0
    }
    
    private func riskLevel(from score: Double) -> RiskLevel {
        if score >= 60 { return .high }
        if score >= 30 { return .medium }
        return .low
    }
    
    private func calculateConfidence(factors: Int) -> Double {
        // More factors analyzed = higher confidence
        return min(0.95, 0.7 + Double(factors) * 0.05)
    }
}

// MARK: - Prediction Models

struct ChurnPrediction: Identifiable {
    let id = UUID()
    let clientId: String
    let probability: Double // 0.0 to 1.0
    let riskLevel: RiskLevel
    let factors: [ChurnFactor]
    let confidence: Double
    let generatedAt: Date
    
    var percentageString: String {
        "\(Int(probability * 100))%"
    }
}

struct ChurnFactor: Identifiable {
    let id = UUID()
    let name: String
    let impact: FactorImpact
    let description: String
    let recommendation: String
}

enum FactorImpact: String {
    case high = "High"
    case medium = "Medium"
    case low = "Low"
    
    var color: String {
        switch self {
        case .high: return "EF4444"
        case .medium: return "F59E0B"
        case .low: return "10B981"
        }
    }
}

enum RiskLevel: String {
    case high = "High Risk"
    case medium = "Medium Risk"
    case low = "Low Risk"
}

struct NudgeRecommendation: Identifiable {
    let id = UUID()
    let clientId: String
    let message: String
    let tone: NudgeTone
    let suggestedChannel: NudgeChannel
    let urgency: RiskLevel
    let expiresAt: Date?
}

enum NudgeTone: String, CaseIterable {
    case friendly = "Friendly"
    case caring = "Caring"
    case proactive = "Proactive"
    case informative = "Informative"
    case urgent = "Urgent"
}

enum NudgeChannel: String, CaseIterable {
    case sms = "SMS"
    case email = "Email"
    case push = "Push Notification"
    case call = "Phone Call"
    
    var icon: String {
        switch self {
        case .sms: return "message.fill"
        case .email: return "envelope.fill"
        case .push: return "bell.fill"
        case .call: return "phone.fill"
        }
    }
}
