//
//  ARTreatmentPreviewView.swift
//  MedSpaAI
//
//  ARKit-powered treatment preview with face tracking
//

import SwiftUI
import ARKit
import RealityKit

struct ARTreatmentPreviewView: View {
    let treatment: TreatmentType
    @Environment(\.dismiss) var dismiss
    @State private var isARSupported = ARFaceTrackingConfiguration.isSupported
    @State private var previewIntensity: Double = 0.5
    @State private var showingInfo = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                if isARSupported {
                    // AR View
                    ARViewContainer(treatment: treatment, intensity: previewIntensity)
                        .ignoresSafeArea()
                    
                    // Controls overlay
                    VStack {
                        Spacer()
                        
                        // Treatment info card
                        VStack(spacing: Theme.Spacing.md) {
                            HStack {
                                Image(systemName: treatment.icon)
                                    .font(.title2)
                                    .foregroundColor(Theme.Colors.turquoise)
                                
                                VStack(alignment: .leading) {
                                    Text(treatment.name)
                                        .font(Theme.Typography.headline)
                                    
                                    Text("Preview Mode")
                                        .font(Theme.Typography.caption)
                                        .foregroundColor(Theme.Colors.textSecondary)
                                }
                                
                                Spacer()
                                
                                Button {
                                    showingInfo = true
                                } label: {
                                    Image(systemName: "info.circle")
                                        .font(.title2)
                                        .foregroundColor(Theme.Colors.turquoise)
                                }
                            }
                            
                            // Intensity slider
                            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                                Text("Effect Intensity")
                                    .font(Theme.Typography.caption)
                                    .foregroundColor(Theme.Colors.textSecondary)
                                
                                HStack {
                                    Text("Subtle")
                                        .font(Theme.Typography.caption2)
                                    
                                    Slider(value: $previewIntensity, in: 0...1)
                                        .tint(Theme.Colors.turquoise)
                                    
                                    Text("Full")
                                        .font(Theme.Typography.caption2)
                                }
                            }
                            
                            // Action buttons
                            HStack(spacing: Theme.Spacing.md) {
                                Button {
                                    HapticManager.shared.impact()
                                    // Save screenshot
                                } label: {
                                    Label("Save Photo", systemImage: "camera.fill")
                                        .frame(maxWidth: .infinity)
                                }
                                .secondaryButtonStyle()
                                
                                Button {
                                    HapticManager.shared.impact()
                                    // Book treatment
                                } label: {
                                    Label("Book Now", systemImage: "calendar")
                                        .frame(maxWidth: .infinity)
                                }
                                .primaryButtonStyle()
                            }
                        }
                        .padding()
                        .background(.ultraThinMaterial)
                        .cornerRadius(Theme.CornerRadius.xl)
                        .padding()
                    }
                } else {
                    // Fallback for devices without AR
                    ARNotSupportedView()
                }
            }
            .navigationTitle("AR Preview")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showingInfo) {
                TreatmentInfoSheet(treatment: treatment)
            }
        }
    }
}

// MARK: - AR View Container
struct ARViewContainer: UIViewRepresentable {
    let treatment: TreatmentType
    let intensity: Double
    
    func makeUIView(context: Context) -> ARView {
        let arView = ARView(frame: .zero)
        
        // Configure face tracking
        let configuration = ARFaceTrackingConfiguration()
        configuration.isLightEstimationEnabled = true
        
        arView.session.run(configuration)
        arView.session.delegate = context.coordinator
        
        return arView
    }
    
    func updateUIView(_ uiView: ARView, context: Context) {
        context.coordinator.intensity = intensity
        context.coordinator.treatment = treatment
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(treatment: treatment, intensity: intensity)
    }
    
    class Coordinator: NSObject, ARSessionDelegate {
        var treatment: TreatmentType
        var intensity: Double
        
        init(treatment: TreatmentType, intensity: Double) {
            self.treatment = treatment
            self.intensity = intensity
        }
        
        func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
            // Update face mesh with treatment effects
            for anchor in anchors {
                if let faceAnchor = anchor as? ARFaceAnchor {
                    // Apply treatment-specific face modifications
                    applyTreatmentEffect(to: faceAnchor)
                }
            }
        }
        
        private func applyTreatmentEffect(to faceAnchor: ARFaceAnchor) {
            // In production, this would modify the face mesh
            // to show treatment effects like:
            // - Botox: Smooth forehead area
            // - Fillers: Enhanced lip or cheek volume
            // - Laser: Improved skin texture
            
            let blendShapes = faceAnchor.blendShapes
            // Process blend shapes based on treatment type
        }
    }
}

// MARK: - AR Not Supported View
struct ARNotSupportedView: View {
    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Image(systemName: "arkit")
                .font(.system(size: 60))
                .foregroundColor(Theme.Colors.textMuted)
            
            Text("AR Preview Not Available")
                .font(Theme.Typography.title2)
            
            Text("Face tracking requires iPhone X or later with TrueDepth camera.")
                .font(Theme.Typography.body)
                .foregroundColor(Theme.Colors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Button("View Gallery Instead") {
                // Open gallery view
            }
            .primaryButtonStyle()
        }
        .padding()
    }
}

