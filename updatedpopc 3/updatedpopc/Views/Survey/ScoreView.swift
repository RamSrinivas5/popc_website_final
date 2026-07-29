import SwiftUI

struct ScoreView: View {
    let patientId: Int
    @Environment(\.presentationMode) var presentationMode
    
    @State private var sections: [SurveySectionRisk] = []
    @State private var isLoading = true
    
    var totalScore: Int {
        sections.compactMap { $0.score }.reduce(0, +)
    }
    
    var riskLevel: String {
        if totalScore <= 30 { return "Low Risk" }
        else if totalScore <= 45 { return "Moderate" }
        else if totalScore <= 60 { return "High" }
        else { return "Very High" }
    }
    
    var riskColor: Color {
        if totalScore <= 30 { return Color(red: 0.81, green: 0.96, blue: 0.84) } // Light Green
        else if totalScore <= 45 { return Color(red: 1.0, green: 0.95, blue: 0.77) } // Light Yellow
        else if totalScore <= 60 { return Color(red: 1.0, green: 0.88, blue: 0.7) } // Light Orange
        else { return Color(red: 1.0, green: 0.8, blue: 0.82) } // Light Red
    }
    
    var riskTextColor: Color {
        if totalScore <= 30 { return Color(red: 0.1, green: 0.45, blue: 0.2) }
        else if totalScore <= 45 { return Color(red: 0.6, green: 0.4, blue: 0.0) }
        else if totalScore <= 60 { return Color(red: 0.7, green: 0.3, blue: 0.0) }
        else { return Color(red: 0.7, green: 0.1, blue: 0.1) }
    }
    
    var managementAdvice: String {
        if totalScore <= 30 {
            return "Standard anesthesia protocol recommended. Routine intraoperative monitoring is sufficient. No additional pulmonary consult required unless clinical status changes."
        } else if totalScore <= 45 {
            return "Lung-protective ventilation, multimodal analgesia, encourage early mobilization."
        } else if totalScore <= 60 {
            return "Prefer regional if feasible, strict lung-protective strategy, consider postoperative ICU/HDU."
        } else {
            return "Strongly consider avoiding GA/ETT if possible, optimize comorbidities pre-op, mandatory ICU planning."
        }
    }
    
