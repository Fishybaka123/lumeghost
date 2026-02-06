//
//  ChurnPredictionTests.swift
//  MedSpaAITests
//
//  Unit tests for AI churn prediction service
//

import XCTest
@testable import MedSpaAI

final class ChurnPredictionTests: XCTestCase {
    
    var sut: ChurnPredictionService!
    
    override func setUp() {
        super.setUp()
        sut = ChurnPredictionService.shared
    }
    
    override func tearDown() {
        sut = nil
        super.tearDown()
    }
    
    // MARK: - Churn Prediction Tests
    
    func testPredictChurn_HealthyClient_ReturnsLowRisk() {
        // Given: A healthy client with recent visits
        let client = createClient(
            healthScore: 85,
            churnRisk: 10,
            lastVisitDaysAgo: 5,
            hasNextAppointment: true,
            membershipType: .premium
        )
        
        // When
        let prediction = sut.predictChurn(for: client)
        
        // Then
        XCTAssertLessThan(prediction.probability, 0.3, "Healthy client should have low churn probability")
        XCTAssertEqual(prediction.riskLevel, .low)
        XCTAssertGreaterThan(prediction.confidence, 0.7)
    }
    
    func testPredictChurn_AtRiskClient_ReturnsHighRisk() {
        // Given: An at-risk client with no recent visits
        let client = createClient(
            healthScore: 25,
            churnRisk: 80,
            lastVisitDaysAgo: 90,
            hasNextAppointment: false,
            membershipType: .none
        )
        
        // When
        let prediction = sut.predictChurn(for: client)
        
        // Then
        XCTAssertGreaterThan(prediction.probability, 0.6, "At-risk client should have high churn probability")
        XCTAssertEqual(prediction.riskLevel, .high)
    }
    
    func testPredictChurn_NoLastVisit_MaximizesInactivityRisk() {
        // Given: A client with no visit history
        let client = createClient(
            healthScore: 50,
            churnRisk: 50,
            lastVisitDaysAgo: nil,
            hasNextAppointment: false,
            membershipType: .basic
        )
        
        // When
        let prediction = sut.predictChurn(for: client)
        
        // Then
        XCTAssertGreaterThan(prediction.probability, 0.5)
        
        // Should have inactivity factor
        let hasInactivityFactor = prediction.factors.contains { $0.name == "Inactivity" }
        XCTAssertTrue(hasInactivityFactor, "Should identify inactivity as a risk factor")
    }
    
    func testPredictChurn_VIPMember_ReducesRisk() {
        // Given: VIP member vs non-member with same stats
        let vipClient = createClient(
            healthScore: 50,
            churnRisk: 50,
            lastVisitDaysAgo: 30,
            hasNextAppointment: true,
            membershipType: .vip
        )
        
        let nonMemberClient = createClient(
            healthScore: 50,
            churnRisk: 50,
            lastVisitDaysAgo: 30,
            hasNextAppointment: true,
            membershipType: .none
        )
        
        // When
        let vipPrediction = sut.predictChurn(for: vipClient)
        let nonMemberPrediction = sut.predictChurn(for: nonMemberClient)
        
        // Then
        XCTAssertLessThan(vipPrediction.probability, nonMemberPrediction.probability,
                         "VIP members should have lower churn risk")
    }
    
    func testPredictChurn_FactorsAreGenerated() {
        // Given: A client with multiple risk factors
        let client = createClient(
            healthScore: 30,
            churnRisk: 70,
            lastVisitDaysAgo: 60,
            hasNextAppointment: false,
            membershipType: .none
        )
        
        // When
        let prediction = sut.predictChurn(for: client)
        
        // Then
        XCTAssertFalse(prediction.factors.isEmpty, "Should generate risk factors")
        
        // Verify factor structure
        for factor in prediction.factors {
            XCTAssertFalse(factor.name.isEmpty)
            XCTAssertFalse(factor.description.isEmpty)
            XCTAssertFalse(factor.recommendation.isEmpty)
        }
    }
    
    // MARK: - Nudge Recommendation Tests
    
    func testGenerateNudgeRecommendation_HighRisk_SuggestsSMS() {
        // Given: High-risk prediction
        let client = createClient(
            healthScore: 25,
            churnRisk: 80,
            lastVisitDaysAgo: 90,
            hasNextAppointment: false,
            membershipType: .none
        )
        let prediction = sut.predictChurn(for: client)
        
        // When
        let nudge = sut.generateNudgeRecommendation(for: prediction, client: client)
        
        // Then
        XCTAssertEqual(nudge.suggestedChannel, .sms, "High-risk clients should get SMS (more urgent)")
        XCTAssertFalse(nudge.message.isEmpty)
        XCTAssertTrue(nudge.message.contains(client.firstName))
    }
    
