//
//  WKDelegate.h
//  cocoaViewTest_WK
//
//  Created by Brett Renfer on 3/18/16.
//
//

#import <WebKit/WebKit.h>

@interface WKDelegate : NSObject <WKNavigationDelegate> {
    bool * isLoaded;
}

@property (readwrite) bool * isLoaded;

@end
