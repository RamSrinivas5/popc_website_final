import SwiftUI
import PhotosUI

struct AddPatientView: View {
    @Environment(\.presentationMode) var presentationMode
    
    @State private var patientId: String = ""
    @State private var name: String = ""
    @State private var phone: String = ""
    @State private var weight: String = ""
    @State private var height: String = ""
    @State private var age: String = ""
    
    @State private var nameError = ""
    @State private var phoneError = ""
    @State private var weightError = ""
    @State private var heightError = ""
    @State private var ageError = ""
    @State private var showError = false
    @State private var errorMessage = ""
    
    @State private var selectedGender: String = "Female"
    let genders = ["Male", "Female", "Other"]
    
    @State private var profileImage: UIImage?
    @State private var isShowingImagePicker = false
    
    @State private var isSaved = false
    @State private var isSaving = false
    
    @State private var navigateToDemographics = false
    @State private var savedPatientId: Int?
    
    var computedBMI: String {
        guard let w = Double(weight), let h = Double(height), h > 0 else { return "" }
        let bmi = w / ((h / 100) * (h / 100))
        return String(format: "%.2f", bmi)
    }
    
    var isFormValid: Bool {
        !name.isEmpty && !phone.isEmpty && phone.count >= 10 && !weight.isEmpty && !height.isEmpty && !age.isEmpty && !computedBMI.isEmpty
    }
    
    private struct PatientIdResponse: Decodable {
        let patientId: String
        enum CodingKeys: String, CodingKey {
            case patientId = "patient_id"
        }
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                HStack {
                    Button(action: { presentationMode.wrappedValue.dismiss() }) {
                        Image(systemName: "chevron.left")
                            .font(.title3.bold())
                            .foregroundColor(.white)
                            .padding()
                            .background(Circle().fill(Color.white.opacity(0.2)))
                    }
                    Text("ADD PATIENT")
                        .font(.system(.title2, design: .rounded).bold())
                        .foregroundColor(.white)
                    Spacer()
                    if #available(iOS 16.0, *) {
                        NavigationLink(destination: ProfileView()) {
                            DoctorProfileIconView(size: 35, iconColor: .white.opacity(0.85))
                        }
                    }
                }
                .padding()
                .background(Theme.primaryGradient)
                
                // Profile Image Picker
                Button(action: { isShowingImagePicker = true }) {
                    ZStack {
                        Circle()
                            .fill(Color.gray.opacity(0.2))
                            .frame(width: 100, height: 100)
                        
                        if let image = profileImage {
                            Image(uiImage: image)
                                .resizable()
                                .scaledToFill()
                                .frame(width: 100, height: 100)
                                .clipShape(Circle())
                        } else {
                            Image(systemName: "person.crop.circle.fill")
                                .resizable()
                                .symbolRenderingMode(.hierarchical)
                                .frame(width: 100, height: 100)
                                .foregroundColor(.gray)
                        }
                    }
                }
                .sheet(isPresented: $isShowingImagePicker) {
                    ImagePicker(image: $profileImage)
                }
                
