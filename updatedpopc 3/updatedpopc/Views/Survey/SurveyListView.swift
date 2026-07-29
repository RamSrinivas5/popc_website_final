import SwiftUI

struct SurveyListView: View {
    @Environment(\.presentationMode) var presentationMode
    
    @State private var searchText = ""
    @State private var allRecords: [RecordsResponse] = []
    
    @State private var selectedSurveyPatientPk: Int?
    @State private var navigateToSurveyDisplay = false
    @State private var navigateToProfile = false
    
    var filteredRecords: [RecordsResponse] {
        if searchText.isEmpty {
            return allRecords
        } else {
            return allRecords.filter { record in
                let nameMatches = record.name?.lowercased().contains(searchText.lowercased()) ?? false
                let idMatches = record.id?.lowercased().contains(searchText.lowercased()) ?? false
                return nameMatches || idMatches
            }
        }
    }
    
    var body: some View {
        VStack {
            // Header
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.20, green: 0.27, blue: 0.80),
                    Color(red: 0.09, green: 0.73, blue: 0.71)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .overlay(
                HStack {
                    Button(action: {
                        NotificationCenter.default.post(name: NSNotification.Name("GoHomeNotification"), object: nil)
                    }) {
                        Image(systemName: "chevron.left")
                            .font(.title3.bold())
                            .foregroundColor(.white)
                            .padding()
                            .background(Circle().fill(Color.white.opacity(0.2)))
                    }
                    
                    Text("SURVEY RECORDS")
                        .font(.title2)
                        .bold()
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: {
                        navigateToProfile = true
                    }) {
                        DoctorProfileIconView(size: 40, iconColor: .white)
                    }
                }
                .padding()
            )
            .frame(height: 110)
            
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
            
            // Survey List
            List(filteredRecords, id: \.pk) { record in
                RecordRow(record: record)
                    .onTapGesture {
                        self.selectedSurveyPatientPk = record.pk
                        self.navigateToSurveyDisplay = true
                    }
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(top: 5, leading: 15, bottom: 5, trailing: 15))
            }
            .listStyle(PlainListStyle())
        }
        .popupAppear()
        .animatedBackground()
        .navigationBarHidden(true)
        .onAppear(perform: loadSurveys)
        .background(
            Group {
                if let pk = selectedSurveyPatientPk {
                    NavigationLink(destination: SurveyDisplayView(patientPk: pk), isActive: $navigateToSurveyDisplay) { EmptyView() }
                }
                if #available(iOS 16.0, *) {
                    NavigationLink(destination: ProfileView(), isActive: $navigateToProfile) { EmptyView() }
                } else {
                    // Fallback on earlier versions
                }
            }
        )
    }
    
    private func loadSurveys() {
        ApiClient.shared.request(endpoint: "api/surveys/completed/") { (result: Result<[RecordsResponse], Error>) in
            DispatchQueue.main.async {
                switch result {
                case .success(let records):
                    self.allRecords = records
                    
                    // Pre-fetch scores to correct risk levels dynamically
                    let group = DispatchGroup()
                    let lock = NSLock()
                    var updatedRecords = records
                    
                    for i in 0..<records.count {
                        let record = records[i]
                        group.enter()
                        ApiClient.shared.request(endpoint: "api/surveys/patient/\(record.pk)/") { (detailResult: Result<SurveyDisplayResponse, Error>) in
                            lock.lock()
                            if case .success(let survey) = detailResult, let score = survey.totalScore {
                                var updated = record
                                if score <= 30 {
                                    updated.riskLevel = "Low"
                                } else if score <= 45 {
                                    updated.riskLevel = "Moderate"
                                } else if score <= 60 {
                                    updated.riskLevel = "High"
                                } else {
                                    updated.riskLevel = "Very High"
                                }
                                updatedRecords[i] = updated
                            }
                            lock.unlock()
                            group.leave()
                        }
                    }
                    
                    group.notify(queue: .main) {
                        self.allRecords = updatedRecords
                    }
                case .failure:
                    break
                }
            }
        }
    }
}

struct RecordRow: View {
    let record: RecordsResponse
    
    var body: some View {
        HStack {
            if let photo = record.photoUrl, !photo.isEmpty {
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
                Text(record.name ?? "Unknown")
                    .font(.headline)
                    .foregroundColor(.primary)
                HStack(spacing: 5) {
                    Text("ID: \(record.id ?? "") | Risk:")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Text(record.riskLevel ?? "N/A")
                        .font(.subheadline.bold())
                        .foregroundColor(Theme.color(forRiskStatus: record.riskLevel))
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
        SurveyListView()
    }
}
