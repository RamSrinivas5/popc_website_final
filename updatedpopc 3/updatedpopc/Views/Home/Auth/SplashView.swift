import SwiftUI

struct SplashView: View {
    @State private var isActive = false
    @State private var iconScale: CGFloat = 0.6
    @State private var iconOpacity: Double = 0.0
    @State private var textOpacity: Double = 0.0
    @State private var taglineOpacity: Double = 0.0
    
    @ObservedObject private var authManager = SharedPrefManager.shared
    
    var body: some View {
        if isActive {
            if authManager.isLoggedIn {
                DoctorHomeView()
            } else {
                NavigationView {
                    LoginView()
                }
                .navigationViewStyle(.stack)
            }
        } else {
            ZStack {
                // Background
                Theme.appBackground
                    .edgesIgnoringSafeArea(.all)
                
                // Decorative elements
                VStack {
                    Circle()
                        .fill(Theme.appTeal.opacity(0.05))
                        .frame(width: 300, height: 300)
                        .blur(radius: 50)
                        .offset(x: -100, y: -200)
                    Spacer()
                    Circle()
                        .fill(Theme.appPrimary.opacity(0.05))
                        .frame(width: 400, height: 400)
                        .blur(radius: 60)
                        .offset(x: 150, y: 300)
                }
                .edgesIgnoringSafeArea(.all)

                VStack(spacing: 0) {
                    Spacer()
                    
                    // Animated Icon
                    Image(systemName: "cross.case.fill")
                        .font(.system(size: 100))
                        .foregroundStyle(Theme.primaryGradient)
                        .scaleEffect(iconScale)
                        .opacity(iconOpacity)
                        .shadow(color: Theme.appPrimary.opacity(0.2), radius: 20, x: 0, y: 10)
                        .padding(.bottom, 40)
                    
                    // App Title
                    if #available(iOS 16.0, *) {
                        Text("POPC")
                            .font(.system(size: 64, weight: .black, design: .rounded))
                            .foregroundColor(Theme.appPrimary)
                            .opacity(textOpacity)
                            .kerning(2)
                    } else {
                        // Fallback on earlier versions
                    };
                    
                    // Tagline
                    Text("Postoperative Pulmonary Complications")
                        .font(.system(size: 18, weight: .semibold, design: .rounded))
                        .foregroundColor(Theme.appPrimary.opacity(0.9))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                        .padding(.top, 12)
                        .opacity(taglineOpacity)
                    
                    Spacer()
                    
                    // Bottom Indicator or Brand
                    VStack(spacing: 8) {
                        Text("CLINICAL INTELLIGENCE")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(Theme.appPrimary.opacity(0.4))
                            .kerning(3)
                        
                        
                    }
                    .padding(.bottom, 40)
                    .opacity(taglineOpacity)
                }
            }
            .onAppear {
                startAnimations()
                
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                    withAnimation(.easeOut(duration: 0.6)) {
                        self.isActive = true
                    }
                }
            }
        }
    }
    
    private func startAnimations() {
        // Step 1: Icon pops in
        withAnimation(Theme.fluidSpring) {
            iconScale = 1.0
            iconOpacity = 1.0
        }
        
        // Step 2: Text fades in
        withAnimation(.easeOut(duration: 0.8).delay(0.4)) {
            textOpacity = 1.0
        }
        
        // Step 3: Tagline fades in
        withAnimation(.easeOut(duration: 0.8).delay(0.8)) {
            taglineOpacity = 1.0
        }
    }
}

// Preview
#Preview {
    SplashView()
}
