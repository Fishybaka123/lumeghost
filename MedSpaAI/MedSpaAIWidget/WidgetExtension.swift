//
//  WidgetExtension.swift
//  MedSpaAI
//
//  Widget extension for home screen metrics glance
//

import WidgetKit
import SwiftUI

// MARK: - Widget Entry
struct MedSpaEntry: TimelineEntry {
    let date: Date
    let atRiskCount: Int
    let healthScore: Int
    let todayAppointments: Int
    let recentNudge: String?
}

// MARK: - Widget Provider
struct MedSpaProvider: TimelineProvider {
    func placeholder(in context: Context) -> MedSpaEntry {
        MedSpaEntry(
            date: Date(),
            atRiskCount: 5,
            healthScore: 74,
            todayAppointments: 8,
            recentNudge: nil
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (MedSpaEntry) -> Void) {
        let entry = MedSpaEntry(
            date: Date(),
            atRiskCount: 5,
            healthScore: 74,
            todayAppointments: 8,
            recentNudge: "Sarah M. responded!"
        )
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<MedSpaEntry>) -> Void) {
        // In production, fetch from shared app group data
        let entry = MedSpaEntry(
            date: Date(),
            atRiskCount: 5,
            healthScore: 74,
            todayAppointments: 8,
            recentNudge: "Lisa T. booked appointment"
        )
        
        // Refresh every hour
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

// MARK: - Small Widget View
struct MedSpaWidgetSmall: View {
    let entry: MedSpaEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "waveform.path.ecg")
                    .foregroundColor(.white)
                Text("MedSpa AI")
                    .font(.caption.bold())
                    .foregroundColor(.white)
            }
            
            Spacer()
            
            VStack(alignment: .leading, spacing: 4) {
                Text("\(entry.atRiskCount)")
                    .font(.system(size: 40, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("At-Risk Clients")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
            }
        }
        .padding()
        .background(
            LinearGradient(
                colors: [Color(hex: "0A2540"), Color(hex: "00B8D9")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

// MARK: - Medium Widget View
struct MedSpaWidgetMedium: View {
    let entry: MedSpaEntry
    
    var body: some View {
        HStack(spacing: 16) {
            // Left side - At Risk
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "waveform.path.ecg")
                        .foregroundColor(.white)
                    Text("MedSpa AI")
                        .font(.caption.bold())
                        .foregroundColor(.white)
                }
                
                Spacer()
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(entry.atRiskCount)")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    
                    Text("At-Risk")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                }
            }
            
            // Center - Health Score
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .stroke(.white.opacity(0.3), lineWidth: 6)
                    
                    Circle()
                        .trim(from: 0, to: Double(entry.healthScore) / 100)
                        .stroke(.white, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                    
                    Text("\(entry.healthScore)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                }
                .frame(width: 70, height: 70)
                
                Text("Health Score")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.8))
            }
            
            // Right side - Today
            VStack(alignment: .trailing, spacing: 8) {
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(entry.todayAppointments)")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    
                    Text("Today")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                }
                
                if let nudge = entry.recentNudge {
                    Text(nudge)
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.7))
                        .lineLimit(1)
                }
            }
        }
        .padding()
        .background(
            LinearGradient(
                colors: [Color(hex: "0A2540"), Color(hex: "00B8D9")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

// MARK: - Widget Configuration
struct MedSpaWidget: Widget {
    let kind: String = "MedSpaWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: MedSpaProvider()) { entry in
            if #available(iOS 17.0, *) {
                MedSpaWidgetView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                MedSpaWidgetView(entry: entry)
            }
        }
        .configurationDisplayName("MedSpa AI")
        .description("Quick glance at your client health metrics")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct MedSpaWidgetView: View {
    @Environment(\.widgetFamily) var family
    let entry: MedSpaEntry
    
    var body: some View {
        switch family {
        case .systemSmall:
            MedSpaWidgetSmall(entry: entry)
        case .systemMedium:
            MedSpaWidgetMedium(entry: entry)
        default:
            MedSpaWidgetSmall(entry: entry)
        }
    }
}

// MARK: - Live Activity
struct MedSpaLiveActivity: Widget {
    var body: some WidgetConfiguration {
        // Live Activity configuration for real-time updates
        // e.g., "New lead from Instagram - Sarah M."
        
        StaticConfiguration(kind: "MedSpaLiveActivity", provider: MedSpaProvider()) { entry in
            LiveActivityView(entry: entry)
        }
        .configurationDisplayName("Live Updates")
        .description("Real-time notifications for new leads")
        .supportedFamilies([.systemSmall])
    }
}

struct LiveActivityView: View {
    let entry: MedSpaEntry
    
    var body: some View {
        HStack {
            Image(systemName: "bell.badge.fill")
                .foregroundColor(Color(hex: "FF6B6B"))
            
            VStack(alignment: .leading) {
                Text("New Lead")
                    .font(.caption.bold())
                
                Text(entry.recentNudge ?? "Check app for details")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding()
    }
}

// MARK: - Preview
#Preview("Small", as: .systemSmall) {
    MedSpaWidget()
} timeline: {
    MedSpaEntry(date: .now, atRiskCount: 5, healthScore: 74, todayAppointments: 8, recentNudge: nil)
}

#Preview("Medium", as: .systemMedium) {
    MedSpaWidget()
} timeline: {
    MedSpaEntry(date: .now, atRiskCount: 5, healthScore: 74, todayAppointments: 8, recentNudge: "Lisa T. responded!")
}
