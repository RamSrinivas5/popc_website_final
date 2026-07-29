import SwiftUI
import PhotosUI

@available(iOS 16.0, *)
struct ProfileView: View {
    @Environment(\.presentationMode) var presentationMode
    
    @State private var doctorId: String = ""
    @State private var name: String = ""
    @State private var phone: String = ""
    @State private var email: String = ""
    @State private var specialization: String = "Anesthesia"
    @State private var gender: String = "Female"
    @State private var age: Int = 24
    @State private var profileImageUrl: String? = nil
    
    let specializations = ["Anesthesia", "Surgery", "Cardiology", "Neurology", "Orthopedics", "General", "Others"]
    
    @State private var isSubmitting = false
    @State private var isLoading = true
    
    @State private var selectedItem: PhotosPickerItem? = nil
    @State private var selectedImageData: Data? = nil
    
    @State private var showAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            Theme.primaryGradient
            .overlay(
                HStack {
                    Button(action: { NotificationCenter.default.post(name: NSNotification.Name("GoHomeNotification"), object: nil) }) {
                        Image(systemName: "arrow.left")
                            .foregroundColor(.white)
                            .padding()
                            .background(Circle().fill(Color.white.opacity(0.2)))
                    }
                    Text("Profile")
                        .font(.system(.title2, design: .rounded).bold())
                        .foregroundColor(.white)
                    Spacer()
                }
                .padding()
            )
            .frame(height: 110)
            
