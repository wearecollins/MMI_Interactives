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
    //initialize to "startup" state
    self->startupState = 0;
    //transition to "fullscreen" state in a second
    self->nextStateTransition = ofGetElapsedTimeMillis() + 2000;
    
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
    
    // attach log4cpp
    // channels can be configured in Resources/log4cpp.properties
    shared_ptr<ofxLog4CppChannel> log(new ofxLog4CppChannel());
    ofSetLoggerChannel(log);
    
    // attach OF event helper
    setupEventHelper(self);
    ofAddListener(ofEvents().keyPressed, eventHelper.get(), &EventHelper::keyReleased);
    
    id globalKey = [NSEvent addGlobalMonitorForEventsMatchingMask:NSEventMaskKeyUp handler:^(NSEvent *e) {
        [self keyUp:e];
    }];
    
    /**************************************
        SET GL
     *************************************/
    ofSetFrameRate(60);
    ofBackground(ofColor(255,255,255,0));
    
    ofGetGLRenderer()->setOrientation(OF_ORIENTATION_DEFAULT, true);
    
    /**************************************
        Build WKWebView
     *************************************/
    
    WKWebViewConfiguration * config = [[WKWebViewConfiguration alloc] init];
    webView = [[Webview alloc] initWithFrame:[self frame] configuration:config];
    
    [webView setNavigationDelegate:self];
    self->isFullscreen = false;
    
    self->lastReloaded = ofGetElapsedTimeMillis();
    self->reloadInterval = 5000;
    
    //delay loading URL until we are fullscreen and stabilized
    //[self loadURL];
    
    [webView setWantsLayer:YES];
    // drawsTransparentBackground is deprecated, I think drawsBackground is the new key
    //[webView setValue:@(YES) forKey:@"drawsTransparentBackground"];
    [webView setValue:@(NO) forKey:@"drawsBackground"];
    
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
    
    ofLogNotice("Frontend")<<"frontend loaded";
}


- (void) loadURL
{
    string urlText = "http://127.0.0.1:8080";
    NSString * url = [NSString stringWithUTF8String:urlText.c_str()];
    
    self->isLoaded = false;
    
    [webView loadRequest:[[NSURLRequest alloc] initWithURL:[NSURL URLWithString:url]]];
}

- (void) goFullscreen
{
    if ( (([[self window] styleMask] & NSWindowStyleMaskFullScreen) == NSWindowStyleMaskFullScreen) ) return;
    
    [[self window] toggleFullScreen:nil];
    
    ofHideCursor();
}

- (void)update
{
    auto t = ofGetElapsedTimeMillis();
    if (self->startupState != 2){
        if (t >= self->nextStateTransition){
            if (self->startupState == 0){
                ofLogNotice("Frontend")<<"going fullscreen";
                [self goFullscreen];
                self->startupState = 1;
                self->nextStateTransition = (t + 2000);
            } else if (self->startupState == 1){
                ofLogNotice("Frontend")<<"requesting webpage";
                [self loadURL];
                self->startupState = 2;
                self->lastReloaded = t;
            }
        }
    } else if ( !self->isLoaded ){
        if ( t - self->lastReloaded > self->reloadInterval ){
            self->lastReloaded = t;
            ofLogNotice("Frontend")<<"frontend not loaded. Trying reload";
            [webView stopLoading];
            [self loadURL];
        }
    }
    
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
        [webView stopLoading];
        [self loadURL];
        
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
