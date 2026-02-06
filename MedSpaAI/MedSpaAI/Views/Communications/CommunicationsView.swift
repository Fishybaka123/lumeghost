//
//  CommunicationsView.swift
//  MedSpaAI
//
//  Communications hub with message threads and AI suggestions
//

import SwiftUI

struct CommunicationsView: View {
    @State private var searchText = ""
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Tab selector
                Picker("View", selection: $selectedTab) {
                    Text("Messages").tag(0)
                    Text("Automations").tag(1)
                }
                .pickerStyle(.segmented)
                .padding()
                
                if selectedTab == 0 {
                    MessageThreadsView()
                } else {
                    AutomationsView()
                }
            }
            .background(Theme.Colors.pearl.ignoresSafeArea())
            .navigationTitle("Communications")
            .searchable(text: $searchText, prompt: "Search messages...")
        }
    }
}

// MARK: - Message Threads View
struct MessageThreadsView: View {
    let threads: [MessageThread] = MessageThread.samples
    
    var body: some View {
        List {
            ForEach(threads) { thread in
                NavigationLink(destination: ThreadDetailView(thread: thread)) {
                    MessageThreadRow(thread: thread)
                }
                .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                .listRowSeparator(.hidden)
            }
        }
        .listStyle(.plain)
    }
}

struct MessageThreadRow: View {
    let thread: MessageThread
    
    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            // Avatar
            Text(thread.clientInitials)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
                .frame(width: 44, height: 44)
                .background(Color(hex: thread.avatarColor))
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(thread.clientName)
                        .font(Theme.Typography.headline)
                    
                    Spacer()
                    
                    Text(thread.lastMessageTime)
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.textMuted)
                }
                
                Text(thread.lastMessage)
                    .font(Theme.Typography.subheadline)
                    .foregroundColor(Theme.Colors.textSecondary)
                    .lineLimit(1)
                
                // Channel badges
                HStack(spacing: Theme.Spacing.xs) {
                    ForEach(thread.channels, id: \.self) { channel in
                        ChannelBadge(channel: channel)
                    }
                }
            }
            
            if thread.unreadCount > 0 {
                Text("\(thread.unreadCount)")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                    .frame(width: 22, height: 22)
                    .background(Theme.Colors.coral)
                    .clipShape(Circle())
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.medium)
        .shadow(color: Theme.Shadows.small.color, radius: Theme.Shadows.small.radius)
    }
}

struct ChannelBadge: View {
    let channel: String
    
    var icon: String {
        switch channel {
        case "email": return "envelope"
        case "sms": return "message"
        case "call": return "phone"
        default: return "bubble.left"
        }
    }
    
    var body: some View {
        Image(systemName: icon)
            .font(.system(size: 10))
            .foregroundColor(Theme.Colors.textMuted)
            .padding(4)
            .background(Color(hex: "F3F4F6"))
            .cornerRadius(4)
    }
}

// MARK: - Thread Detail View
struct ThreadDetailView: View {
    let thread: MessageThread
    @State private var newMessage = ""
    
    var body: some View {
        VStack {
            ScrollView {
                LazyVStack(spacing: Theme.Spacing.md) {
                    ForEach(thread.messages) { message in
                        MessageBubble(message: message)
                    }
                }
                .padding()
            }
            
            // Message input
            HStack(spacing: Theme.Spacing.sm) {
                TextField("Type a message...", text: $newMessage)
                    .textFieldStyle(.roundedBorder)
                
                Button {
                    HapticManager.shared.impact()
                } label: {
                    Image(systemName: "paperplane.fill")
                        .foregroundColor(.white)
                        .padding(10)
                        .background(Theme.Colors.turquoise)
                        .clipShape(Circle())
                }
            }
            .padding()
            .background(Color.white)
        }
        .navigationTitle(thread.clientName)
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct MessageBubble: View {
    let message: Message
    
    var body: some View {
        HStack {
            if message.isFromClient {
                Spacer()
            }
            
            VStack(alignment: message.isFromClient ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .font(Theme.Typography.body)
                    .padding(.horizontal, Theme.Spacing.md)
                    .padding(.vertical, Theme.Spacing.sm)
                    .background(message.isFromClient ? Theme.Colors.turquoise : Color(hex: "F3F4F6"))
                    .foregroundColor(message.isFromClient ? .white : Theme.Colors.textPrimary)
                    .cornerRadius(16)
                
                Text(message.timestamp)
                    .font(Theme.Typography.caption2)
                    .foregroundColor(Theme.Colors.textMuted)
            }
            
            if !message.isFromClient {
                Spacer()
            }
        }
    }
}

// MARK: - Automations View
struct AutomationsView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                // AI Suggestions header
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Label("AI Message Suggestions", systemImage: "sparkles")
                        .font(Theme.Typography.headline)
                    
                    Text("Personalized messages generated by AI based on client behavior")
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal)
                
