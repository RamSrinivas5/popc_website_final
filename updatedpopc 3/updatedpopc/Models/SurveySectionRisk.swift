import Foundation

struct SurveySectionRisk: Codable, Identifiable {
    var sectionName: String?
    var score: Int?
    
    var id: String { sectionName ?? UUID().uuidString }
    
    enum CodingKeys: String, CodingKey {
        case sectionName = "section_name"
        case score
    }
}
