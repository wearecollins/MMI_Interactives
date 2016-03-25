#pragma once

#include "ofMain.h"
#include "BlackFlyCamera.h"
#include "ofxCocoaGLView.h"
#include "WKDelegate.h"
#import <WebKit/WebKit.h>

#include "SysCommand.h"

@interface ofApp : ofxCocoaGLView {
    WKWebView * webView;
    mmi::BlackFlyCamera camera;
    WKDelegate * delegate;
    bool isLoaded;
    
    StringOutputCommand webserver;
}

- (void)setup;
- (void)update;
- (void)draw;
- (void)exit;

- (void)keyPressed:(int)key;
- (void)keyReleased:(int)key;
- (void)mouseMoved:(NSPoint)p;
- (void)mouseDragged:(NSPoint)p button:(int)button;
- (void)mousePressed:(NSPoint)p button:(int)button;
- (void)mouseReleased:(NSPoint)p button:(int)button;
- (void)windowResized:(NSSize)size;


@property (nonatomic, retain) WKDelegate *delegate;


@end
