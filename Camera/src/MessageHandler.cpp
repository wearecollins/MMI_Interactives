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
            ofLogVerbose()<<"[MessageHandler] - Disconnected from Frontend. Trying reconnect";
        }
    };
    
    //--------------------------------------------------------------
    void MessageHandler::onMessage( ofxLibwebsockets::Event & e ){
        if ( !e.json.isNull() ){
            
            // state event
            if ( !e.json["state"].isNull() ){
                
            // event event
            } else if ( !e.json["event"].isNull() ){
                auto n = e.json["event"]["name"];
                if ( n == "take_photo" ){
                    string n = e.json["event"]["detail"].asString();
                    ofNotifyEvent( onCaptureImage, n );
                } else if ( n == "confirm_photo" ){
                    string n = e.json["event"]["detail"].asString();
                    ofNotifyEvent( onConfirmImage, n );
                } else if (n == "camera_front"){
                    int whichCamera = 0;
                    ofNotifyEvent( onSwitchCamera, whichCamera );
                } else if (n == "camera_side"){
                    int whichCamera = 1;
                    ofNotifyEvent( onSwitchCamera, whichCamera );
                } else if (n == "record_video"){
                    string v = e.json["event"]["detail"]["clip"].asString();
                    string n = e.json["event"]["detail"]["name"].asString();
                    string s = v +":"+ n;
                    // pack video and name into : separated string
                    ofNotifyEvent( onStartRecording, s );
                } else if (n == "camera_reset"){
                    bool reset = true;
                    ofNotifyEvent( onResetCameras, reset );
                } else if (n == "camera_stop"){
                    bool stop = true;
                    ofNotifyEvent( onStopCameras, stop );
                } else if (n == "camera_start"){
                    bool start = true;
                    ofNotifyEvent( onStartCameras, start );
                } else if (n == "restart_app"){
                    ofLogWarning("Camera.MessageHandler",
                                 "received restart command");
                    bool shutdown = true;
                    ofNotifyEvent( onShutdownApp, shutdown );
                    
                    //this is a little harsh, stopping everything mid-frame
                    //exit(0);
                    
                    //this doesn't work because it only stops the oF app
                    // and not the WebView
                    //ofExit();
                }
            }
            
            if ( e.json["type"] == "event" ){
                int whichCamera = e.json["data"].asInt();
                ofNotifyEvent( onSwitchCamera, whichCamera );
            }
        }
        ofLogVerbose()<<"[MessageHandler] - Recieved message from Frontend: "<< e.message;
    }
    
    
    //--------------------------------------------------------------
    void MessageHandler::onVideoRecorded( string & file ){
        Json::Value json;
        json["event"]["name"] = "videoRecorded";
        json["event"]["detail"] = file;
        
        Json::FastWriter writer;
        wsClient->send( writer.write(json) );
    }
    
    //--------------------------------------------------------------
    void MessageHandler::onImageCaptured( string & file ){
        Json::Value json;
        json["event"]["name"] = "imageCapture";
        json["event"]["detail"] = file;
        
        Json::FastWriter writer;
        wsClient->send( writer.write(json) );
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
