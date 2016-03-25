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
        
        ofEvent<int> onSwitchCamera;
        void onMessage( ofxLibwebsockets::Event & m );
    };
    
}

