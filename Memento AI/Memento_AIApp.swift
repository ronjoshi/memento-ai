//
//  Memento_AIApp.swift
//  Memento AI
//
//  Created by Ron Joshi on 11/27/25.
//

import SwiftUI
import CoreData

@main
struct Memento_AIApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
