import Foundation
import Combine

class SharedPrefManager: ObservableObject {
    static let shared = SharedPrefManager()
    
    private let defaults = UserDefaults.standard
    
    private let keyToken = "key_token"
    private let keyDoctorId = "key_doctor_id"
    private let keyUsername = "key_username"
    private let keyProfileImageUrl = "key_profile_image_url"
    
    @Published var isLoggedIn: Bool = false
    @Published var profileImageUrl: String = .init() {
        didSet {
            UserDefaults.standard.set(profileImageUrl, forKey: keyProfileImageUrl)
        }
    }
    
    private init() {
        // Force isLoggedIn to false at startup so user always sees Login screen
        // even if a token exists.
        self.isLoggedIn = false
        self.profileImageUrl = defaults.string(forKey: keyProfileImageUrl) ?? .init()
    }
    
    func saveLoginData(token: String, doctorId: String, username: String) {
        defaults.set(token, forKey: keyToken)
        defaults.set(doctorId, forKey: keyDoctorId)
        defaults.set(username, forKey: keyUsername)
        DispatchQueue.main.async {
            self.isLoggedIn = true
        }
    }
    
    func getToken() -> String? {
        return defaults.string(forKey: keyToken)
    }
    
    func getDoctorId() -> String? {
        return defaults.string(forKey: keyDoctorId)
    }
    
    func getUsername() -> String? {
        return defaults.string(forKey: keyUsername)
    }
    
    func logout() {
        defaults.removeObject(forKey: keyToken)
        defaults.removeObject(forKey: keyDoctorId)
        defaults.removeObject(forKey: keyUsername)
        defaults.removeObject(forKey: keyProfileImageUrl)
        DispatchQueue.main.async {
            self.isLoggedIn = false
            self.profileImageUrl = ""
        }
    }
}
