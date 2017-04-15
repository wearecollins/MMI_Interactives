#pragma once

#include "ofMain.h"
#include "ofxLog4CppChannel.h"

#include "CameraApp.h"
#include "ofxCocoaGLView.h"
#include "Webview.h"

#include "SysCommand.h"

@interface ofApp : ofxCocoaGLView <WKNavigationDelegate> {
    ofLogLevel(OF_LOG_VERBOSE);
    Webview * webView;
    mmi::CameraApp cameraApp;
    bool isLoaded;
    bool isFullscreen;
    uint64_t startupState;
    uint64_t nextStateTransition;
    
    // in case frontend starts before webserver
    uint64_t lastReloaded, reloadInterval;
}

- (void)setup;
- (void)update;
- (void)draw;
- (void)exit;

- (void) goFullscreen;

- (void) loadURL;

- (void)keyPressed:(int)key;
- (void)keyReleased:(int)key;
- (void)mouseMoved:(NSPoint)p;
- (void)mouseDragged:(NSPoint)p button:(int)button;
- (void)mousePressed:(NSPoint)p button:(int)button;
- (void)mouseReleased:(NSPoint)p button:(int)button;
- (void)windowResized:(NSSize)size;


@end