    func iconForSection(_ name: String) -> String {
        let lower = name.lowercased()
        if lower.contains("demographics") { return "person.fill" }
        if lower.contains("history") { return "clock.arrow.circlepath" }
        if lower.contains("preoperative") { return "briefcase.fill" }
        if lower.contains("surgery") { return "bandage.fill" }
        if lower.contains("anesthesia") { return "ivfluid.bag.fill" } 
        if lower.contains("postoperative") { return "doc.text.fill" }
        return "doc.text.fill"
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: { presentationMode.wrappedValue.dismiss() }) {
                    Image(systemName: "chevron.left")
                        .font(.title3.bold())
                        .foregroundColor(Theme.appPrimary)
                        .padding(10)
                        .background(Circle().fill(Theme.appPrimary.opacity(0.1)))
                }
                Spacer()
                Text("Assessment Summary")
                    .font(.system(.headline, design: .rounded).bold())
                Spacer()
                Button(action: {
                    // Help action
                }) {
                    Image(systemName: "questionmark.circle.fill")
                        .foregroundColor(.gray)
                        .font(.title2)
                }
            }
            .padding()

            if isLoading {
                Spacer()
                ProgressView("Calculating Score...")
                Spacer()
            } else {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        
                        // Top Score Card
                        VStack(spacing: 8) {
                            Text("TOTAL SCORE")
                                .font(.subheadline.weight(.semibold))
                                .foregroundColor(.white.opacity(0.9))
                                .padding(.top, 24)
                            
                            Text("\(totalScore)")
                                .font(.system(size: 80, weight: .semibold, design: .rounded))
                                .foregroundColor(.white)
                                .padding(.bottom, -10)
                            
                            HStack(spacing: 6) {
                                Image(systemName: "chart.bar.doc.horizontal")
                                    .font(.system(size: 10))
                                Text("Assessment Complete")
                                    .font(.caption.weight(.medium))
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .foregroundColor(.white)
                            .background(Color.white.opacity(0.2))
                            .cornerRadius(20)
                            .padding(.bottom, 24)
                        }
                        .frame(maxWidth: .infinity)
                        .background(Theme.primaryGradient)
                        .cornerRadius(30)
                        
                        // Breakdown
                        VStack(alignment: .leading, spacing: 14) {
                            Text("BREAKDOWN")
                                .font(.caption.bold())
                                .foregroundColor(.gray)
                                .padding(.leading, 8)
                            
                            ForEach(sections) { section in
                                breakdownRow(section: section)
                            }
                        }
                        
                        // Risk Level Card
                        VStack(alignment: .leading, spacing: 16) {
                            HStack {
                                Text("RISK LEVEL")
                                    .font(.subheadline.bold())
                                Spacer()
                                HStack(spacing: 4) {
                                    Image(systemName: "checkmark.circle.fill")
                                    Text(riskLevel)
                                }
                                .font(.caption.bold())
                                .foregroundColor(riskTextColor)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(riskColor)
                                .cornerRadius(16)
                            }
                            
                            // Risk Bar Graphic
                            HStack(spacing: 0) {
                                Spacer()
                                riskBarSegment(title: "LOW", range: "0-30", color: Color.green, active: totalScore <= 30)
                                Spacer()
                                riskBarSegment(title: "MOD", range: "31-45", color: Color.yellow, active: totalScore > 30 && totalScore <= 45)
                                Spacer()
                                riskBarSegment(title: "HIGH", range: "46-60", color: Color.red.opacity(0.7), active: totalScore > 45 && totalScore <= 60)
                                Spacer()
                                riskBarSegment(title: "V.HIGH", range: "> 60", color: Color.red, active: totalScore > 60)
                                Spacer()
                            }
                        }
                        .padding(20)
                        .background(Theme.cardBackground)
                        .cornerRadius(24)
                        
                        // Management Guidance
                        VStack(alignment: .leading, spacing: 12) {
                            HStack(spacing: 12) {
                                Image(systemName: "clipboard.fill")
                                    .foregroundColor(Theme.appPrimary)
                                    .font(.title3)
                                
                                Text("MANAGEMENT GUIDANCE")
                                    .font(.subheadline.bold())
                            }
                            
                            Text(managementAdvice)
                                .font(.subheadline)
                                .foregroundColor(.gray)
                                .lineSpacing(4)
                        }
                        .padding(20)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Theme.cardBackground)
                        .cornerRadius(24)
                        
                        // Done Button
                        Button(action: {
                            NotificationCenter.default.post(name: NSNotification.Name("GoHomeNotification"), object: nil)
                        }) {
                            Text("Done")
                                .font(.system(.headline, design: .rounded).weight(.bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity, minHeight: 44)
                        }
                        .background(
                            RoundedRectangle(cornerRadius: 15, style: .continuous)
                                .fill(Theme.appPrimary)
                        )
                        .shadow(color: Theme.appPrimary.opacity(0.3), radius: 6, x: 0, y: 3)
                        .padding(.top, 10)
                        
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
        .popupAppear()
        .animatedBackground()
        .navigationBarHidden(true)
        .onAppear(perform: loadScores)
    }
    
    @ViewBuilder
    func breakdownRow(section: SurveySectionRisk) -> some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Theme.appPrimary.opacity(0.1))
                    .frame(width: 40, height: 40)
                Image(systemName: iconForSection(section.sectionName ?? ""))
                    .foregroundColor(Theme.appPrimary)
                    .font(.system(size: 16))
            }
            
            Text(section.sectionName ?? "Unknown")
                .font(.subheadline)
                .foregroundColor(.primary)
            
            Spacer()
            
            Text("\(section.score ?? 0)")
                .font(.subheadline.bold())
                .foregroundColor(Theme.appPrimary)
                .padding(.horizontal, 16)
                .padding(.vertical, 6)
                .background(Theme.appPrimary.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Theme.appPrimary.opacity(0.2), lineWidth: 1)
                )
        }
        .padding(16)
        .background(Theme.cardBackground)
        .cornerRadius(20)
    }
    
    @ViewBuilder
    func riskBarSegment(title: String, range: String, color: Color, active: Bool) -> some View {
        VStack(spacing: 6) {
            Text(title)
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(active ? color : .gray.opacity(0.5))
            
            Text(range)
                .font(.system(size: 10))
                .foregroundColor(.gray)
            
            Rectangle()
                .fill(active ? color : Color.gray.opacity(0.2))
                .frame(width: 50, height: 6)
                .cornerRadius(3)
        }
    }
    
    private func loadScores() {
        ApiClient.shared.request(endpoint: "api/surveys/patient/\(patientId)/") {
            (result: Result<SurveyDisplayResponse, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                if case .success(let survey) = result {
                    self.sections = survey.sectionScores?.map {
                        SurveySectionRisk(sectionName: $0.section, score: $0.score)
                    } ?? []
                }
            }
        }
    }
}

#Preview {
    NavigationView {
        ScoreView(patientId: 1)
    }
}
