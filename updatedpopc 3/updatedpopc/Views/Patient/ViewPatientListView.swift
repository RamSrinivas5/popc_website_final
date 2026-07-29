import SwiftUI

struct ViewPatientListView: View {
    let mode: String // "view" or "edit"
    
    @Environment(\.presentationMode) var presentationMode
    
    @State private var searchText = ""
    @State private var allPatients: [PatientResponse] = []
    
    @State private var selectedPatientId: Int?
    @State private var navigateToView = false
    @State private var navigateToEdit = false
    @State private var navigateToProfile = false
    
    // Sharing state
    @State private var showShareSheet = false
    @State private var shareURL: URL?
    @State private var isLoading = false
    
    // Computed property for filtering
    var filteredPatients: [PatientResponse] {
        if searchText.isEmpty {
            return allPatients
        } else {
            return allPatients.filter { patient in
                let nameMatches = patient.name?.lowercased().contains(searchText.lowercased()) ?? false
                let idMatches = patient.patientId?.lowercased().contains(searchText.lowercased()) ?? false
                return nameMatches || idMatches
            }
        }
    }
    
    var body: some View {
        VStack {
            // Header
            HStack {
                Button(action: {
                    presentationMode.wrappedValue.dismiss()
                }) {
                    Image(systemName: "chevron.left")
                        .font(.title3.bold())
                        .foregroundColor(.white)
                        .padding()
                        .background(Circle().fill(Color.white.opacity(0.2)))
                }
                
                Text(mode == "edit" ? "EDIT PATIENT" : "VIEW PATIENTS")
                    .font(.title2)
                    .bold()
                    .foregroundColor(.white)
                
                Spacer()
                

                
                Button(action: {
                    navigateToProfile = true
                }) {
                    DoctorProfileIconView(size: 40, iconColor: .white.opacity(0.85))
                }
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
                    )          )
            
            // Search Bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                TextField("Search by Name or ID...", text: $searchText)
            }
            .padding()
            .background(Theme.cardBackground)
            .cornerRadius(15)
            .padding(.horizontal)
            
            // Patient List
            List(filteredPatients) { patient in
                PatientRow(patient: patient)
                    .onTapGesture {
                        self.selectedPatientId = patient.id
                        if mode == "edit" {
                            navigateToEdit = true
                        } else {
                            navigateToView = true
                        }
                    }
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(top: 5, leading: 15, bottom: 5, trailing: 15))
            }
            .listStyle(PlainListStyle())
            
        }
        .popupAppear()
        .animatedBackground()
        .navigationBarHidden(true)
        .onAppear(perform: loadPatients)
        .background(
            Group {
                if let pid = selectedPatientId {
                    NavigationLink(destination: ViewPatientView(patientId: pid), isActive: $navigateToView) { EmptyView() }
                    NavigationLink(destination: EditPatientView(patientId: pid), isActive: $navigateToEdit) { EmptyView() }
                }
                if #available(iOS 16.0, *) {
                    NavigationLink(destination: ProfileView(), isActive: $navigateToProfile) { EmptyView() }
                } else {
                    // Fallback on earlier versions
                }
            }
        )
        .sheet(isPresented: $showShareSheet) {
            if let url = shareURL {
                ShareSheet(items: [url])
            }
        }

    }
    
    private func loadPatients() {
        ApiClient.shared.request(endpoint: "patients/") { (result: Result<[PatientResponse], Error>) in
            DispatchQueue.main.async {
                switch result {
                case .success(let patients):
                    self.allPatients = patients
                    
                    // Pre-fetch scores for completed patients to correct risk levels dynamically
                    let group = DispatchGroup()
                    let lock = NSLock()
                    var updatedPatients = patients
                    
                    for i in 0..<patients.count {
                        let patient = patients[i]
                        guard patient.surveyStatus?.lowercased() == "completed" else { continue }
                        
                        group.enter()
                        ApiClient.shared.request(endpoint: "api/surveys/patient/\(patient.id)/") { (detailResult: Result<SurveyDisplayResponse, Error>) in
                            lock.lock()
                            if case .success(let survey) = detailResult, let score = survey.totalScore {
                                var updated = patient
                                if score <= 30 {
                                    updated.riskLevel = "Low"
                                } else if score <= 45 {
                                    updated.riskLevel = "Moderate"
                                } else if score <= 60 {
                                    updated.riskLevel = "High"
                                } else {
                                    updated.riskLevel = "Very High"
                                }
                                updatedPatients[i] = updated
                            }
                            lock.unlock()
                            group.leave()
                        }
                    }
                    
                    group.notify(queue: .main) {
                        self.allPatients = updatedPatients
                    }
                case .failure:
                    break
                }
            }
        }
    }
    

}

struct PatientRow: View {
    let patient: PatientResponse
    
    var body: some View {
        HStack {
            if let photo = patient.photoUrl, !photo.isEmpty {
                AsyncImage(url: URL(string: photo)) { phase in
                    if let image = phase.image {
                        image.resizable().scaledToFill()
                    } else {
                        Image(systemName: "person.crop.circle.fill")
                            .symbolRenderingMode(.hierarchical)
                            .foregroundColor(.gray)
                    }
                }
                .frame(width: 50, height: 50)
                .clipShape(Circle())
            } else {
                Image(systemName: "person.crop.circle.fill")
                    .resizable()
                    .symbolRenderingMode(.hierarchical)
                    .frame(width: 50, height: 50)
                    .foregroundColor(.gray)
            }
            
            VStack(alignment: .leading, spacing: 5) {
                HStack {
                    Text(patient.name ?? "Unknown")
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    if let risk = patient.riskLevel, risk != "N/A" {
                        Text(risk)
                            .font(.caption2.bold())
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Theme.color(forRiskStatus: patient.riskLevel))
                            .cornerRadius(4)
                    }
                }
                
                HStack(spacing: 5) {
                    Text("ID: \(patient.patientId ?? "") | Status:")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Text(patient.surveyStatus ?? "Not Started")
                        .font(.subheadline.bold())
                        .foregroundColor(Theme.color(forSurveyStatus: patient.surveyStatus))
                }
            }
            .padding(.leading, 10)
            
            Spacer()
        }
        .padding()
        .cardStyle()
    }
}

#Preview {
    NavigationView {
        ViewPatientListView(mode: "view")
    }
}
