import SwiftUI

struct ChangePasswordView: View {
    @Environment(\.presentationMode) var presentationMode
    @State private var oldPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    
    @State private var isOldPasswordVisible = false
    @State private var isNewPasswordVisible = false
    @State private var isConfirmPasswordVisible = false
    
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
                Text("Change Password")
                    .font(.system(.title2, design: .rounded).bold())
                    .foregroundColor(.white)
                Spacer()
            }
            .padding()
            .background(Theme.primaryGradient)
            
            VStack(spacing: 20) {
                // Old Password
                passwordField(placeholder: "Old Password", text: $oldPassword, isVisible: $isOldPasswordVisible)
                
                // New Password
                VStack(spacing: 0) {
                    passwordField(placeholder: "New Password", text: $newPassword, isVisible: $isNewPasswordVisible)
                    
                    PasswordStrengthView(password: newPassword)
                        .padding(.top, 10)
                        // Make sure the width matches the field width
                        .padding(.horizontal, 5)
                }
                
                // Confirm Password
                passwordField(placeholder: "Confirm Password", text: $confirmPassword, isVisible: $isConfirmPasswordVisible)
                
                if !confirmPassword.isEmpty {
                    HStack {
                        Text(newPassword == confirmPassword ? "Password matched" : "Password does not match")
                            .font(.caption)
                            .foregroundColor(newPassword == confirmPassword ? .green : .red)
                            .padding(.leading, 10)
                        Spacer()
                    }
                }
                
                Button(action: changePassword) {
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
                if alertMessage == "Password changed successfully" {
                    presentationMode.wrappedValue.dismiss()
                }
            })
        }
    }
    
    @ViewBuilder
    private func passwordField(placeholder: String, text: Binding<String>, isVisible: Binding<Bool>) -> some View {
        HStack {
            if isVisible.wrappedValue {
                TextField(placeholder, text: text)
                    .autocapitalization(.none)
                    .textContentType(.oneTimeCode)
            } else {
                SecureField(placeholder, text: text)
                    .autocapitalization(.none)
                    .textContentType(.oneTimeCode)
            }
            
            Button(action: { isVisible.wrappedValue.toggle() }) {
                Image(systemName: isVisible.wrappedValue ? "eye" : "eye.slash")
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Theme.appPrimary.opacity(0.06))
        .cornerRadius(10)
    }
    
    private func changePassword() {
        let oldPass = oldPassword.trimmingCharacters(in: .whitespaces)
        let newPass = newPassword.trimmingCharacters(in: .whitespaces)
        let confirmPass = confirmPassword.trimmingCharacters(in: .whitespaces)
        
        guard !oldPass.isEmpty, !newPass.isEmpty, !confirmPass.isEmpty else {
            alertMessage = "Please fill all fields"
            showAlert = true
            return
        }
        
        guard newPass == confirmPass else {
            alertMessage = "New password and confirm password do not match"
            showAlert = true
            return
        }
        
        isSubmitting = true
        
        let body = [
            "old_password": oldPass,
            "new_password": newPass
        ]
        guard let requestBody = try? JSONEncoder().encode(body) else { return }
        
        ApiClient.shared.request(endpoint: "accounts/change-password/", method: "PUT", body: requestBody) { (result: Result<Data, Error>) in
            DispatchQueue.main.async {
                self.isSubmitting = false
                switch result {
                case .success(_):
                    self.alertMessage = "Password changed successfully"
                    self.showAlert = true
                case .failure(let error):
                    self.alertMessage = "Failed to change password: \(error.localizedDescription)"
                    self.showAlert = true
                }
            }
        }
    }
}

#Preview {
    NavigationView {
        ChangePasswordView()
    }
}
