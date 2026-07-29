import SwiftUI

struct PreoperativeConsiderationsView: View {
    let patientId: Int
    @Environment(\.presentationMode) var presentationMode
    
    @State private var selectedAsa: String?
    @State private var selectedExercise: String?
    @State private var selectedDyspnea: String?
    @State private var selectedInfection: String?
    @State private var selectedSpO2: String?

    @State private var showValidationError = false
    @State private var validationMessage = ""
    
    let asaOptions = ["I", "II", "III", "IV", "V"]
    let exerciseOptions = ["<4 METs", "4-10 METs", ">10 METs"]
    let yesNoOptions = ["Yes", "No"]
    let spo2Options = [">=96%", "91-95%", "<=90%"]
    
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
                    Text("Preoperative Considerations")
                        .font(.system(.title2, design: .rounded).bold())
                        .foregroundColor(.white)
                    Spacer()
                }
                .padding()
                .background(Theme.primaryGradient)
                
                VStack(spacing: 15) {
                    RadioSection(title: "ASA Physical Status :", options: asaOptions, selection: $selectedAsa)
                    RadioSection(title: "Exercise tolerance :", options: exerciseOptions, selection: $selectedExercise)
                    RadioSection(title: "Dyspnea at rest :", options: yesNoOptions, selection: $selectedDyspnea)
                    RadioSection(title: "Recent respiratory infection :", options: yesNoOptions, selection: $selectedInfection)
                    RadioSection(title: "SpO₂ :", options: spo2Options, selection: $selectedSpO2)
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
            NavigationLink(destination: SurgeryFactorsView(patientId: patientId), isActive: $navigateToNext) {
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
                            case "ASA Physical Status": self.selectedAsa = answer.selectedOption
                            case "Exercise tolerance": self.selectedExercise = answer.selectedOption
                            case "Dyspnea at rest": self.selectedDyspnea = answer.selectedOption
                            case "Recent respiratory infection": self.selectedInfection = answer.selectedOption
                            case "SpO2": self.selectedSpO2 = answer.selectedOption
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
        case "ASA Physical Status":
            if opt == "I" { return 1 }
            if opt == "II" { return 2 }
            if opt == "III" { return 3 }
            if opt == "IV" { return 4 }
            if opt == "V" { return 5 }
        case "Exercise tolerance":
            if opt == ">10 METs" { return 1 }
            if opt == "4-10 METs" { return 2 }
            if opt == "<4 METs" { return 3 }
        case "Dyspnea at rest", "Recent respiratory infection":
            return opt == "Yes" ? 2 : 1
        case "SpO2":
            if opt == ">=96%" { return 1 }
            if opt == "91-95%" { return 2 }
            if opt == "<=90%" { return 3 }
        default: break
        }
        return 0
    }

    private func submitSurvey() {
        guard selectedAsa != nil, selectedExercise != nil, selectedDyspnea != nil,
              selectedInfection != nil, selectedSpO2 != nil else {
            validationMessage = "Please answer all questions before continuing."
            showValidationError = true
            return
        }
        isSubmitting = true
        
        let asaScore = getScore(for: "ASA Physical Status", option: selectedAsa)
        let exerciseScore = getScore(for: "Exercise tolerance", option: selectedExercise)
        let dyspneaScore = getScore(for: "Dyspnea at rest", option: selectedDyspnea)
        let infectionScore = getScore(for: "Recent respiratory infection", option: selectedInfection)
        let spo2Score = getScore(for: "SpO2", option: selectedSpO2)
        
        let sectionTotal = asaScore + exerciseScore + dyspneaScore + infectionScore + spo2Score
        
        let answers = [
            SurveyRequest.Answer(question: "ASA Physical Status", selectedOption: selectedAsa,
                                 customText: nil, score: asaScore, sectionName: "Preoperative Considerations"),
            SurveyRequest.Answer(question: "Exercise tolerance", selectedOption: selectedExercise,
                                 customText: nil, score: exerciseScore, sectionName: "Preoperative Considerations"),
            SurveyRequest.Answer(question: "Dyspnea at rest", selectedOption: selectedDyspnea,
                                 customText: nil, score: dyspneaScore, sectionName: "Preoperative Considerations"),
            SurveyRequest.Answer(question: "Recent respiratory infection",
                                 selectedOption: selectedInfection,
                                 customText: nil, score: infectionScore, sectionName: "Preoperative Considerations"),
            SurveyRequest.Answer(question: "SpO2", selectedOption: selectedSpO2,
                                 customText: nil, score: spo2Score, sectionName: "Preoperative Considerations")
        ]
        
        let sectionScore = SurveyRequest.SectionScore(sectionName: "Preoperative Considerations", score: sectionTotal)
        let request = SurveyRequest(patientId: patientId, totalScore: sectionTotal,
                                    status: "preoperative_considerations", riskLevel: nil,
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
        PreoperativeConsiderationsView(patientId: 1)
    }
}
