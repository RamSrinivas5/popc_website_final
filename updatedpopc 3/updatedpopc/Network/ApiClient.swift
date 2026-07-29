import Foundation

class ApiClient {
    static let shared = ApiClient()
    
    let baseURL = "http://180.235.121.245:8065/"
    
    // Standard session (60s timeout) for all normal API calls
    private let session = URLSession.shared
    
    // Long timeout session (5 minutes) specifically for AI chat calls
    private let chatSession: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 300   // 5 minutes
        config.timeoutIntervalForResource = 300
        return URLSession(configuration: config)
    }()
    
    private init() {}
    
    func request<T: Decodable>(endpoint: String, method: String = "GET", body: Data? = nil, requiresAuth: Bool = true, completion: @escaping (Result<T, Error>) -> Void) {
        guard let url = URL(string: baseURL + endpoint) else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0, userInfo: nil)))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        if let body = body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        
        if requiresAuth, let token = SharedPrefManager.shared.getToken() {
            request.setValue("Token \(token)", forHTTPHeaderField: "Authorization")
        }
        
        session.dataTask(with: request) { data, response, error in
            self.handleResponse(data: data, response: response, error: error, endpoint: endpoint, completion: completion)
        }.resume()
    }
    
    // ✅ Use this for the PPC AI chatbot — it has a 5-minute timeout
    func chatRequest<T: Decodable>(endpoint: String, body: Data?, completion: @escaping (Result<T, Error>) -> Void) {
        guard let url = URL(string: baseURL + endpoint) else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0, userInfo: nil)))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = SharedPrefManager.shared.getToken() {
            request.setValue("Token \(token)", forHTTPHeaderField: "Authorization")
        }
        request.httpBody = body
        
        chatSession.dataTask(with: request) { data, response, error in
            self.handleResponse(data: data, response: response, error: error, endpoint: endpoint, completion: completion)
        }.resume()
    }

    func multipartRequest<T: Decodable>(endpoint: String, method: String = "PATCH", fields: [String: String], image: Data? = nil, completion: @escaping (Result<T, Error>) -> Void) {
        guard let url = URL(string: baseURL + endpoint) else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0, userInfo: nil)))
            return
        }

        let boundary = "Boundary-\(UUID().uuidString)"
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        if let token = SharedPrefManager.shared.getToken() {
            request.setValue("Token \(token)", forHTTPHeaderField: "Authorization")
        }

        var body = Data()

        // Text fields
        for (key, value) in fields {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(value)\r\n".data(using: .utf8)!)
        }

        // Image field
        if let imageData = image {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"profile_image\"; filename=\"profile.jpg\"\r\n".data(using: .utf8)!)
            body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
            body.append(imageData)
            body.append("\r\n".data(using: .utf8)!)
        }

        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body

        session.dataTask(with: request) { data, response, error in
            self.handleResponse(data: data, response: response, error: error, endpoint: endpoint, completion: completion)
        }.resume()
    }
    
    private func handleResponse<T: Decodable>(data: Data?, response: URLResponse?, error: Error?, endpoint: String, completion: @escaping (Result<T, Error>) -> Void) {
        if let error = error {
            DispatchQueue.main.async { completion(.failure(error)) }
            return
        }
        
        guard let httpResponse = response as? HTTPURLResponse else {
            DispatchQueue.main.async { completion(.failure(NSError(domain: "Invalid Response", code: 0, userInfo: nil))) }
            return
        }
        
        guard let data = data else {
            DispatchQueue.main.async { completion(.failure(NSError(domain: "No Data", code: httpResponse.statusCode, userInfo: nil))) }
            return
        }
        
        if !(200...299).contains(httpResponse.statusCode) {
            let errorBody = String(data: data, encoding: .utf8) ?? "Unknown Error"
            print("API Error [\(httpResponse.statusCode)] at \(endpoint): \(errorBody)")
            DispatchQueue.main.async {
                completion(.failure(NSError(domain: "Server Error", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: errorBody])))
            }
            return
        }
        
        do {
            if T.self == Data.self {
                DispatchQueue.main.async { completion(.success(data as! T)) }
                return
            }
            let decoded = try JSONDecoder().decode(T.self, from: data)
            DispatchQueue.main.async { completion(.success(decoded)) }
        } catch {
            let bodyString = String(data: data, encoding: .utf8) ?? "Could not decode body"
            print("Decoding Error for \(endpoint): \(error). Body: \(bodyString)")
            DispatchQueue.main.async { completion(.failure(error)) }
        }
    }
}
