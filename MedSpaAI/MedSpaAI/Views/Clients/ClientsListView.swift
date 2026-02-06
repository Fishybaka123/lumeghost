//
//  ClientsListView.swift
//  MedSpaAI
//
//  Searchable, filterable list of all clients
//

import SwiftUI

struct ClientsListView: View {
    @StateObject private var viewModel = ClientsViewModel()
    @State private var searchText = ""
    @State private var selectedFilter: ClientFilter = .all
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Filter pills
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Theme.Spacing.sm) {
                        ForEach(ClientFilter.allCases, id: \.self) { filter in
                            FilterPill(
                                title: filter.title,
                                count: viewModel.count(for: filter),
                                isSelected: selectedFilter == filter
                            ) {
                                withAnimation(.spring(response: 0.3)) {
                                    selectedFilter = filter
                                    viewModel.applyFilter(filter)
                                }
                                HapticManager.shared.selection()
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, Theme.Spacing.sm)
                }
                .background(Color.white)
                
                // Client list
                List {
                    ForEach(viewModel.filteredClients) { client in
                        NavigationLink(destination: ClientProfileView(client: client)) {
                            ClientRowView(client: client)
                        }
                        .swipeActions(edge: .trailing) {
                            Button {
                                viewModel.sendNudge(to: client)
                            } label: {
                                Label("Nudge", systemImage: "paperplane.fill")
                            }
                            .tint(Theme.Colors.turquoise)
                            
                            Button {
                                viewModel.scheduleAppointment(for: client)
                            } label: {
                                Label("Schedule", systemImage: "calendar")
                            }
                            .tint(Theme.Colors.coral)
                        }
                        .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                        .listRowSeparator(.hidden)
                    }
                }
                .listStyle(.plain)
                .searchable(text: $searchText, prompt: "Search by name, email, or phone")
                .onChange(of: searchText) { _, newValue in
                    viewModel.search(query: newValue)
                }
            }
            .background(Theme.Colors.pearl)
            .navigationTitle("Clients")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        viewModel.showAddClient = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 22))
                            .foregroundColor(Theme.Colors.turquoise)
                    }
                }
            }
            .sheet(isPresented: $viewModel.showAddClient) {
                AddClientSheet()
            }
            .alert("Send Nudge", isPresented: $viewModel.showNudgeAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Send") {
                    viewModel.confirmSendNudge()
                }
            } message: {
                Text("Send a personalized message to \(viewModel.selectedClient?.fullName ?? "client")?")
            }
        }
    }
}

// MARK: - Client Filter
enum ClientFilter: String, CaseIterable {
    case all = "All"
    case healthy = "Healthy"
    case attention = "Needs Attention"
    case atRisk = "At Risk"
    
    var title: String { rawValue }
}

// MARK: - Filter Pill
struct FilterPill: View {
    let title: String
    let count: Int
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Text(title)
                Text("(\(count))")
                    .fontWeight(.semibold)
            }
            .font(Theme.Typography.subheadline)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.sm)
            .background(isSelected ? Theme.Colors.turquoise : Color.white)
            .foregroundColor(isSelected ? .white : Theme.Colors.textSecondary)
            .cornerRadius(Theme.CornerRadius.full)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.full)
                    .stroke(isSelected ? Color.clear : Color(hex: "E5E7EB"), lineWidth: 1)
            )
        }
    }
}

// MARK: - Client Row View
struct ClientRowView: View {
    let client: Client
    
    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            // Avatar
            Text(client.initials)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
                .frame(width: 50, height: 50)
                .background(client.avatarSwiftColor)
                .clipShape(Circle())
            
            // Client info
            VStack(alignment: .leading, spacing: 4) {
                Text(client.fullName)
                    .font(Theme.Typography.headline)
                    .foregroundColor(Theme.Colors.textPrimary)
                
                Text(client.email)
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.textSecondary)
                    .lineLimit(1)
            }
            
            Spacer()
            
            // Metrics
            VStack(alignment: .trailing, spacing: 6) {
                // Health score
                HealthScoreBadge(score: client.healthScore)
                
                // Churn risk
                ChurnRiskBadge(risk: client.churnRisk)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.medium)
        .shadow(color: Theme.Shadows.small.color, radius: Theme.Shadows.small.radius)
    }
}

// MARK: - Add Client Sheet
struct AddClientSheet: View {
    @Environment(\.dismiss) var dismiss
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var email = ""
    @State private var phone = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Personal Information") {
                    TextField("First Name", text: $firstName)
                    TextField("Last Name", text: $lastName)
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                        .textContentType(.emailAddress)
                    TextField("Phone", text: $phone)
                        .keyboardType(.phonePad)
                        .textContentType(.telephoneNumber)
                }
                
                Section("Membership") {
                    Picker("Type", selection: .constant(MembershipType.basic)) {
                        ForEach(MembershipType.allCases, id: \.self) { type in
                            Text(type.displayName).tag(type)
                        }
                    }
                }
            }
            .navigationTitle("Add Client")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        // Save client
                        dismiss()
                    }
                    .disabled(firstName.isEmpty || lastName.isEmpty)
                }
            }
        }
    }
}

#Preview {
    ClientsListView()
}
