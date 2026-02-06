//
//  ClientsViewModel.swift
//  MedSpaAI
//
//  Clients list view model with filtering and search
//

import Foundation
import SwiftUI

@MainActor
class ClientsViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var allClients: [Client] = Client.sampleClients
    @Published var filteredClients: [Client] = []
    @Published var isLoading = false
    @Published var showAddClient = false
    @Published var showNudgeAlert = false
    @Published var selectedClient: Client?
    
    // Filter state
    @Published var currentFilter: ClientFilter = .all
    @Published var searchQuery = ""
    
    // MARK: - Initialization
    init() {
        filteredClients = allClients
    }
    
    // MARK: - Filtering
    func applyFilter(_ filter: ClientFilter) {
        currentFilter = filter
        updateFilteredClients()
    }
    
    func search(query: String) {
        searchQuery = query
        updateFilteredClients()
    }
    
    private func updateFilteredClients() {
        var clients = allClients
        
        // Apply health filter
        switch currentFilter {
        case .all:
            break
        case .healthy:
            clients = clients.filter { $0.healthScore >= 70 }
        case .attention:
            clients = clients.filter { $0.healthScore >= 40 && $0.healthScore < 70 }
        case .atRisk:
            clients = clients.filter { $0.healthScore < 40 }
        }
        
        // Apply search
        if !searchQuery.isEmpty {
            let query = searchQuery.lowercased()
            clients = clients.filter { client in
                client.fullName.lowercased().contains(query) ||
                client.email.lowercased().contains(query) ||
                client.phone.contains(query)
            }
        }
        
        // Sort by health score (lowest first for attention)
        clients.sort { $0.healthScore < $1.healthScore }
        
        filteredClients = clients
    }
    
    // MARK: - Filter Counts
    func count(for filter: ClientFilter) -> Int {
        switch filter {
        case .all:
            return allClients.count
        case .healthy:
            return allClients.filter { $0.healthScore >= 70 }.count
        case .attention:
            return allClients.filter { $0.healthScore >= 40 && $0.healthScore < 70 }.count
        case .atRisk:
            return allClients.filter { $0.healthScore < 40 }.count
        }
    }
    
    // MARK: - Actions
    func sendNudge(to client: Client) {
        selectedClient = client
        showNudgeAlert = true
        HapticManager.shared.impact(style: .medium)
    }
    
    func confirmSendNudge() {
        guard let client = selectedClient else { return }
        
        // In production, this would call the nudge service
        print("📤 Sending nudge to \(client.fullName)")
        HapticManager.shared.notification(type: .success)
        
        selectedClient = nil
    }
    
    func scheduleAppointment(for client: Client) {
        selectedClient = client
        // In production, this would open the scheduling flow
        print("📅 Scheduling appointment for \(client.fullName)")
        HapticManager.shared.impact(style: .medium)
    }
}
