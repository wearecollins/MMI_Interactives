//
//  MessageHandler.cpp
//  Camera
//
//  Created by Brett Renfer on 3/25/16.
//  Copyright (c) 2016 __MyCompanyName__. All rights reserved.
//

#include "MessageHandler.h"

namespace mmi {
    //--------------------------------------------------------------
    void MessageHandler::setup(){
        
    };
    
    //--------------------------------------------------------------
    void MessageHandler::onMessage( ofxLibwebsockets::Event & e ){
        if ( !e.json.is_null() ){
            if ( e.json["type"] == "event" ){
                int whichCamera = e.json["data"];
                ofNotifyEvent( onSwitchCamera, whichCamera );
            }
        }
    }
    
    /*
     
     {
     "type":"",
     "data":"" or Number or ???
     }
     
     */
    
}