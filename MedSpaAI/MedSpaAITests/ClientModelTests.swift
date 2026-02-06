//
//  ClientModelTests.swift
//  MedSpaAITests
//
//  Unit tests for Client data model
//

import XCTest
@testable import MedSpaAI

final class ClientModelTests: XCTestCase {
    
    // MARK: - Initialization Tests
    
    func testClientInit_SetsAllProperties() {
        // Given
        let id = "test-123"
        let firstName = "John"
        let lastName = "Doe"
        
        // When
        let client = Client(
            id: id,
            firstName: firstName,
            lastName: lastName,
            email: "john@example.com",
            phone: "(555) 123-4567",
            avatarColor: "FF6B6B",
            healthScore: 75,
            churnRisk: 25,
            lastVisit: Date(),
            nextAppointment: nil,
            membershipType: .premium,
            totalSpend: 2500,
            visitCount: 10,
            memberSince: Date(),
            preferredTreatments: ["Botox", "HydraFacial"],
            notes: "Test notes",
            visits: []
        )
        
        // Then
        XCTAssertEqual(client.id, id)
        XCTAssertEqual(client.firstName, firstName)
        XCTAssertEqual(client.lastName, lastName)
        XCTAssertEqual(client.healthScore, 75)
        XCTAssertEqual(client.membershipType, .premium)
    }
    
    // MARK: - Computed Properties Tests
    
    func testFullName_CombinesFirstAndLast() {
        let client = createTestClient(firstName: "Sarah", lastName: "Mitchell")
        XCTAssertEqual(client.fullName, "Sarah Mitchell")
    }
    
    func testInitials_ReturnsFirstLetters() {
        let client = createTestClient(firstName: "Sarah", lastName: "Mitchell")
        XCTAssertEqual(client.initials, "SM")
    }
    
    func testInitials_HandlesLowercase() {
        let client = createTestClient(firstName: "john", lastName: "doe")
        XCTAssertEqual(client.initials, "JD")
    }
    
    // MARK: - Health Score Category Tests
    
    func testHealthScoreCategory_HighScore_ReturnsHealthy() {
        let client = createTestClient(healthScore: 85)
        XCTAssertEqual(client.healthScoreCategory, .healthy)
    }
    
    func testHealthScoreCategory_MediumScore_ReturnsNeedsAttention() {
        let client = createTestClient(healthScore: 55)
        XCTAssertEqual(client.healthScoreCategory, .needsAttention)
    }
    
    func testHealthScoreCategory_LowScore_ReturnsAtRisk() {
        let client = createTestClient(healthScore: 30)
        XCTAssertEqual(client.healthScoreCategory, .atRisk)
    }
    
    func testHealthScoreCategory_BoundaryValues() {
        // Test exact boundaries
        XCTAssertEqual(createTestClient(healthScore: 70).healthScoreCategory, .healthy)
        XCTAssertEqual(createTestClient(healthScore: 69).healthScoreCategory, .needsAttention)
        XCTAssertEqual(createTestClient(healthScore: 40).healthScoreCategory, .needsAttention)
        XCTAssertEqual(createTestClient(healthScore: 39).healthScoreCategory, .atRisk)
    }
    
    // MARK: - Churn Risk Category Tests
    
    func testChurnRiskCategory_HighRisk() {
        let client = createTestClient(churnRisk: 75)
        XCTAssertEqual(client.churnRiskCategory, .high)
    }
    
    func testChurnRiskCategory_MediumRisk() {
        let client = createTestClient(churnRisk: 45)
        XCTAssertEqual(client.churnRiskCategory, .medium)
    }
    
    func testChurnRiskCategory_LowRisk() {
        let client = createTestClient(churnRisk: 15)
        XCTAssertEqual(client.churnRiskCategory, .low)
    }
    
    // MARK: - Membership Type Tests
    
    func testMembershipType_DisplayNames() {
        XCTAssertEqual(MembershipType.none.displayName, "No Membership")
        XCTAssertEqual(MembershipType.basic.displayName, "Basic")
        XCTAssertEqual(MembershipType.premium.displayName, "💎 Premium")
        XCTAssertEqual(MembershipType.vip.displayName, "⭐ VIP")
    }
    
    func testMembershipType_AllCases() {
        XCTAssertEqual(MembershipType.allCases.count, 4)
    }
    
    // MARK: - Codable Tests
    
    func testClient_EncodesAndDecodes() throws {
        // Given
        let originalClient = createTestClient()
        
        // When
        let encoder = JSONEncoder()
        let data = try encoder.encode(originalClient)
        
        let decoder = JSONDecoder()
        let decodedClient = try decoder.decode(Client.self, from: data)
        
        // Then
        XCTAssertEqual(decodedClient.id, originalClient.id)
        XCTAssertEqual(decodedClient.firstName, originalClient.firstName)
        XCTAssertEqual(decodedClient.email, originalClient.email)
        XCTAssertEqual(decodedClient.healthScore, originalClient.healthScore)
        XCTAssertEqual(decodedClient.membershipType, originalClient.membershipType)
    }
    
    // MARK: - Hashable Tests
    
    func testClient_IsHashable() {
        let client1 = createTestClient(id: "1")
        let client2 = createTestClient(id: "2")
        let client3 = createTestClient(id: "1")
        
        var set = Set<Client>()
        set.insert(client1)
        set.insert(client2)
        set.insert(client3)
        
        XCTAssertEqual(set.count, 2)
    }
    
    // MARK: - Sample Data Tests
    
    func testSampleClients_AreValid() {
        let samples = Client.sampleClients
        
        XCTAssertFalse(samples.isEmpty)
        
        for client in samples {
            XCTAssertFalse(client.id.isEmpty)
            XCTAssertFalse(client.firstName.isEmpty)
            XCTAssertFalse(client.email.isEmpty)
            XCTAssertGreaterThanOrEqual(client.healthScore, 0)
            XCTAssertLessThanOrEqual(client.healthScore, 100)
            XCTAssertGreaterThanOrEqual(client.churnRisk, 0)
            XCTAssertLessThanOrEqual(client.churnRisk, 100)
        }
    }
    
    // MARK: - Helper
    
    private func createTestClient(
        id: String = "test-id",
        firstName: String = "Test",
        lastName: String = "User",
        healthScore: Int = 75,
        churnRisk: Int = 25
    ) -> Client {
        Client(
            id: id,
            firstName: firstName,
            lastName: lastName,
            email: "test@example.com",
            phone: "(555) 000-0000",
            avatarColor: "3B82F6",
            healthScore: healthScore,
            churnRisk: churnRisk,
            lastVisit: Date(),
            nextAppointment: nil,
            membershipType: .basic,
            totalSpend: 1000,
            visitCount: 5,
            memberSince: Date(),
            preferredTreatments: [],
            notes: nil,
            visits: []
        )
    }
}
