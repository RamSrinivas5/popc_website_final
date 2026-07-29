import SwiftUI

struct ResetPasswordView: View {
    let identifier: String
    let otp: String
    
    @Environment(\.presentationMode) var presentationMode
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var isNewPasswordVisible = false
    @State private var isConfirmPasswordVisible = false
    @State private var isSubmitting = false
    @State private var navigateToLogin = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var showSuccess = false
    
    var isResetEnabled: Bool {
        !newPassword.isEmpty && newPassword == confirmPassword && !isSubmitting
    }
    
    var body: some View {
        ZStack {
            Theme.backgroundGradient
                .edgesIgnoringSafeArea(.all)
            
            ScrollView {
                VStack(spacing: 30) {
                    // Header
                    HStack {
                        Button(action: { presentationMode.wrappedValue.dismiss() }) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(Theme.appPrimary)
                        }
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top, 20)
                    
                    VStack(spacing: 15) {
                        Image(systemName: "key.viewfinder")
                            .font(.system(size: 70))
                            .foregroundStyle(Theme.primaryGradient)
                            .padding(.bottom, 10)
                        
                        Text("Create New Password")
                            .font(.system(.largeTitle, design: .rounded).weight(.bold))
                            .foregroundColor(Theme.appPrimary)
                        
                        Text("Your identity has been verified. Please choose a strong new password for your account.")
                            .font(.system(size: 16))
                            .foregroundColor(Theme.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)
                    }
                    
                    VStack(spacing: 20) {
                        // New Password
                        VStack(alignment: .leading, spacing: 8) {
                            Text("New Password")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(Theme.appPrimary)
                                .padding(.leading, 4)
                            
                            HStack {
                                Image(systemName: "lock.fill")
                                    .foregroundColor(Theme.appPrimary)
                                if isNewPasswordVisible {
                                    TextField("Strong Password", text: $newPassword)
                                } else {
                                    SecureField("Strong Password", text: $newPassword)
                                }
                                Button(action: { isNewPasswordVisible.toggle() }) {
                                    Image(systemName: isNewPasswordVisible ? "eye.slash.fill" : "eye.fill")
                                        .foregroundColor(.secondary)
                                }
                            }
                            .professionalTextFieldStyle()
                            
                            PasswordStrengthView(password: newPassword)
                                .padding(.top, 5)
                        }
                        
                        // Confirm Password
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Confirm Password")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(Theme.appPrimary)
                                .padding(.leading, 4)
                            
                            HStack {
                                Image(systemName: "checkmark.shield.fill")
                                    .foregroundColor(Theme.appPrimary)
                                if isConfirmPasswordVisible {
                                    TextField("Re-enter Password", text: $confirmPassword)
                                } else {
                                    SecureField("Re-enter Password", text: $confirmPassword)
                                }
                                Button(action: { isConfirmPasswordVisible.toggle() }) {
                                    Image(systemName: isConfirmPasswordVisible ? "eye.slash.fill" : "eye.fill")
                                        .foregroundColor(.secondary)
                                }
                            }
                            .professionalTextFieldStyle()
                        }
                    }
                    .padding(.horizontal, 24)
                    
                    // Reset Button
                    Button(action: resetPassword) {
                        if isSubmitting {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .frame(maxWidth: .infinity, minHeight: 54)
                        } else {
                            Text("RESET PASSWORD")
                                .font(.system(.headline, design: .rounded).weight(.bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity, minHeight: 54)
                        }
                    }
                    .background(
                        RoundedRectangle(cornerRadius: 15, style: .continuous)
                            .fill(Theme.primaryGradient)
                    )
                    .opacity(isResetEnabled ? 1.0 : 0.6)
                    .disabled(!isResetEnabled)
                    .shadow(color: Theme.appPrimary.opacity(0.3), radius: 8, x: 0, y: 4)
                    .padding(.horizontal, 24)
                    .padding(.top, 10)
                    
                    Spacer()
                    
                    NavigationLink(destination: LoginView(), isActive: $navigateToLogin) {
                        EmptyView()
                    }
                }
            }
        }
        .navigationBarHidden(true)
        .popupAppear()
        .alert(isPresented: $showError) {
            Alert(title: Text("Update Failed"), message: Text(errorMessage), dismissButton: .default(Text("OK")))
        }
        .alert(isPresented: $showSuccess) {
            Alert(title: Text("Success"), message: Text("Your password has been reset successfully. You can now login with your new credentials."), dismissButton: .default(Text("Continue to Login"), action: {
                self.navigateToLogin = true
            }))
        }
    }
    
    private func resetPassword() {
        guard newPassword == confirmPassword else { return }
        
        isSubmitting = true
        let body: [String: String] = [
            "identifier": identifier,
            "otp": otp,
            "new_password": newPassword
        ]
        guard let data = try? JSONEncoder().encode(body) else {
            isSubmitting = false
            return
        }
        
        ApiClient.shared.request(
            endpoint: "accounts/reset-password/",
            method: "POST",
            body: data,
            requiresAuth: false
        ) { (result: Result<Data, Error>) in
            DispatchQueue.main.async {
                self.isSubmitting = false
                switch result {
                case .success:
                    self.showSuccess = true
                case .failure(let error):
                    self.errorMessage = "Failed to reset password: \(error.localizedDescription)"
                    self.showError = true
                }
            }
        }
    }
}
