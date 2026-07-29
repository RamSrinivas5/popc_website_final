import Foundation

struct SurveyDisplayResponse: Codable {
    var patientId: Int?
    var patientIdCode: String?
    var totalScore: Int?
    var status: String?
    var sectionScores: [SectionScore]?
    var answers: [Answer]?

    enum CodingKeys: String, CodingKey {
        case patientId = "patient_id"
        case patientIdCode = "patient_id_code"
        case totalScore = "total_score"
        case status
        case sectionScores = "section_scores"
        case answers
    }

    struct SectionScore: Codable, Identifiable {
        var section: String?
        var score: Int?

        var id: String { section ?? UUID().uuidString }

        enum CodingKeys: String, CodingKey {
            case section = "section_name"
            case score
        }
    }

    struct Answer: Codable, Identifiable {
        var question: String?
        var selectedOption: String?
        var customText: String?
        var score: Int?
        var sectionName: String?

        var id: String { UUID().uuidString }

        enum CodingKeys: String, CodingKey {
            case question
            case selectedOption = "selected_option"
            case customText = "custom_text"
            case score
            case sectionName = "section_name"
        }
    }
}
