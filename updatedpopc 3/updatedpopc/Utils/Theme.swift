import SwiftUI

public struct Theme {
    public static let appPrimary = Color(red: 0.15, green: 0.25, blue: 0.70) // Deeper, more trustworthy blue
    public static let appTeal = Color(red: 0.12, green: 0.70, blue: 0.65) // Softer medical teal
    
    public static let appBackground = Color(red: 0.92, green: 0.96, blue: 0.98) // Soft Ocean tint
    public static let cardBackground = Color.white
    
    public static let textPrimary = Color(red: 0.10, green: 0.15, blue: 0.25)
    public static let textSecondary = Color.gray
    
    public static let categoryOrange = Color(red: 0.95, green: 0.55, blue: 0.20)
    public static let categoryRed = Color(red: 0.90, green: 0.35, blue: 0.40)
    public static let categoryGreen = Color(red: 0.20, green: 0.80, blue: 0.50)
    public static let categoryPurple = Color(red: 0.55, green: 0.35, blue: 0.85)
    
    // Background Gradient for a "Premium" non-white look
    public static let backgroundGradient = LinearGradient(
        gradient: Gradient(colors: [appBackground, Color(red: 0.88, green: 0.92, blue: 0.95)]),
        startPoint: .top,
        endPoint: .bottom
    )

    // Modern Header Gradient
    public static let primaryGradient = LinearGradient(
        gradient: Gradient(colors: [appPrimary, appTeal.opacity(0.85)]),
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Status Colors
    public static func color(forSurveyStatus status: String?) -> Color {
        guard let status = status?.lowercased() else { return textSecondary }
        if status.contains("completed") {
            return categoryGreen
        } else if status.contains("pending") {
            return categoryOrange
        } else {
            return textSecondary
        }
    }
    
    public static func color(forRiskStatus status: String?) -> Color {
        guard let status = status?.lowercased() else { return textSecondary }
        if status.contains("very high") {
            return categoryRed
        } else if status.contains("high") {
            return categoryOrange
        } else if status.contains("moderate") {
            return .yellow
        } else if status.contains("low") {
            return categoryGreen
        }
        return textSecondary
    }
    
    // Smooth Animation
    public static let fluidSpring = Animation.spring(response: 0.35, dampingFraction: 0.8)
}

// MARK: - Popup Appear Modifier
public struct PopupAppearModifier: ViewModifier {
    @State private var scale: CGFloat = 0.93
    @State private var opacity: Double = 0.0
    
    public func body(content: Content) -> some View {
        content
            .scaleEffect(scale)
            .opacity(opacity)
            .onAppear {
                withAnimation(.easeOut(duration: 0.2)) {
                    scale = 1.0
                    opacity = 1.0
                }
            }
    }
}

public struct CardStyle: ViewModifier {
    public func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(Theme.cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(Theme.appPrimary.opacity(0.3), lineWidth: 1.5)
            )
            .shadow(color: Theme.appPrimary.opacity(0.12), radius: 15, x: 0, y: 8)
    }
}

public struct PremiumTextFieldStyle: ViewModifier {
    var icon: String
    
    public func body(content: Content) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(Theme.appPrimary)
                .frame(width: 20)
            
            content
                .font(.body)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color.white)
                .shadow(color: Theme.appPrimary.opacity(0.06), radius: 5, x: 0, y: 2)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Theme.appPrimary.opacity(0.15), lineWidth: 1)
        )
    }
}

public struct ProfessionalTextFieldStyle: ViewModifier {
    public func body(content: Content) -> some View {
        content
            .padding()
            .background(Theme.appTeal.opacity(0.05))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Theme.appPrimary.opacity(0.2), lineWidth: 1.5)
            )
            .cornerRadius(12)
    }
}

public struct AnimatedBackgroundModifier: ViewModifier {
    @State private var animateGradient = false
    
    public func body(content: Content) -> some View {
        content
            .background(
                ZStack {
                    Theme.appBackground.ignoresSafeArea()
                    LinearGradient(
                        gradient: Gradient(colors: [Theme.appBackground, Theme.appTeal.opacity(0.1), Theme.appBackground]),
                        startPoint: animateGradient ? .topLeading : .bottomTrailing,
                        endPoint: animateGradient ? .bottomTrailing : .topLeading
                    )
                    .ignoresSafeArea()
                }
                .animation(.easeInOut(duration: 6.0).repeatForever(autoreverses: true), value: animateGradient)
            )
            .onAppear {
                animateGradient = true
            }
    }
}

public extension View {
    func cardStyle() -> some View {
        self.modifier(CardStyle())
    }
    
    func premiumTextFieldStyle(icon: String) -> some View {
        self.modifier(PremiumTextFieldStyle(icon: icon))
    }
    
    func professionalTextFieldStyle() -> some View {
        self.modifier(ProfessionalTextFieldStyle())
    }
    
    func popupAppear() -> some View {
        self.modifier(PopupAppearModifier())
    }
    
    func animatedBackground() -> some View {
        self.modifier(AnimatedBackgroundModifier())
    }
}
