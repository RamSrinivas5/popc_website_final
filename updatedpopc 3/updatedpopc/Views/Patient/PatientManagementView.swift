import SwiftUI

struct PatientManagementView: View {
    @Environment(\.presentationMode) var presentationMode
    
    @State private var navigateToAddPatient = false
    @State private var navigateToViewPatientList = false
    @State private var navigateToEditPatientList = false
    @State private var navigateToDeletePatient = false
    
    // REDESIGN: Pulse bg animation state
    @State private var animateBg = false
    
    var body: some View {
        ZStack {
            // REDESIGN: Premium Floating Glow Spheres in the background
            ZStack {
                Theme.appBackground.edgesIgnoringSafeArea(.all)
                
                Circle()
                    .fill(Theme.appTeal.opacity(0.18))
                    .frame(width: 280, height: 280)
                    .blur(radius: 40)
                    .offset(x: animateBg ? -90 : -50, y: animateBg ? -100 : -140)
                
                Circle()
                    .fill(Theme.appPrimary.opacity(0.12))
                    .frame(width: 340, height: 340)
                    .blur(radius: 50)
                    .offset(x: animateBg ? 90 : 50, y: animateBg ? 150 : 90)
            }
            .ignoresSafeArea()
            .onAppear {
                withAnimation(Animation.easeInOut(duration: 8.0).repeatForever(autoreverses: true)) {
                    animateBg = true
                }
            }
            
            VStack(spacing: 0) {
                // REDESIGN: Gorgeous Padded Floating Navigation Header
                Theme.primaryGradient
                    .overlay(
                        HStack(spacing: 15) {
                            Button(action: {
                                NotificationCenter.default.post(name: NSNotification.Name("GoHomeNotification"), object: nil)
                            }) {
                                Image(systemName: "chevron.left")
                                    .font(.title3.bold())
                                    .foregroundColor(Theme.appPrimary)
                                    .padding(10)
                                    .background(Circle().fill(Color.white))
                                    .shadow(color: Theme.appPrimary.opacity(0.15), radius: 6, x: 0, y: 3)
                            }
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Patient Management")
                                    .font(.system(.title2, design: .rounded).bold())
                                    .foregroundColor(.white)
                                
                                Text("Manage records and patient information")
                                    .font(.system(.caption, design: .rounded))
                                    .foregroundColor(.white.opacity(0.85))
                            }
                            
                            Spacer()
                            
                            if #available(iOS 16.0, *) {
                                NavigationLink(destination: ProfileView()) {
                                    DoctorProfileIconView(size: 38, iconColor: .white.opacity(0.9))
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                    )
                    .frame(height: 100)
                    .cornerRadius(24)
                    .padding(.horizontal, 14)
                    .padding(.top, 10)
                    .shadow(color: Theme.appPrimary.opacity(0.2), radius: 15, x: 0, y: 8)
                
                // Cards Container
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 18) {
                      
                        // Action Cards with Glassmorphism, Gradient Icons, and Scale Effects
                        PatientActionCard(
                            title: "Add New Patient",
                            subtitle: "Register a new patient into the system",
                            icon: "person.badge.plus.fill",
                            color: Theme.appPrimary
                        ) {
                            navigateToAddPatient = true
                        }

                        PatientActionCard(
                            title: "View Patients",
                            subtitle: "Browse and search existing patient records",
                            icon: "list.bullet.rectangle.portrait.fill",
                            color: Theme.appTeal
                        ) {
                            navigateToViewPatientList = true
                        }

                        PatientActionCard(
                            title: "Edit Patients",
                            subtitle: "Update existing patient details",
                            icon: "pencil.circle.fill",
                            color: Theme.categoryOrange
                        ) {
                            navigateToEditPatientList = true
                        }

                        PatientActionCard(
                            title: "Delete Patients",
                            subtitle: "Remove patient records from the system",
                            icon: "trash.fill",
                            color: Theme.categoryRed
                        ) {
                            navigateToDeletePatient = true
                        }

                    }
                    .padding(.top, 20)
                    .padding(.horizontal, 16)
                    .padding(.bottom, 30)
                }
                
                Spacer()
            }
        }
        .popupAppear()
        .navigationBarHidden(true)
        .background(
            Group {
                NavigationLink(destination: AddPatientView(), isActive: $navigateToAddPatient) { EmptyView() }
                NavigationLink(destination: ViewPatientListView(mode: "view"), isActive: $navigateToViewPatientList) { EmptyView() }
                NavigationLink(destination: ViewPatientListView(mode: "edit"), isActive: $navigateToEditPatientList) { EmptyView() }
                NavigationLink(destination: DeletePatientView(mode: "Delete"), isActive: $navigateToDeletePatient) { EmptyView() }
            }
        )
    }
}

// REDESIGN: High-fidelity Glassmorphic Action Card
struct PatientActionCard: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 18) {
                // Icon with layered dual-gradient ring
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [color.opacity(0.18), color.opacity(0.06)]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 56, height: 56)
                        .overlay(
                            Circle()
                                .stroke(color.opacity(0.25), lineWidth: 1.5)
                        )
                    
                    Image(systemName: icon)
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundColor(color)
                        .symbolRenderingMode(.hierarchical)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(.headline, design: .rounded).weight(.bold))
                        .foregroundColor(Theme.textPrimary)
                    
                    Text(subtitle)
                        .font(.system(.caption2, design: .rounded))
                        .foregroundColor(Theme.textSecondary)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                        .lineSpacing(2)
                }
                
                Spacer()
                
                // Small round chevron badge
                ZStack {
                    Circle()
                        .fill(Theme.appBackground.opacity(0.8))
                        .frame(width: 28, height: 28)
                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(color.opacity(0.7))
                }
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(Color.white.opacity(0.7))
                    .background(Blur(style: .systemThinMaterialLight))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .stroke(color.opacity(0.18), lineWidth: 1.2)
            )
            .shadow(color: Color.black.opacity(0.03), radius: 10, x: 0, y: 5)
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

#Preview {
    NavigationView {
        PatientManagementView()
    }
}
