//
//  ClientProfileView.swift
//  MedSpaAI
//
//  Detailed client profile with stats, timeline, and AI insights
//

import SwiftUI

struct ClientProfileView: View {
    let client: Client
    @State private var showingNudgeSheet = false
    @State private var showingScheduleSheet = false
    @State private var notes: String
    
    init(client: Client) {
        self.client = client
        _notes = State(initialValue: client.notes ?? "")
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                // Profile Header Card
                ProfileHeaderCard(client: client)
                
                // Stats Row
                StatsRowView(client: client)
                
                // AI Insights
                AIInsightsCard(client: client)
                
                // Quick Actions
                QuickActionsCard(
                    onNudge: { showingNudgeSheet = true },
                    onSchedule: { showingScheduleSheet = true }
                )
                
                // Visit Timeline
                VisitTimelineCard(visits: client.visits)
                
                // Notes
                NotesCard(notes: $notes)
            }
            .padding()
        }
        .background(Theme.Colors.pearl.ignoresSafeArea())
        .navigationTitle(client.fullName)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showingNudgeSheet) {
            SendNudgeSheet(client: client)
        }
        .sheet(isPresented: $showingScheduleSheet) {
            ScheduleAppointmentSheet(client: client)
        }
    }
}

// MARK: - Profile Header Card
struct ProfileHeaderCard: View {
    let client: Client
    
    var body: some View {
        VStack(spacing: Theme.Spacing.md) {
            // Avatar and basic info
            HStack(spacing: Theme.Spacing.lg) {
                Text(client.initials)
                    .font(.system(size: 36, weight: .bold))
                    .foregroundColor(.white)
                    .frame(width: 80, height: 80)
                    .background(client.avatarSwiftColor)
                    .clipShape(Circle())
                
                VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                    Text(client.fullName)
                        .font(Theme.Typography.title2)
                        .foregroundColor(Theme.Colors.textPrimary)
                    
                    // Contact info
                    HStack(spacing: Theme.Spacing.sm) {
                        Label(client.email, systemImage: "envelope")
                        
                        Label(client.phone, systemImage: "phone")
                    }
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.textSecondary)
                    
                    // Tags
                    HStack(spacing: Theme.Spacing.xs) {
                        MembershipBadge(type: client.membershipType)
                        ChurnRiskBadge(risk: client.churnRisk)
                    }
                }
                
                Spacer()
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.large)
        .shadow(color: Theme.Shadows.medium.color, radius: Theme.Shadows.medium.radius)
    }
}

// MARK: - Membership Badge
struct MembershipBadge: View {
    let type: MembershipType
    
    var body: some View {
        Text(type.displayName)
            .font(.system(size: 12, weight: .semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(type.backgroundColor)
            .foregroundColor(type.color)
            .cornerRadius(Theme.CornerRadius.full)
    }
}

// MARK: - Stats Row View
struct StatsRowView: View {
    let client: Client
    
    var body: some View {
        HStack(spacing: Theme.Spacing.sm) {
            StatItem(
                value: "\(client.healthScore)",
                label: "Health Score",
                color: client.healthScoreCategory.color
            )
            
            StatItem(
                value: "\(client.churnRisk)%",
                label: "Churn Risk",
                color: client.churnRiskCategory.color
            )
            
            StatItem(
                value: formatCurrency(client.totalSpend),
                label: "Total Spend",
                color: Theme.Colors.success
            )
            
            StatItem(
                value: "\(client.visitCount)",
                label: "Visits",
                color: Theme.Colors.turquoise
            )
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.large)
        .shadow(color: Theme.Shadows.medium.color, radius: Theme.Shadows.medium.radius)
    }
    
    func formatCurrency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: amount)) ?? "$0"
    }
}

struct StatItem: View {
    let value: String
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(Theme.Typography.title3)
                .fontWeight(.bold)
                .foregroundColor(color)
            
