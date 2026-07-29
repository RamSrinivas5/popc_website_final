import SwiftUI

struct RegisterView: View {
    @State private var doctorId = ""
    @State private var name = ""
    @State private var phone = ""
    @State private var email = ""
    @State private var age = ""
    @State private var username = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var isPasswordVisible = false
    @State private var isConfirmPasswordVisible = false

    @State private var doctorIdError = ""
    @State private var nameError = ""
    @State private var phoneError = ""
    @State private var emailError = ""
    @State private var ageError = ""
    @State private var usernameError = ""
    @State private var passwordError = ""
    @State private var confirmPasswordError = ""
    
    @State private var gender = "Male"
    let genders = ["Male", "Female", "Other"]
    
    @State private var specialization = "Anesthesia"
    let specializations = ["Anesthesia", "Surgery", "Cardiology", "Neurology", "Orthopedics", "General", "Others"]
    
    @State private var isRegistering = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var navigateToLogin = false

    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        ScrollView {
            VStack(spacing: 25) {
                // Header
                VStack(spacing: 8) {
                    Text("Join POPC")
                        .font(.system(size: 34, weight: .bold, design: .rounded))
                        .foregroundColor(Theme.appPrimary)
                    
                    Text("Create your professional account")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 30)
                
                // Professional Section
                VStack(alignment: .leading, spacing: 15) {
                    SectionHeader(title: "Professional Identity", icon: "briefcase.fill")
                    
                    TextField("Doctor ID", text: $doctorId)
                        .premiumTextFieldStyle(icon: "number.square")
                        .onChange(of: doctorId) { newValue in
                            let filtered = newValue.filter { $0.isLetter || $0.isNumber }
                            if newValue != filtered {
                                doctorId = filtered
                                errorMessage = "Special characters and spaces are not allowed in Doctor ID."
                                showError = true
                            } else {
                                doctorId = filtered
                            }
                        }
                    
                    if !doctorIdError.isEmpty { ErrorText(text: doctorIdError) }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Specialization")
                            .font(.caption).bold()
                            .foregroundColor(.secondary)
                            .padding(.leading, 5)
                        
                        Picker("Specialization", selection: $specialization) {
                            ForEach(specializations, id: \.self) { Text($0) }
                        }
                        .pickerStyle(MenuPickerStyle())
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.white)
                        .cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.appPrimary.opacity(0.15), lineWidth: 1))
                    }
                }
                .padding()
                .background(Color.white.opacity(0.5))
                .cornerRadius(20)
                .padding(.horizontal)
                
                // Personal Section
                VStack(alignment: .leading, spacing: 15) {
                    SectionHeader(title: "Personal Profile", icon: "person.fill")
                    
                    TextField("Full Name", text: $name)
                        .premiumTextFieldStyle(icon: "person.text.rectangle")
                        .onChange(of: name) { newValue in
                            let filtered = newValue.filter { $0.isLetter || $0 == " " || $0 == "." }
                            if newValue != filtered {
                                name = filtered
                                errorMessage = "Special characters and numbers are not allowed in Name."
                                showError = true
                            } else {
                                name = filtered
                            }
                        }
                    if !nameError.isEmpty { ErrorText(text: nameError) }
                    
                    TextField("Phone Number", text: $phone)
                        .keyboardType(.phonePad)
                        .premiumTextFieldStyle(icon: "phone.fill")
                        .onChange(of: phone) { newValue in
                            var filtered = String(newValue.filter { $0.isNumber }.prefix(10))
                            
                            if let first = filtered.first, !("6"..."9").contains(first) {
                                errorMessage = "Mobile number must start with 6, 7, 8, or 9."
                                showError = true
                                while let f = filtered.first, !("6"..."9").contains(f) {
                                    filtered = String(filtered.dropFirst())
                                }
                            }
                            
                            if phone != filtered {
                                phone = filtered
                            }
                        }
                    if !phoneError.isEmpty { ErrorText(text: phoneError) }
                    
                    TextField("Email Address", text: $email)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .premiumTextFieldStyle(icon: "envelope.fill")
                    if !emailError.isEmpty { ErrorText(text: emailError) }
                    
                    HStack(spacing: 15) {
                        TextField("Age", text: $age)
                            .keyboardType(.numberPad)
                            .premiumTextFieldStyle(icon: "calendar")
                            .frame(width: 120)
                            .onChange(of: age) { newValue in
                                let filtered = String(newValue.filter { $0.isNumber }.prefix(3))
                                if newValue != filtered {
                                    age = filtered
                                    if newValue.contains(where: { !$0.isNumber }) {
                                        errorMessage = "Special characters and text are not allowed in Age."
                                        showError = true
                                    }
                                } else if let ageVal = Int(filtered), ageVal > 120 {
                                    age = String(filtered.dropLast())
                                    errorMessage = "Age cannot exceed 120."
                                    showError = true
                                } else {
                                    age = filtered
                                }
                            }
                        
                        Picker("Gender", selection: $gender) {
                            ForEach(genders, id: \.self) { Text($0) }
                        }
                        .pickerStyle(SegmentedPickerStyle())
                    }
                    if !ageError.isEmpty { ErrorText(text: ageError) }
                }
                .padding()
                .background(Color.white.opacity(0.5))
                .cornerRadius(20)
                .padding(.horizontal)
                
                // Security Section
                VStack(alignment: .leading, spacing: 15) {
                    SectionHeader(title: "Account Security", icon: "lock.shield.fill")
                    
                    TextField("Username", text: $username)
                        .autocapitalization(.none)
                        .premiumTextFieldStyle(icon: "at")
                    if !usernameError.isEmpty { ErrorText(text: usernameError) }
                    
                    HStack {
                        if isPasswordVisible {
                            TextField("Password", text: $password)
                        } else {
                            SecureField("Password", text: $password)
                        }
                        Button(action: { isPasswordVisible.toggle() }) {
                            Image(systemName: isPasswordVisible ? "eye" : "eye.slash")
                                .foregroundColor(.secondary)
                        }
                    }
                    .premiumTextFieldStyle(icon: "key.fill")
                    
                    PasswordStrengthView(password: password)
                    
                    if !passwordError.isEmpty { ErrorText(text: passwordError) }
                    
                    HStack {
                        if isConfirmPasswordVisible {
                            TextField("Confirm Password", text: $confirmPassword)
                        } else {
                            SecureField("Confirm Password", text: $confirmPassword)
                        }
                        Button(action: { isConfirmPasswordVisible.toggle() }) {
                            Image(systemName: isConfirmPasswordVisible ? "eye" : "eye.slash")
                                .foregroundColor(.secondary)
                        }
                    }
                    .premiumTextFieldStyle(icon: "checkmark.shield.fill")
                    
                    if !confirmPassword.isEmpty {
                        Text(password == confirmPassword ? "Passwords match" : "Passwords do not match")
                            .font(.caption)
                            .foregroundColor(password == confirmPassword ? .green : .red)
                            .padding(.leading, 5)
                    } else if !confirmPasswordError.isEmpty {
                        ErrorText(text: confirmPasswordError)
                    }
                }
                .padding()
                .background(Color.white.opacity(0.5))
                .cornerRadius(20)
                .padding(.horizontal)
                
                // Submit Button
                VStack(spacing: 15) {
                    Button(action: registerDoctor) {
                        HStack {
                            if isRegistering {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .padding(.trailing, 5)
                            }
                            Text(isRegistering ? "Creating Account..." : "Create Account")
                                .font(.system(.headline, design: .rounded).weight(.bold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity, minHeight: 56)
                        .background(Theme.primaryGradient)
                        .cornerRadius(15)
                        .shadow(color: Theme.appPrimary.opacity(0.3), radius: 10, x: 0, y: 5)
                    }
                    .disabled(isRegistering)
                    
                    Button(action: {
                        presentationMode.wrappedValue.dismiss()
                    }) {
                        HStack {
                            Text("Already have an account?")
                                .foregroundColor(.secondary)
                            Text("Sign In")
                                .foregroundColor(Theme.appPrimary)
                                .fontWeight(.bold)
                        }
                        .font(.subheadline)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 10)
                
                Button(action: {
                    if let url = URL(string: "https://www.freeprivacypolicy.com/live/5dd5c304-93ce-47fb-8854-4b62ea808c68") {
                        UIApplication.shared.open(url)
                    }
                }) {
                    Text("By registering, you agree to our Privacy Policy")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .underline()
                }
                .padding(.bottom, 40)
            }
        }
        .animatedBackground()
        .navigationBarHidden(true)
        .alert(isPresented: $showError) {
            Alert(title: Text("Registration Failed"), message: Text(errorMessage), dismissButton: .default(Text("OK")))
        }
    }
    
    private func registerDoctor() {
        // Clear previous errors
        doctorIdError = ""
        nameError = ""
        phoneError = ""
        emailError = ""
        ageError = ""
        usernameError = ""
        passwordError = ""
        confirmPasswordError = ""
        
        var isValid = true

        if doctorId.trimmingCharacters(in: .whitespaces).isEmpty {
            doctorIdError = "Doctor ID is required"
            isValid = false
        }
        
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        if trimmedName.isEmpty {
            nameError = "Full name is required"
            isValid = false
        }
        
        let trimmedPhone = phone.trimmingCharacters(in: .whitespaces)
        if trimmedPhone.isEmpty || trimmedPhone.count != 10 {
            phoneError = "Valid 10-digit phone is required"
            isValid = false
        }
        
        let trimmedEmail = email.trimmingCharacters(in: .whitespaces)
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        if !NSPredicate(format: "SELF MATCHES %@", emailRegex).evaluate(with: trimmedEmail) {
            emailError = "Valid email is required"
            isValid = false
        }
        
        if age.isEmpty {
            ageError = "Age is required"
            isValid = false
        }
        
        if username.trimmingCharacters(in: .whitespaces).isEmpty {
            usernameError = "Username is required"
            isValid = false
        }
        
        if password.count < 6 {
            passwordError = "Password too short"
            isValid = false
        }
        
        if password != confirmPassword {
            confirmPasswordError = "Passwords do not match"
            isValid = false
        }
        
        guard isValid else { return }

        isRegistering = true
        let body: [String: String] = [
            "doctor_id": doctorId,
            "name": name,
            "phone": phone,
            "email": email,
            "age": age,
            "gender": gender,
            "specialization": specialization,
            "username": username,
            "password": password,
            "password2": password
        ]
        
        guard let data = try? JSONEncoder().encode(body) else {
            isRegistering = false
            return
        }
        
        ApiClient.shared.request(
            endpoint: "accounts/register/",
            method: "POST",
            body: data,
            requiresAuth: false
        ) { (result: Result<Data, Error>) in
            DispatchQueue.main.async {
                self.isRegistering = false
                switch result {
                case .success:
                    self.presentationMode.wrappedValue.dismiss()
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                    self.showError = true
                }
            }
        }
    }
}

struct SectionHeader: View {
    let title: String
    let icon: String
    
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .foregroundColor(Theme.appPrimary)
            Text(title.uppercased())
                .font(.caption)
                .fontWeight(.bold)
                .tracking(1)
                .foregroundColor(.secondary)
        }
        .padding(.bottom, 5)
    }
}

struct ErrorText: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.caption)
            .foregroundColor(.red)
            .padding(.leading, 5)
    }
}

#Preview {
    RegisterView()
}
