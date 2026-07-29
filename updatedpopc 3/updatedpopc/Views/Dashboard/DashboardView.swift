import SwiftUI

struct DashboardView: View {
    @Environment(\.presentationMode) var presentationMode
    
    @State private var totalPatients = 0
    @State private var totalSurveyed = 0
    @State private var pendingSurveys = 0
    @State private var highRiskPatients = 0
    
    @State private var graphLowRisk: Double = 33.3
    @State private var graphModerateRisk: Double = 33.3
    @State private var graphHighRisk: Double = 33.3
    
    @State private var isLoading = true
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            Theme.primaryGradient
            .overlay(
                HStack {
                    Button(action: { NotificationCenter.default.post(name: NSNotification.Name("GoHomeNotification"), object: nil) }) {
                        Image(systemName: "chevron.left")
                            .font(.title3.bold())
                            .foregroundColor(.white)
                            .padding()
                            .background(Circle().fill(Color.white.opacity(0.25)))
                    }
                    Text("DASHBOARD")
                        .font(.title2)
                        .bold()
                        .foregroundColor(.white)
                    Spacer()
                    if #available(iOS 16.0, *) {
                        NavigationLink(destination: ProfileView()) {
                            DoctorProfileIconView(size: 35, iconColor: .white.opacity(0.85))
                        }
                    }
                }
                .padding()
            )
            .frame(height: 110)
            
            if isLoading {
                ProgressView("Loading Dashboard...")
                    .frame(maxHeight: .infinity)
            } else {
                ScrollView {
                    VStack(spacing: 20) {
                        
                        // Pie Chart
                        PieChartView(
                            lowRisk: graphLowRisk,
                            moderateRisk: graphModerateRisk,
                            highRisk: graphHighRisk
                        )
                        .frame(height: 250)
                        .padding()
                        
                        // Stats Grid
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 15) {
                            
                            StatCard(title: "Total Patients", value: "\(totalPatients)", iconName: "person.3.fill", color: Theme.appPrimary)

                            StatCard(title: "Surveyed", value: "\(totalSurveyed)", iconName: "doc.text.fill", color: Theme.appTeal)

                            NavigationLink(destination: PendingSurveysView()) {
                                StatCard(title: "Pending", value: "\(pendingSurveys)", iconName: "clock.fill", color: Theme.categoryOrange)
                            }

                            NavigationLink(destination: HighRiskListView()) {
                                StatCard(title: "High Risk", value: "\(highRiskPatients)", iconName: "exclamationmark.triangle.fill", color: Theme.categoryRed)
                            }
                        }
                        .padding(.horizontal)
                        
                        Spacer()
                    }
                    .padding(.top)
                }
            }
        }
        .popupAppear()
        .background(Theme.appBackground.edgesIgnoringSafeArea(.all))
        .navigationBarHidden(true)
        .onAppear(perform: loadData)
    }
    
    private func loadData() {
        ApiClient.shared.request(endpoint: "api/dashboard/", method: "GET") { (result: Result<DashboardResponse, Error>) in
            DispatchQueue.main.async {
                switch result {
                case .success(let response):
                    self.totalPatients = response.totalPatients ?? 0
                    self.totalSurveyed = response.totalSurveyed ?? 0
                    self.pendingSurveys = response.pendingSurveys ?? 0
                    self.highRiskPatients = response.highRiskPatients ?? 0
                    
                    // Pre-fetch all survey details to dynamically recalculate correct score risk levels on the frontend
                    self.recalculateCountsFromScores()
                case .failure:
                    self.isLoading = false
                }
            }
        }
    }
    
    private func recalculateCountsFromScores() {
        ApiClient.shared.request(endpoint: "api/surveys/completed/") { (result: Result<[RecordsResponse], Error>) in
            DispatchQueue.main.async {
                switch result {
                case .success(let records):
                    let group = DispatchGroup()
                    var localLow = 0
                    var localMod = 0
                    var localHigh = 0
                    var localHighRiskCardCount = 0
                    
                    let lock = NSLock()
                    
                    for record in records {
                        group.enter()
                        ApiClient.shared.request(endpoint: "api/surveys/patient/\(record.pk)/") { (detailResult: Result<SurveyDisplayResponse, Error>) in
                            lock.lock()
                            if case .success(let survey) = detailResult, let score = survey.totalScore {
                                // Correct thresholds: <= 30 Low, <= 45 Moderate, <= 60 High, > 60 Very High
                                if score <= 30 {
                                    localLow += 1
                                } else if score <= 45 {
                                    localMod += 1
                                } else {
                                    localHigh += 1
                                    localHighRiskCardCount += 1
                                }
                            } else {
                                // Fallback to returned risk level
                                if let risk = record.riskLevel?.lowercased() {
                                    if risk.contains("high") {
                                        localHigh += 1
                                        localHighRiskCardCount += 1
                                    } else if risk.contains("moderate") {
                                        localMod += 1
                                    } else {
                                        localLow += 1
                                    }
                                }
                            }
                            lock.unlock()
                            group.leave()
                        }
                    }
                    
                    group.notify(queue: .main) {
                        self.graphLowRisk = Double(localLow)
                        self.graphModerateRisk = Double(localMod)
                        self.graphHighRisk = Double(localHigh)
                        self.highRiskPatients = localHighRiskCardCount
                        self.isLoading = false
                    }
                    
                case .failure:
                    self.isLoading = false
                }
            }
        }
    }
    
}

