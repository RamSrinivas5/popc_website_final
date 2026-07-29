import SwiftUI

struct LoginView: View {
    @State private var username = ""
    @State private var password = ""
    @State private var isPasswordVisible = false
    @State private var usernameError = ""
    @State private var passwordError = ""
    @State private var navigateToRegister = false
    @State private var navigateToForgotPassword = false
    @State private var navigateToOtp = false
    @State private var forgotIdentifier = ""
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isRequestRunning = false
    
    // REDESIGN: Interactive Focus states and BG animation states
    @State private var isUsernameEditing = false
    @State private var isPasswordEditing = false
    @State private var animateGlowSpheres = false
    
    var isLoginEnabled: Bool {
        !username.isEmpty && !password.isEmpty
    }
    
    var body: some View {
        ZStack {
            // REDESIGN: Premium Floating Glow Spheres in the background
            ZStack {
                Circle()
                    .fill(Theme.appTeal.opacity(0.18))
                    .frame(width: 260, height: 260)
                    .blur(radius: 40)
                    .offset(x: animateGlowSpheres ? -90 : -50, y: animateGlowSpheres ? -120 : -160)
                
                Circle()
                    .fill(Theme.appPrimary.opacity(0.12))
                    .frame(width: 320, height: 320)
                    .blur(radius: 50)
                    .offset(x: animateGlowSpheres ? 90 : 50, y: animateGlowSpheres ? 140 : 90)
            }
            .ignoresSafeArea()
            .onAppear {
                withAnimation(Animation.easeInOut(duration: 8.0).repeatForever(autoreverses: true)) {
                    animateGlowSpheres = true
                }
            }
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 25) {
                    // REDESIGN: Beautiful Multi-layered Medical Brand Mark
                    VStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        gradient: Gradient(colors: [Theme.appPrimary.opacity(0.15), Theme.appTeal.opacity(0.08)]),
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 130, height: 130)
                                .overlay(
                                    Circle()
                                        .stroke(Theme.primaryGradient.opacity(0.25), lineWidth: 1.5)
                                )
                                .shadow(color: Theme.appPrimary.opacity(0.08), radius: 10, x: 0, y: 5)
                            
                            Circle()
                                .fill(Theme.primaryGradient)
                                .frame(width: 90, height: 90)
                                .shadow(color: Theme.appPrimary.opacity(0.35), radius: 15, x: 0, y: 8)
                            
                            Image(systemName: "cross.case.fill")
                                .font(.system(size: 40, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        .padding(.top, 40)
                        
                        VStack(spacing: 6) {
                            Text("Welcome Back")
                                .font(.system(size: 32, weight: .bold, design: .rounded))
                                .foregroundColor(Theme.appPrimary)
                            
                            Text("Secure Access for Medical Professionals")
                                .font(.system(.subheadline, design: .rounded))
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    // REDESIGN: Premium Card with active glow inputs
                    VStack(spacing: 20) {
                        Text("Doctor Login")
                            .font(.system(.headline, design: .rounded).weight(.bold))
                            .foregroundColor(Theme.appPrimary)
                            .padding(.top, 5)
                        
                        VStack(alignment: .leading, spacing: 15) {
                            UsernameInputView(username: $username, isUsernameEditing: $isUsernameEditing)
                            
                            if !usernameError.isEmpty {
                                ErrorText(text: usernameError)
                            }
                            
                            PasswordInputView(
                                password: $password,
                                isPasswordVisible: $isPasswordVisible,
                                isPasswordEditing: $isPasswordEditing,
                                isUsernameEditing: $isUsernameEditing
                            )
                            
                            if !passwordError.isEmpty {
                                ErrorText(text: passwordError)
                            }
                        }
                        
                        // REDESIGN: Pulsing scale-on-tap Login Button
                        LoginButtonView(
                            isEnabled: isLoginEnabled,
                            isRunning: isRequestRunning,
                            action: loginDoctor
                        )
                        .padding(.top, 10)
                    }
                    .padding(25)
                    .background(
                        RoundedRectangle(cornerRadius: 30, style: .continuous)
                            .fill(Color.white.opacity(0.65))
                            .background(Blur(style: .systemThinMaterialLight))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 30, style: .continuous)
                            .stroke(Color.white.opacity(0.6), lineWidth: 1.5)
                    )
                    .shadow(color: Color.black.opacity(0.04), radius: 25, x: 0, y: 12)
                    .padding(.horizontal, 24)
                    
                    // REDESIGN: Polished spacing for links
                    VStack(spacing: 16) {
                        HStack {
                            Text("Don't have an account?")
                                .foregroundColor(.secondary)
                            Button(action: { navigateToRegister = true }) {
                                Text("REGISTER")
                                    .fontWeight(.bold)
                                    .foregroundColor(Theme.appPrimary)
                            }
                        }
                        .font(.system(.subheadline, design: .rounded))
                        
                        Button(action: { navigateToForgotPassword = true }) {
                            Text("Forgot Password?")
                                .font(.system(.subheadline, design: .rounded).weight(.semibold))
                                .foregroundColor(Theme.appPrimary)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 8)
                                .background(Theme.appPrimary.opacity(0.06))
                                .cornerRadius(12)
                        }
                        .buttonStyle(ScaleButtonStyle())
                    }
                    
                    Spacer(minLength: 20)
                    
                    // Disclaimer
                    VStack(spacing: 6) {
                        HStack(spacing: 5) {
                            Image(systemName: "shield.checkered")
                            Text("Authorized Medical Personnel Only")
                                .fontWeight(.bold)
                        }
                        .font(.system(size: 11, design: .rounded))
                        
                        Text("This platform handles sensitive patient data securely in accordance with medical healthcare standards.")
                            .font(.system(size: 10, design: .rounded))
                            .multilineTextAlignment(.center)
                            .opacity(0.6)
                    }
                    .foregroundColor(Theme.appPrimary)
                    .padding(.horizontal, 40)
                    .padding(.bottom, 20)
                }
            }
        }
        .animatedBackground()
        .navigationBarHidden(true)
        .onTapGesture {
            // Dismiss keyboard and focus on background tap
            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
            withAnimation(.easeOut(duration: 0.2)) {
                isUsernameEditing = false
                isPasswordEditing = false
            }
        }
        .background(
            Group {
                NavigationLink(destination: RegisterView(), isActive: $navigateToRegister) { EmptyView() }
                NavigationLink(destination: ForgotPasswordView(), isActive: $navigateToForgotPassword) { EmptyView() }
                NavigationLink(destination: OtpVerifyView(identifier: forgotIdentifier), isActive: $navigateToOtp) { EmptyView() }
            }
        )
        .alert(isPresented: $showError) {
            Alert(title: Text("Access Denied"), message: Text(errorMessage), dismissButton: .default(Text("OK")))
        }
    }
    
    private func loginDoctor() {
        usernameError = ""
        passwordError = ""
        var isValid = true
        let trimmedUsername = username.trimmingCharacters(in: .whitespaces)
        
        if trimmedUsername.isEmpty {
            usernameError = "Username is required"
            isValid = false
        }
        
        if password.isEmpty {
            passwordError = "Password is required"
            isValid = false
        }
        
        guard isValid else { return }
        
        isRequestRunning = true
        let body: [String: String] = [
            "username": trimmedUsername,
            "password": password
        ]
        
        guard let requestBody = try? JSONEncoder().encode(body) else {
            isRequestRunning = false
            return
        }
        
        ApiClient.shared.request(
            endpoint: "accounts/login/",
            method: "POST",
            body: requestBody,
            requiresAuth: false
        ) { (result: Result<LoginResponse, Error>) in
            DispatchQueue.main.async {
                self.isRequestRunning = false
                switch result {
                case .success(let response):
                    if let token = response.token, let doctorId = response.doctorId {
                        SharedPrefManager.shared.saveLoginData(
                            token: token,
                            doctorId: doctorId,
                            username: response.username ?? self.username
                        )
                    } else {
                        self.errorMessage = "Session could not be established."
                        self.showError = true
                    }
                case .failure:
                    self.errorMessage = "Invalid credentials. Please try again."
                    self.showError = true
                }
            }
        }
    }
}

