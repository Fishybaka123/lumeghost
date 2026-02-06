//
//  Theme.swift
//  MedSpaAI
//
//  Design system with ocean-inspired color palette and typography
//

import SwiftUI

// MARK: - Theme
enum Theme {
    
    // MARK: - Colors
    enum Colors {
        // Primary Ocean Palette
        static let deepBlue = Color(hex: "0A2540")
        static let turquoise = Color(hex: "00B8D9")
        static let seafoam = Color(hex: "4FD1C5")
        static let coral = Color(hex: "FF6B6B")
        
        // Backgrounds
        static let pearl = Color(hex: "F7FAFC")
        static let midnight = Color(hex: "1A1D29")
        
        // Gradients
        static let primaryGradient = LinearGradient(
            colors: [deepBlue, turquoise],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        
        static let oceanGradient = LinearGradient(
            colors: [deepBlue, Color(hex: "0D3B66"), turquoise],
            startPoint: .top,
            endPoint: .bottom
        )
        
        static let coralGradient = LinearGradient(
            colors: [coral, Color(hex: "FF8E8E")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        
        // Semantic Colors
        static let success = Color(hex: "10B981")
        static let successLight = Color(hex: "D1FAE5")
        static let warning = Color(hex: "F59E0B")
        static let warningLight = Color(hex: "FEF3C7")
        static let danger = Color(hex: "EF4444")
        static let dangerLight = Color(hex: "FEE2E2")
        static let info = Color(hex: "3B82F6")
        static let infoLight = Color(hex: "DBEAFE")
        
        // Text Colors
        static let textPrimary = Color(hex: "1F2937")
        static let textSecondary = Color(hex: "6B7280")
        static let textMuted = Color(hex: "9CA3AF")
        
        // Card Colors for Metrics
        static let cardBlue = LinearGradient(
            colors: [Color(hex: "60A5FA"), Color(hex: "3B82F6")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        static let cardCoral = LinearGradient(
            colors: [Color(hex: "FCA5A5"), Color(hex: "EF4444")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        static let cardAmber = LinearGradient(
            colors: [Color(hex: "FCD34D"), Color(hex: "F59E0B")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        static let cardEmerald = LinearGradient(
            colors: [Color(hex: "6EE7B7"), Color(hex: "10B981")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        static let cardPurple = LinearGradient(
            colors: [Color(hex: "C4B5FD"), Color(hex: "8B5CF6")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        static let cardTeal = LinearGradient(
            colors: [Color(hex: "5EEAD4"), Color(hex: "14B8A6")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    // MARK: - Typography
    enum Typography {
        static let largeTitle = Font.system(size: 34, weight: .bold, design: .rounded)
        static let title = Font.system(size: 28, weight: .bold, design: .rounded)
        static let title2 = Font.system(size: 22, weight: .semibold, design: .rounded)
        static let title3 = Font.system(size: 20, weight: .semibold, design: .rounded)
        static let headline = Font.system(size: 17, weight: .semibold)
        static let body = Font.system(size: 17, weight: .regular)
        static let callout = Font.system(size: 16, weight: .regular)
        static let subheadline = Font.system(size: 15, weight: .regular)
        static let footnote = Font.system(size: 13, weight: .regular)
        static let caption = Font.system(size: 12, weight: .regular)
        static let caption2 = Font.system(size: 11, weight: .regular)
        
        // Metric specific
        static let metricValue = Font.system(size: 32, weight: .bold, design: .rounded)
        static let metricLabel = Font.system(size: 14, weight: .medium)
    }
    
    // MARK: - Spacing
    enum Spacing {
        static let xxs: CGFloat = 4
        static let xs: CGFloat = 8
        static let sm: CGFloat = 12
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }
    
    // MARK: - Corner Radius
    enum CornerRadius {
        static let small: CGFloat = 8
        static let medium: CGFloat = 12
        static let large: CGFloat = 16
        static let xl: CGFloat = 24
        static let full: CGFloat = 9999
    }
    
    // MARK: - Shadows
    enum Shadows {
        static let small = Shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
        static let medium = Shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
        static let large = Shadow(color: .black.opacity(0.15), radius: 16, x: 0, y: 8)
    }
}

// MARK: - Shadow Struct
struct Shadow {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - View Extensions for Theme
extension View {
    func cardStyle() -> some View {
        self
            .background(Color.white)
            .cornerRadius(Theme.CornerRadius.large)
            .shadow(
                color: Theme.Shadows.medium.color,
                radius: Theme.Shadows.medium.radius,
                x: Theme.Shadows.medium.x,
                y: Theme.Shadows.medium.y
            )
    }
    
    func primaryButtonStyle() -> some View {
        self
            .font(Theme.Typography.headline)
            .foregroundColor(.white)
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.vertical, Theme.Spacing.sm)
            .background(Theme.Colors.primaryGradient)
            .cornerRadius(Theme.CornerRadius.medium)
    }
    
    func secondaryButtonStyle() -> some View {
        self
            .font(Theme.Typography.headline)
            .foregroundColor(Theme.Colors.deepBlue)
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.vertical, Theme.Spacing.sm)
            .background(Color.white)
            .cornerRadius(Theme.CornerRadius.medium)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.medium)
                    .stroke(Theme.Colors.deepBlue.opacity(0.3), lineWidth: 1)
            )
    }
}
