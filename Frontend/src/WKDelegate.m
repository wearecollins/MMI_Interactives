//
//  WKDelegate.m
//  cocoaViewTest_WK
//
//  Created by Brett Renfer on 3/18/16.
//
//

#import "WKDelegate.h"

//@interface WKDelegate ()

@implementation WKDelegate

@synthesize isLoaded;

- (void)webView:(WKWebView *)webView didFinishNavigation:(null_unspecified WKNavigation *)navigation
{
    if ( isLoaded != NULL){
        *isLoaded = true;
    }
    NSLog(@"Yes");
}

@end
