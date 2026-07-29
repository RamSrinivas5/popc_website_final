import SwiftUI

struct ChangeUsernameView: View {
    @Environment(\.presentationMode) var presentationMode
    @State private var newUsername: String = ""
    @State private var isSubmitting = false
    @State private var showAlert = false
    @State private var alertMessage = ""
    
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
                Text("Change Username")
                    .font(.system(.title2, design: .rounded).bold())
                    .foregroundColor(.white)
                Spacer()
            }
            .padding()
            .background(Theme.primaryGradient)
            
            VStack(spacing: 30) {
                TextField("New Username", text: $newUsername)
                    .professionalTextFieldStyle()
                
                Button(action: saveUsername) {
                    if isSubmitting {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(maxWidth: .infinity, minHeight: 44)
                    } else {
                        Text("Save")
                            .font(.system(.headline, design: .rounded).weight(.bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, minHeight: 44)
                    }
                }
                .background(
                    RoundedRectangle(cornerRadius: 15, style: .continuous)
                        .fill(Theme.primaryGradient)
                )
                .opacity(isSubmitting ? 0.6 : 1.0)
                .disabled(isSubmitting)
                .shadow(color: Theme.appPrimary.opacity(0.3), radius: 6, x: 0, y: 3)
                
                Spacer()
            }
            .padding()
        }
        .popupAppear()
        .animatedBackground()
        .navigationBarHidden(true)
        .alert(isPresented: $showAlert) {
            Alert(title: Text("Message"), message: Text(alertMessage), dismissButton: .default(Text("OK")) {
                if alertMessage == "Username updated successfully" {
                    presentationMode.wrappedValue.dismiss()
                }
            })
        }
    }
    
    private func saveUsername() {
        let username = newUsername.trimmingCharacters(in: .whitespaces)
        guard !username.isEmpty else {
            alertMessage = "Enter new username"
            showAlert = true
            return
        }
        
        isSubmitting = true
        
        guard let _ = SharedPrefManager.shared.getToken() else {
            isSubmitting = false
            return
        }
        
        let body = ["username": username]
        guard let requestBody = try? JSONEncoder().encode(body) else { return }
        
        ApiClient.shared.request(endpoint: "accounts/change-username/", method: "PUT", body: requestBody) { (result: Result<Data, Error>) in
            DispatchQueue.main.async {
                self.isSubmitting = false
                switch result {
                case .success(_):
                    self.alertMessage = "Username updated successfully"
                    self.showAlert = true
                case .failure(let error):
                    self.alertMessage = "Failed to update username: \(error.localizedDescription)"
                    self.showAlert = true
                }
            }
        }
    }
}

#Preview {
    NavigationView {
        ChangeUsernameView()
    }
}
