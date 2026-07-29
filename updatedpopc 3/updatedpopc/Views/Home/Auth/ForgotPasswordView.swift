import SwiftUI

struct ForgotPasswordView: View {
    @Environment(\.presentationMode) var presentationMode
    @State private var identifier = ""
    @State private var isSending = false
    @State private var navigateToOtp = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    var isSendEnabled: Bool {
        !identifier.trimmingCharacters(in: .whitespaces).isEmpty && !isSending
    }
    
    var body: some View {
        ZStack {
            Theme.appBackground
                .edgesIgnoringSafeArea(.all)
            
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
                    Image(systemName: "lock.shield.fill")
                        .font(.system(size: 70))
                        .foregroundStyle(Theme.primaryGradient)
                        .padding(.bottom, 10)
                    
                    Text("Forgot Password?")
                        .font(.system(.largeTitle, design: .rounded).weight(.bold))
                        .foregroundColor(Theme.appPrimary)
                    
                    Text("Enter your username or email address and we'll send you an OTP to reset your password.")
                        .font(.system(size: 16))
                        .foregroundColor(Theme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 20)
                }
                
                // Input Field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Username or Email")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Theme.appPrimary)
                        .padding(.leading, 4)
                    
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .foregroundColor(Theme.appPrimary)
                        TextField("Enter your identifier", text: $identifier)
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                    }
                    .professionalTextFieldStyle()
                }
                .padding(.horizontal, 24)
                
                // Send Button
                Button(action: sendOtp) {
                    if isSending {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(maxWidth: .infinity, minHeight: 54)
                    } else {
                        Text("SEND OTP")
                            .font(.system(.headline, design: .rounded).weight(.bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, minHeight: 54)
                    }
                }
                .background(
                    RoundedRectangle(cornerRadius: 15, style: .continuous)
                        .fill(Theme.primaryGradient)
                )
                .opacity(isSendEnabled ? 1.0 : 0.6)
                .disabled(!isSendEnabled)
                .shadow(color: Theme.appPrimary.opacity(0.3), radius: 8, x: 0, y: 4)
                .padding(.horizontal, 24)
                .padding(.top, 10)
                
                Spacer()
                
                // Navigation
                NavigationLink(destination: OtpVerifyView(identifier: identifier), isActive: $navigateToOtp) {
                    EmptyView()
                }
            }
        }
        .navigationBarHidden(true)
        .popupAppear()
        .alert(isPresented: $showError) {
            Alert(title: Text("Error"), message: Text(errorMessage), dismissButton: .default(Text("OK")))
        }
    }
    
    private func sendOtp() {
        let trimmedIdentifier = identifier.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedIdentifier.isEmpty else { return }
        
        isSending = true
        let body: [String: String] = ["identifier": trimmedIdentifier]
        guard let data = try? JSONEncoder().encode(body) else {
            isSending = false
            return
        }
        
        ApiClient.shared.request(
            endpoint: "accounts/forgot-password/",
            method: "POST",
            body: data,
            requiresAuth: false
        ) { (result: Result<Data, Error>) in
            DispatchQueue.main.async {
                self.isSending = false
                switch result {
                case .success:
                    self.navigateToOtp = true
                case .failure(let error):
                    self.errorMessage = "Could not send OTP. Please check your username/email.\nError: \(error.localizedDescription)"
                    self.showError = true
                }
            }
        }
    }
}
