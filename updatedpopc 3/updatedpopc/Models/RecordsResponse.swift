import Foundation

struct RecordsResponse: Codable, Identifiable {
    var pk: Int
    var id: String?
    var name: String?
    var photoUrl: String?
    var riskLevel: String?

    // For Identifiable protocol
    var identifiableId: Int { pk }

    enum CodingKeys: String, CodingKey {
        case pk
        case id
        case name
        case photoUrl = "photoUrl"
        case riskLevel = "risk_level"
    }
}
