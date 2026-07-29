import SwiftUI

struct PendingSurveysView: View {
    @Environment(\.presentationMode) var presentationMode
    
    @State private var searchText = ""
    @State private var patientList: [PendingPatient] = .init()
    @State private var isLoading = true
    @State private var navigateToEditSurvey = false
    @State private var selectedPatientPk: Int?
    
    var filteredList: [PendingPatient] {
        if searchText.isEmpty {
            return patientList
        } else {
            return patientList.filter { patient in
                let nameMatches = patient.name?.localizedCaseInsensitiveContains(searchText) ?? false
                let idMatches = patient.id?.localizedCaseInsensitiveContains(searchText) ?? false
                return nameMatches || idMatches
            }
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: { presentationMode.wrappedValue.dismiss() }) {
                    Image(systemName: "chevron.left")
                        .font(.title3.bold())
                        .foregroundColor(Theme.appPrimary)
                        .padding()
                        .background(Theme.appPrimary.opacity(0.12))
                        .clipShape(Circle())
                }
                Text("Pending Surveys")
                    .font(.title2)
                    .bold()
                Spacer()
                
                if #available(iOS 16.0, *) {
                    NavigationLink(destination: ProfileView()) {
                        DoctorProfileIconView(size: 30, iconColor: .blue)
                    }
                } else {
                    // Fallback on earlier versions
                }
            }
            .padding()
            
            // Search Bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                TextField("Search pending patients...", text: $searchText)
            }
            .padding()
            .background(Theme.cardBackground)
            .cornerRadius(10)
            .padding(.horizontal)
            .padding(.bottom, 10)
            
            if isLoading {
                ProgressView("Loading Pending Surveys...")
                    .frame(maxHeight: .infinity)
            } else if filteredList.isEmpty {
                Text("No pending surveys found.")
                    .foregroundColor(.gray)
                    .frame(maxHeight: .infinity)
            } else {
                List(filteredList, id: \.identifiableId) { patient in
                    HStack(spacing: 0) {
                        NavigationLink(destination: SurveyDisplayView(patientPk: patient.pk)) {
                            HStack(spacing: 15) {
                                if let photoUrl = patient.photoUrl, let url = URL(string: photoUrl) {
                                    AsyncImage(url: url) { image in
                                        image.resizable().scaledToFill()
                                    } placeholder: {
                                    Image(systemName: "person.crop.circle.fill")
                                        .resizable()
                                        .symbolRenderingMode(.hierarchical)
                                        .foregroundColor(.gray)
                                }
                                .frame(width: 50, height: 50)
                                .clipShape(Circle())
                            } else {
                                Image(systemName: "person.crop.circle.fill")
                                    .resizable()
                                    .symbolRenderingMode(.hierarchical)
                                    .foregroundColor(.gray)
                                    .frame(width: 50, height: 50)
                            }
                                
                                VStack(alignment: .leading, spacing: 5) {
                                Text(patient.name ?? "Unknown Name")
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                Text("ID: \(patient.id ?? "N/A")")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                
                                let statusColor = Theme.color(forSurveyStatus: patient.status)
                                Text("Status: \(patient.status ?? "Pending")")
                                        .font(.caption.bold())
                                        .foregroundColor(statusColor)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(statusColor.opacity(0.15))
                                        .cornerRadius(8)
                                }
                                Spacer()
                            }
                            .padding(.vertical, 5)
                        }
                        
                        Button(action: {
                            self.selectedPatientPk = patient.pk
                            self.navigateToEditSurvey = true
                        }) {
                            Image(systemName: "pencil.circle.fill")
                                .resizable()
                                .frame(width: 32, height: 32)
                                .foregroundColor(.blue)
                                .padding(.leading, 10)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .listStyle(PlainListStyle())
            }
        }
        .popupAppear()
        .animatedBackground()
        .navigationBarHidden(true)
        .onAppear(perform: loadPendingPatients)
        .background(
            Group {
                if let pk = selectedPatientPk {
                    NavigationLink(destination: PatientDemographicsView(patientId: pk), isActive: $navigateToEditSurvey) {
                        EmptyView()
                    }
                }
            }
        )
    }
    
    private func loadPendingPatients() {
        ApiClient.shared.request(endpoint: "api/surveys/not-completed/", method: "GET") { (result: Result<[PendingPatient], Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let patients):
                    self.patientList = patients
                case .failure(let error):
                    print("Failed to load pending surveys: \(error.localizedDescription)")
                }
            }
        }
    }
}

#Preview {
    NavigationView {
        PendingSurveysView()
    }
}