            if isLoading {
                ProgressView("Loading Profile...")
                    .frame(maxHeight: .infinity)
            } else {
                ScrollView {
                    VStack(spacing: 20) {
                        
                        // Profile Image
                        PhotosPicker(selection: $selectedItem, matching: .images, photoLibrary: .shared()) {
                            if let selectedImageData, let uiImage = UIImage(data: selectedImageData) {
                                Image(uiImage: uiImage)
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 100, height: 100)
                                    .clipShape(Circle())
                            } else if let imageUrl = profileImageUrl, let url = URL(string: imageUrl) {
                                AsyncImage(url: url) { image in
                                    image.resizable().scaledToFill()
                                } placeholder: {
                                    Image(systemName: "person.circle.fill")
                                        .resizable()
                                        .foregroundColor(.gray)
                                }
                                .frame(width: 100, height: 100)
                                .clipShape(Circle())
                            } else {
                                Image(systemName: "person.circle.fill")
                                    .resizable()
                                    .foregroundColor(.gray)
                                    .frame(width: 100, height: 100)
                            }
                        }
                        .onChange(of: selectedItem) { newItem in
                            Task {
                                if let data = try? await newItem?.loadTransferable(type: Data.self) {
                                    if let uiImage = UIImage(data: data), let jpegData = uiImage.jpegData(compressionQuality: 0.8) {
                                        selectedImageData = jpegData
                                    } else {
                                        selectedImageData = data
                                    }
                                }
                            }
                        }
                        
                        Text(doctorId)
                            .font(.headline)
                            .foregroundColor(.gray)
                        
                        VStack(alignment: .leading, spacing: 15) {
                            
                            // Name
                            TextField("Name", text: $name)
                                .professionalTextFieldStyle()
                                .onChange(of: name) { newValue in
                                    let filtered = newValue.filter { $0.isLetter || $0 == " " || $0 == "." }
                                    if newValue != filtered {
                                        name = filtered
                                        alertMessage = "Special characters and numbers are not allowed in Name."
                                        showAlert = true
                                    } else {
                                        name = filtered
                                    }
                                }
                            
                            // Phone
                            TextField("Phone", text: $phone)
                                .keyboardType(.phonePad)
                                .professionalTextFieldStyle()
                                .onChange(of: phone) { newValue in
                                    var filtered = String(newValue.filter { $0.isNumber }.prefix(10))
                                    var invalidStartError = false

                                    if let first = filtered.first, !("6789".contains(first)) {
                                        filtered = String(filtered.dropFirst())
                                        invalidStartError = true
                                    }

                                    if newValue != filtered {
                                        phone = filtered
                                        if invalidStartError {
                                            alertMessage = "Phone number must start with 6, 7, 8, or 9."
                                            showAlert = true
                                        } else if newValue.contains(where: { !$0.isNumber }) {
                                            alertMessage = "Special characters and text are not allowed in Phone."
                                            showAlert = true
                                        }
                                    } else {
                                        phone = filtered
                                    }
                                }
                            
                            // Email
                            TextField("Email", text: $email)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                .professionalTextFieldStyle()
                            
                            // Specialization
                            Picker("Specialization", selection: $specialization) {
                                ForEach(specializations, id: \.self) {
                                    Text($0)
                                }
                            }
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(8)
                            
                            // Gender
                            Picker("Gender", selection: $gender) {
                                Text("Female").tag("Female")
                                Text("Male").tag("Male")
                                Text("Other").tag("Other")
                            }
                            .pickerStyle(SegmentedPickerStyle())
                            .padding(.vertical, 5)
                            
                            // Age
                            HStack {
                                Text("Age:")
                                    .font(.headline)
                                Spacer()
                                Button(action: { if age > 1 { age -= 1 } }) {
                                    Image(systemName: "minus.square.fill")
                                        .font(.title2)
                                        .foregroundColor(.blue)
                                }
                                Text("\(age)")
                                    .font(.title3)
                                    .frame(width: 40)
                                    .multilineTextAlignment(.center)
                                Button(action: { if age < 120 { age += 1 } }) {
                                    Image(systemName: "plus.square.fill")
                                        .font(.title2)
                                        .foregroundColor(.blue)
                                }
                            }
                            .padding()
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(8)
                        }
                        
                        Button(action: saveProfile) {
                            if isSubmitting {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .frame(maxWidth: .infinity, minHeight: 44)
                            } else {
                                Text("Update")
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
                        .padding()
                        
                        Spacer()
                    }
                    .padding()
                }
            }
        }
        .popupAppear()
        .animatedBackground()
        .navigationBarHidden(true)
        .onAppear(perform: loadProfile)
        .alert(isPresented: $showAlert) {
            Alert(title: Text("Message"), message: Text(alertMessage), dismissButton: .default(Text("OK")))
        }
    }
    
    private func loadProfile() {
        ApiClient.shared.request(endpoint: "accounts/profile/", method: "GET") { (result: Result<DoctorResponse, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let doctor):
                    self.doctorId = doctor.doctorId
                    self.name = doctor.name ?? ""
                    self.phone = doctor.phone ?? ""
                    self.email = doctor.email ?? ""
                    self.specialization = doctor.specialization ?? "Anesthesia"
                    self.gender = doctor.gender ?? "Female"
                    self.profileImageUrl = doctor.profileImageUrl
                    SharedPrefManager.shared.profileImageUrl = doctor.profileImageUrl ?? ""
                    if let ageValue = doctor.age {
                        self.age = ageValue
                    }
                case .failure(let error):
                    print("Error loading profile: \(error)")
                }
            }
        }
    }
    
    private func saveProfile() {
        guard !name.isEmpty, !phone.isEmpty, !email.isEmpty else {
            alertMessage = "All fields are required"
            showAlert = true
            return
        }
        if phone.count < 10 {
            alertMessage = "Phone must be at least 10 digits"
            showAlert = true
            return
        }
        if let first = phone.first, !("6789".contains(first)) {
            alertMessage = "Phone number must start with 6, 7, 8, or 9"
            showAlert = true
            return
        }
        
        isSubmitting = true
        
        let fields: [String: String] = [
            "name": name,
            "phone": phone,
            "email": email,
            "specialization": specialization,
            "gender": gender,
            "age": String(age)
        ]
        
        ApiClient.shared.multipartRequest(
            endpoint: "accounts/profile/",
            method: "PATCH",
            fields: fields,
            image: selectedImageData
        ) { (result: Result<DoctorResponse, Error>) in
            DispatchQueue.main.async {
                self.isSubmitting = false
                switch result {
                case .success(let doctor):
                    if let newPhotoUrl = doctor.profileImageUrl {
                        self.profileImageUrl = newPhotoUrl
                    }
                    self.selectedImageData = nil
                    
                    // Notify other views (like Home) that profile changed
                    NotificationCenter.default.post(name: NSNotification.Name("ProfileUpdated"), object: nil)
                    
                    self.alertMessage = "Profile Updated Successfully"
                    self.showAlert = true
                case .failure(let error):
                    self.alertMessage = "Update failed: \(error.localizedDescription)"
                    self.showAlert = true
                }
            }
        }
    }
}

#Preview {
    NavigationView {
        if #available(iOS 16.0, *) {
            ProfileView()
        } else {
            // Fallback on earlier versions
        }
    }
}