                // Form Fields
                VStack(spacing: 15) {
                    HStack {
                        Text("Patient ID:")
                        Spacer()
                        Text(patientId.isEmpty ? "Generating..." : patientId)
                            .foregroundColor(.gray)
                    }
                    .padding()
                    .background(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.5)))
                    
                    TextField("Name", text: $name)
                        .professionalTextFieldStyle()
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
                    if !nameError.isEmpty {
                        Text(nameError)
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding(.leading, 4)
                    }
                    
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
                                    errorMessage = "Phone number must start with 6, 7, 8, or 9."
                                    showError = true
                                } else if newValue.contains(where: { !$0.isNumber }) {
                                    errorMessage = "Special characters and text are not allowed in Phone."
                                    showError = true
                                }
                            } else {
                                phone = filtered
                            }
                        }
                    if !phoneError.isEmpty {
                        Text(phoneError)
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding(.leading, 4)
                    }
                    
                    HStack {
                        VStack(alignment: .leading, spacing: 0) {
                            TextField("Weight (kg)", text: $weight)
                                .keyboardType(.numberPad)
                                .professionalTextFieldStyle()
                                .onChange(of: weight) { newValue in
                                    let filtered = String(newValue.filter { $0.isNumber }.prefix(3))
                                    if newValue != filtered {
                                        weight = filtered
                                        if newValue.contains(where: { !$0.isNumber }) {
                                            errorMessage = "Only digits are allowed in Weight."
                                            showError = true
                                        }
                                    } else {
                                        weight = filtered
                                    }
                                }
                            if !weightError.isEmpty {
                                Text(weightError)
                                    .font(.caption)
                                    .foregroundColor(.red)
                                    .padding(.leading, 4)
                            }
                        }
                        
                        VStack(alignment: .leading, spacing: 0) {
                            TextField("Height (cm)", text: $height)
                                .keyboardType(.numberPad)
                                .professionalTextFieldStyle()
                                .onChange(of: height) { newValue in
                                    let filtered = String(newValue.filter { $0.isNumber }.prefix(3))
                                    if newValue != filtered {
                                        height = filtered
                                        if newValue.contains(where: { !$0.isNumber }) {
                                            errorMessage = "Only digits are allowed in Height."
                                            showError = true
                                        }
                                    } else {
                                        height = filtered
                                    }
                                }
                            if !heightError.isEmpty {
                                Text(heightError)
                                    .font(.caption)
                                    .foregroundColor(.red)
                                    .padding(.leading, 4)
                            }
                        }
                    }
                    
                    HStack {
                        Text("BMI: \(computedBMI)")
                            .foregroundColor(.gray)
                        Spacer()
                    }
                    .padding(.horizontal)
                    
                    HStack {
                        Text("Age:")
                        Spacer()
                        Button("-") {
                            if let currentAge = Int(age), currentAge > 0 {
                                age = "\(currentAge - 1)"
                            }
                        }
                        TextField("Age", text: $age)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.center)
                            .frame(width: 50)
                            .padding(.vertical, 5)
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(5)
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
                        Button("+") {
                            let currentAge = Int(age) ?? 0
                            age = "\(currentAge + 1)"
                        }
                    }
                    .padding()
                    .background(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.5)))
                    if !ageError.isEmpty {
                        Text(ageError)
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding(.leading, 4)
                    }
                    
                    Picker("Gender", selection: $selectedGender) {
                        ForEach(genders, id: \.self) {
                            Text($0)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                .padding(.horizontal)
                
                // Buttons
                HStack(spacing: 20) {
                    Button(action: savePatient) {
                        Text(isSaved ? "Saved" : (isSaving ? "Saving..." : "Save"))
                            .font(.system(.headline, design: .rounded).weight(.bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, minHeight: 44)
                    }
                    .background(
                        RoundedRectangle(cornerRadius: 15, style: .continuous)
                            .fill(Theme.appTeal)
                    )
                    .opacity((!isFormValid || isSaved || isSaving) ? 0.6 : 1.0)
                    .disabled(!isFormValid || isSaved || isSaving)
                    .shadow(color: Theme.appTeal.opacity(0.3), radius: 6, x: 0, y: 3)
                    
                    Button(action: {
                        if isSaved {
                            navigateToDemographics = true
                        } else {
                            savePatientAndNext()
                        }
                    }) {
                        Text("Next")
                            .font(.system(.headline, design: .rounded).weight(.bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, minHeight: 44)
                    }
                    .background(
                        RoundedRectangle(cornerRadius: 15, style: .continuous)
                            .fill(Theme.primaryGradient)
                    )
                    .opacity((!isFormValid || isSaving) ? 0.6 : 1.0)
                    .disabled(!isFormValid || isSaving)
                    .shadow(color: Theme.appPrimary.opacity(0.3), radius: 6, x: 0, y: 3)
                }
                .padding(.horizontal)
                .padding(.top, 20)
                
                Spacer()
            }
        }
        .popupAppear()
        .animatedBackground()
        .navigationBarHidden(true)
        .onAppear(perform: fetchNextPatientId)
        .background(
            NavigationLink(destination: PatientDemographicsView(patientId: savedPatientId ?? 0), isActive: $navigateToDemographics) {
                EmptyView()
            }
        )
        .alert(isPresented: $showError) {
            Alert(title: Text("Error"), message: Text(errorMessage),
                  dismissButton: .default(Text("OK")))
        }
    }
    
    private func validateFields() -> Bool {
        nameError = ""
        phoneError = ""
        weightError = ""
        heightError = ""
        ageError = ""
        var isValid = true
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        if trimmedName.isEmpty {
            nameError = "Patient name is required"
            isValid = false
        } else if trimmedName.count < 2 {
            nameError = "Name must be at least 2 characters"
            isValid = false
        }
        let trimmedPhone = phone.trimmingCharacters(in: .whitespaces)
        if trimmedPhone.isEmpty {
            phoneError = "Phone number is required"
            isValid = false
        } else if trimmedPhone.count < 10 {
            phoneError = "Phone must be at least 10 digits"
            isValid = false
        } else if let first = trimmedPhone.first, !("6789".contains(first)) {
            phoneError = "Phone number must start with 6, 7, 8, or 9"
            isValid = false
        } else if !trimmedPhone.allSatisfy({ $0.isNumber }) {
            phoneError = "Phone must contain numbers only"
            isValid = false
        }
        if weight.isEmpty {
            weightError = "Weight is required"
            isValid = false
        } else if let w = Double(weight) {
            if w <= 0 { weightError = "Enter a valid weight"; isValid = false }
            else if w > 500 { weightError = "Weight seems too high"; isValid = false }
        } else {
            weightError = "Enter a valid number"
            isValid = false
        }
        if height.isEmpty {
            heightError = "Height is required"
            isValid = false
        } else if let h = Double(height) {
            if h < 30 { heightError = "Height too low — use cm"; isValid = false }
            else if h > 300 { heightError = "Height too high — use cm"; isValid = false }
        } else {
            heightError = "Enter a valid number"
            isValid = false
        }
        if age.isEmpty {
            ageError = "Age is required"
            isValid = false
        } else if let a = Int(age) {
            if a < 0 { ageError = "Age cannot be less than 0"; isValid = false }
            else if a > 120 { ageError = "Age cannot exceed 120"; isValid = false }
        } else {
            ageError = "Enter a valid age"
            isValid = false
        }
        return isValid
    }
    
    private func fetchNextPatientId() {
        ApiClient.shared.request(endpoint: "patients/next-id/") { (result: Result<PatientIdResponse, Error>) in
            DispatchQueue.main.async {
                if case .success(let r) = result {
                    self.patientId = r.patientId
                }
            }
        }
    }
    
    private func savePatient() {
        guard validateFields() else { return }
        isSaving = true
        let fields: [String: String] = [
            "patient_id": patientId,
            "name": name.trimmingCharacters(in: .whitespaces),
            "phone": phone.trimmingCharacters(in: .whitespaces),
            "weight": weight,
            "height": height,
            "age": age,
            "gender": selectedGender,
            "bmi": computedBMI
        ]
        
        let imageData = profileImage?.jpegData(compressionQuality: 0.8)
        
        ApiClient.shared.multipartRequest(
            endpoint: "patients/create/",
            method: "POST",
            fields: fields,
            image: imageData
        ) { (result: Result<PatientResponse, Error>) in
            DispatchQueue.main.async {
                self.isSaving = false
                switch result {
                case .success(let p):
                    self.isSaved = true
                    self.savedPatientId = p.id
                case .failure(let e):
                    self.errorMessage = e.localizedDescription
                    self.showError = true
                }
            }
        }
    }
    
    private func savePatientAndNext() {
        guard validateFields() else { return }
        isSaving = true
        let fields: [String: String] = [
            "patient_id": patientId,
            "name": name.trimmingCharacters(in: .whitespaces),
            "phone": phone.trimmingCharacters(in: .whitespaces),
            "weight": weight,
            "height": height,
            "age": age,
            "gender": selectedGender,
            "bmi": computedBMI
        ]
        
        let imageData = profileImage?.jpegData(compressionQuality: 0.8)
        
        ApiClient.shared.multipartRequest(
            endpoint: "patients/create/",
            method: "POST",
            fields: fields,
            image: imageData
        ) { (result: Result<PatientResponse, Error>) in
            DispatchQueue.main.async {
                self.isSaving = false
                switch result {
                case .success(let p):
                    self.isSaved = true
                    self.savedPatientId = p.id
                    self.navigateToDemographics = true
                case .failure(let e):
                    self.errorMessage = e.localizedDescription
                    self.showError = true
                }
            }
        }
    }
}

// Helper to wrap UIImagePickerController for SwiftUI
struct ImagePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.presentationMode) var presentationMode
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker
        
        init(_ parent: ImagePicker) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.image = image
            }
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}

#Preview {
    NavigationView {
        AddPatientView()
    }
}
