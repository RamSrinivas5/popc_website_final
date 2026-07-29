//
//  ContentView.swift
//  updatedpopc
//
//  Created by M.PAVANKALYAN on 25/02/26.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "cross.case.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 80, height: 80)
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(Theme.appPrimary)
            Text("PPC App")
                .font(.largeTitle)
                .bold()
                .foregroundColor(.primary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .animatedBackground()
    }
}

#Preview {
    ContentView()
}
