#import "ofApp.h"
#import "Poco/Format.h"

/**
    Wrapper class to allow us to hook into OF events.
 */
class EventHelper {
public:
    
    EventHelper(ofApp * app){
        this->appPtr = app;
    }
    
    ofApp * appPtr;
    
    void keyReleased( ofKeyEventArgs & e ){
        if ( appPtr == nullptr){
            ofLogError()<<"App ptr is null";
            return;
        }
        [appPtr keyReleased:e.key];
    }
};

static ofPtr<EventHelper> eventHelper;

static void setupEventHelper(ofApp *app)
{
    if (eventHelper) return;
    eventHelper = ofPtr<EventHelper>(new EventHelper(app));
}

@implementation ofApp

- (void)setup
{
    // attach OF event helper
    setupEventHelper(self);
    ofAddListener(ofEvents().keyPressed, eventHelper.get(), &EventHelper::keyReleased);
    
    // attach log4cpp
    // channels can be configured in bin/data/log4cpp.properties
    shared_ptr<ofxLog4CppChannel> log(new ofxLog4CppChannel());
    ofSetLoggerChannel(log);
    
    id globalKey = [NSEvent addGlobalMonitorForEventsMatchingMask:NSKeyUpMask handler:^(NSEvent *e) {
        [self keyUp:e];
    }];
    
    /**************************************
        SET GL
     *************************************/
    ofSetFrameRate(60);
    ofBackground(ofColor(255,255,255,0));
    
    ofGetGLRenderer()->setOrientation(OF_ORIENTATION_DEFAULT, true);
    
    /**************************************
        Serve/load from Resources
     *************************************/
    
    // this code is amazing, and from here:
    // https://github.com/hideyukisaito/ofxBundleResources
    
    CFURLRef  bundleURL_ = CFBundleCopyResourcesDirectoryURL(CFBundleGetMainBundle());
    char buf_[4096];
    
    if (CFURLGetFileSystemRepresentation(bundleURL_, TRUE, (UInt8 *)buf_, 4096))
    {
        string path_ = buf_;
        string str   = "";
        ofSetDataPathRoot(Poco::format("%s/%s", path_, str));
        path_.clear();
    }
    CFRelease(bundleURL_);
    
    /**************************************
        Build WKWebView
     *************************************/
    
    WKWebViewConfiguration * config = [[WKWebViewConfiguration alloc] init];
    webView = [[Webview alloc] initWithFrame:[self frame] configuration:config];
    
    string urlText = "http://127.0.0.1:8080";
    NSString * url = [NSString stringWithUTF8String:urlText.c_str()];
    
    [webView setNavigationDelegate:self];
    
    self->isLoaded = false;
    self->isFullscreen = false;
    
    [webView loadRequest:[[NSURLRequest alloc] initWithURL:[NSURL URLWithString:url]]];
    
    [webView setWantsLayer:YES];
    [webView setValue:@YES forKey:@"drawsTransparentBackground"];
    
    [[self superview] addSubview:webView positioned:NSWindowAbove relativeTo:nil];
    
    ofHideCursor();
    
    /**************************************
         Open camera(s)
     *************************************/
    
    cameraApp.setup(false);
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(null_unspecified WKNavigation *)navigation
{
    if ( self->isLoaded) return;
    self->isLoaded = true;
    [self goFullscreen];
    
    ofLogVerbose()<<"[ofApp] - frontend loaded";
}

- (void) goFullscreen
{
    if ( (([[self window] styleMask] & NSFullScreenWindowMask) == NSFullScreenWindowMask) ) return;
    
    [[self window] toggleFullScreen:nil];
    
    ofHideCursor();
}

- (void)update
{
    cameraApp.update();
}

- (void)draw
{
    ofSetColor(255);
    cameraApp.draw();
}

- (void)exit
{
}

- (void)keyPressed:(int)key
{
    
}

- (void)keyReleased:(int)key
{
    if ( key =='R'){
        [webView reload:nil];
    } else if ( key == 'm' ){
        if ( cameraApp.currentMode == mmi::MODE_NONE ){
            [[self superview] addSubview:webView positioned:NSWindowAbove relativeTo:nil];
            ofHideCursor();
        } else {
            [webView removeFromSuperview];
            ofShowCursor();
        }
    }
}

- (void)mouseMoved:(NSPoint)p
{
    
}

- (void)mouseDragged:(NSPoint)p button:(int)button
{
    
}

- (void)mousePressed:(NSPoint)p button:(int)button
{
    
}

- (void)mouseReleased:(NSPoint)p button:(int)button
{
    
}

- (void)windowResized:(NSSize)size
{
    [webView setFrame:[self frame]];
}

@end