import SwiftUI

struct HighRiskListView: View {
    @Environment(\.presentationMode) var presentationMode
    
    @State private var searchText = ""
    @State private var patientList: [RecordsResponse] = .init()
    @State private var isLoading = true
    
    var filteredList: [RecordsResponse] {
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
                        .foregroundColor(.white)
                        .padding()
                        .background(Circle().fill(Color.white.opacity(0.2)))
                }
                Text("High Risk Patients")
                    .font(.system(.title2, design: .rounded).bold())
                    .foregroundColor(.white)
                Spacer()
                
                if #available(iOS 16.0, *) {
                    NavigationLink(destination: ProfileView()) {
                        DoctorProfileIconView(size: 30, iconColor: .white.opacity(0.85))
                    }
                } else {
                    // Fallback on earlier versions
                }
            }
            .padding()
            .background(Theme.primaryGradient)
            
            // Search Bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(Theme.appPrimary)
                TextField("Search high-risk patients...", text: $searchText)
            }
            .padding(.vertical, 12)
            .padding(.horizontal)
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 15, style: .continuous))
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
            .padding(.horizontal)
            .padding(.bottom, 10)
            
            if isLoading {
                ProgressView("Loading High Risk Patients...")
                    .frame(maxHeight: .infinity)
            } else if filteredList.isEmpty {
                Text("No high-risk patients found.")
                    .foregroundColor(.gray)
                    .frame(maxHeight: .infinity)
            } else {
                List(filteredList, id: \.identifiableId) { patient in
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
                                    .font(.system(.headline, design: .rounded).bold())
                                    .foregroundColor(Theme.textPrimary)
                                Text("ID: \(patient.id ?? "N/A")")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                
                                Text("High Risk")
                                    .font(.caption)
                                    .bold()
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Theme.categoryRed)
                                    .cornerRadius(8)
                            }
                            Spacer()
                        }
                        .padding()
                        .cardStyle()
                        .padding(.vertical, 5)
                    }
                }
                .listStyle(PlainListStyle())
            }
        }
        .popupAppear()
        .animatedBackground()
        .navigationBarHidden(true)
        .onAppear(perform: loadHighRiskPatients)
    }
    
    private func loadHighRiskPatients() {
        ApiClient.shared.request(endpoint: "api/surveys/high-risk/", method: "GET") { (result: Result<[RecordsResponse], Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let patients):
                    self.patientList = patients
                case .failure(let error):
                    print("Failed to load high risk patients: \(error.localizedDescription)")
                }
            }
        }
    }
}

#Preview {
    NavigationView {
        HighRiskListView()
    }
}