            Text(label)
                .font(Theme.Typography.caption2)
                .foregroundColor(Theme.Colors.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - AI Insights Card
struct AIInsightsCard: View {
    let client: Client
    
    var insights: [AIInsight] {
        var results: [AIInsight] = []
        
        if client.churnRisk >= 60 {
            results.append(AIInsight(
                type: .warning,
                title: "High Churn Risk",
                message: "\(client.firstName) hasn't visited in a while. Consider a personalized re-engagement offer.",
                action: "Send Re-engagement Nudge"
            ))
        }
        
        if client.nextAppointment == nil {
            results.append(AIInsight(
                type: .info,
                title: "No Upcoming Appointment",
                message: "Based on treatment history, \(client.firstName) may be due for a follow-up.",
                action: "Schedule Follow-up"
            ))
        }
        
        if client.totalSpend > 5000 {
            results.append(AIInsight(
                type: .success,
                title: "Loyal Customer",
                message: "\(client.firstName) is a high-value customer. Consider exclusive perks.",
                action: nil
            ))
        }
        
        return results
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack {
                Label("AI Insights", systemImage: "sparkles")
                    .font(Theme.Typography.headline)
                
                Spacer()
                
                Text("Placeholder")
                    .font(Theme.Typography.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Theme.Colors.infoLight)
                    .foregroundColor(Theme.Colors.info)
                    .cornerRadius(Theme.CornerRadius.small)
            }
            
            ForEach(insights) { insight in
                AIInsightRow(insight: insight)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.large)
        .shadow(color: Theme.Shadows.medium.color, radius: Theme.Shadows.medium.radius)
    }
}

struct AIInsightRow: View {
    let insight: AIInsight
    
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Text(insight.title)
                .font(Theme.Typography.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(Theme.Colors.textPrimary)
            
            Text(insight.message)
                .font(Theme.Typography.caption)
                .foregroundColor(Theme.Colors.textSecondary)
            
            if let action = insight.action {
                Button(action) {
                    HapticManager.shared.impact()
                }
                .font(Theme.Typography.caption)
                .fontWeight(.semibold)
                .foregroundColor(Theme.Colors.turquoise)
                .padding(.top, 4)
            }
        }
        .padding()
        .background(Theme.Colors.infoLight.opacity(0.3))
        .cornerRadius(Theme.CornerRadius.medium)
    }
}

// MARK: - Quick Actions Card
struct QuickActionsCard: View {
    let onNudge: () -> Void
    let onSchedule: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            Text("Quick Actions")
                .font(Theme.Typography.headline)
            
            VStack(spacing: Theme.Spacing.sm) {
                QuickActionButton(
                    title: "Send Personalized Nudge",
                    icon: "paperplane.fill",
                    isPrimary: true,
                    action: onNudge
                )
                
                QuickActionButton(
                    title: "Schedule Appointment",
                    icon: "calendar",
                    action: onSchedule
                )
                
                QuickActionButton(
                    title: "Call Client",
                    icon: "phone.fill",
                    action: {}
                )
                
                QuickActionButton(
                    title: "View Documents",
                    icon: "doc.fill",
                    action: {}
                )
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.large)
        .shadow(color: Theme.Shadows.medium.color, radius: Theme.Shadows.medium.radius)
    }
}

struct QuickActionButton: View {
    let title: String
    let icon: String
    var isPrimary: Bool = false
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                Text(title)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12))
            }
            .font(Theme.Typography.subheadline)
            .fontWeight(.medium)
            .padding()
            .background(isPrimary ? Theme.Colors.primaryGradient : LinearGradient(colors: [.white], startPoint: .leading, endPoint: .trailing))
            .foregroundColor(isPrimary ? .white : Theme.Colors.textPrimary)
            .cornerRadius(Theme.CornerRadius.medium)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.medium)
                    .stroke(isPrimary ? Color.clear : Color(hex: "E5E7EB"), lineWidth: 1)
            )
        }
    }
}

