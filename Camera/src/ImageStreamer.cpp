//
//  ImageStreamer.cpp
//  Camera
//
//  Created by Brett Renfer on 3/21/16.
//  Copyright (c) 2016 __MyCompanyName__. All rights reserved.
//

#include "ImageStreamer.h"


namespace mmi {
    
    //--------------------------------------------------------------
    ImageStreamer::ImageStreamer() : bSetup(false), bShouldStream(false) {
        
    }
    
    //--------------------------------------------------------------
    ImageStreamer::~ImageStreamer(){
        if ( bSetup ){
            ofRemoveListener( ofEvents().update, this, &ImageStreamer::update );
        }
    }
    
    //--------------------------------------------------------------
    void ImageStreamer::setup( string host, int port ){
        wsServer.setup( port );
        wsServer.addListener(this);
        
        static int numImageStreamers = 0;
        numImageStreamers++;
        
        params.setName("ImageStreamer "+ofToString(numImageStreamers));
        params.add(jpegQuality.set("JPEQ quality", 20, 1, 100));
        params.add(frameRate.set("Stream framerate", 60, 1, 120.));
        
        ofAddListener( ofEvents().update, this, &ImageStreamer::update );
        bSetup = true;
    }
    
    //--------------------------------------------------------------
    void ImageStreamer::update( ofEventArgs & e ){
        auto t = ofGetElapsedTimeMillis();
        
        if ( t - lastSent > 1000./frameRate ){
            bShouldStream = true;
            lastSent = t;
        }
    }
    
    //--------------------------------------------------------------
    void ImageStreamer::onConnect( ofxLibwebsockets::Event & e ){
        
    }
    
    //--------------------------------------------------------------
    void ImageStreamer::onOpen( ofxLibwebsockets::Event & e ){
        bConnected = true;
    }
    
    //--------------------------------------------------------------
    void ImageStreamer::onClose( ofxLibwebsockets::Event & e ){
        bConnected = false;
        //todo: auto-reconnect
    }
    
    //--------------------------------------------------------------
    void ImageStreamer::onIdle( ofxLibwebsockets::Event & e ){
        
    }
    
    //--------------------------------------------------------------
    void ImageStreamer::onMessage( ofxLibwebsockets::Event & e ){
        ofNotifyEvent(onWsMessage, e);
    }
}