struct StatCard: View {
    let title: String
    let value: String
    let iconName: String?
    let color: Color
    
    var body: some View {
        VStack(spacing: 12) {
            if let icon = iconName {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                    .symbolRenderingMode(.hierarchical)
            }
            
            Text(title)
                .font(.system(.subheadline, design: .rounded))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
            
            Text(value)
                .font(.system(.title, design: .rounded).weight(.bold))
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(Theme.cardBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(color.opacity(0.4), lineWidth: 1.5)
        )
        .shadow(color: color.opacity(0.2), radius: 15, x: 0, y: 8)
    }
}

struct PieChartView: View {
    let lowRisk: Double
    let moderateRisk: Double
    let highRisk: Double
    
    var total: Double {
        let sum = lowRisk + moderateRisk + highRisk
        return sum == 0 ? 1 : sum
    }
    
    var body: some View {
        VStack {
            GeometryReader { geometry in
                let radius = min(geometry.size.width, geometry.size.height) / 2
                let center = CGPoint(x: geometry.size.width / 2, y: geometry.size.height / 2)
                
                ZStack {
                    // Low Risk
                    let lowStart = 0.0
                    let lowEnd = (lowRisk / total) * 360
                    PieSlice(startAngle: lowStart, endAngle: lowEnd)
                        .fill(Theme.categoryGreen)
                    if lowRisk > 0 {
                        Text("\(Int(lowRisk))")
                            .font(.system(.subheadline, design: .rounded).bold())
                            .foregroundColor(.white)
                            .position(position(for: (lowStart + lowEnd) / 2, radius: radius * 0.75, center: center))
                    }
                    
                    // Moderate Risk
                    let modStart = lowEnd
                    let modEnd = modStart + (moderateRisk / total) * 360
                    PieSlice(startAngle: modStart, endAngle: modEnd)
                        .fill(Color.yellow) // Standard warning color
                    if moderateRisk > 0 {
                        Text("\(Int(moderateRisk))")
                            .font(.system(.subheadline, design: .rounded).bold())
                            .foregroundColor(.black)
                            .position(position(for: (modStart + modEnd) / 2, radius: radius * 0.75, center: center))
                    }
                    
                    // High Risk
                    let highStart = modEnd
                    let highEnd = highStart + (highRisk / total) * 360
                    PieSlice(startAngle: highStart, endAngle: highEnd)
                        .fill(Theme.categoryRed)
                    if highRisk > 0 {
                        Text("\(Int(highRisk))")
                            .font(.system(.subheadline, design: .rounded).bold())
                            .foregroundColor(.white)
                            .position(position(for: (highStart + highEnd) / 2, radius: radius * 0.75, center: center))
                    }
                    
                    // Hole for Donut chart effect
                    Circle()
                        .fill(Theme.appBackground) // Match depth
                        .frame(width: radius * 1.2, height: radius * 1.2)
                }
            }
            .frame(width: 200, height: 200)
            
            // Legend
            HStack(spacing: 15) {
                LegendItem(color: Theme.categoryGreen, text: "Low Risk")
                LegendItem(color: Color.yellow, text: "Moderate")
                LegendItem(color: Theme.categoryRed, text: "High Risk")
            }
            .padding(.top, 10)
        }
    }
    
    private func position(for angle: Double, radius: Double, center: CGPoint) -> CGPoint {
        let adjustedAngle = angle - 90
        let radians = adjustedAngle * .pi / 180
        return CGPoint(
            x: center.x + radius * cos(radians),
            y: center.y + radius * sin(radians)
        )
    }
}

struct PieSlice: Shape {
    var startAngle: Double
    var endAngle: Double
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = min(rect.width, rect.height) / 2
        
        path.move(to: center)
        path.addArc(center: center,
                    radius: radius,
                    startAngle: .degrees(startAngle - 90),
                    endAngle: .degrees(endAngle - 90),
                    clockwise: false)
        path.closeSubpath()
        return path
    }
}

struct LegendItem: View {
    let color: Color
    let text: String
    
    var body: some View {
        HStack(spacing: 5) {
            Circle()
                .fill(color)
                .frame(width: 10, height: 10)
            Text(text)
                .font(.caption)
                .foregroundColor(.black)
        }
    }
}

#Preview {
    NavigationView {
        DashboardView()
    }
}
