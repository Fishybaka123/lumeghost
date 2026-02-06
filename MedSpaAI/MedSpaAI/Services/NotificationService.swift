//
//  NotificationService.swift
//  MedSpaAI
//
//  Push notification handling with UserNotifications framework
//

import Foundation
import UserNotifications

class NotificationService: NSObject {
    static let shared = NotificationService()
    
    private override init() {
        super.init()
    }
    
    // MARK: - Permission Request
    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if let error = error {
                print("❌ Notification permission error: \(error.localizedDescription)")
                return
            }
            
            if granted {
                print("✅ Notification permission granted")
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
        
        UNUserNotificationCenter.current().delegate = self
    }
    
    // MARK: - Schedule Local Notification
    func scheduleLocalNotification(
        title: String,
        body: String,
        identifier: String,
        timeInterval: TimeInterval = 5,
        repeats: Bool = false
    ) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        content.badge = 1
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: repeats)
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("❌ Failed to schedule notification: \(error.localizedDescription)")
            }
        }
    }
    
    // MARK: - Schedule Nudge Reminder
    func scheduleNudgeReminder(for clientName: String, in hours: Int = 24) {
        let content = UNMutableNotificationContent()
        content.title = "Time to send a nudge! 💬"
        content.body = "\(clientName) hasn't been contacted recently. Send a personalized message?"
        content.sound = .default
        content.categoryIdentifier = "NUDGE_REMINDER"
        
        // Add action buttons
        let sendAction = UNNotificationAction(
            identifier: "SEND_NUDGE",
            title: "Send Nudge",
            options: .foreground
        )
        let dismissAction = UNNotificationAction(
            identifier: "DISMISS",
            title: "Later",
            options: []
        )
        
        let category = UNNotificationCategory(
            identifier: "NUDGE_REMINDER",
            actions: [sendAction, dismissAction],
            intentIdentifiers: [],
            options: []
        )
        
        UNUserNotificationCenter.current().setNotificationCategories([category])
        
        let trigger = UNTimeIntervalNotificationTrigger(
            timeInterval: TimeInterval(hours * 3600),
            repeats: false
        )
        
        let request = UNNotificationRequest(
            identifier: "nudge_\(clientName.lowercased().replacingOccurrences(of: " ", with: "_"))",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Schedule At-Risk Alert
    func scheduleAtRiskAlert(clientName: String, churnRisk: Int) {
        guard churnRisk >= 60 else { return }
        
        let content = UNMutableNotificationContent()
        content.title = "⚠️ High Churn Risk Alert"
        content.body = "\(clientName) has a \(churnRisk)% churn risk. Take action now!"
        content.sound = .defaultCritical
        
        let request = UNNotificationRequest(
            identifier: "atrisk_\(UUID().uuidString)",
            content: content,
            trigger: nil // Immediate
        )
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Clear Notifications
    func clearAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
    }
    
    func clearNotification(identifier: String) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [identifier])
        UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: [identifier])
    }
}

// MARK: - UNUserNotificationCenterDelegate
extension NotificationService: UNUserNotificationCenterDelegate {
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show notification even when app is in foreground
        completionHandler([.banner, .badge, .sound])
    }
    
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let actionIdentifier = response.actionIdentifier
        let categoryIdentifier = response.notification.request.content.categoryIdentifier
        
        switch actionIdentifier {
        case "SEND_NUDGE":
            // Handle send nudge action
            print("📤 User wants to send a nudge")
            NotificationCenter.default.post(name: .openNudgeSheet, object: nil)
            
        case UNNotificationDefaultActionIdentifier:
            // User tapped the notification
            print("📲 User tapped notification")
            
        default:
            break
        }
        
        completionHandler()
    }
}

// MARK: - Notification Names
extension Notification.Name {
    static let openNudgeSheet = Notification.Name("openNudgeSheet")
    static let openClientProfile = Notification.Name("openClientProfile")
}
