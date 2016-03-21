//
//  ImageStreamer.h
//  Camera
//
//  Created by Brett Renfer on 3/21/16.
//  Copyright (c) 2016 __MyCompanyName__. All rights reserved.
//

#pragma once


#include "ofxLibwebsockets.h"

#define USE_TURBO
#ifdef USE_TURBO
#include "ofxTurboJpeg.h"
#endif

namespace mmi {

    class ImageStreamer
    {
        friend class ofxLibwebsockets::Server;
        friend class ofxLibwebsockets::Client;
    public:
        ImageStreamer();
        ~ImageStreamer();
        
        // host is for future if client
        void setup( string host="", int port = 9000 );
        void update( ofEventArgs & e );
        void stream( ofImage & img );
        
        ofParameterGroup params;
        
    protected:
        ofParameter<int> jpegQuality;
        ofParameter<float> frameRate;
        
        uint64_t lastSent;
        
        bool bSetup, bConnected, bShouldStream;
        
        //todo: probably client, not server
        ofxLibwebsockets::Server wsServer;
        
#ifdef USE_TURBO
        ofxTurboJpeg turbo;
#endif
        
        void onConnect( ofxLibwebsockets::Event & e );
        void onOpen( ofxLibwebsockets::Event & e );
        void onClose( ofxLibwebsockets::Event & e );
        void onIdle( ofxLibwebsockets::Event & e );
        void onMessage( ofxLibwebsockets::Event & e );
    };

}
