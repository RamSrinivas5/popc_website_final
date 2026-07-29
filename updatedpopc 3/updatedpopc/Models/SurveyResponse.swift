import Foundation

struct SurveyResponse: Codable, Identifiable {
    var id: Int
    var patient: Int
    var totalScore: Int

    enum CodingKeys: String, CodingKey {
        case id
        case patient
        case totalScore = "total_score"
    }
}
