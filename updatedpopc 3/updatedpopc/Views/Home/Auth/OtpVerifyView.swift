import SwiftUI

struct OtpVerifyView: View {
    let identifier: String
    
    @Environment(\.presentationMode) var presentationMode
    @State private var otp: String = ""
    @State private var isVerifying = false
    @State private var navigateToReset = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    var isVerifyEnabled: Bool {
        otp.count == 6 && !isVerifying
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
                    Image(systemName: "envelope.badge.shield.half.filled")
                        .font(.system(size: 70))
                        .foregroundStyle(Theme.primaryGradient)
                        .padding(.bottom, 10)
                    
                    Text("Verify Identity")
                        .font(.system(.largeTitle, design: .rounded).weight(.bold))
                        .foregroundColor(Theme.appPrimary)
                    
                    Text("We've sent a 6-digit verification code to your registered contact details for **\(identifier)**.")
                        .font(.system(size: 16))
                        .foregroundColor(Theme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 20)
                }
                
                // OTP Input
                VStack(spacing: 20) {
                    TextField("Enter 6-digit OTP", text: $otp)
                        .font(.system(size: 24, weight: .bold, design: .monospaced))
                        .multilineTextAlignment(.center)
                        .keyboardType(.numberPad)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 15)
                                .stroke(Theme.appPrimary.opacity(0.5), lineWidth: 2)
                                .background(Theme.appPrimary.opacity(0.05))
                        )
                        .cornerRadius(15)
                        .onChange(of: otp) { newValue in
                            let filtered = newValue.filter { $0.isNumber }
                            otp = String(filtered.prefix(6))
                        }
                }
                .padding(.horizontal, 40)
                
                // Verify Button
                Button(action: verifyOtp) {
                    if isVerifying {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(maxWidth: .infinity, minHeight: 54)
                    } else {
                        Text("VERIFY CODE")
                            .font(.system(.headline, design: .rounded).weight(.bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, minHeight: 54)
                    }
                }
                .background(
                    RoundedRectangle(cornerRadius: 15, style: .continuous)
                        .fill(Theme.primaryGradient)
                )
                .opacity(isVerifyEnabled ? 1.0 : 0.6)
                .disabled(!isVerifyEnabled)
                .shadow(color: Theme.appPrimary.opacity(0.3), radius: 8, x: 0, y: 4)
                .padding(.horizontal, 40)
                
                Button(action: { presentationMode.wrappedValue.dismiss() }) {
                    Text("Didn't receive code? Resend")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Theme.appPrimary)
                }
                .padding(.top, 10)
                
                Spacer()
                
                NavigationLink(destination: ResetPasswordView(identifier: identifier, otp: otp), isActive: $navigateToReset) {
                    EmptyView()
                }
            }
        }
        .navigationBarHidden(true)
        .popupAppear()
        .alert(isPresented: $showError) {
            Alert(title: Text("Verification Failed"), message: Text(errorMessage), dismissButton: .default(Text("OK")))
        }
    }
    
    private func verifyOtp() {
        guard otp.count == 6 else { return }
        
        isVerifying = true
        let body: [String: String] = ["identifier": identifier, "otp": otp]
        guard let data = try? JSONEncoder().encode(body) else {
            isVerifying = false
            return
        }
        
        ApiClient.shared.request(
            endpoint: "accounts/verify-otp/",
            method: "POST",
            body: data,
            requiresAuth: false
        ) { (result: Result<Data, Error>) in
            DispatchQueue.main.async {
                self.isVerifying = false
                switch result {
                case .success:
                    self.navigateToReset = true
                case .failure:
                    self.errorMessage = "Invalid or expired OTP. Please check and try again."
                    self.showError = true
                }
            }
        }
    }
}
