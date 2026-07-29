import SwiftUI

struct ViewPatientView: View {
    let patientId: Int
    @Environment(\.presentationMode) var presentationMode
    
    @State private var patient: PatientResponse?
    @State private var isLoading = true
    
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
                    Text("Patient Details")
                        .font(.title2)
                        .bold()
                        .foregroundColor(.white)
                    Spacer()
                }
                .padding()
                .background(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Theme.appPrimary,
                            Theme.appTeal
                        ]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                
                if isLoading {
                    ProgressView()
                } else if let p = patient {
                    // Profile Image
                    if let photo = p.photoUrl, !photo.isEmpty {
                        AsyncImage(url: URL(string: photo)) { phase in
                            if let image = phase.image {
                                image.resizable().scaledToFill()
                            } else {
                                Image(systemName: "person.crop.circle.fill")
                                    .symbolRenderingMode(.hierarchical)
                                    .foregroundColor(.gray)
                            }
                        }
                        .frame(width: 100, height: 100)
                        .clipShape(Circle())
                    } else {
                        Image(systemName: "person.crop.circle.fill")
                            .resizable()
                            .symbolRenderingMode(.hierarchical)
                            .frame(width: 100, height: 100)
                            .foregroundColor(.gray)
                    }
                    
                    VStack(alignment: .leading, spacing: 15) {
                        DetailRow(title: "Patient ID", value: p.patientId ?? "")
                        DetailRow(title: "Name", value: p.name ?? "")
                        DetailRow(title: "Age", value: p.age.map { String($0) } ?? "")
                        DetailRow(title: "Gender", value: p.gender ?? "")
                        DetailRow(title: "Phone", value: p.phone ?? "")
                        DetailRow(title: "Weight", value: p.weight.map { String(format: "%.1f", $0) } ?? "")
                        DetailRow(title: "Height", value: p.height.map { String(format: "%.1f", $0) } ?? "")
                        DetailRow(title: "BMI", value: p.bmi.map { String(format: "%.2f", $0) } ?? "")
                        
                        Divider()
                            .padding(.vertical, 5)
                        
                        DetailRow(title: "Survey Status", value: p.surveyStatus ?? "Not Started", valueColor: Theme.color(forSurveyStatus: p.surveyStatus))
                        DetailRow(title: "Risk Level", value: p.riskLevel ?? "N/A", valueColor: Theme.color(forRiskStatus: p.riskLevel))
                    }
                    .padding()
                    .cardStyle()
                    .padding(.horizontal)
                } else {
                    Text("Failed to load patient details.")
                        .foregroundColor(.red)
                }
                
                Spacer()
            }
        }
        .popupAppear()
        .animatedBackground()
        .navigationBarHidden(true)
        .onAppear(perform: loadPatient)
    }
    
    private func loadPatient() {
        ApiClient.shared.request(endpoint: "patients/\(patientId)/") {
            (result: Result<PatientResponse, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                if case .success(let p) = result {
                    self.patient = p
                }
            }
        }
    }
}

struct DetailRow: View {
    let title: String
    let value: String
    var valueColor: Color? = nil
    
    var body: some View {
        HStack {
            Text(title)
                .bold()
                .foregroundColor(Theme.appPrimary)
                .frame(width: 100, alignment: .leading)
            Text(value)
                .foregroundColor(valueColor ?? .primary)
            Spacer()
        }
        .padding(.vertical, 5)
    }
}

#Preview {
    NavigationView {
        ViewPatientView(patientId: 1)
    }
}
