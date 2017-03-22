//
//  Webview.m
//  Frontend
//
//  Created by Brett Renfer on 3/28/16.
//
//

#include "ofMain.h"
#import "Webview.h"

@implementation Webview

//@synthesize onLoaded;

- (id) initWithFrame:(NSRect)frameRect
{
    [super initWithFrame:frameRect];
    
    localMonitorHandler = [NSEvent addLocalMonitorForEventsMatchingMask:NSEventMaskMouseMoved handler:^(NSEvent *e) {
        [self _mouseMoved:e];
        return e;
    }];
    return self;
}

- (void)drawRect:(NSRect)dirtyRect {
    [super drawRect:dirtyRect];
}


- (NSPoint)getCurrentMousePos
{
    NSPoint mouse = [NSEvent mouseLocation];
    NSPoint p = [self.window convertRectFromScreen:NSMakeRect(mouse.x, mouse.y, 1.,1.)].origin;
    p = [self convertPoint:p fromView:nil];
    
    if ( ofIsVFlipped() ){
        p.y = ofGetHeight() - p.y;
    }
    
    return p;
}

static int conv_button_number(int n)
{
    static int table[] = {0, 2, 1};
    return table[n];
}

- (void)mouseDown:(NSEvent *)theEvent
{
    NSPoint p = [self getCurrentMousePos];

    [self beginWindowEvent];
    
    int b = conv_button_number([theEvent buttonNumber]);
    ofEvents().notifyMousePressed(p.x, p.y, b);
    
    [self endWindowEvent];
    
    [super mouseDown:theEvent];
}

- (void)mouseDragged:(NSEvent *)theEvent
{
    
    NSPoint p = [self getCurrentMousePos];
    
    [self beginWindowEvent];
    
    int b = conv_button_number([theEvent buttonNumber]);
    ofEvents().notifyMouseDragged(p.x, p.y, b);
    
    [self endWindowEvent];
}

- (void)mouseUp:(NSEvent *)theEvent
{
    NSPoint p = [self getCurrentMousePos];
    
    [self beginWindowEvent];
    
    int b = conv_button_number([theEvent buttonNumber]);
    ofEvents().notifyMouseReleased(p.x, p.y, b);
    
    [self endWindowEvent];
    
    [super mouseUp:theEvent];
}

- (void)_mouseMoved:(NSEvent *)theEvent
{
    NSPoint p = [self getCurrentMousePos];
    
    [self beginWindowEvent];
    
    ofEvents().notifyMouseMoved(p.x, p.y);
    
    [self endWindowEvent];
}

- (void)rightMouseDown:(NSEvent *)theEvent
{
    
    NSPoint p = [self getCurrentMousePos];
    
    [self beginWindowEvent];
    
    int b = conv_button_number([theEvent buttonNumber]);
    ofEvents().notifyMousePressed(p.x, p.y, b);
    
    [self endWindowEvent];
}

- (void)rightMouseDragged:(NSEvent *)theEvent
{
    
    NSPoint p = [self getCurrentMousePos];
    
    [self beginWindowEvent];
    
    int b = conv_button_number([theEvent buttonNumber]);
    ofEvents().notifyMouseDragged(p.x, p.y, b);
    
    [self endWindowEvent];
}

- (void)rightMouseUp:(NSEvent *)theEvent
{
    
    NSPoint p = [self getCurrentMousePos];
    
    [self beginWindowEvent];
    
    int b = conv_button_number([theEvent buttonNumber]);
    ofEvents().notifyMouseReleased(p.x, p.y, b);
    
    [self endWindowEvent];
}

