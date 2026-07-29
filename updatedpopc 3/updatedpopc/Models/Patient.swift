import Foundation

struct Patient: Codable, Identifiable {
    var id: Int
    var patientId: String
    var name: String
    var age: Int
    var phone: String
    var weight: Double
    var gender: String
    var height: Double
    var bmi: Double
    var doctorId: Int

    init(id: Int = 0, patientId: String = "", name: String = "", age: Int = 0, phone: String = "", weight: Double = 0.0, gender: String = "", height: Double = 0.0, bmi: Double = 0.0, doctorId: Int = 0) {
        self.id = id
        self.patientId = patientId
        self.name = name
        self.age = age
        self.phone = phone
        self.weight = weight
        self.gender = gender
        self.height = height
        self.bmi = bmi
        self.doctorId = doctorId
    }
}
