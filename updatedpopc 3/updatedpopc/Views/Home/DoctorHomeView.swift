import SwiftUI

struct DoctorHomeView: View {
    @State private var doctorName: String = "Dr. Doctor"
    @State private var doctorId: String = "DOC123"
    @State private var profileImageUrl: String = ""
    
    // Navigation States
    @State private var navigateToProfile = false
    @State private var navigateToChat = false
    @State private var navigateToPatientManagement = false
    @State private var navigateToSurveyRecords = false
    @State private var navigateToDashboard = false
    @State private var navigateToSettings = false
    @State private var navigateToInfo = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                ZStack {
                    ScrollView {
                        VStack(spacing: 0) {
                            // Header Area with gradient
                            Theme.primaryGradient
                                .overlay(
                                    HStack {
                                        VStack(alignment: .leading) {
                                            Text(doctorId)
                                                .font(.system(.subheadline, design: .rounded))
                                                .foregroundColor(.white.opacity(0.8))
                                            Text(doctorName)
                                                .font(.system(.title2, design: .rounded).weight(.bold))
                                                .foregroundColor(.white)
                                        }
                                        Spacer()
                                        Button(action: { navigateToProfile = true }) {
                                            DoctorProfileIconView(size: 50, iconColor: .white.opacity(0.85))
                                        }
                                    }
                                    .padding()
                                )
                                .frame(height: 110)

                            // Dashboard Buttons Grid
                            VStack(spacing: 20) {
                                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
                                    DashboardButton(title: "Patient Management", icon: "person.3.fill", color: Theme.appPrimary) {
                                        navigateToPatientManagement = true
                                    }
                                    DashboardButton(title: "Survey Records", icon: "doc.text.fill", color: Theme.categoryOrange) {
                                        navigateToSurveyRecords = true
                                    }
                                    DashboardButton(title: "Dashboard", icon: "chart.bar.fill", color: Theme.categoryPurple) {
                                        navigateToDashboard = true
                                    }
                                    DashboardButton(title: "Settings", icon: "gearshape.fill", color: Theme.textSecondary) {
                                        navigateToSettings = true
                                    }
                                    DashboardButton(title: "PPC Chat", icon: "message.fill", color: Theme.appTeal) {
                                        navigateToChat = true
                                    }
                                    DashboardButton(title: "App Info", icon: "info.circle.fill", color: Theme.appPrimary) {
                                        navigateToInfo = true
                                    }
                                }
                                .padding()
                            }
                            .padding(.top, 20)
                            .padding(.bottom, 20)
                        }
                    } // End of ScrollView
                    
                    // Premium Navigation Popups (200ms scale+fade)
                    Group {
                        if navigateToProfile {
                            if #available(iOS 16.0, *) {
                                ProfileView().transition(.scale(scale: 0.93).combined(with: .opacity))
                            }
                        }
                        if navigateToChat { PPCChatView().transition(.scale(scale: 0.93).combined(with: .opacity)) }
                        if navigateToPatientManagement { PatientManagementView().transition(.scale(scale: 0.93).combined(with: .opacity)) }
                        if navigateToSurveyRecords { SurveyListView().transition(.scale(scale: 0.93).combined(with: .opacity)) }
                        if navigateToDashboard { DashboardView().transition(.scale(scale: 0.93).combined(with: .opacity)) }
                        if navigateToSettings { SettingsView().transition(.scale(scale: 0.93).combined(with: .opacity)) }
                        if navigateToInfo { AppInfoView().transition(.scale(scale: 0.93).combined(with: .opacity)) }
                    }
                    .zIndex(2)
                } // End of ZStack
                .background(Theme.backgroundGradient.edgesIgnoringSafeArea(.all))
                
                BottomNavBar(
                    navigateToDashboard: $navigateToDashboard,
                    navigateToPatientManagement: $navigateToPatientManagement,
                    navigateToChat: $navigateToChat,
                    navigateToSettings: $navigateToSettings
                )
            } // End of VStack
            .navigationBarHidden(true)
            .animation(.easeOut(duration: 0.2), value: navigateToProfile)
            .animation(.easeOut(duration: 0.2), value: navigateToChat)
            .animation(.easeOut(duration: 0.2), value: navigateToPatientManagement)
            .animation(.easeOut(duration: 0.2), value: navigateToSurveyRecords)
            .animation(.easeOut(duration: 0.2), value: navigateToDashboard)
            .animation(.easeOut(duration: 0.2), value: navigateToSettings)
            .animation(.easeOut(duration: 0.2), value: navigateToInfo)
            .onAppear(perform: loadDoctorProfile)
            .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("GoHomeNotification"))) { _ in
                navigateToProfile = false
                navigateToChat = false
                navigateToPatientManagement = false
                navigateToSurveyRecords = false
                navigateToDashboard = false
                navigateToSettings = false
                navigateToInfo = false
            }
            .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("ProfileUpdated"))) { _ in
                loadDoctorProfile()
            }
        }
        .navigationViewStyle(.stack)
    }
    
    private func loadDoctorProfile() {
        // Mocking API call to ApiClient
        ApiClient.shared.request(endpoint: "accounts/profile/") { (result: Result<DoctorResponse, Error>) in
            switch result {
            case .success(let response):
                self.doctorName = response.name ?? self.doctorName
                self.doctorId = response.doctorId
                self.profileImageUrl = response.profileImageUrl ?? ""
                DispatchQueue.main.async {
                    SharedPrefManager.shared.profileImageUrl = response.profileImageUrl ?? ""
                }
            case .failure(let error):
                print("Failed to load profile: \(error.localizedDescription)")
            }
        }
    }
}

