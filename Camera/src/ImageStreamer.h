//
//  ImageStreamer.h
//  Camera
//
//  Created by Brett Renfer on 3/21/16.
//  Copyright (c) 2016 __MyCompanyName__. All rights reserved.
//

#pragma once


#include "ofxLibwebsockets.h"

#ifndef NO_TURBO
#define USE_TURBO
#endif

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
        void setup( string host="", int port = 9001 );
        void update( ofEventArgs & e );
        
        template<class T>
        void stream( T & img ){
            if ( bSetup ){
                if ( bShouldStream ){
#ifdef USE_TURBO
                    static ofBuffer out;
                    static size_t size;
                    
                    size = 0;
                    out.clear();
                    
                    auto * data = turbo.compress(img, jpegQuality.get(), &size);
                    out.set(reinterpret_cast<char*>(data), size);
                    //wsServer.clearBinaryMessageQueue();
                    wsServer.sendBinary(out);
                    free(data);
#else
                    wsServer.sendBinary(img);
#endif
                    bShouldStream = false;
                } else {
                    ofLogVerbose()<<"[ImageStreamer] Trying to stream to soon.";
                }
            } else {
                ofLogError()<<"[ImageStreamer] Not connected!";
            }
        }
        
        ofParameterGroup params;
        
        // pass-thru of WS messages
        ofEvent<ofxLibwebsockets::Event> onWsMessage;
        
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
