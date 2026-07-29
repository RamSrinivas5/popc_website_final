import Foundation

struct LoginResponse: Codable {
    var token: String?
    var doctorId: String?
    var username: String?

    enum CodingKeys: String, CodingKey {
        case token = "token"
        case doctorId = "doctor_id"
        case username = "username"
    }
}
