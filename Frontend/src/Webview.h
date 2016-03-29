//
//  Webview.h
//  Frontend
//
//  Created by Brett Renfer on 3/28/16.
//
//

#import <WebKit/WebKit.h>

@interface Webview : WKWebView <NSWindowDelegate, WKNavigationDelegate> {
    @public
    id localMonitorHandler;
}

@end
