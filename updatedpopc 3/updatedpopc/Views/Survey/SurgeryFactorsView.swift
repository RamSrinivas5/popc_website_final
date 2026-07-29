import SwiftUI

struct SurgeryFactorsView: View {
    let patientId: Int
    @Environment(\.presentationMode) var presentationMode
    
    @State private var selectedSurgeryType: String?
    @State private var otherSurgeryText: String = ""
    @State private var selectedUrgency: String?
    @State private var selectedDuration: String?
    @State private var selectedBloodLoss: String?

    @State private var showValidationError = false
    @State private var validationMessage = ""
    
    let typeOptions = ["Thoracic", "Upper Abdominal", "Lower Abdominal", "Neurosurgery", "Orthopedic", "ENT / Head & Neck", "Vascular / Cardiac", "Others"]
    let urgencyOptions = ["Elective", "Emergency"]
    let durationOptions = ["<2 hours", "2-4 hours", ">4 hours"]
    let bloodLossOptions = ["<500 ml", "500-1000 ml", ">1000 ml"]
    
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
                    Text("Surgery Factors")
                        .font(.system(.title2, design: .rounded).bold())
                        .foregroundColor(.white)
                    Spacer()
                }
                .padding()
                .background(Theme.primaryGradient)
                
                VStack(spacing: 15) {
                    RadioSection(title: "Type of surgery :", options: typeOptions, selection: $selectedSurgeryType)
                    
                    if selectedSurgeryType == "Others" {
                        TextField("Specify other surgery", text: $otherSurgeryText)
                            .professionalTextFieldStyle()
                    }
                    
                    RadioSection(title: "Urgency :", options: urgencyOptions, selection: $selectedUrgency)
                    RadioSection(title: "Duration :", options: durationOptions, selection: $selectedDuration)
                    RadioSection(title: "Estimated blood loss :", options: bloodLossOptions, selection: $selectedBloodLoss)
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
            NavigationLink(destination: PlannedAnesthesiaView(patientId: patientId), isActive: $navigateToNext) {
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
                            case "Type of surgery": self.selectedSurgeryType = answer.selectedOption
                            case "Urgency": self.selectedUrgency = answer.selectedOption
                            case "Duration": self.selectedDuration = answer.selectedOption
                            case "Estimated blood loss": self.selectedBloodLoss = answer.selectedOption
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
        case "Type of surgery":
            if opt == "Thoracic" || opt == "Upper Abdominal" || opt == "Vascular / Cardiac" || opt == "Neurosurgery" { return 3 }
            if opt == "Lower Abdominal" || opt == "Orthopedic" || opt == "ENT / Head & Neck" { return 2 }
            if opt == "Others" { return 1 }
        case "Urgency":
            return opt == "Emergency" ? 3 : 1
        case "Duration":
            if opt == ">4 hours" { return 3 }
            if opt == "2-4 hours" { return 2 }
            if opt == "<2 hours" { return 1 }
        case "Estimated blood loss":
            if opt == ">1000 ml" { return 3 }
            if opt == "500-1000 ml" { return 2 }
            if opt == "<500 ml" { return 1 }
        default: break
        }
        return 0
    }

    private func submitSurvey() {
        guard selectedSurgeryType != nil, selectedUrgency != nil,
              selectedDuration != nil, selectedBloodLoss != nil else {
            validationMessage = "Please answer all questions before continuing."
            showValidationError = true
            return
        }
        isSubmitting = true
        
        let typeScore = getScore(for: "Type of surgery", option: selectedSurgeryType)
        let urgencyScore = getScore(for: "Urgency", option: selectedUrgency)
        let durationScore = getScore(for: "Duration", option: selectedDuration)
        let bloodLossScore = getScore(for: "Estimated blood loss", option: selectedBloodLoss)
        
        let sectionTotal = typeScore + urgencyScore + durationScore + bloodLossScore
        
        let answers = [
            SurveyRequest.Answer(question: "Type of surgery", selectedOption: selectedSurgeryType,
                                 customText: nil, score: typeScore, sectionName: "Surgery Factors"),
            SurveyRequest.Answer(question: "Urgency", selectedOption: selectedUrgency,
                                 customText: nil, score: urgencyScore, sectionName: "Surgery Factors"),
            SurveyRequest.Answer(question: "Duration", selectedOption: selectedDuration,
                                 customText: nil, score: durationScore, sectionName: "Surgery Factors"),
            SurveyRequest.Answer(question: "Estimated blood loss", selectedOption: selectedBloodLoss,
                                 customText: nil, score: bloodLossScore, sectionName: "Surgery Factors")
        ]
        
        let sectionScore = SurveyRequest.SectionScore(sectionName: "Surgery Factors", score: sectionTotal)
        let request = SurveyRequest(patientId: patientId, totalScore: sectionTotal,
                                    status: "surgery_Factors", riskLevel: nil,
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
        SurgeryFactorsView(patientId: 1)
    }
}
