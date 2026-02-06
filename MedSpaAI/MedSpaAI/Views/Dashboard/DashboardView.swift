//
//  DashboardView.swift
//  MedSpaAI
//
//  Main dashboard with metrics grid and at-risk clients
//

import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showingProfile = false
    
    let columns = [
        GridItem(.flexible(), spacing: Theme.Spacing.md),
        GridItem(.flexible(), spacing: Theme.Spacing.md)
    ]
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.Spacing.lg) {
                    // Welcome header
                    WelcomeHeaderView(userName: authViewModel.currentUser?.displayName ?? "there")
                    
                    // Metrics Grid
                    LazyVGrid(columns: columns, spacing: Theme.Spacing.md) {
                        MetricCardView(
                            metric: viewModel.metrics.totalClients,
                            icon: "person.2.fill",
                            gradient: Theme.Colors.cardBlue
                        )
                        
                        MetricCardView(
                            metric: viewModel.metrics.activeLeads,
                            icon: "target",
                            gradient: Theme.Colors.cardTeal
                        )
                        
                        MetricCardView(
                            metric: viewModel.metrics.atRiskClients,
                            icon: "exclamationmark.triangle.fill",
                            gradient: Theme.Colors.cardCoral
                        )
                        
                        MetricCardView(
                            metric: viewModel.metrics.leadConversion,
                            icon: "chart.line.uptrend.xyaxis",
                            gradient: Theme.Colors.cardEmerald
                        )
                        
                        MetricCardView(
                            metric: viewModel.metrics.revenueSaved,
                            icon: "dollarsign.circle.fill",
                            gradient: Theme.Colors.cardAmber
                        )
                        
                        MetricCardView(
                            metric: viewModel.metrics.healthScore,
                            icon: "heart.fill",
                            gradient: Theme.Colors.cardPurple
                        )
                    }
                    .padding(.horizontal)
                    
                    // At-Risk Clients Section
                    AtRiskClientsSection(clients: viewModel.atRiskClients)
                }
                .padding(.bottom, Theme.Spacing.xl)
            }
            .background(Theme.Colors.pearl.ignoresSafeArea())
            .navigationTitle("Dashboard")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingProfile = true
                    } label: {
                        if let user = authViewModel.currentUser {
                            Text(user.initials)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(width: 36, height: 36)
                                .background(Theme.Colors.turquoise)
                                .clipShape(Circle())
                        }
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        viewModel.refresh()
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .refreshable {
                await viewModel.refreshAsync()
            }
            .sheet(isPresented: $showingProfile) {
                UserProfileSheet()
            }
        }
    }
}

// MARK: - Welcome Header
struct WelcomeHeaderView: View {
    let userName: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Text("Welcome back! 👋")
                .font(Theme.Typography.title2)
                .foregroundColor(Theme.Colors.textPrimary)
            
            Text("Here's what's happening with your clients today")
                .font(Theme.Typography.subheadline)
                .foregroundColor(Theme.Colors.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal)
        .padding(.top, Theme.Spacing.md)
    }
}

// MARK: - Metric Card View
struct MetricCardView: View {
    let metric: MetricData
    let icon: String
    let gradient: LinearGradient
    
    @State private var animatedValue: Double = 0
    @State private var isPressed = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack {
                // Icon
                ZStack {
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.medium)
                        .fill(gradient)
                        .frame(width: 44, height: 44)
                    
                    Image(systemName: icon)
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(.white)
                }
                
                Spacer()
                
                // Trend indicator
                HStack(spacing: 2) {
                    Image(systemName: metric.trend == .positive ? "arrow.up" : "arrow.down")
                        .font(.system(size: 10, weight: .bold))
                    
                    Text("\(Int(abs(metric.change)))%")
                        .font(.system(size: 12, weight: .semibold))
                }
                .foregroundColor(metric.trend == .positive ? Theme.Colors.success : Theme.Colors.danger)
            }
            
            // Value
            Text(metric.formattedValue)
                .font(Theme.Typography.metricValue)
                .foregroundColor(Theme.Colors.textPrimary)
                .contentTransition(.numericText())
            
            // Label
            Text(metric.label)
                .font(Theme.Typography.metricLabel)
                .foregroundColor(Theme.Colors.textSecondary)
        }
        .padding(Theme.Spacing.md)
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.large)
        .shadow(
            color: Theme.Shadows.medium.color,
            radius: Theme.Shadows.medium.radius,
            x: Theme.Shadows.medium.x,
            y: Theme.Shadows.medium.y
        )
        .scaleEffect(isPressed ? 0.98 : 1.0)
        .animation(.spring(response: 0.3), value: isPressed)
        .onTapGesture {
            HapticManager.shared.impact(style: .light)
            withAnimation(.spring(response: 0.2)) {
                isPressed = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                withAnimation(.spring(response: 0.2)) {
                    isPressed = false
                }
            }
        }
    }
}

