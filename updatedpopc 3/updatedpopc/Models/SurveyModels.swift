import Foundation

struct SurveyRequest: Codable {
    var patientId: Int?
    var totalScore: Int?
    var status: String?
    var riskLevel: String?
    var sectionScores: [SectionScore]?
    var answers: [Answer]?
    
    enum CodingKeys: String, CodingKey {
        case patientId = "patient_id"
        case totalScore = "total_score"
        case status
        case riskLevel = "risk_level"
        case sectionScores = "section_scores"
        case answers
    }
    
    struct SectionScore: Codable {
        var sectionName: String?
        var score: Int?
        
        enum CodingKeys: String, CodingKey {
            case sectionName = "section_name"
            case score
        }
    }
    
    struct Answer: Codable {
        var question: String?
        var selectedOption: String?
        var customText: String?
        var score: Int?
        var sectionName: String?
        
        enum CodingKeys: String, CodingKey {
            case question
            case selectedOption = "selected_option"
            case customText = "custom_text"
            case score
            case sectionName = "section_name"
        }
    }
}

struct SurveyAnswersResponse: Codable {
    var answers: [AnswerItem]?
    
    struct AnswerItem: Codable {
        var question: String?
        var selectedOption: String?
        var customText: String?
        
        enum CodingKeys: String, CodingKey {
            case question
            case selectedOption = "selected_option"
            case customText = "custom_text"
        }
    }
}
