import SwiftUI

struct PatientDemographicsView: View {
    let patientId: Int
    @Environment(\.presentationMode) var presentationMode
    
    @State private var selectedAge: String?
    @State private var selectedSex: String?
    @State private var selectedBmi: String?
    @State private var selectedSmoking: String?
    @State private var selectedAlcohol: String?

    @State private var showValidationError = false
    @State private var validationMessage = ""
    
    let ageOptions = ["Age<50", "50>Age<69", "Age>69"]
    let sexOptions = ["Male", "Female", "0thers"]
    let bmiOptions = ["BMI<30", "BMI>=30"]
    let smokingOptions = ["Never", "Current_smoker", "Ex_smoker"]
    let alcoholOptions = ["Yes", "No"]
    
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
                    Text("Patient Demographics")
                        .font(.system(.title2, design: .rounded).bold())
                        .foregroundColor(.white)
                    Spacer()
                }
                .padding()
                .background(Theme.primaryGradient)
                
                VStack(spacing: 15) {
                    RadioSection(title: "Age :", options: ageOptions, selection: $selectedAge)
                    RadioSection(title: "Sex :", options: sexOptions, selection: $selectedSex)
                    RadioSection(title: "Body Mass Index (BMI) :", options: bmiOptions, selection: $selectedBmi)
                    RadioSection(title: "Smoking Status :", options: smokingOptions, selection: $selectedSmoking)
                    RadioSection(title: "Alcohol :", options: alcoholOptions, selection: $selectedAlcohol)
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
            NavigationLink(destination: MedicalHistoryView(patientId: patientId), isActive: $navigateToNext) {
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
                            case "Age": self.selectedAge = answer.selectedOption
                            case "Sex": self.selectedSex = answer.selectedOption
                            case "Body Mass Index (BMI)": self.selectedBmi = answer.selectedOption
                            case "Smoking Status": self.selectedSmoking = answer.selectedOption
                            case "Alcohol": self.selectedAlcohol = answer.selectedOption
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
        case "Age":
            if opt == "Age<50" { return 1 }
            if opt == "50>Age<69" { return 2 }
            if opt == "Age>69" { return 3 }
        case "Sex":
            if opt == "Male" { return 1 }
            if opt == "Female" { return 1 }
            if opt == "0thers" { return 1 }
        case "Body Mass Index (BMI)":
            if opt == "BMI<30" { return 1 }
            if opt == "BMI>=30" { return 2 }
        case "Smoking Status":
            if opt == "Never" { return 1 }
            if opt == "Ex_smoker" { return 2 }
            if opt == "Current_smoker" { return 3 }
        case "Alcohol":
            if opt == "No" { return 1 }
            if opt == "Yes" { return 2 }
        default: break
        }
        return 0
    }

    private func submitSurvey() {
        guard selectedAge != nil, selectedSex != nil, selectedBmi != nil,
              selectedSmoking != nil, selectedAlcohol != nil else {
            validationMessage = "Please answer all questions before continuing."
            showValidationError = true
            return
        }
        isSubmitting = true
        
        // Calculate scores
        let ageScore = getScore(for: "Age", option: selectedAge)
        let sexScore = getScore(for: "Sex", option: selectedSex)
        let bmiScore = getScore(for: "Body Mass Index (BMI)", option: selectedBmi)
        let smokingScore = getScore(for: "Smoking Status", option: selectedSmoking)
        let alcoholScore = getScore(for: "Alcohol", option: selectedAlcohol)
        
        let sectionTotal = ageScore + sexScore + bmiScore + smokingScore + alcoholScore
        
        let answers = [
            SurveyRequest.Answer(question: "Age", selectedOption: selectedAge,
                                 customText: nil, score: ageScore, sectionName: "Patient Demographics"),
            SurveyRequest.Answer(question: "Sex", selectedOption: selectedSex,
                                 customText: nil, score: sexScore, sectionName: "Patient Demographics"),
            SurveyRequest.Answer(question: "Body Mass Index (BMI)", selectedOption: selectedBmi,
                                 customText: nil, score: bmiScore, sectionName: "Patient Demographics"),
            SurveyRequest.Answer(question: "Smoking Status", selectedOption: selectedSmoking,
                                 customText: nil, score: smokingScore, sectionName: "Patient Demographics"),
            SurveyRequest.Answer(question: "Alcohol", selectedOption: selectedAlcohol,
                                 customText: nil, score: alcoholScore, sectionName: "Patient Demographics")
        ]
        let sectionScore = SurveyRequest.SectionScore(sectionName: "Patient Demographics", score: sectionTotal)
        let request = SurveyRequest(patientId: patientId, totalScore: sectionTotal,
                                    status: "patient_Demographics", riskLevel: nil,
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

struct RadioSection: View {
    let title: String
    let options: [String]
    @Binding var selection: String?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.title3)
                .bold()
                .foregroundColor(.primary)
                .padding(.bottom, 2)
            
            ForEach(options, id: \.self) { option in
                Button(action: {
                    selection = option
                }) {
                    Text(option)
                        .font(.subheadline)
                        .fontWeight(selection == option ? .semibold : .regular)
                        .foregroundColor(selection == option ? .white : Theme.appPrimary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .padding(.horizontal, 16)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(selection == option
                                    ? Theme.primaryGradient
                                    : LinearGradient(colors: [Theme.appTeal.opacity(0.1), Theme.appPrimary.opacity(0.05)], startPoint: .topLeading, endPoint: .bottomTrailing))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(selection == option ? Theme.appTeal : Theme.appPrimary.opacity(0.6), lineWidth: selection == option ? 3 : 2)
                        )
                        .shadow(color: selection == option ? Theme.appPrimary.opacity(0.3) : Color.clear, radius: 4, x: 0, y: 2)
                }
            }
        }
        .padding()
        .cardStyle()
    }
}

#Preview {
    NavigationView {
        PatientDemographicsView(patientId: 1)
    }
}
