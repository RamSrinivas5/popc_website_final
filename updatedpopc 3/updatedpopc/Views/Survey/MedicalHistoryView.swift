import SwiftUI

struct MedicalHistoryView: View {
    let patientId: Int
    @Environment(\.presentationMode) var presentationMode
    
    @State private var selectedCOPD: String?
    @State private var selectedAsthma: String?
    @State private var selectedOSA: String?
    @State private var selectedILD: String?
    @State private var selectedHeartFailure: String?
    @State private var selectedCAD: String?
    @State private var selectedHypertension: String?
    @State private var selectedDiabetes: String?
    @State private var selectedCKD: String?

    @State private var showValidationError = false
    @State private var validationMessage = ""
    
    let yesNoOptions = ["Yes", "No"]
    
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
                    Text("Medical History")
                        .font(.system(.title2, design: .rounded).bold())
                        .foregroundColor(.white)
                    Spacer()
                }
                .padding()
                .background(Theme.primaryGradient)
                
                VStack(spacing: 15) {
                    RadioSection(title: "COPD :", options: yesNoOptions, selection: $selectedCOPD)
                    RadioSection(title: "Asthma :", options: yesNoOptions, selection: $selectedAsthma)
                    RadioSection(title: "OSA :", options: yesNoOptions, selection: $selectedOSA)
                    RadioSection(title: "ILD :", options: yesNoOptions, selection: $selectedILD)
                    RadioSection(title: "Heart Failure :", options: yesNoOptions, selection: $selectedHeartFailure)
                    RadioSection(title: "CAD :", options: yesNoOptions, selection: $selectedCAD)
                    RadioSection(title: "Hypertension :", options: yesNoOptions, selection: $selectedHypertension)
                    RadioSection(title: "Diabetes :", options: yesNoOptions, selection: $selectedDiabetes)
                    RadioSection(title: "CKD :", options: yesNoOptions, selection: $selectedCKD)
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
            NavigationLink(destination: PreoperativeConsiderationsView(patientId: patientId), isActive: $navigateToNext) {
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
                            case "COPD": self.selectedCOPD = answer.selectedOption
                            case "Asthma": self.selectedAsthma = answer.selectedOption
                            case "OSA": self.selectedOSA = answer.selectedOption
                            case "ILD": self.selectedILD = answer.selectedOption
                            case "Heart Failure": self.selectedHeartFailure = answer.selectedOption
                            case "CAD": self.selectedCAD = answer.selectedOption
                            case "Hypertension": self.selectedHypertension = answer.selectedOption
                            case "Diabetes": self.selectedDiabetes = answer.selectedOption
                            case "CKD": self.selectedCKD = answer.selectedOption
                            default: break
                            }
                        }
                    }
                }
            }
        }
    }
    
    private func getScore(option: String?) -> Int {
        return option == "Yes" ? 1 : 0
    }

    private func submitSurvey() {
        guard selectedCOPD != nil, selectedAsthma != nil, selectedOSA != nil,
              selectedILD != nil, selectedHeartFailure != nil, selectedCAD != nil,
              selectedHypertension != nil, selectedDiabetes != nil, selectedCKD != nil else {
            validationMessage = "Please answer all questions before continuing."
            showValidationError = true
            return
        }
        isSubmitting = true
        
        // Calculate scores
        let copdScore = getScore(option: selectedCOPD)
        let asthmaScore = getScore(option: selectedAsthma)
        let osaScore = getScore(option: selectedOSA)
        let ildScore = getScore(option: selectedILD)
        let hfScore = getScore(option: selectedHeartFailure)
        let cadScore = getScore(option: selectedCAD)
        let htnScore = getScore(option: selectedHypertension)
        let diabScore = getScore(option: selectedDiabetes)
        let ckdScore = getScore(option: selectedCKD)
        
        let sectionTotal = copdScore + asthmaScore + osaScore + ildScore +
                           hfScore + cadScore + htnScore + diabScore + ckdScore
        
        let answers = [
            SurveyRequest.Answer(question: "COPD", selectedOption: selectedCOPD,
                                 customText: nil, score: copdScore, sectionName: "Medical History"),
            SurveyRequest.Answer(question: "Asthma", selectedOption: selectedAsthma,
                                 customText: nil, score: asthmaScore, sectionName: "Medical History"),
            SurveyRequest.Answer(question: "OSA", selectedOption: selectedOSA,
                                 customText: nil, score: osaScore, sectionName: "Medical History"),
            SurveyRequest.Answer(question: "ILD", selectedOption: selectedILD,
                                 customText: nil, score: ildScore, sectionName: "Medical History"),
            SurveyRequest.Answer(question: "Heart Failure", selectedOption: selectedHeartFailure,
                                 customText: nil, score: hfScore, sectionName: "Medical History"),
            SurveyRequest.Answer(question: "CAD", selectedOption: selectedCAD,
                                 customText: nil, score: cadScore, sectionName: "Medical History"),
            SurveyRequest.Answer(question: "Hypertension", selectedOption: selectedHypertension,
                                 customText: nil, score: htnScore, sectionName: "Medical History"),
            SurveyRequest.Answer(question: "Diabetes", selectedOption: selectedDiabetes,
                                 customText: nil, score: diabScore, sectionName: "Medical History"),
            SurveyRequest.Answer(question: "CKD", selectedOption: selectedCKD,
                                 customText: nil, score: ckdScore, sectionName: "Medical History")
        ]
        
        let sectionScore = SurveyRequest.SectionScore(sectionName: "Medical History", score: sectionTotal)
        let request = SurveyRequest(patientId: patientId, totalScore: sectionTotal,
                                    status: "medical_history", riskLevel: nil,
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
        MedicalHistoryView(patientId: 1)
    }
}
