//
//  AnalyticsView.swift
//  MedSpaAI
//
//  Analytics dashboard with charts and reports
//

import SwiftUI
import Charts

struct AnalyticsView: View {
    @State private var selectedTimeframe: Timeframe = .mtd
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.Spacing.lg) {
                    // Timeframe selector
                    Picker("Timeframe", selection: $selectedTimeframe) {
                        ForEach(Timeframe.allCases, id: \.self) { timeframe in
                            Text(timeframe.rawValue).tag(timeframe)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)
                    
                    // Revenue Chart
                    RevenueChartCard(timeframe: selectedTimeframe)
                    
                    // Churn Metrics
                    ChurnMetricsCard()
                    
                    // Treatment Popularity
                    TreatmentPopularityCard()
                    
                    // Export button
                    Button {
                        HapticManager.shared.impact()
                    } label: {
                        Label("Export Report", systemImage: "square.and.arrow.up")
                            .frame(maxWidth: .infinity)
                    }
                    .secondaryButtonStyle()
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .background(Theme.Colors.pearl.ignoresSafeArea())
            .navigationTitle("Analytics")
        }
    }
}

// MARK: - Timeframe
enum Timeframe: String, CaseIterable {
    case mtd = "MTD"
    case ytd = "YTD"
    case custom = "Custom"
}

// MARK: - Revenue Chart Card
struct RevenueChartCard: View {
    let timeframe: Timeframe
    
    // Sample data
    let revenueData: [RevenueDataPoint] = [
        RevenueDataPoint(month: "Jan", revenue: 12500),
        RevenueDataPoint(month: "Feb", revenue: 14200),
        RevenueDataPoint(month: "Mar", revenue: 13800),
        RevenueDataPoint(month: "Apr", revenue: 16500),
        RevenueDataPoint(month: "May", revenue: 18200),
        RevenueDataPoint(month: "Jun", revenue: 21000)
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Revenue")
                        .font(Theme.Typography.headline)
                    
                    Text("$96,200")
                        .font(Theme.Typography.title)
                        .foregroundColor(Theme.Colors.success)
                    
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.up")
                        Text("23% vs last period")
                    }
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.success)
                }
                
                Spacer()
            }
            
            // Chart
            Chart(revenueData) { dataPoint in
                BarMark(
                    x: .value("Month", dataPoint.month),
                    y: .value("Revenue", dataPoint.revenue)
                )
                .foregroundStyle(Theme.Colors.primaryGradient)
                .cornerRadius(4)
            }
            .frame(height: 200)
            .chartYAxis {
                AxisMarks(position: .leading) { value in
                    AxisValueLabel {
                        if let intValue = value.as(Int.self) {
                            Text("$\(intValue / 1000)k")
                                .font(.caption2)
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.large)
        .shadow(color: Theme.Shadows.medium.color, radius: Theme.Shadows.medium.radius)
        .padding(.horizontal)
    }
}

struct RevenueDataPoint: Identifiable {
    let id = UUID()
    let month: String
    let revenue: Double
}

// MARK: - Churn Metrics Card
struct ChurnMetricsCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            Text("Churn Analysis")
                .font(Theme.Typography.headline)
            
            HStack(spacing: Theme.Spacing.lg) {
                // Churn rate gauge
                VStack {
                    ZStack {
                        Circle()
                            .stroke(Color.gray.opacity(0.2), lineWidth: 10)
                            .frame(width: 100, height: 100)
                        
                        Circle()
                            .trim(from: 0, to: 0.12)
                            .stroke(Theme.Colors.success, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                            .frame(width: 100, height: 100)
                            .rotationEffect(.degrees(-90))
                        
                        VStack(spacing: 0) {
                            Text("12%")
                                .font(Theme.Typography.title2)
                                .fontWeight(.bold)
                            Text("Churn")
                                .font(Theme.Typography.caption2)
                                .foregroundColor(Theme.Colors.textSecondary)
                        }
                    }
                }
                
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    MetricRow(label: "Clients Lost", value: "8", trend: "-3", isPositive: true)
                    MetricRow(label: "Revenue Lost", value: "$4,200", trend: "-12%", isPositive: true)
                    MetricRow(label: "Avg Client Lifespan", value: "14 mo", trend: "+2 mo", isPositive: true)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.large)
        .shadow(color: Theme.Shadows.medium.color, radius: Theme.Shadows.medium.radius)
        .padding(.horizontal)
    }
}

struct MetricRow: View {
    let label: String
    let value: String
    let trend: String
    let isPositive: Bool
    
    var body: some View {
        HStack {
            Text(label)
                .font(Theme.Typography.caption)
                .foregroundColor(Theme.Colors.textSecondary)
            
            Spacer()
            
            Text(value)
                .font(Theme.Typography.subheadline)
                .fontWeight(.semibold)
            
            Text(trend)
                .font(Theme.Typography.caption)
                .foregroundColor(isPositive ? Theme.Colors.success : Theme.Colors.danger)
        }
    }
}

// MARK: - Treatment Popularity Card
struct TreatmentPopularityCard: View {
    let treatments: [(name: String, count: Int, color: Color)] = [
        ("Botox", 45, Theme.Colors.turquoise),
        ("HydraFacial", 32, Theme.Colors.seafoam),
        ("Laser", 28, Color(hex: "F59E0B")),
        ("Microneedling", 21, Theme.Colors.coral),
        ("Chemical Peel", 18, Color(hex: "8B5CF6"))
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            Text("Treatment Popularity")
                .font(Theme.Typography.headline)
            
            ForEach(treatments, id: \.name) { treatment in
                HStack {
                    Text(treatment.name)
                        .font(Theme.Typography.subheadline)
                        .frame(width: 100, alignment: .leading)
                    
                    GeometryReader { geo in
                        RoundedRectangle(cornerRadius: 4)
                            .fill(treatment.color)
                            .frame(width: geo.size.width * CGFloat(treatment.count) / 50)
                    }
                    .frame(height: 20)
                    
                    Text("\(treatment.count)")
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.textSecondary)
                        .frame(width: 30, alignment: .trailing)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.large)
        .shadow(color: Theme.Shadows.medium.color, radius: Theme.Shadows.medium.radius)
        .padding(.horizontal)
    }
}

#Preview {
    AnalyticsView()
}