// REDESIGN: Dynamic Scale Button Style for micro-animations
struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}

// Blur Effect Helper
struct Blur: UIViewRepresentable {
    var style: UIBlurEffect.Style = .systemMaterial
    func makeUIView(context: Context) -> UIVisualEffectView {
        return UIVisualEffectView(effect: UIBlurEffect(style: style))
    }
    func updateUIView(_ uiView: UIVisualEffectView, context: Context) {
        uiView.effect = UIBlurEffect(style: style)
    }
}

#Preview {
    NavigationView {
        LoginView()
    }
}

// REDESIGN: Username Input component to avoid compiler complexity
struct UsernameInputView: View {
    @Binding var username: String
    @Binding var isUsernameEditing: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "person.fill")
                .foregroundColor(isUsernameEditing ? Theme.appPrimary : .gray.opacity(0.6))
                .font(.system(size: 16, weight: .medium))
                .frame(width: 20)
            
            TextField("Username", text: $username, onEditingChanged: { editing in
                withAnimation(.easeOut(duration: 0.2)) {
                    self.isUsernameEditing = editing
                }
            })
            .autocapitalization(.none)
            .font(.body)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color.white)
                .shadow(color: isUsernameEditing ? Theme.appPrimary.opacity(0.12) : Theme.appPrimary.opacity(0.03), radius: 6, x: 0, y: 3)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(isUsernameEditing ? Theme.appPrimary : Theme.appPrimary.opacity(0.18), lineWidth: isUsernameEditing ? 2 : 1.2)
        )
        .scaleEffect(isUsernameEditing ? 1.015 : 1.0)
    }
}

