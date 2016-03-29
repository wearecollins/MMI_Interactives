#pragma once

#include "ofMain.h"

#include "CameraApp.h"
#include "ofxCocoaGLView.h"
#include "Webview.h"

#include "SysCommand.h"

@interface ofApp : ofxCocoaGLView <WKNavigationDelegate> {
    Webview * webView;
    CameraApp cameraApp;
    bool isLoaded;
}

- (void)setup;
- (void)update;
- (void)draw;
- (void)exit;

- (void) goFullscreen;

- (void)keyPressed:(int)key;
- (void)keyReleased:(int)key;
- (void)mouseMoved:(NSPoint)p;
- (void)mouseDragged:(NSPoint)p button:(int)button;
- (void)mousePressed:(NSPoint)p button:(int)button;
- (void)mouseReleased:(NSPoint)p button:(int)button;
- (void)windowResized:(NSSize)size;


@end
