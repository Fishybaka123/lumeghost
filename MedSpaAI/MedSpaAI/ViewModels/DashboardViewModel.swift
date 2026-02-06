//
//  DashboardViewModel.swift
//  MedSpaAI
//
//  Dashboard view model managing metrics and at-risk clients
//

import Foundation
import SwiftUI

@MainActor
class DashboardViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var metrics: DashboardMetrics = .sample
    @Published var atRiskClients: [Client] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    // MARK: - Initialization
    init() {
        loadData()
    }
    
    // MARK: - Data Loading
    func loadData() {
        isLoading = true
        
        // Load sample data (in production, this would fetch from Firebase)
        metrics = .sample
        
        // Get at-risk clients (churn risk >= 50%)
        atRiskClients = Client.sampleClients
            .filter { $0.churnRisk >= 50 }
            .sorted { $0.churnRisk > $1.churnRisk }
        
        isLoading = false
    }
    
    func refresh() {
        HapticManager.shared.impact(style: .light)
        loadData()
    }
    
    func refreshAsync() async {
        // Simulate network delay
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        loadData()
    }
}
