import Foundation

struct SupabaseConfig {
    static let local = true

    static let supabaseURL: URL = {
        let envKey = local ? "SUPABASE_LOCAL_URL" : "SUPABASE_URL"
        let urlString = ProcessInfo.processInfo.environment[envKey] ?? ""
        guard let url = URL(string: urlString) else {
            fatalError("Invalid \(envKey): \(urlString)")
        }
        return url
    }()

    static let supabaseKey: String = {
        let envKey = local ? "SUPABASE_SECRET_KEY" : "SUPABASE_SECRET_KEY"
        return ProcessInfo.processInfo.environment[envKey] ?? ""
    }()

    static let memoryFetchURL: URL = {
        let envKey = local ? "MEMORY_FETCH_LOCAL_URL" : "MEMORY_FETCH_URL"
        let urlString = ProcessInfo.processInfo.environment[envKey] ?? ""
        guard let url = URL(string: urlString) else {
            fatalError("Invalid \(envKey): \(urlString)")
        }
        return url
    }()
}
