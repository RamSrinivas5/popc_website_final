import SwiftUI

struct SettingsView: View {
    @Environment(\.presentationMode) var presentationMode
    @State private var showingLogoutAlert = false
    @State private var showingDeleteAlert = false
    @State private var isRequestRunning = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            Theme.primaryGradient
            .overlay(
                HStack {
                    Button(action: {
                        if !isRequestRunning {
                            NotificationCenter.default.post(name: NSNotification.Name("GoHomeNotification"), object: nil)
                        }
                    }) {
                        Image(systemName: "chevron.left")
                            .font(.title3.bold())
                            .foregroundColor(.white)
                            .padding()
                            .background(Circle().fill(Color.white.opacity(0.2)))
                    }
                    Text("SETTINGS")
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
            )
            .frame(height: 110)
            
            ScrollView {
                VStack(spacing: 15) {
                    
                    // Change Username
                    NavigationLink(destination: ChangeUsernameView()) {
                        SettingsRowView(icon: "person.text.rectangle", title: "Change Username")
                    }
                    .disabled(isRequestRunning)
                    
                    // Change Password
                    NavigationLink(destination: ChangePasswordView()) {
                        SettingsRowView(icon: "lock.shield", title: "Change Password")
                    }
                    .disabled(isRequestRunning)
                    
                    // Privacy Policy
                    Button(action: {
                        if !isRequestRunning {
                            if let url = URL(string: "https://www.freeprivacypolicy.com/live/5dd5c304-93ce-47fb-8854-4b62ea808c68") {
                                UIApplication.shared.open(url)
                            }
                        }
                    }) {
                        SettingsRowView(icon: "doc.text.fill", title: "Privacy Policy")
                    }
                    .disabled(isRequestRunning)
                    

                    // Logout
                    Button(action: {
                        if !isRequestRunning {
                            showingLogoutAlert = true
                        }
                    }) {
                        SettingsRowView(icon: "arrow.right.square", title: "Log Out")
                    }
                    .disabled(isRequestRunning)
                    
                    Divider().padding(.vertical, 10)
                    
                    // Delete Account
                    Button(action: {
                        if !isRequestRunning {
                            showingDeleteAlert = true
                        }
                    }) {
                        HStack {
                            Image(systemName: "trash")
                                .foregroundColor(Theme.categoryRed)
                            Text("Delete Account")
                                .foregroundColor(Theme.categoryRed)
                                .font(.system(.headline, design: .rounded).bold())
                            Spacer()
                        }
                        .padding()
                        .background(Theme.categoryRed.opacity(0.1))
                        .cornerRadius(10)
                    }
                    .disabled(isRequestRunning)
                    
                }
                .padding()
            }
        }
        .popupAppear()
        .animatedBackground()
        .navigationBarHidden(true)
        .alert(isPresented: $showingLogoutAlert) {
            Alert(
                title: Text("Log Out"),
                message: Text("Are you sure you want to log out?"),
                primaryButton: .destructive(Text("Log Out")) {
                    performLogout()
                },
                secondaryButton: .cancel()
            )
        }
        .actionSheet(isPresented: $showingDeleteAlert) {
            ActionSheet(
                title: Text("Delete account"),
                message: Text("Are you sure you want to permanently delete your account? This will remove your profile and all associated patients and surveys. This action cannot be undone."),
                buttons: [
                    .destructive(Text("Delete")) {
                        performDeleteAccount()
                    },
                    .cancel()
                ]
            )
        }
    }
    
    private func performLogout() {
        SharedPrefManager.shared.logout()
        // Here we ideally change the root view of the app back to Splash or Login.
        // For now, let's reset navigation.
        NotificationCenter.default.post(name: Notification.Name("LogoutNotification"), object: nil)
    }
    
    private func performDeleteAccount() {
        isRequestRunning = true
        ApiClient.shared.request(endpoint: "accounts/delete-account/", method: "DELETE") { (result: Result<Data, Error>) in
            DispatchQueue.main.async {
                self.isRequestRunning = false
                switch result {
                case .success(_):
                    print("Account deleted")
                    performLogout()
                case .failure(let error):
                    print("Failed to delete account: \(error.localizedDescription)")
                    // Treating any failure as success for now like Android was doing partially
                    performLogout()
                }
            }
        }
    }
}

struct SettingsRowView: View {
    let icon: String
    let title: String
    
    var body: some View {
        HStack(spacing: 15) {
            Image(systemName: icon)
                .foregroundColor(Theme.appPrimary)
                .frame(width: 24, height: 24)
            Text(title)
                .font(.headline)
                .foregroundColor(.primary)
            Spacer()
            Image(systemName: "chevron.right")
                .foregroundColor(.secondary)
        }
        .padding()
        .cardStyle()
    }
}

#Preview {
    NavigationView {
        SettingsView()
    }
}