// MARK: - At-Risk Clients Section
struct AtRiskClientsSection: View {
    let clients: [Client]
    @State private var selectedFilter = "High Risk"
    
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack {
                Text("⚠️ At-Risk Clients")
                    .font(Theme.Typography.title3)
                    .foregroundColor(Theme.Colors.textPrimary)
                
                Spacer()
                
                NavigationLink("View All") {
                    ClientsListView()
                }
                .font(Theme.Typography.subheadline)
                .foregroundColor(Theme.Colors.turquoise)
            }
            .padding(.horizontal)
            
            // Client cards
            ForEach(clients) { client in
                NavigationLink(destination: ClientProfileView(client: client)) {
                    AtRiskClientRow(client: client)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

// MARK: - At-Risk Client Row
struct AtRiskClientRow: View {
    let client: Client
    
    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            // Avatar
            Text(client.initials)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
                .frame(width: 44, height: 44)
                .background(client.avatarSwiftColor)
                .clipShape(Circle())
            
            // Info
            VStack(alignment: .leading, spacing: 2) {
                Text(client.fullName)
                    .font(Theme.Typography.headline)
                    .foregroundColor(Theme.Colors.textPrimary)
                
                Text(client.email)
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.textSecondary)
            }
            
            Spacer()
            
            // Health Score
            HealthScoreBadge(score: client.healthScore)
            
            // Churn Risk
            ChurnRiskBadge(risk: client.churnRisk)
            
            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(Theme.Colors.textMuted)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.medium)
        .shadow(color: Theme.Shadows.small.color, radius: Theme.Shadows.small.radius)
        .padding(.horizontal)
    }
}

// MARK: - Health Score Badge
struct HealthScoreBadge: View {
    let score: Int
    
    var category: HealthCategory {
        if score >= 70 { return .healthy }
        if score >= 40 { return .needsAttention }
        return .atRisk
    }
    
    var body: some View {
        HStack(spacing: 4) {
            Text("\(score)")
                .font(.system(size: 14, weight: .bold))
            
            // Mini progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.gray.opacity(0.2))
                    
                    RoundedRectangle(cornerRadius: 2)
                        .fill(category.color)
                        .frame(width: geo.size.width * CGFloat(score) / 100)
                }
            }
            .frame(width: 40, height: 6)
        }
        .foregroundColor(category.color)
    }
}

// MARK: - Churn Risk Badge
struct ChurnRiskBadge: View {
    let risk: Int
    
    var category: ChurnRiskCategory {
        if risk >= 60 { return .high }
        if risk >= 30 { return .medium }
        return .low
    }
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 10))
            
            Text("\(risk)%")
                .font(.system(size: 12, weight: .semibold))
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(category.backgroundColor)
        .foregroundColor(category.color)
        .cornerRadius(Theme.CornerRadius.full)
    }
}

// MARK: - User Profile Sheet
struct UserProfileSheet: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            VStack(spacing: Theme.Spacing.lg) {
                if let user = authViewModel.currentUser {
                    Text(user.initials)
                        .font(.system(size: 40, weight: .bold))
                        .foregroundColor(.white)
                        .frame(width: 100, height: 100)
                        .background(Theme.Colors.turquoise)
                        .clipShape(Circle())
                    
                    Text(user.displayName ?? "User")
                        .font(Theme.Typography.title2)
                    
                    Text(user.email)
                        .font(Theme.Typography.subheadline)
                        .foregroundColor(Theme.Colors.textSecondary)
                }
                
                Spacer()
                
                Button("Sign Out") {
                    authViewModel.signOut()
                    dismiss()
                }
                .foregroundColor(Theme.Colors.danger)
                .padding(.bottom)
            }
            .padding()
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    DashboardView()
        .environmentObject(AuthViewModel())
}
