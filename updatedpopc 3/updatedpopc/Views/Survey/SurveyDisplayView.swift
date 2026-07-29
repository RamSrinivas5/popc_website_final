import SwiftUI
import UIKit

struct SurveyDisplayView: View {
    let patientPk: Int
    @Environment(\.presentationMode) var presentationMode
    
    @State private var surveyData: SurveyDisplayResponse?
    @State private var isLoading = true
    @State private var showingDownloadOptions = false
    @State private var currentDownloadSection: String? = nil
    @State private var isDownloadingAll = false
    @State private var navigateToSurvey = false
    
    // Sharing state
    @State private var showShareSheet = false
    @State private var shareURL: URL?
    
    var riskLevel: String {
        guard let score = surveyData?.totalScore else { return "Unknown" }
        if score <= 30 { return "Low" }
        else if score <= 45 { return "Moderate" }
        else if score <= 60 { return "High" }
        else { return "Very High" }
    }
    
    var riskColor: Color {
        switch riskLevel {
        case "High": return .orange
        case "Very High": return .red
        case "Moderate": return .yellow
        case "Low": return .green
        default: return .gray
        }
    }
    
    var riskSubText: String {
        switch riskLevel {
        case "High": return "Prefer regional if feasible, strict lung-protective strategy, consider postoperative ICU/HDU."
        case "Very High": return "Strongly consider avoiding GA/ETT if possible; optimize comorbidities pre-op, mandatory ICU planning."
        case "Moderate": return "Lung-protective ventilation, multimodal analgesia, encourage early mobilization."
        default: return "Standard anesthesia; routine monitoring."
        }
    }
    
