import SwiftUI

struct PasswordStrengthView: View {
    var password: String
    
    private var strength: Double {
        var score = 0.0
        if password.count >= 8 { score += 0.25 }
        if password.rangeOfCharacter(from: .uppercaseLetters) != nil { score += 0.25 }
        if password.rangeOfCharacter(from: .lowercaseLetters) != nil { score += 0.25 }
        if password.rangeOfCharacter(from: .decimalDigits) != nil ||
           password.rangeOfCharacter(from: .punctuationCharacters) != nil ||
           password.rangeOfCharacter(from: .symbols) != nil { score += 0.25 }
        return score
    }
    
    private var strengthColor: Color {
        if password.isEmpty { return .clear }
        else if strength <= 0.25 { return .red }
        else if strength <= 0.5 { return .orange }
        else if strength <= 0.75 { return .blue }
        else { return .green }
    }
    
    private var strengthLabel: String {
        if password.isEmpty { return "" }
        else if strength <= 0.25 { return "Weak" }
        else if strength <= 0.5 { return "Fair" }
        else if strength <= 0.75 { return "Good" }
        else { return "Strong" }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Password Requirements Box
            VStack(alignment: .leading, spacing: 10) {
                Text("Security Requirements")
                    .font(.system(.subheadline, design: .rounded).weight(.bold))
                    .foregroundColor(Theme.appPrimary)
                
                VStack(alignment: .leading, spacing: 8) {
                    RequirementRow(title: "At least 8 characters", isMet: password.count >= 8)
                    RequirementRow(title: "One uppercase letter", isMet: password.rangeOfCharacter(from: .uppercaseLetters) != nil)
                    RequirementRow(title: "One lowercase letter", isMet: password.rangeOfCharacter(from: .lowercaseLetters) != nil)
                    RequirementRow(title: "One number or symbol", isMet: password.rangeOfCharacter(from: .decimalDigits) != nil ||
                                   password.rangeOfCharacter(from: .punctuationCharacters) != nil ||
                                   password.rangeOfCharacter(from: .symbols) != nil)
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 15)
                    .fill(Color.white)
                    .shadow(color: Color.black.opacity(0.03), radius: 5, x: 0, y: 2)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 15)
                    .stroke(Theme.appPrimary.opacity(0.1), lineWidth: 1)
            )
            
            // Password Strength Bar
            if !password.isEmpty {
                VStack(spacing: 6) {
                    HStack {
                        Text("Strength: \(strengthLabel)")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(strengthColor)
                        Spacer()
                    }
                    
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            Capsule()
                                .fill(Color.gray.opacity(0.1))
                                .frame(height: 6)
                            
                            Capsule()
                                .fill(
                                    LinearGradient(
                                        gradient: Gradient(colors: [strengthColor.opacity(0.7), strengthColor]),
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(width: max(0, geometry.size.width * CGFloat(strength)), height: 6)
                        }
                    }
                    .frame(height: 6)
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding(.horizontal)
        .animation(.spring(), value: password)
    }
}

struct RequirementRow: View {
    let title: String
    let isMet: Bool
    
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: isMet ? "checkmark.circle.fill" : "circle")
                .foregroundColor(isMet ? .green : Color.gray.opacity(0.4))
                .font(.system(size: 14, weight: .bold))
            
            Text(title)
                .font(.system(size: 13, design: .rounded))
                .foregroundColor(isMet ? .primary : .secondary)
        }
    }
}
