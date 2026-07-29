import Foundation

struct PendingPatient: Codable, Identifiable {
    var pk: Int
    var id: String?
    var name: String?
    var status: String?
    var photoUrl: String?
    var riskLevel: String?
    
    var identifiableId: Int { pk }
    
    enum CodingKeys: String, CodingKey {
        case pk
        case id
        case name
        case status
        case photoUrl = "photo"
        case riskLevel = "risk_level"
    }
}
