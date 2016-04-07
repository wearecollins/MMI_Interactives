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
    void MessageHandler::setup( string host, int port ){
        
        this->host = host;
        this->port = port;
    
        wsClient = new ofxLibwebsockets::Client();
        wsClient->addListener(this);
        connect();
        reconnectInterval = 2000;
    };
    
    //--------------------------------------------------------------
    void MessageHandler::connect(){
        if ( bConnected ){
            return;
        }
        bConnected = wsClient->connect(host, port);
        lastTimeTriedConnect = ofGetElapsedTimeMillis();
    }
    
    //--------------------------------------------------------------
    void MessageHandler::update( ){
        if ( !bConnected && ofGetElapsedTimeMillis() - lastTimeTriedConnect > reconnectInterval ){
            lastTimeTriedConnect = ofGetElapsedTimeMillis();
            connect();
        }
    };
    
    //--------------------------------------------------------------
    void MessageHandler::onMessage( ofxLibwebsockets::Event & e ){
        if ( !e.json.is_null() ){
            
            // state event
            if ( !e.json["state"].is_null() ){
                
            // event event
            } else if ( !e.json["event"].is_null() ){
                auto n = e.json["event"]["name"];
                if ( n == "take_photo" ){
                    ofNotifyEvent( onCaptureImage );
                    cout << "TAKING PHOTO"<<endl;
                }
            }
            
            if ( e.json["type"] == "event" ){
                int whichCamera = e.json["data"];
                ofNotifyEvent( onSwitchCamera, whichCamera );
            }
        }
        cout << e.message << endl;
    }
    
    
    //--------------------------------------------------------------
    void MessageHandler::onVideoRecorded( string & file ){
        ofJson json;
        json["event"] = ofJson::object();
        json["event"]["name"] = "videoRecorded";
        json["event"]["data"] = file;
        
        wsClient->send( json.dump() );
    }
    
    //--------------------------------------------------------------
    void MessageHandler::onImageCaptured( string & file ){
        ofJson json;
        json["event"] = ofJson::object();
        json["event"]["name"] = "imageCapture";
        json["event"]["detail"] = file;
        
        cout << file << endl;
        
        wsClient->send( json.dump() );
    }
    
#pragma mark ofxLibwebsockets Events
    
    //--------------------------------------------------------------
    void MessageHandler::onConnect( ofxLibwebsockets::Event& args ){
    }
    
    //--------------------------------------------------------------
    void MessageHandler::onOpen( ofxLibwebsockets::Event& args ){
        bConnected = true;
    }
    
    //--------------------------------------------------------------
    void MessageHandler::onClose( ofxLibwebsockets::Event& args ){
        bConnected = false;
        lastTimeTriedConnect = ofGetElapsedTimeMillis();
    }
    
    //--------------------------------------------------------------
    void MessageHandler::onIdle( ofxLibwebsockets::Event& args ){}
    
    /*
     
     {
     "type":"",
     "data":"" or Number or ???
     }
     
     */
    
}