import Foundation

struct PatientResponse: Codable, Identifiable {
    var id: Int
    var patientId: String?
    var name: String?
    var age: Int?
    var phone: String?
    var weight: Double?
    var gender: String?
    var height: Double?
    var bmi: Double?
    var photoUrl: String?
    var surveyStatus: String?
    var riskLevel: String?

    enum CodingKeys: String, CodingKey {
        case id
        case patientId = "patient_id"
        case name, age, phone, weight, gender, height, bmi
        case photoUrl = "photo"
        case surveyStatus = "survey_status"
        case riskLevel = "risk_level"
    }
}
