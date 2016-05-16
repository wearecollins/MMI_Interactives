//
//  MessageHandler.cpp
//  Camera
//
//  Created by Brett Renfer on 3/25/16.
//  .
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
            ofLogVerbose()<<"[MessageHanlder] - Disconnected from Frontend. Trying reconnect";
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
                    string n = e.json["event"]["detail"];
                    ofNotifyEvent( onCaptureImage, n );
                } else if ( n == "confirm_photo" ){
                    string n = e.json["event"]["detail"];
                    ofNotifyEvent( onConfirmImage, n );
                } else if (n == "camera_front"){
                    int whichCamera = 0;
                    ofNotifyEvent( onSwitchCamera, whichCamera );
                } else if (n == "camera_side"){
                    int whichCamera = 1;
                    ofNotifyEvent( onSwitchCamera, whichCamera );
                } else if (n == "record_video"){
                    string v = e.json["event"]["detail"]["clip"];
                    string n = e.json["event"]["detail"]["name"];
                    string s = v +":"+ n;
                    // pack video and name into : separated streing
                    ofNotifyEvent( onStartRecording, s );
                }
            }
            
            if ( e.json["type"] == "event" ){
                int whichCamera = e.json["data"];
                ofNotifyEvent( onSwitchCamera, whichCamera );
            }
        }
        ofLogVerbose()<<"[MessageHanlder] - Recieved message from Frontend: "<< e.message;
    }
    
    
    //--------------------------------------------------------------
    void MessageHandler::onVideoRecorded( string & file ){
        ofJson json;
        json["event"] = ofJson::object();
        json["event"]["name"] = "videoRecorded";
        json["event"]["detail"] = file;
        
        wsClient->send( json.dump() );
    }
    
    //--------------------------------------------------------------
    void MessageHandler::onImageCaptured( string & file ){
        ofJson json;
        json["event"] = ofJson::object();
        json["event"]["name"] = "imageCapture";
        json["event"]["detail"] = file;
        
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