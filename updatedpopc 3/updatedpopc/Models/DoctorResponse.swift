import Foundation

struct DoctorResponse: Codable {
    var doctorId: String
    var username: String?
    var email: String?
    var phone: String?
    var age: Int?
    var gender: String?
    var name: String?
    var specialization: String?
    var profileImageUrl: String?

    enum CodingKeys: String, CodingKey {
        case doctorId = "doctor_id"
        case username, email, phone, age, gender, name, specialization
        case profileImageUrl = "profile_image_url"
    }
}
