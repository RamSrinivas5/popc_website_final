//
//  updatedpopcApp.swift
//  updatedpopc
//
//  Created by G.Ram Srinivas on 25/02/26.
//

import SwiftUI
import UIKit
import ObjectiveC.runtime

// Suppress UINavigationController's slide animation globally —
// every NavigationLink push/pop will be instant, leaving only
// each destination's .popupAppear() (scale 0.93→1 + fade, 200ms)
// as the visible transition throughout the app.
extension UINavigationController {
    static func suppressSlideAnimation() {
        let cls = UINavigationController.self
        // Swizzle pushViewController
        if let orig = class_getInstanceMethod(cls, #selector(UINavigationController.pushViewController(_:animated:))),
           let swiz = class_getInstanceMethod(cls, #selector(UINavigationController.push_noAnim(_:animated:))) {
            method_exchangeImplementations(orig, swiz)
        }
        // Swizzle popViewController
        if let orig = class_getInstanceMethod(cls, #selector(UINavigationController.popViewController(animated:))),
           let swiz = class_getInstanceMethod(cls, #selector(UINavigationController.pop_noAnim(animated:))) {
            method_exchangeImplementations(orig, swiz)
        }
    }

    // After swizzle, calling push_noAnim invokes the original pushViewController IMP
    @objc fileprivate func push_noAnim(_ vc: UIViewController, animated: Bool) {
        push_noAnim(vc, animated: false)
    }

    @objc fileprivate func pop_noAnim(animated: Bool) -> UIViewController? {
        return pop_noAnim(animated: false)
    }
}

@main
struct updatedpopcApp: App {
    init() {
        UINavigationController.suppressSlideAnimation()
    }

    var body: some Scene {
        WindowGroup {
            SplashView()
        }
    }
}

