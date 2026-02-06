// swift-tools-version: 5.9
// MedSpaAI Package Dependencies

import PackageDescription

let package = Package(
    name: "MedSpaAI",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "MedSpaAI",
            targets: ["MedSpaAI"]
        ),
    ],
    dependencies: [
        // Firebase - Authentication, Firestore, Analytics
        .package(
            url: "https://github.com/firebase/firebase-ios-sdk",
            from: "10.0.0"
        ),
        
        // Lottie - Animations
        .package(
            url: "https://github.com/airbnb/lottie-spm",
            from: "4.0.0"
        ),
        
        // Kingfisher - Image Loading & Caching
        .package(
            url: "https://github.com/onevcat/Kingfisher",
            from: "7.0.0"
        ),
        
        // Alamofire - Networking (optional, can use URLSession)
        .package(
            url: "https://github.com/Alamofire/Alamofire",
            from: "5.8.0"
        ),
    ],
    targets: [
        .target(
            name: "MedSpaAI",
            dependencies: [
                .product(name: "FirebaseAuth", package: "firebase-ios-sdk"),
                .product(name: "FirebaseFirestore", package: "firebase-ios-sdk"),
                .product(name: "FirebaseAnalytics", package: "firebase-ios-sdk"),
                .product(name: "FirebaseMessaging", package: "firebase-ios-sdk"),
                .product(name: "Lottie", package: "lottie-spm"),
                .product(name: "Kingfisher", package: "Kingfisher"),
                .product(name: "Alamofire", package: "Alamofire"),
            ],
            path: "MedSpaAI"
        ),
        .testTarget(
            name: "MedSpaAITests",
            dependencies: ["MedSpaAI"],
            path: "MedSpaAITests"
        ),
    ]
)
