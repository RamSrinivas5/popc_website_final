import SwiftUI
import Combine

struct PPCChatView: View {
    @Environment(\.presentationMode) var presentationMode
    
    @State private var messages: [ChatMessage] = []
    @State private var inputText: String = ""
    @State private var patientId: String?
    @State private var isAITyping = false
    
    init(patientId: String? = nil) {
        _patientId = State(initialValue: patientId)
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            Theme.primaryGradient
            .overlay(
                HStack {
                    Button(action: { NotificationCenter.default.post(name: NSNotification.Name("GoHomeNotification"), object: nil) }) {
                        Image(systemName: "chevron.left")
                            .font(.title3.bold())
                            .foregroundColor(.white)
                            .padding()
                            .background(Circle().fill(Color.white.opacity(0.2)))
                    }
                    
                    VStack(alignment: .leading) {
                        Text("PPC Chatbot")
                            .font(.title3)
                            .bold()
                            .foregroundColor(.white)
                        Text("PATIENT ID: \(patientId ?? "NOT SET")")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                    }
                    
                    Spacer()
                    if #available(iOS 16.0, *) {
                        NavigationLink(destination: ProfileView()) {
                            DoctorProfileIconView(size: 40, iconColor: .white)
                        }
                    }
                }
                .padding()
            )
            .frame(height: 110)
            
            // Chat List
            ScrollViewReader { proxy in
                ScrollView {
                    VStack(spacing: 15) {
                        ForEach(messages) { message in
                            ChatBubble(message: message)
                        }
                        
                        if isAITyping {
                            HStack {
                                TypingIndicator()
                                    .padding(.horizontal)
                                Spacer()
                            }
                            .id("typingIndicator")
                        }
                    }
                    .padding()
                }
                .background(Theme.appBackground)
                .onChange(of: messages.count) { _ in
                    scrollToBottom(proxy: proxy)
                }
                .onChange(of: isAITyping) { typing in
                    if typing {
                        withAnimation { proxy.scrollTo("typingIndicator", anchor: .bottom) }
                    }
                }
            }
            
