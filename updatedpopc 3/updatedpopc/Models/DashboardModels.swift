import Foundation

struct DashboardResponse: Codable {
    var totalPatients: Int?
    var totalSurveyed: Int?
    var pendingSurveys: Int?
    var highRiskPatients: Int?
    // Pie chart percentages (returned by the same /api/dashboard/ endpoint)
    var stable: Double?
    var pendingPct: Double?
    var highRisk: Double?

    enum CodingKeys: String, CodingKey {
        case totalPatients = "total_patients"
        case totalSurveyed = "total_surveyed"
        case pendingSurveys = "pending_surveys"
        case highRiskPatients = "high_risk_patients"
        case stable
        case pendingPct = "pending"
        case highRisk = "high_risk"
    }
}

// DashboardGraph is kept for backward compatibility (no longer used in DashboardView)
struct DashboardGraph: Codable {
    var stable: Double?
    var pending: Double?
    var highRisk: Double?

    enum CodingKeys: String, CodingKey {
        case stable
        case pending
        case highRisk = "high_risk"
    }
}
