//
//  PhotoAnalyzerService.swift
//  MedSpaAI
//
//  Vision framework-powered photo analysis for treatment tracking
//

import Foundation
import Vision
import UIKit
import CoreImage

class PhotoAnalyzerService {
    static let shared = PhotoAnalyzerService()
    
    private let context = CIContext()
    
    private init() {}
    
    // MARK: - Face Detection & Analysis
    
    /// Analyzes a face photo for skin quality metrics
    func analyzeSkinQuality(image: UIImage) async throws -> SkinAnalysisResult {
        guard let cgImage = image.cgImage else {
            throw PhotoAnalysisError.invalidImage
        }
        
        // Create face detection request
        let faceRequest = VNDetectFaceRectanglesRequest()
        let faceLandmarksRequest = VNDetectFaceLandmarksRequest()
        let qualityRequest = VNDetectFaceCaptureQualityRequest()
        
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        
        try handler.perform([faceRequest, faceLandmarksRequest, qualityRequest])
        
        guard let faceObservation = faceRequest.results?.first else {
            throw PhotoAnalysisError.noFaceDetected
        }
        
        // Get face quality score
        let qualityScore = qualityRequest.results?.first?.faceCaptureQuality ?? 0.5
        
        // Analyze skin metrics (simulated - real implementation would use trained ML model)
        let skinMetrics = analyzeSkinMetrics(in: cgImage, faceRect: faceObservation.boundingBox)
        
        return SkinAnalysisResult(
            overallScore: Int(qualityScore * 100),
            hydration: skinMetrics.hydration,
            texture: skinMetrics.texture,
            clarity: skinMetrics.clarity,
            evenness: skinMetrics.evenness,
            faceConfidence: Double(faceObservation.confidence),
            analyzedAt: Date()
        )
    }
    
    /// Compares two photos to track treatment progress
    func comparePhotos(before: UIImage, after: UIImage) async throws -> PhotoComparisonResult {
        let beforeAnalysis = try await analyzeSkinQuality(image: before)
        let afterAnalysis = try await analyzeSkinQuality(image: after)
        
        // Calculate improvements
        let overallImprovement = afterAnalysis.overallScore - beforeAnalysis.overallScore
        let hydrationChange = afterAnalysis.hydration - beforeAnalysis.hydration
        let textureChange = afterAnalysis.texture - beforeAnalysis.texture
        let clarityChange = afterAnalysis.clarity - beforeAnalysis.clarity
        
        return PhotoComparisonResult(
            beforeAnalysis: beforeAnalysis,
            afterAnalysis: afterAnalysis,
            overallImprovement: overallImprovement,
            improvements: [
                MetricChange(name: "Hydration", before: beforeAnalysis.hydration, after: afterAnalysis.hydration),
                MetricChange(name: "Texture", before: beforeAnalysis.texture, after: afterAnalysis.texture),
                MetricChange(name: "Clarity", before: beforeAnalysis.clarity, after: afterAnalysis.clarity),
                MetricChange(name: "Evenness", before: beforeAnalysis.evenness, after: afterAnalysis.evenness)
            ],
            recommendation: generateRecommendation(improvement: overallImprovement)
        )
    }
    
    // MARK: - Private Helpers
    
    private func analyzeSkinMetrics(in image: CGImage, faceRect: CGRect) -> SkinMetrics {
        // In production, this would use a trained Core ML model
        // For now, we use image analysis heuristics
        
        let ciImage = CIImage(cgImage: image)
        
        // Calculate average color/brightness for simulated metrics
        let extent = ciImage.extent
        let faceArea = CGRect(
            x: extent.width * faceRect.minX,
            y: extent.height * faceRect.minY,
            width: extent.width * faceRect.width,
            height: extent.height * faceRect.height
        )
        
        // Simulated metrics (0-100 scale)
        // Real implementation would analyze texture, pores, spots, etc.
        return SkinMetrics(
            hydration: Int.random(in: 60...90),
            texture: Int.random(in: 55...85),
            clarity: Int.random(in: 50...95),
            evenness: Int.random(in: 60...88)
        )
    }
    
    private func generateRecommendation(improvement: Int) -> String {
        if improvement >= 15 {
            return "Excellent progress! Your skin shows significant improvement. Continue your current regimen."
        } else if improvement >= 5 {
            return "Good progress! Your skin is improving. Consider adding a hydrating treatment for better results."
        } else if improvement >= 0 {
            return "Skin quality is stable. Schedule a consultation to discuss enhancing your treatment plan."
        } else {
            return "Let's review your skincare routine. Schedule a follow-up to optimize your treatment."
        }
    }
}

// MARK: - Models

struct SkinAnalysisResult: Identifiable {
    let id = UUID()
    let overallScore: Int
    let hydration: Int
    let texture: Int
    let clarity: Int
    let evenness: Int
    let faceConfidence: Double
    let analyzedAt: Date
    
    var scoreLabel: String {
        if overallScore >= 80 { return "Excellent" }
        if overallScore >= 60 { return "Good" }
        if overallScore >= 40 { return "Fair" }
        return "Needs Attention"
    }
}

struct SkinMetrics {
    let hydration: Int
    let texture: Int
    let clarity: Int
    let evenness: Int
}

struct PhotoComparisonResult: Identifiable {
    let id = UUID()
    let beforeAnalysis: SkinAnalysisResult
    let afterAnalysis: SkinAnalysisResult
    let overallImprovement: Int
    let improvements: [MetricChange]
    let recommendation: String
    
    var improvementLabel: String {
        if overallImprovement > 0 {
            return "+\(overallImprovement)%"
        }
        return "\(overallImprovement)%"
    }
}

struct MetricChange: Identifiable {
    let id = UUID()
    let name: String
    let before: Int
    let after: Int
    
    var change: Int { after - before }
    var isImproved: Bool { change >= 0 }
}

enum PhotoAnalysisError: Error, LocalizedError {
    case invalidImage
    case noFaceDetected
    case analysisFailure
    
    var errorDescription: String? {
        switch self {
        case .invalidImage: return "Unable to process the image"
        case .noFaceDetected: return "No face detected in the photo"
        case .analysisFailure: return "Analysis could not be completed"
        }
    }
}