                // Suggestion cards
                ForEach(AISuggestion.samples) { suggestion in
                    AISuggestionCard(suggestion: suggestion)
                }
                
                // Create automation button
                Button {
                    HapticManager.shared.impact()
                } label: {
                    Label("Create New Automation", systemImage: "plus.circle.fill")
                        .frame(maxWidth: .infinity)
                }
                .primaryButtonStyle()
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
    }
}

struct AISuggestionCard: View {
    let suggestion: AISuggestion
    
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundColor(Theme.Colors.turquoise)
                
                Text(suggestion.title)
                    .font(Theme.Typography.headline)
                
                Spacer()
                
                Text(suggestion.type)
                    .font(Theme.Typography.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Theme.Colors.infoLight)
                    .foregroundColor(Theme.Colors.info)
                    .cornerRadius(Theme.CornerRadius.small)
            }
            
            Text(suggestion.message)
                .font(Theme.Typography.body)
                .padding()
                .background(Color(hex: "F9FAFB"))
                .cornerRadius(Theme.CornerRadius.medium)
            
            HStack {
                Button("Preview") {
                    HapticManager.shared.selection()
                }
                .font(Theme.Typography.subheadline)
                .foregroundColor(Theme.Colors.turquoise)
                
                Spacer()
                
                Button {
                    HapticManager.shared.notification(type: .success)
                } label: {
                    Label("Send", systemImage: "paperplane")
                }
                .primaryButtonStyle()
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(Theme.CornerRadius.large)
        .shadow(color: Theme.Shadows.medium.color, radius: Theme.Shadows.medium.radius)
        .padding(.horizontal)
    }
}

// MARK: - Models
struct MessageThread: Identifiable {
    let id = UUID()
    let clientName: String
    let clientInitials: String
    let avatarColor: String
    let lastMessage: String
    let lastMessageTime: String
    let unreadCount: Int
    let channels: [String]
    let messages: [Message]
    
    static let samples: [MessageThread] = [
        MessageThread(
            clientName: "Sarah Mitchell",
            clientInitials: "SM",
            avatarColor: "8B5CF6",
            lastMessage: "Thank you for the reminder! I'll book my appointment soon.",
            lastMessageTime: "2h ago",
            unreadCount: 1,
            channels: ["email", "sms"],
            messages: [
                Message(content: "Hi Sarah! It's been a while since your last HydraFacial. Ready for a refresh?", timestamp: "Yesterday 2:30 PM", isFromClient: false),
                Message(content: "Thank you for the reminder! I'll book my appointment soon.", timestamp: "Today 10:15 AM", isFromClient: true)
            ]
        ),
        MessageThread(
            clientName: "Lisa Thompson",
            clientInitials: "LT",
            avatarColor: "3B82F6",
            lastMessage: "Looking forward to my appointment next week!",
            lastMessageTime: "1d ago",
            unreadCount: 0,
            channels: ["email"],
            messages: []
        )
    ]
}

struct Message: Identifiable {
    let id = UUID()
    let content: String
    let timestamp: String
    let isFromClient: Bool
}

struct AISuggestion: Identifiable {
    let id = UUID()
    let title: String
    let type: String
    let message: String
    
    static let samples: [AISuggestion] = [
        AISuggestion(
            title: "Re-engagement for Emily",
            type: "Follow-up",
            message: "Hi Emily! We noticed it's been a while since your last visit. We'd love to see you again! Book your next facial this week and receive 15% off. 💆‍♀️"
        ),
        AISuggestion(
            title: "Post-treatment follow-up",
            type: "Care",
            message: "Hi Sarah! How is your skin feeling after yesterday's HydraFacial? Remember to keep it hydrated and avoid direct sun. Let us know if you have any questions!"
        )
    ]
}

#Preview {
    CommunicationsView()
}