-(void)flagsChanged:(NSEvent *)theEvent {
    [self beginWindowEvent];
    
    NSEventModifierFlags flags = [theEvent modifierFlags];
    
    if( flags & NSEventModifierFlagCommand ){
        ofEvents().notifyKeyPressed(OF_KEY_SUPER);
        
    } else if( flags & NSEventModifierFlagShift ){
        ofEvents().notifyKeyPressed(OF_KEY_SHIFT);
        
    } else if( flags & NSEventModifierFlagControl ){
        ofEvents().notifyKeyPressed(OF_KEY_CONTROL);
        
    }   else if( flags & NSEventModifierFlagOption ){
        ofEvents().notifyKeyPressed(OF_KEY_ALT);
        
    } else {
        switch( [theEvent keyCode] ){
            case 58:
                ofEvents().notifyKeyReleased(OF_KEY_ALT);
                break;
            case 55:
                ofEvents().notifyKeyReleased(OF_KEY_SUPER);
                break;
                
            case 56:
                ofEvents().notifyKeyReleased(OF_KEY_SHIFT);
                break;
                
            case 59:
                ofEvents().notifyKeyReleased(OF_KEY_CONTROL);
                break;
        }
    }
    //    } else if( flags & NSNumericPadKeyMask ){
    //        ofNotifyKeyPressed(OF_KEY_SUPER);
    //    } else if( flags & NSHelpKeyMask ){
    //        ofNotifyKeyPressed(OF_KEY_SUPER);
    //    } else if( flags & NSFunctionKeyMask ){
    //        ofNotifyKeyPressed(OF_KEY_);
    //    }
    
    [self endWindowEvent];
}

#define KEY_CASE(CODE, KEY) case CODE: key = KEY; break;

- (void)keyDown:(NSEvent *)theEvent
{
    const char *c = [[theEvent charactersIgnoringModifiers] UTF8String];
    int key = c[0];
    
    switch ([theEvent keyCode]) {
            KEY_CASE(122, OF_KEY_F1);
            KEY_CASE(120, OF_KEY_F2);
            KEY_CASE(99, OF_KEY_F3);
            KEY_CASE(118, OF_KEY_F4);
            KEY_CASE(96, OF_KEY_F5);
            KEY_CASE(97, OF_KEY_F6);
            KEY_CASE(98, OF_KEY_F7);
            KEY_CASE(100, OF_KEY_F8);
            KEY_CASE(101, OF_KEY_F9);
            KEY_CASE(109, OF_KEY_F10);
            KEY_CASE(103, OF_KEY_F11);
            KEY_CASE(111, OF_KEY_F12);
            KEY_CASE(51, OF_KEY_DEL);
            KEY_CASE(116, OF_KEY_HOME);
            KEY_CASE(121, OF_KEY_END);
            KEY_CASE(115, OF_KEY_PAGE_UP);
            KEY_CASE(119, OF_KEY_PAGE_DOWN);
            KEY_CASE(123, OF_KEY_LEFT);
            KEY_CASE(124, OF_KEY_RIGHT);
            KEY_CASE(125, OF_KEY_DOWN);
            KEY_CASE(126, OF_KEY_UP);
        default:
            break;
    }
    
    [self beginWindowEvent];
    
    if (key == OF_KEY_ESC)
    {
        [[NSApplication sharedApplication] terminate:self];
        [NSApp terminate:self];
    }
    
    ofEvents().notifyKeyPressed(key);
    
    [self endWindowEvent];
    
    [super keyDown:theEvent];
}

- (void)keyUp:(NSEvent *)theEvent
{
    const char *c = [[theEvent charactersIgnoringModifiers] UTF8String];
    int key = c[0];
    
    switch ([theEvent keyCode]) {
            KEY_CASE(122, OF_KEY_F1);
            KEY_CASE(120, OF_KEY_F2);
            KEY_CASE(99, OF_KEY_F3);
            KEY_CASE(118, OF_KEY_F4);
            KEY_CASE(96, OF_KEY_F5);
            KEY_CASE(97, OF_KEY_F6);
            KEY_CASE(98, OF_KEY_F7);
            KEY_CASE(100, OF_KEY_F8);
            KEY_CASE(101, OF_KEY_F9);
            KEY_CASE(109, OF_KEY_F10);
            KEY_CASE(103, OF_KEY_F11);
            KEY_CASE(111, OF_KEY_F12);
            KEY_CASE(51, OF_KEY_DEL);
            KEY_CASE(116, OF_KEY_HOME);
            KEY_CASE(121, OF_KEY_END);
            KEY_CASE(115, OF_KEY_PAGE_UP);
            KEY_CASE(119, OF_KEY_PAGE_DOWN);
            KEY_CASE(123, OF_KEY_LEFT);
            KEY_CASE(124, OF_KEY_RIGHT);
            KEY_CASE(125, OF_KEY_DOWN);
            KEY_CASE(126, OF_KEY_UP);
        default:
            break;
    }
    
    [self beginWindowEvent];
    
    ofEvents().notifyKeyReleased(key);
    
    [self endWindowEvent];
    
    [super keyUp:theEvent];
}

- (void)beginWindowEvent {}
- (void)endWindowEvent {}



@end
