//
//  ImagePickerModule.swift
//  ImagePickerModule
//
//  Copyright © 2022 Marcos Fuenmayor. All rights reserved.
//

import Foundation

@objc(ImagePickerModule)
class ImagePickerModule: NSObject {
  @objc
  func constantsToExport() -> [AnyHashable : Any]! {
    return ["count": 1]
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
