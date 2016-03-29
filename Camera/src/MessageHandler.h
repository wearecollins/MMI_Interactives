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
        void setup();
        
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
        
        void onMessage( ofxLibwebsockets::Event & m );
    };
    
}

