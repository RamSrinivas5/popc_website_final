import SwiftUI

struct DoctorProfileIconView: View {
    @ObservedObject var sharedPrefs = SharedPrefManager.shared
    var size: CGFloat = 40
    var iconColor: Color = .gray
    
    var body: some View {
        if sharedPrefs.profileImageUrl.isEmpty {
            Image(systemName: "person.crop.circle.fill")
                .resizable()
                .frame(width: size, height: size)
                .foregroundColor(iconColor)
        } else {
            AsyncImage(url: URL(string: sharedPrefs.profileImageUrl)) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                default:
                    Image(systemName: "person.crop.circle.fill")
                        .resizable()
                        .foregroundColor(iconColor)
                }
            }
            .frame(width: size, height: size)
            .clipShape(Circle())
        }
    }
}
