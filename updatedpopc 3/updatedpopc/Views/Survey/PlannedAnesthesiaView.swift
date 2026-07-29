import SwiftUI

struct PlannedAnesthesiaView: View {
    let patientId: Int
    @Environment(\.presentationMode) var presentationMode
    
    @State private var selectedAriscat: String?
    @State private var selectedVentilation: String?
    @State private var selectedMuscle: String?
    @State private var selectedReversal: String?
    @State private var selectedAnalgesia: String?

    @State private var showValidationError = false
    @State private var validationMessage = ""
    
    let ariscatOptions = ["Regional", "LMA", "ETT", "Combined"]
    let ventilationOptions = ["Low tidal volume", "PEEP", "None/Other"]
    let yesNoOptions = ["Yes", "No"]
    let reversalOptions = ["Neostigmine", "Sugammadex"]
    let analgesiaOptions = ["IV opioids", "Non-opioid/Multimodal"]
    
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
                    Text("Planned Anesthesia")
                        .font(.system(.title2, design: .rounded).bold())
                        .foregroundColor(.white)
                    Spacer()
                }
                .padding()
                .background(Theme.primaryGradient)
                
                VStack(spacing: 15) {
                    RadioSection(title: "ARISCAT Choice :", options: ariscatOptions, selection: $selectedAriscat)
                    RadioSection(title: "Ventilation Strategy :", options: ventilationOptions, selection: $selectedVentilation)
                    RadioSection(title: "Muscle relaxant use :", options: yesNoOptions, selection: $selectedMuscle)
                    
                    if selectedMuscle == "Yes" {
                        RadioSection(title: "Reversal :", options: reversalOptions, selection: $selectedReversal)
                    }
                    
                    RadioSection(title: "Planned Analgesia :", options: analgesiaOptions, selection: $selectedAnalgesia)
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
            NavigationLink(destination: PostoperativeView(patientId: patientId), isActive: $navigateToNext) {
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
                            case "ARISCAT Choice": self.selectedAriscat = answer.selectedOption
                            case "Ventilation Strategy": self.selectedVentilation = answer.selectedOption
                            case "Muscle relaxant use": self.selectedMuscle = answer.selectedOption
                            case "Reversal": self.selectedReversal = answer.selectedOption
                            case "Planned Analgesia": self.selectedAnalgesia = answer.selectedOption
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
        case "ARISCAT Choice":
            if opt == "Regional" { return 1 }
            if opt == "LMA" { return 2 }
            if opt == "ETT" { return 3 }
            if opt == "Combined" { return 4 }
        case "Ventilation Strategy":
            if opt == "Low tidal volume" { return 1 }
            if opt == "PEEP" { return 2 }
            if opt == "None/Other" { return 3 }
        case "Muscle relaxant use":
            return opt == "Yes" ? 2 : 1
        case "Reversal":
            if opt == "Sugammadex" { return 1 }
            if opt == "Neostigmine" { return 2 }
        case "Planned Analgesia":
            if opt == "Non-opioid/Multimodal" { return 1 }
            if opt == "IV opioids" { return 2 }
        default: break
        }
        return 0
    }

    private func submitSurvey() {
        guard selectedAriscat != nil, selectedVentilation != nil,
              selectedMuscle != nil, selectedAnalgesia != nil else {
            validationMessage = "Please answer all questions before continuing."
            showValidationError = true
            return
        }
        isSubmitting = true
        
        let ariscatScore = getScore(for: "ARISCAT Choice", option: selectedAriscat)
        let ventilationScore = getScore(for: "Ventilation Strategy", option: selectedVentilation)
        let muscleScore = getScore(for: "Muscle relaxant use", option: selectedMuscle)
        let analgesiaScore = getScore(for: "Planned Analgesia", option: selectedAnalgesia)
        
        var sectionTotal = ariscatScore + ventilationScore + muscleScore + analgesiaScore
        
        var answers = [
            SurveyRequest.Answer(question: "ARISCAT Choice", selectedOption: selectedAriscat,
                                 customText: nil, score: ariscatScore, sectionName: "Planned Anesthesia"),
            SurveyRequest.Answer(question: "Ventilation Strategy", selectedOption: selectedVentilation,
                                 customText: nil, score: ventilationScore, sectionName: "Planned Anesthesia"),
            SurveyRequest.Answer(question: "Muscle relaxant use", selectedOption: selectedMuscle,
                                 customText: nil, score: muscleScore, sectionName: "Planned Anesthesia"),
            SurveyRequest.Answer(question: "Planned Analgesia", selectedOption: selectedAnalgesia,
                                 customText: nil, score: analgesiaScore, sectionName: "Planned Anesthesia")
        ]
        
        if selectedMuscle == "Yes", let reversal = selectedReversal {
            let reversalScore = getScore(for: "Reversal", option: reversal)
            sectionTotal += reversalScore
            answers.append(SurveyRequest.Answer(
                question: "Reversal", selectedOption: reversal,
                customText: nil, score: reversalScore, sectionName: "Planned Anesthesia"))
        }
        
        let sectionScore = SurveyRequest.SectionScore(sectionName: "Planned Anesthesia", score: sectionTotal)
        let request = SurveyRequest(patientId: patientId, totalScore: sectionTotal,
                                    status: "planned_Anesthesia", riskLevel: nil,
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
        PlannedAnesthesiaView(patientId: 1)
    }
}