// MARK: - Visit Timeline Card
struct VisitTimelineCard: View {
    let visits: [Visit]
    
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack {
                Label("Visit Timeline", systemImage: "clock")
                    .font(Theme.Typography.headline)
                
                Spacer()
                
                Button("View All") {}
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.turquoise)
            }
            
            ForEach(visits) { visit in
                VisitRow(visit: visit)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.large)
        .shadow(color: Theme.Shadows.medium.color, radius: Theme.Shadows.medium.radius)
    }
}

struct VisitRow: View {
    let visit: Visit
    
    var body: some View {
        HStack(alignment: .top, spacing: Theme.Spacing.md) {
            // Timeline dot
            Circle()
                .fill(Theme.Colors.turquoise)
                .frame(width: 12, height: 12)
                .padding(.top, 4)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(visit.date.formatted(date: .abbreviated, time: .omitted))
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.textMuted)
                
                Text(visit.treatment)
                    .font(Theme.Typography.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(Theme.Colors.textPrimary)
                
                if visit.amount > 0 {
                    Text(formatCurrency(visit.amount))
                        .font(Theme.Typography.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(Theme.Colors.success)
                }
            }
            
            Spacer()
        }
        .padding()
        .background(Color(hex: "F9FAFB"))
        .cornerRadius(Theme.CornerRadius.medium)
    }
    
    func formatCurrency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: amount)) ?? "$0"
    }
}

// MARK: - Notes Card
struct NotesCard: View {
    @Binding var notes: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack {
                Label("Notes", systemImage: "note.text")
                    .font(Theme.Typography.headline)
                
                Spacer()
                
                Button("Save") {
                    HapticManager.shared.notification(type: .success)
                }
                .font(Theme.Typography.caption)
                .foregroundColor(Theme.Colors.turquoise)
            }
            
            TextEditor(text: $notes)
                .frame(minHeight: 100)
                .padding(Theme.Spacing.sm)
                .background(Color(hex: "F9FAFB"))
                .cornerRadius(Theme.CornerRadius.medium)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.large)
        .shadow(color: Theme.Shadows.medium.color, radius: Theme.Shadows.medium.radius)
    }
}

// MARK: - Send Nudge Sheet
struct SendNudgeSheet: View {
    let client: Client
    @Environment(\.dismiss) var dismiss
    @State private var message = ""
    
    var body: some View {
        NavigationStack {
            VStack(spacing: Theme.Spacing.lg) {
                Text("Send a personalized message to \(client.firstName)")
                    .font(Theme.Typography.subheadline)
                    .foregroundColor(Theme.Colors.textSecondary)
                
                TextEditor(text: $message)
                    .frame(minHeight: 150)
                    .padding()
                    .background(Color(hex: "F9FAFB"))
                    .cornerRadius(Theme.CornerRadius.medium)
                
                Button {
                    HapticManager.shared.notification(type: .success)
                    dismiss()
                } label: {
                    Text("Send Nudge")
                        .frame(maxWidth: .infinity)
                }
                .primaryButtonStyle()
                
                Spacer()
            }
            .padding()
            .navigationTitle("Send Nudge")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Schedule Appointment Sheet
struct ScheduleAppointmentSheet: View {
    let client: Client
    @Environment(\.dismiss) var dismiss
    @State private var selectedDate = Date()
    
    var body: some View {
        NavigationStack {
            VStack(spacing: Theme.Spacing.lg) {
                DatePicker("Select Date & Time", selection: $selectedDate)
                    .datePickerStyle(.graphical)
                
                Button {
                    HapticManager.shared.notification(type: .success)
                    dismiss()
                } label: {
                    Text("Schedule Appointment")
                        .frame(maxWidth: .infinity)
                }
                .primaryButtonStyle()
                
                Spacer()
            }
            .padding()
            .navigationTitle("Schedule Appointment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        ClientProfileView(client: Client.sampleClients[0])
    }
}
