import SwiftUI

struct PostoperativeView: View {
    let patientId: Int
    @Environment(\.presentationMode) var presentationMode
    
    @State private var selectedIcu: String?
    @State private var selectedVentilation: String?
    @State private var selectedAnalgesia: String?
    @State private var selectedMobilization: String?

    @State private var showValidationError = false
    @State private var validationMessage = ""
    
    let yesNoOptions = ["Yes", "No"]
    let analgesiaOptions = ["Opioid heavy", "Multimodal/Regional"]
    
    @State private var isSubmitting = false
    @State private var navigateToNext = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                HStack {
                    Button(action: { presentationMode.wrappedValue.dismiss() }) {
                        Image(systemName: "chevron.left")
                            .font(.title3.bold())
                            .foregroundColor(.white)
                            .padding()
                            .background(Circle().fill(Color.white.opacity(0.2)))
                    }
                    Text("Postoperative Care")
                        .font(.system(.title2, design: .rounded).bold())
                        .foregroundColor(.white)
                    Spacer()
                }
                .padding()
                .background(Theme.primaryGradient)
                
                VStack(spacing: 15) {
                    RadioSection(title: "Planned ICU/HDU admission :", options: yesNoOptions, selection: $selectedIcu)
                    RadioSection(title: "Anticipated >24h ventilation :", options: yesNoOptions, selection: $selectedVentilation)
                    RadioSection(title: "Post-op analgesia :", options: analgesiaOptions, selection: $selectedAnalgesia)
                    RadioSection(title: "Early mobilization within 24h :", options: yesNoOptions, selection: $selectedMobilization)
                }
                .padding(.horizontal)
                
                Button(action: submitSurvey) {
                    if isSubmitting {
                        ProgressView().progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(maxWidth: .infinity, minHeight: 44)
                    } else {
                        Text("Next")
                            .font(.system(.headline, design: .rounded).weight(.bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, minHeight: 44)
                    }
                }
                .background(
                    RoundedRectangle(cornerRadius: 15, style: .continuous)
                        .fill(Theme.appTeal)
                )
                .shadow(color: Theme.appTeal.opacity(0.3), radius: 6, x: 0, y: 3)
                .disabled(isSubmitting)
                .padding(.horizontal)
                .padding(.top, 20)
                .padding(.bottom, 40)
            }
        }
        .popupAppear()
        .animatedBackground()
        .navigationBarHidden(true)
        .onAppear(perform: loadSavedData)
        .background(
            NavigationLink(destination: ScoreView(patientId: patientId), isActive: $navigateToNext) {
                EmptyView()
            }
        )
        .alert(isPresented: $showValidationError) {
            Alert(title: Text("Required"), message: Text(validationMessage),
                  dismissButton: .default(Text("OK")))
        }
    }
    
    private func loadSavedData() {
        ApiClient.shared.request(endpoint: "api/surveys/patient/\(patientId)/") {
            (result: Result<SurveyDisplayResponse, Error>) in
            DispatchQueue.main.async {
                if case .success(let survey) = result {
                    if let answers = survey.answers {
                        for answer in answers {
                            switch answer.question {
                            case "Planned ICU/HDU admission": self.selectedIcu = answer.selectedOption
                            case "Anticipated >24h ventilation": self.selectedVentilation = answer.selectedOption
                            case "Post-op analgesia": self.selectedAnalgesia = answer.selectedOption
                            case "Early mobilization within 24h": self.selectedMobilization = answer.selectedOption
                            default: break
                            }
                        }
                    }
                }
            }
        }
    }
    
    private func getScore(for question: String, option: String?) -> Int {
        guard let opt = option else { return 0 }
        
        switch question {
        case "Planned ICU/HDU admission", "Anticipated >24h ventilation":
            return opt == "Yes" ? 2 : 1
        case "Post-op analgesia":
            if opt == "Opioid heavy" { return 2 }
            if opt == "Multimodal/Regional" { return 1 }
        case "Early mobilization within 24h":
            return opt == "No" ? 2 : 1 // Assuming 'No' means higher risk
        default: break
        }
        return 0
    }

    private func submitSurvey() {
        guard selectedIcu != nil, selectedVentilation != nil,
              selectedAnalgesia != nil, selectedMobilization != nil else {
            validationMessage = "Please answer all questions before continuing."
            showValidationError = true
            return
        }
        isSubmitting = true
        
        let icuScore = getScore(for: "Planned ICU/HDU admission", option: selectedIcu)
        let ventilationScore = getScore(for: "Anticipated >24h ventilation", option: selectedVentilation)
        let analgesiaScore = getScore(for: "Post-op analgesia", option: selectedAnalgesia)
        let mobilizationScore = getScore(for: "Early mobilization within 24h", option: selectedMobilization)
        
        let sectionTotal = icuScore + ventilationScore + analgesiaScore + mobilizationScore
        
        let answers = [
            SurveyRequest.Answer(question: "Planned ICU/HDU admission",
                                 selectedOption: selectedIcu,
                                 customText: nil, score: icuScore, sectionName: "Postoperative"),
            SurveyRequest.Answer(question: "Anticipated >24h ventilation",
                                 selectedOption: selectedVentilation,
                                 customText: nil, score: ventilationScore, sectionName: "Postoperative"),
            SurveyRequest.Answer(question: "Post-op analgesia",
                                 selectedOption: selectedAnalgesia,
                                 customText: nil, score: analgesiaScore, sectionName: "Postoperative"),
            SurveyRequest.Answer(question: "Early mobilization within 24h",
                                 selectedOption: selectedMobilization,
                                 customText: nil, score: mobilizationScore, sectionName: "Postoperative")
        ]
        
        let sectionScore = SurveyRequest.SectionScore(sectionName: "Postoperative", score: sectionTotal)
        let request = SurveyRequest(patientId: patientId, totalScore: sectionTotal,
                                    status: "postoperative", riskLevel: nil,
                                    sectionScores: [sectionScore], answers: answers)
        guard let data = try? JSONEncoder().encode(request) else {
            isSubmitting = false; return
        }
        ApiClient.shared.request(
            endpoint: "api/surveys/",
            method: "POST",
            body: data
        ) { (result: Result<Data, Error>) in
            DispatchQueue.main.async {
                self.isSubmitting = false
                if case .success = result { self.navigateToNext = true }
            }
        }
    }
}

#Preview {
    NavigationView {
        PostoperativeView(patientId: 1)
    }
}
