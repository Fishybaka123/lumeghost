//
//  CoreDataManager.swift
//  MedSpaAI
//
//  Core Data stack management for offline persistence
//

import Foundation
import CoreData

class CoreDataManager {
    static let shared = CoreDataManager()
    
    // MARK: - Persistent Container
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "MedSpaAI")
        
        // Configure for lightweight migration
        let description = container.persistentStoreDescriptions.first
        description?.shouldMigrateStoreAutomatically = true
        description?.shouldInferMappingModelAutomatically = true
        
        // Enable CloudKit sync (when configured)
        // description?.cloudKitContainerOptions = NSPersistentCloudKitContainerOptions(
        //     containerIdentifier: "iCloud.com.medspaai.app"
        // )
        
        container.loadPersistentStores { storeDescription, error in
            if let error = error as NSError? {
                print("❌ Core Data load error: \(error), \(error.userInfo)")
                // In production, handle gracefully
            } else {
                print("✅ Core Data store loaded: \(storeDescription.url?.absoluteString ?? "")")
            }
        }
        
        // Merge policy for sync conflicts
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
        container.viewContext.automaticallyMergesChangesFromParent = true
        
        return container
    }()
    
    // MARK: - View Context
    var viewContext: NSManagedObjectContext {
        persistentContainer.viewContext
    }
    
    // MARK: - Background Context
    func newBackgroundContext() -> NSManagedObjectContext {
        let context = persistentContainer.newBackgroundContext()
        context.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
        return context
    }
    
    // MARK: - Save Context
    func saveContext() {
        let context = viewContext
        if context.hasChanges {
            do {
                try context.save()
                print("✅ Core Data context saved")
            } catch {
                let nsError = error as NSError
                print("❌ Core Data save error: \(nsError), \(nsError.userInfo)")
            }
        }
    }
    
    // MARK: - Background Save
    func performBackgroundTask(_ block: @escaping (NSManagedObjectContext) -> Void) {
        persistentContainer.performBackgroundTask { context in
            block(context)
            
            if context.hasChanges {
                do {
                    try context.save()
                } catch {
                    print("❌ Background save error: \(error)")
                }
            }
        }
    }
    
    // MARK: - Client Operations
    func saveClient(_ client: Client) {
        performBackgroundTask { context in
            let entity = ClientEntity(context: context)
            entity.id = client.id
            entity.firstName = client.firstName
            entity.lastName = client.lastName
            entity.email = client.email
            entity.phone = client.phone
            entity.avatarColor = client.avatarColor
            entity.healthScore = Int16(client.healthScore)
            entity.churnRisk = Int16(client.churnRisk)
            entity.lastVisit = client.lastVisit
            entity.nextAppointment = client.nextAppointment
            entity.membershipType = client.membershipType.rawValue
            entity.totalSpend = client.totalSpend
            entity.visitCount = Int16(client.visitCount)
            entity.memberSince = client.memberSince
            entity.notes = client.notes
            entity.syncStatus = "synced"
            entity.lastModified = Date()
        }
    }
    
    func fetchClients() -> [Client] {
        let request: NSFetchRequest<ClientEntity> = ClientEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \ClientEntity.healthScore, ascending: true)]
        
        do {
            let entities = try viewContext.fetch(request)
            return entities.compactMap { entity in
                Client(
                    id: entity.id ?? UUID().uuidString,
                    firstName: entity.firstName ?? "",
                    lastName: entity.lastName ?? "",
                    email: entity.email ?? "",
                    phone: entity.phone ?? "",
                    avatarColor: entity.avatarColor ?? "3B82F6",
                    healthScore: Int(entity.healthScore),
                    churnRisk: Int(entity.churnRisk),
                    lastVisit: entity.lastVisit,
                    nextAppointment: entity.nextAppointment,
                    membershipType: MembershipType(rawValue: entity.membershipType ?? "none") ?? .none,
                    totalSpend: entity.totalSpend,
                    visitCount: Int(entity.visitCount),
                    memberSince: entity.memberSince ?? Date(),
                    preferredTreatments: [], // Would be stored in relationship
                    notes: entity.notes,
                    visits: [] // Would be stored in relationship
                )
            }
        } catch {
            print("❌ Fetch error: \(error)")
            return []
        }
    }
    
    func deleteClient(id: String) {
        performBackgroundTask { context in
            let request: NSFetchRequest<ClientEntity> = ClientEntity.fetchRequest()
            request.predicate = NSPredicate(format: "id == %@", id)
            
            if let entity = try? context.fetch(request).first {
                context.delete(entity)
            }
        }
    }
    
    // MARK: - Offline Queue
    func queueOfflineAction(_ action: OfflineAction) {
        performBackgroundTask { context in
            let entity = OfflineQueueEntity(context: context)
            entity.id = UUID().uuidString
            entity.actionType = action.type.rawValue
            entity.payload = try? JSONEncoder().encode(action.payload)
            entity.createdAt = Date()
            entity.retryCount = 0
        }
    }
    
    func processOfflineQueue() async {
        let request: NSFetchRequest<OfflineQueueEntity> = OfflineQueueEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \OfflineQueueEntity.createdAt, ascending: true)]
        
        guard let actions = try? viewContext.fetch(request), !actions.isEmpty else { return }
        
        for action in actions {
            // Process each queued action
            // In production, this would sync with Firebase/API
            print("📤 Processing offline action: \(action.actionType ?? "")")
            
            // Delete after successful processing
            viewContext.delete(action)
        }
        
        saveContext()
    }
}

// MARK: - Offline Action
struct OfflineAction: Codable {
    let type: ActionType
    let payload: [String: String]
    
    enum ActionType: String, Codable {
        case sendNudge
        case updateClient
        case logVisit
        case scheduleAppointment
    }
}

// MARK: - Core Data Entity Extensions
extension ClientEntity {
    var syncStatusType: SyncStatus {
        SyncStatus(rawValue: syncStatus ?? "pending") ?? .pending
    }
}

enum SyncStatus: String {
    case synced
    case pending
    case failed
}