// REDESIGN: Password Input component to avoid compiler complexity
struct PasswordInputView: View {
    @Binding var password: String
    @Binding var isPasswordVisible: Bool
    @Binding var isPasswordEditing: Bool
    @Binding var isUsernameEditing: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "lock.fill")
                .foregroundColor(isPasswordEditing ? Theme.appPrimary : .gray.opacity(0.6))
                .font(.system(size: 16, weight: .medium))
                .frame(width: 20)
            
            Group {
                if isPasswordVisible {
                    TextField("Password", text: $password, onEditingChanged: { editing in
                        withAnimation(.easeOut(duration: 0.2)) {
                            self.isPasswordEditing = editing
                        }
                    })
                } else {
                    SecureField("Password", text: $password)
                        .onTapGesture {
                            withAnimation(.easeOut(duration: 0.2)) {
                                self.isPasswordEditing = true
                                self.isUsernameEditing = false
                            }
                        }
                }
            }
            .autocapitalization(.none)
            .font(.body)
            
            Button(action: { isPasswordVisible.toggle() }) {
                Image(systemName: isPasswordVisible ? "eye.slash.fill" : "eye.fill")
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color.white)
                .shadow(color: isPasswordEditing ? Theme.appPrimary.opacity(0.12) : Theme.appPrimary.opacity(0.03), radius: 6, x: 0, y: 3)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(isPasswordEditing ? Theme.appPrimary : Theme.appPrimary.opacity(0.18), lineWidth: isPasswordEditing ? 2 : 1.2)
        )
        .scaleEffect(isPasswordEditing ? 1.015 : 1.0)
    }
}

// REDESIGN: Premium Login Button component to avoid compiler complexity
struct LoginButtonView: View {
    var isEnabled: Bool
    var isRunning: Bool
    var action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                if isRunning {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .padding(.trailing, 8)
                }
                Text("LOGIN")
                    .font(.system(.headline, design: .rounded).weight(.bold))
                    .tracking(1.2)
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity, minHeight: 56)
            .background(Theme.primaryGradient)
            .cornerRadius(16)
            .shadow(color: Theme.appPrimary.opacity(0.35), radius: 12, x: 0, y: 6)
        }
        .buttonStyle(ScaleButtonStyle())
        .opacity(isEnabled ? 1.0 : 0.55)
        .disabled(!isEnabled || isRunning)
    }
}