    func testGenerateNudgeRecommendation_LowRisk_SuggestsEmail() {
        // Given: Low-risk prediction
        let client = createClient(
            healthScore: 85,
            churnRisk: 10,
            lastVisitDaysAgo: 5,
            hasNextAppointment: true,
            membershipType: .vip
        )
        let prediction = sut.predictChurn(for: client)
        
        // When
        let nudge = sut.generateNudgeRecommendation(for: prediction, client: client)
        
        // Then
        XCTAssertEqual(nudge.suggestedChannel, .email, "Low-risk clients should get email (less urgent)")
    }
    
    func testGenerateNudgeRecommendation_MessageIsPersonalized() {
        // Given
        let client = createClient(
            healthScore: 45,
            churnRisk: 55,
            lastVisitDaysAgo: 45,
            hasNextAppointment: false,
            membershipType: .basic
        )
        let prediction = sut.predictChurn(for: client)
        
        // When
        let nudge = sut.generateNudgeRecommendation(for: prediction, client: client)
        
        // Then
        XCTAssertTrue(nudge.message.contains(client.firstName), 
                     "Nudge should be personalized with client name")
        XCTAssertNotNil(nudge.expiresAt)
    }
    
    // MARK: - Batch Prediction Tests
    
    func testPredictChurnBatch_ReturnsAllPredictions() async {
        // Given
        let clients = [
            createClient(healthScore: 80, churnRisk: 15, lastVisitDaysAgo: 3, hasNextAppointment: true, membershipType: .vip),
            createClient(healthScore: 40, churnRisk: 60, lastVisitDaysAgo: 45, hasNextAppointment: false, membershipType: .basic),
            createClient(healthScore: 20, churnRisk: 85, lastVisitDaysAgo: 100, hasNextAppointment: false, membershipType: .none)
        ]
        
        // When
        let predictions = await sut.predictChurnBatch(for: clients)
        
        // Then
        XCTAssertEqual(predictions.count, clients.count)
        for client in clients {
            XCTAssertNotNil(predictions[client.id])
        }
    }
    
    // MARK: - Edge Cases
    
    func testPredictChurn_ProbabilityWithinBounds() {
        // Test various edge cases
        let testCases: [(healthScore: Int, lastVisitDays: Int?)] = [
            (100, 0),    // Perfect health, just visited
            (0, 365),    // Worst case
            (50, 45),    // Middle ground
        ]
        
        for testCase in testCases {
            let client = createClient(
                healthScore: testCase.healthScore,
                churnRisk: 100 - testCase.healthScore,
                lastVisitDaysAgo: testCase.lastVisitDays,
                hasNextAppointment: false,
                membershipType: .basic
            )
            
            let prediction = sut.predictChurn(for: client)
            
            XCTAssertGreaterThanOrEqual(prediction.probability, 0.0)
            XCTAssertLessThanOrEqual(prediction.probability, 1.0)
        }
    }
    
    // MARK: - Helper Methods
    
    private func createClient(
        healthScore: Int,
        churnRisk: Int,
        lastVisitDaysAgo: Int?,
        hasNextAppointment: Bool,
        membershipType: MembershipType
    ) -> Client {
        let lastVisit: Date? = lastVisitDaysAgo.map { 
            Calendar.current.date(byAdding: .day, value: -$0, to: Date())!
        }
        let nextAppointment: Date? = hasNextAppointment ? 
            Calendar.current.date(byAdding: .day, value: 7, to: Date()) : nil
        
        return Client(
            id: UUID().uuidString,
            firstName: "Test",
            lastName: "Client",
            email: "test@example.com",
            phone: "(555) 000-0000",
            avatarColor: "3B82F6",
            healthScore: healthScore,
            churnRisk: churnRisk,
            lastVisit: lastVisit,
            nextAppointment: nextAppointment,
            membershipType: membershipType,
            totalSpend: 1000,
            visitCount: 5,
            memberSince: Calendar.current.date(byAdding: .year, value: -1, to: Date())!,
            preferredTreatments: ["Botox"],
            notes: nil,
            visits: []
        )
    }
}
