import SwiftUI

struct DeletePatientView: View {
    let mode: String
    
    @Environment(\.presentationMode) var presentationMode
    
    @State private var searchText = ""
    @State private var allPatients: [PatientResponse] = []
    
    @State private var patientToDelete: PatientResponse?
    @State private var showDeleteConfirmation = false
    
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
                
                Text("DELETE PATIENT")
                    .font(.system(.title2, design: .rounded).bold())
                    .foregroundColor(.white)
                
                Spacer()
                
                Button(action: {
                    // Navigate to Profile
                }) {
                    DoctorProfileIconView(size: 40, iconColor: .white.opacity(0.85))
                }
            }
            .padding()
            .background(Theme.primaryGradient)
            
            // Search Bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(Theme.appPrimary)
                TextField("Search by Name or ID...", text: $searchText)
            }
            .padding(.vertical, 12)
            .padding(.horizontal)
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 15, style: .continuous))
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
            .padding(.horizontal)
            
            // Patient List
            List(filteredPatients) { patient in
                HStack {
                    PatientRow(patient: patient)
                    
                    Spacer()
                    
                    Button(action: {
                        patientToDelete = patient
                        showDeleteConfirmation = true
                    }) {
                        Image(systemName: "trash.fill")
                            .foregroundColor(.red)
                            .padding()
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
        .alert(isPresented: $showDeleteConfirmation) {
            Alert(
                title: Text("Confirm Deletion"),
                message: Text("Are you sure you want to delete \(patientToDelete?.name ?? "this patient")?"),
                primaryButton: .destructive(Text("Delete")) {
                    if let patient = patientToDelete {
                        deletePatient(patient)
                    }
                },
                secondaryButton: .cancel()
            )
        }
    }
    
    private func loadPatients() {
        ApiClient.shared.request(endpoint: "patients/") {
            (result: Result<[PatientResponse], Error>) in
            DispatchQueue.main.async {
                if case .success(let patients) = result {
                    self.allPatients = patients
                }
            }
        }
    }
    
    private func deletePatient(_ patient: PatientResponse) {
        ApiClient.shared.request(
            endpoint: "patients/\(patient.id)/delete/",
            method: "DELETE"
        ) { (result: Result<Data, Error>) in
            DispatchQueue.main.async {
                if case .success = result {
                    self.allPatients.removeAll { $0.id == patient.id }
                }
            }
        }
    }
}

#Preview {
    NavigationView {
        DeletePatientView(mode: "Delete")
    }
}