            // Input Bar
            VStack(spacing: 0) {
                Divider()
                HStack(spacing: 12) {
                    TextField("Type your medical query...", text: $inputText)
                        .professionalTextFieldStyle()
                    
                    Button(action: sendMessage) {
                        Image(systemName: "paperplane.fill")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white)
                            .padding(12)
                            .background(
                                LinearGradient(colors: [Theme.appPrimary, Theme.appTeal], startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                            .clipShape(Circle())
                            .shadow(color: Color.blue.opacity(0.3), radius: 5, x: 0, y: 3)
                    }
                    .disabled(inputText.trimmingCharacters(in: .whitespaces).isEmpty)
                }
                .padding()
                .background(Theme.cardBackground)
            }
        }
        .popupAppear()
        .animatedBackground()
        .navigationBarHidden(true)
        .onAppear {
            if messages.isEmpty {
                if let pid = patientId {
                    addAi("Hello! I'm your PPC Assistant. I'm ready to analyze records for Patient **\(pid)**. What would you like to know?")
                } else {
                    addAi("Welcome! Please enter the **Patient ID** (e.g., PID0001) so I can access their PPC risk data.")
                }
            }
        }
    }
    
    private func scrollToBottom(proxy: ScrollViewProxy) {
        if let last = messages.last {
            withAnimation {
                proxy.scrollTo(last.id, anchor: .bottom)
            }
        }
    }
    
    private func sendMessage() {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        
        addUser(text)
        inputText = ""
        
        let pidPattern = "^(?i)PID\\d{4}$"
        let isPidFormat = text.range(of: pidPattern, options: .regularExpression) != nil
        
        if patientId == nil {
            if isPidFormat {
                patientId = text.uppercased()
                addAi("Patient ID **\(patientId!)** confirmed. Analyzing survey results... How can I help?")
            } else {
                addAi("I need a valid Patient ID to continue. Please enter it in the format: **PID0001**.")
            }
            return
        }
        
        if isPidFormat && text.uppercased() != patientId {
            patientId = text.uppercased()
            addAi("Switched context to Patient **\(patientId!)**. Ask me anything about their risks.")
            return
        }
        
        sendQuestionToApi(question: text)
    }
    
    private func sendQuestionToApi(question: String) {
        guard let pid = patientId else { return }
        isAITyping = true
        
        let body: [String: Any] = ["question": question, "patient_id": pid]
        guard let requestBody = try? JSONSerialization.data(withJSONObject: body) else {
            isAITyping = false
            return
        }
        
        struct ChatResponse: Decodable {
            let answer: String?
            let success: Bool?
            let error: String?
            let debug: String?
        }
        
        ApiClient.shared.chatRequest(endpoint: "api/ppc-qwen-chat/", body: requestBody) { (result: Result<ChatResponse, Error>) in
            DispatchQueue.main.async {
                self.isAITyping = false
                switch result {
                case .success(let response):
                    if let answer = response.answer, !answer.isEmpty {
                        addAi(answer)
                    } else if let errorMsg = response.error {
                        let debugMsg = response.debug != nil ? "\nDetails: \(response.debug!)" : ""
                        addAi("Medical Analysis Error: \(errorMsg)\(debugMsg)")
                    } else {
                        addAi("I couldn't generate an analysis. Please ensure the Patient ID is correct and they have a completed survey.")
                    }
                case .failure(let error):
                    // Try to parse the error body if it's a JSON string from our server
                    let errorDesc = error.localizedDescription
                    if let data = errorDesc.data(using: .utf8),
                       let errorResponse = try? JSONDecoder().decode(ChatResponse.self, from: data) {
                        let msg = errorResponse.error ?? "Unknown server error"
                        let debugMsg = errorResponse.debug != nil ? "\nDetails: \(errorResponse.debug!)" : ""
                        addAi("Medical Analysis Error: \(msg)\(debugMsg)")
                    } else {
                        addAi("Connection Error: \(errorDesc)\nPlease ensure the backend server is running and reachable.")
                    }
                }
            }
        }
    }
    
    private func addUser(_ text: String) {
        messages.append(ChatMessage(text: text, isUser: true))
    }
    
    private func addAi(_ text: String) {
        messages.append(ChatMessage(text: text, isUser: false))
    }
}

struct ChatBubble: View {
    let message: ChatMessage
    
    var body: some View {
        HStack {
            if message.isUser {
                Spacer()
                Text(message.text)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Theme.primaryGradient)
                    .foregroundColor(.white)
                    .clipShape(ChatBubbleShape(isUser: true))
                    .shadow(color: Theme.appPrimary.opacity(0.3), radius: 5, x: 0, y: 3)
            } else {
                Text(message.text)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Theme.cardBackground)
                    .foregroundColor(Theme.textPrimary)
                    .clipShape(ChatBubbleShape(isUser: false))
                    .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
                Spacer()
            }
        }
    }
}

struct TypingIndicator: View {
    @State private var dotCount = 0
    let timer = Timer.publish(every: 0.4, on: .main, in: .common).autoconnect()
    
    var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<3) { index in
                Circle()
                    .fill(Color.gray.opacity(index == dotCount ? 1.0 : 0.3))
                    .frame(width: 8, height: 8)
            }
        }
        .padding(12)
        .background(Color.white)
        .clipShape(Capsule())
        .onReceive(timer) { _ in
            withAnimation { dotCount = (dotCount + 1) % 3 }
        }
    }
}

struct ChatBubbleShape: Shape {
    let isUser: Bool
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect,
                                byRoundingCorners: [.topLeft, .topRight, isUser ? .bottomLeft : .bottomRight],
                                cornerRadii: CGSize(width: 18, height: 18))
        return Path(path.cgPath)
    }
}

#Preview {
    NavigationView {
        PPCChatView()
    }
}