    var body: some View {
        VStack {
            // Header
            HStack {
                Button(action: { presentationMode.wrappedValue.dismiss() }) {
                    Image(systemName: "chevron.left")
                        .font(.title3.bold())
                        .foregroundColor(Theme.appPrimary)
                        .padding()
                        .background(Circle().fill(Theme.appPrimary.opacity(0.12)))
                }
                Text("SURVEY RESULTS")
                    .font(.title2)
                    .bold()
                    .foregroundColor(Theme.appPrimary)
                Spacer()
            }
            .padding()
            
            if isLoading {
                Spacer()
                ProgressView("Loading Survey...")
                Spacer()
            } else if let survey = surveyData {
                ScrollView {
                    VStack(spacing: 20) {
                        // Risk Header
                        VStack(spacing: 10) {
                            Text("Risk Level: \(riskLevel)")
                                .font(.headline)
                            
                            Text(riskLevel)
                                .font(.title3)
                                .bold()
                                .foregroundColor(.white)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 8)
                                .background(riskColor)
                                .cornerRadius(8)
                            
                            Text(riskSubText)
                                .font(.subheadline)
                                .foregroundColor(.gray)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .cardStyle()
                        
                        // Sections
                        if let sections = survey.sectionScores {
                            ForEach(sections) { section in
                                SectionCard(
                                    section: section.section ?? "Unknown",
                                    score: section.score ?? 0,
                                    answers: survey.answers?.filter { $0.sectionName == section.section } ?? [],
                                    onDownload: {
                                        currentDownloadSection = section.section
                                        isDownloadingAll = false
                                        showingDownloadOptions = true
                                    }
                                )
                            }
                        }
                        
                        // Download All
                        Button(action: {
                            currentDownloadSection = nil
                            isDownloadingAll = true
                            showingDownloadOptions = true
                        }) {
                            HStack {
                                Image(systemName: "arrow.down.doc.fill")
                                Text("Download All Sections")
                                    .font(.system(.headline, design: .rounded).weight(.semibold))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, minHeight: 44)
                        }
                        .background(
                            RoundedRectangle(cornerRadius: 15, style: .continuous)
                                .fill(Theme.primaryGradient)
                        )
                        .shadow(color: Theme.appPrimary.opacity(0.3), radius: 6, x: 0, y: 3)
                        .padding(.top, 20)
                        
                        Button(action: { navigateToSurvey = true }) {
                            HStack {
                                Image(systemName: "pencil.and.outline")
                                Text("Edit / Complete Survey")
                                    .font(.system(.headline, design: .rounded).weight(.semibold))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, minHeight: 44)
                        }
                        .background(
                            RoundedRectangle(cornerRadius: 15, style: .continuous)
                                .fill(Theme.appTeal)
                        )
                        .shadow(color: Theme.appTeal.opacity(0.3), radius: 6, x: 0, y: 3)
                        

                    }
                    .padding(.horizontal)
                }
            } else {
                Spacer()
                VStack(spacing: 20) {
                    Text("Survey not completed.")
                        .font(.headline)
                        .foregroundColor(.gray)
                    
                    Button(action: { navigateToSurvey = true }) {
                        Text("Start / Complete Survey")
                            .font(.system(.headline, design: .rounded).weight(.semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, minHeight: 44)
                    }
                    .background(
                        RoundedRectangle(cornerRadius: 15, style: .continuous)
                            .fill(Theme.primaryGradient)
                    )
                    .shadow(color: Theme.appPrimary.opacity(0.3), radius: 6, x: 0, y: 3)
                }
                Spacer()
            }
        }
        .popupAppear()
        .navigationBarHidden(true)
        .onAppear(perform: loadSurvey)
        .background(
            NavigationLink(destination: PatientDemographicsView(patientId: patientPk), isActive: $navigateToSurvey) {
                EmptyView()
            }
        )
        .actionSheet(isPresented: $showingDownloadOptions) {
            ActionSheet(
                title: Text("Choose format to download"),
                buttons: [
                    .default(Text("PDF")) { downloadReport(format: "PDF") },
                    .default(Text("TXT (Text File)")) { downloadReport(format: "TXT") },
                    .default(Text("CSV")) { downloadReport(format: "CSV") },
                    .cancel()
                ]
            )
        }
        .sheet(isPresented: $showShareSheet) {
            if let url = shareURL {
                ShareSheet(items: [url])
            }
        }
    }
    
    private func loadSurvey() {
        ApiClient.shared.request(endpoint: "api/surveys/patient/\(patientPk)/") {
            (result: Result<SurveyDisplayResponse, Error>) in
            DispatchQueue.main.async {
                self.isLoading = false
                if case .success(let s) = result {
                    self.surveyData = s
                }
            }
        }
    }
    
    private func downloadReport(format: String) {
        let sectionName = isDownloadingAll ? "All_Sections" : (currentDownloadSection?.replacingOccurrences(of: " ", with: "_") ?? "Unknown")
        let fileName = "Patient_\(patientPk)_Survey_\(sectionName).\(format.lowercased())"
        
        let fileManager = FileManager.default
        guard let documentDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first else { return }
        let fileURL = documentDirectory.appendingPathComponent(fileName)
        
        var content = ""
        
        if format == "PDF" || format == "TXT" {
            content += "Patient ID: \(patientPk)\n"
            content += "Risk Level: \(riskLevel)\n"
            content += "Total Score: \(surveyData?.totalScore ?? 0)\n\n"
            
            let sectionsToExport = isDownloadingAll ? surveyData?.sectionScores : surveyData?.sectionScores?.filter { $0.section == currentDownloadSection }
            
            if let sections = sectionsToExport {
                for section in sections {
                    content += "--- \(section.section ?? "Unknown Section") (Score: \(section.score ?? 0)) ---\n"
                    let answers = surveyData?.answers?.filter { $0.sectionName == section.section } ?? []
                    for answer in answers {
                        let q = answer.question ?? ""
                        let a = answer.selectedOption ?? answer.customText ?? ""
                        content += "Q: \(q)\nA: \(a)\n\n"
                    }
                }
            }
        }
        
        if format == "CSV" {
            content += "Patient ID,Question,Answer,Score,Section\n"
            let sectionsToExport = isDownloadingAll ? surveyData?.sectionScores : surveyData?.sectionScores?.filter { $0.section == currentDownloadSection }
            
            if let sections = sectionsToExport {
                for section in sections {
                    let answers = surveyData?.answers?.filter { $0.sectionName == section.section } ?? []
                    for answer in answers {
                        let q = answer.question?.replacingOccurrences(of: ",", with: " ") ?? ""
                        let a = (answer.selectedOption ?? answer.customText ?? "").replacingOccurrences(of: ",", with: " ")
                        let s = "\(answer.score ?? 0)"
                        let sec = (answer.sectionName ?? "").replacingOccurrences(of: ",", with: " ")
                        content += "\(patientPk),\(q),\(a),\(s),\(sec)\n"
                    }
                }
            }
        }
        
        do {
            if format == "PDF" {
                let pdfData = createPDF(from: content)
                try pdfData.write(to: fileURL)
            } else {
                try content.write(to: fileURL, atomically: true, encoding: .utf8)
            }
            self.shareURL = fileURL
            self.showShareSheet = true
        } catch {
            print("Error saving file: \(error.localizedDescription)")
        }
    }
    
    private func createPDF(from text: String) -> Data {
        let formatter = UISimpleTextPrintFormatter(text: text)
        formatter.perPageContentInsets = UIEdgeInsets(top: 72, left: 72, bottom: 72, right: 72)
        
        let render = UIPrintPageRenderer()
        render.addPrintFormatter(formatter, startingAtPageAt: 0)
        
        let page = CGRect(x: 0, y: 0, width: 595.2, height: 841.8) // A4 size
        render.setValue(NSValue(cgRect: page), forKey: "paperRect")
        render.setValue(NSValue(cgRect: page), forKey: "printableRect")
        
        let pdfData = NSMutableData()
        UIGraphicsBeginPDFContextToData(pdfData, .zero, nil)
        
        for i in 0..<render.numberOfPages {
            UIGraphicsBeginPDFPage()
            render.drawPage(at: i, in: UIGraphicsGetPDFContextBounds())
        }
        
        UIGraphicsEndPDFContext()
        
        return pdfData as Data
    }
}

struct SectionCard: View {
    let section: String
    let score: Int
    let answers: [SurveyDisplayResponse.Answer]
    let onDownload: () -> Void
    
    @State private var isExpanded = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text(section)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text("\(score)")
                    .font(.subheadline)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(5)
                
                Button(action: onDownload) {
                    Image(systemName: "arrow.down.circle")
                        .foregroundColor(.black)
                }
                .padding(.horizontal, 10)
                
                Button(action: { isExpanded.toggle() }) {
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundColor(.black)
                }
            }
            .padding()
            .background(Theme.appBackground)
            
            // Expanded Content
            if isExpanded {
                VStack(spacing: 10) {
                    ForEach(answers) { answer in
                        HStack(alignment: .top) {
                            Text("Q: \(answer.question ?? "")")
                                .font(.subheadline)
                                .foregroundColor(.black)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            
                            Text("A: \(answer.selectedOption ?? answer.customText ?? "")")
                                .font(.subheadline)
                                .foregroundColor(.black)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .padding(.vertical, 4)
                        Divider()
                    }
                }
                .padding()
            }
        }
        .cardStyle()
    }
}

#Preview {
    NavigationView {
        SurveyDisplayView(patientPk: 1)
    }
}
