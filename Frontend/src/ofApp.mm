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
        if ( appPtr == nullptr) return;
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
    ofAddListener(ofEvents().keyReleased, eventHelper.get(), &EventHelper::keyReleased);
    
    auto globalKey = [NSEvent addGlobalMonitorForEventsMatchingMask:NSKeyUpMask handler:^(NSEvent *e) {
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
    
    webView = [[Webview alloc] initWithFrame:[self frame]];//] configuration:config];
    
    string urlText = "http://localhost:8000";
    NSString * url = [NSString stringWithUTF8String:urlText.c_str()];
    
    [webView setNavigationDelegate:self];
    
    self->isLoaded = false;
    
    [webView loadRequest:[[NSURLRequest alloc] initWithURL:[NSURL URLWithString:url]]];
    
    [webView setWantsLayer:YES];
    [self setTranslucent:YES];
    [webView setValue:@YES forKey:@"drawsTransparentBackground"];
    
    [[self superview] addSubview:webView positioned:NSWindowAbove relativeTo:nil];
    
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
}

- (void) goFullscreen
{
    [[self window] toggleFullScreen:nil];
    return;
    // this is custom full screen stuff
    // as some of the view ordering things
    // screw up default ofxCocaoView things
    NSPoint center;
    NSRect rect = [self.window frame];
    
    center.x = rect.origin.x + rect.size.width / 2;
    center.y = rect.origin.y + rect.size.height / 2;
    
    NSMutableDictionary *opts = [NSMutableDictionary dictionary];
    
    NSEnumerator *screenEnum = [[NSScreen screens] objectEnumerator];
    NSScreen *screen;
    while (screen = [screenEnum nextObject])
    {
        if (NSPointInRect(center, [screen frame]))
        {
            [[self superview] enterFullScreenMode:screen withOptions:opts];
            break;
        }
    }
    
    auto frame = [[self superview] frame];
    
    [self setBounds:frame];
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
        if ( cameraApp.currentMode == MODE_NONE ){
            [[self superview] addSubview:webView positioned:NSWindowAbove relativeTo:nil];
        } else if ( cameraApp.currentMode >= MODE_GENERAL ){
            [webView removeFromSuperview];
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