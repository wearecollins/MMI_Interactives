//
//  MessageHandler.h
//  Camera
//
//  Created by Brett Renfer on 3/25/16.
//  Copyright (c) 2016 __MyCompanyName__. All rights reserved.
//

#pragma once

#include "ofxLibwebsockets.h"

namespace mmi {    

    class MessageHandler
    {
    public:
        void setup( string address = "localhost", int port = 8080 );
        void update();
        
        /**
         Switch which camera we are showing/streaming
         @param Which camera to switch to
         */
        ofEvent<int>    onSwitchCamera;
        
        /**
         Start recording!
         @string Which backing track to play. Must match a real file!
         */
        ofEvent<string>    onStartRecording;
        
        /**
         Take a photo!
         */
        ofEvent<string>    onCaptureImage;
        
        /**
         Incoming events: finished recording a video,
         or finished capturing a photo
         */
        void onVideoRecorded( string & file );
        void onImageCaptured( string & file );
        
        //websocket listeners
        
        void onMessage( ofxLibwebsockets::Event & m );
        
        void onConnect( ofxLibwebsockets::Event& args );
        void onOpen( ofxLibwebsockets::Event& args );
        void onClose( ofxLibwebsockets::Event& args );
        void onIdle( ofxLibwebsockets::Event& args );
        
    protected:
        
        // we listen to ws stuff directly from frontend
        ofxLibwebsockets::Client * wsClient;
        string host;
        int port;
        
        void connect();
        
        // auto reconnect to our websocket server
        bool        bConnected;
        uint64_t    lastTimeTriedConnect;
        uint64_t    reconnectInterval;
    };
    
}