// MARK: - Treatment Info Sheet
struct TreatmentInfoSheet: View {
    let treatment: TreatmentType
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                    // Header
                    HStack {
                        ZStack {
                            Circle()
                                .fill(Theme.Colors.turquoise.opacity(0.2))
                                .frame(width: 60, height: 60)
                            
                            Image(systemName: treatment.icon)
                                .font(.title)
                                .foregroundColor(Theme.Colors.turquoise)
                        }
                        
                        VStack(alignment: .leading) {
                            Text(treatment.name)
                                .font(Theme.Typography.title2)
                            
                            Text(treatment.category)
                                .font(Theme.Typography.subheadline)
                                .foregroundColor(Theme.Colors.textSecondary)
                        }
                    }
                    
                    Divider()
                    
                    // Description
                    Text("About This Treatment")
                        .font(Theme.Typography.headline)
                    
                    Text(treatment.description)
                        .font(Theme.Typography.body)
                        .foregroundColor(Theme.Colors.textSecondary)
                    
                    // Details
                    VStack(spacing: Theme.Spacing.sm) {
                        InfoRow(label: "Duration", value: treatment.duration)
                        InfoRow(label: "Recovery", value: treatment.recovery)
                        InfoRow(label: "Results", value: treatment.resultsTime)
                        InfoRow(label: "Price Range", value: treatment.priceRange)
                    }
                    .padding()
                    .background(Color(hex: "F9FAFB"))
                    .cornerRadius(Theme.CornerRadius.medium)
                    
                    Spacer()
                }
                .padding()
            }
            .navigationTitle("Treatment Info")
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

struct InfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(Theme.Typography.subheadline)
                .foregroundColor(Theme.Colors.textSecondary)
            
            Spacer()
            
            Text(value)
                .font(Theme.Typography.subheadline)
                .fontWeight(.medium)
        }
    }
}

// MARK: - Treatment Type
enum TreatmentType: String, CaseIterable, Identifiable {
    case botox = "Botox"
    case fillers = "Dermal Fillers"
    case laser = "Laser Resurfacing"
    case hydrafacial = "HydraFacial"
    case microneedling = "Microneedling"
    case chemicalPeel = "Chemical Peel"
    case prp = "PRP Therapy"
    case coolsculpting = "CoolSculpting"
    
    var id: String { rawValue }
    var name: String { rawValue }
    
    var icon: String {
        switch self {
        case .botox: return "syringe"
        case .fillers: return "drop.fill"
        case .laser: return "bolt.fill"
        case .hydrafacial: return "drop.circle.fill"
        case .microneedling: return "waveform.path.ecg"
        case .chemicalPeel: return "sparkles"
        case .prp: return "cross.vial.fill"
        case .coolsculpting: return "snowflake"
        }
    }
    
    var category: String {
        switch self {
        case .botox, .fillers: return "Injectables"
        case .laser, .microneedling, .chemicalPeel: return "Skin Rejuvenation"
        case .hydrafacial, .prp: return "Facials & Therapy"
        case .coolsculpting: return "Body Contouring"
        }
    }
    
    var description: String {
        switch self {
        case .botox:
            return "Botox temporarily reduces wrinkles by relaxing underlying muscles. Results typically last 3-4 months."
        case .fillers:
            return "Dermal fillers restore volume and smooth lines. Great for lips, cheeks, and nasolabial folds."
        case .laser:
            return "Laser treatments improve skin texture, reduce scarring, and promote collagen production."
        case .hydrafacial:
            return "A multi-step treatment that cleanses, exfoliates, extracts, and hydrates the skin."
        case .microneedling:
            return "Micro-injuries stimulate natural collagen production for improved skin texture."
        case .chemicalPeel:
            return "Chemical solutions remove damaged skin layers, revealing smoother, younger skin."
        case .prp:
            return "Uses your own platelet-rich plasma to stimulate healing and rejuvenation."
        case .coolsculpting:
            return "Non-invasive fat reduction using controlled cooling technology."
        }
    }
    
    var duration: String {
        switch self {
        case .botox: return "15-30 min"
        case .fillers: return "30-60 min"
        case .laser: return "30-90 min"
        case .hydrafacial: return "30-45 min"
        case .microneedling: return "30-60 min"
        case .chemicalPeel: return "30-45 min"
        case .prp: return "60-90 min"
        case .coolsculpting: return "35-60 min"
        }
    }
    
    var recovery: String {
        switch self {
        case .botox, .hydrafacial: return "No downtime"
        case .fillers: return "1-2 days"
        case .laser: return "5-7 days"
        case .microneedling: return "2-3 days"
        case .chemicalPeel: return "3-7 days"
        case .prp: return "1-2 days"
        case .coolsculpting: return "No downtime"
        }
    }
    
    var resultsTime: String {
        switch self {
        case .botox: return "3-7 days"
        case .fillers: return "Immediate"
        case .laser: return "2-4 weeks"
        case .hydrafacial: return "Immediate"
        case .microneedling: return "2-4 weeks"
        case .chemicalPeel: return "1-2 weeks"
        case .prp: return "3-6 months"
        case .coolsculpting: return "2-3 months"
        }
    }
    
    var priceRange: String {
        switch self {
        case .botox: return "$300 - $600"
        case .fillers: return "$500 - $1,500"
        case .laser: return "$500 - $3,000"
        case .hydrafacial: return "$150 - $300"
        case .microneedling: return "$200 - $700"
        case .chemicalPeel: return "$150 - $500"
        case .prp: return "$400 - $1,200"
        case .coolsculpting: return "$600 - $1,500"
        }
    }
}

#Preview {
    ARTreatmentPreviewView(treatment: .botox)
}