struct DashboardButton: View {
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 38, weight: .semibold))
                    .symbolRenderingMode(.hierarchical)
                    .foregroundColor(color)
                
                Text(title)
                    .font(.system(.headline, design: .rounded).weight(.semibold))
                    .foregroundColor(Theme.textPrimary)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity, minHeight: 120)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(Theme.cardBackground)
                    .shadow(color: color.opacity(0.12), radius: 10, x: 0, y: 6)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct BottomNavBar: View {
    @Binding var navigateToDashboard: Bool
    @Binding var navigateToPatientManagement: Bool
    @Binding var navigateToChat: Bool
    @Binding var navigateToSettings: Bool
    
    var currentTab: String {
        if navigateToPatientManagement { return "Patients" }
        if navigateToChat { return "Chat" }
        if navigateToSettings { return "Settings" }
        return "Home"
    }
    
    var body: some View {
        HStack(spacing: 0) {
            NavBarItem(icon: "house.fill", title: "Home", isSelected: currentTab == "Home") {
                NotificationCenter.default.post(name: NSNotification.Name("GoHomeNotification"), object: nil)
            }
            Spacer()
            NavBarItem(icon: "person.3.fill", title: "Patients", isSelected: currentTab == "Patients") {
                NotificationCenter.default.post(name: NSNotification.Name("GoHomeNotification"), object: nil)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    navigateToPatientManagement = true
                }
            }
            Spacer()
            NavBarItem(icon: "message.fill", title: "Chat", isSelected: currentTab == "Chat") {
                NotificationCenter.default.post(name: NSNotification.Name("GoHomeNotification"), object: nil)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    navigateToChat = true
                }
            }
            Spacer()
            NavBarItem(icon: "gearshape.fill", title: "Settings", isSelected: currentTab == "Settings") {
                NotificationCenter.default.post(name: NSNotification.Name("GoHomeNotification"), object: nil)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    navigateToSettings = true
                }
            }
        }
        .padding(.horizontal, 30)
        .padding(.top, 15)
        .padding(.bottom, 15)
        .background(
            Theme.cardBackground
                .shadow(color: Color.black.opacity(0.15), radius: 15, x: 0, y: -5)
                .ignoresSafeArea(.all, edges: .bottom)
        )
    }
}

struct NavBarItem: View {
    let icon: String
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundColor(isSelected ? Theme.appPrimary : Theme.textSecondary.opacity(0.7))
                
                Text(title)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(isSelected ? Theme.appPrimary : Theme.textSecondary.opacity(0.7))
            }
        }
    }
}

#Preview {
    DoctorHomeView()
}
