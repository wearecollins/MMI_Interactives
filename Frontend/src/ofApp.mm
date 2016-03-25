#import "ofApp.h"
#import "Poco/Format.h"

@implementation ofApp

@synthesize delegate;

- (void)setup
{
    ofSetFrameRate(60);
    ofBackground(ofColor(255,255,255,0));
    
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
        Start Webserver
     *************************************/
    
    string cmd = "bash --login -c 'cd " + ofToDataPath("web", true) + " && node index.js'";
    webserver.callCommand(cmd);
    
    ofSleepMillis(1000);
    
    /**************************************
        Build WKWebView
     *************************************/
    
    webView = [[WKWebView alloc] initWithFrame:[self frame]];//] configuration:config];
    
    string urlText = "http://localhost:8000";
    NSString * url = [NSString stringWithUTF8String:urlText.c_str()];
    
    self.delegate = [[WKDelegate alloc] init];
    
    // this is silly
    self.delegate.isLoaded = &self->isLoaded;
    
    [webView setNavigationDelegate:self.delegate];
    
    self->isLoaded = false;
    
    [webView loadRequest:[[NSURLRequest alloc] initWithURL:[NSURL URLWithString:url]]];
    
    [self setWantsLayer:YES];
    [webView setWantsLayer:YES];
    [self setTranslucent:YES];
    [webView setValue:@YES forKey:@"drawsTransparentBackground"];
    
    [[self superview] addSubview:self positioned:NSWindowAbove relativeTo:nil];
    [[self superview] addSubview:webView positioned:NSWindowAbove relativeTo:nil];
    
    /**************************************
         Open camera(s)
     *************************************/
    
    // TODO: work with Camera app
    
    camera.setup("b09d0100eefbf3");
}

- (void)update
{
    if ( self->isLoaded ){
        self->isLoaded = false;
        
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
    }
}

- (void)draw
{
    ofSetColor(100);
    ofSetRectMode(OF_RECTMODE_CENTER);
    ofTranslate(ofGetWidth()/2.0, ofGetHeight()/2.0);
    ofRotateZ(sin(ofGetElapsedTimef())*180);
    ofDrawRectangle(0, 0, 640, 480);
//    camera.draw(0,0);
}

- (void)exit
{
    StringOutputCommand sys;
    string cmd = "\"node index.js\"";
    string killCmd = "ps aux | grep " + cmd +" | grep -v grep | awk '{print $ 2}'";
    
    string output = sys.execOutput( (char *) killCmd.c_str() );
    cout << output << endl;
    string die = "kill "+output ;
    system( (char *) die.c_str() );
}

- (void)keyPressed:(int)key
{
    
}

- (void)keyReleased:(int)key
{
    if ( key =='r'){
        [webView reload:nil];
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