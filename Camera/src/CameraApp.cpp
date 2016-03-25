//
//  CameraApp.cpp
//  Camera
//
//  Created by Brett Renfer on 3/25/16.
//  Copyright (c) 2016 __MyCompanyName__. All rights reserved.
//

#include "CameraApp.h"

//--------------------------------------------------------------
void CameraApp::setup(){
    ofSetLogLevel(OF_LOG_VERBOSE);
    gui.add(cameraTop.set("Which camera top", 0, 0, 1));
    
    cameraMgr.setup();
    recordMgr.setup();
    streamMgr.setup("", 9091);
    messageHdlr.setup();
    
    // connect stream message to message parser
    ofAddListener(streamMgr.onWsMessage, &messageHdlr, &mmi::MessageHandler::onMessage);
    
    // listen to events from message parser
    ofAddListener(messageHdlr.onSwitchCamera, this, &CameraApp::setStreamCamera);
    
    gui.setup("Settings");
    
    gui.add( streamMgr.params );
    gui.add( recordMgr.params);
    gui.add( whichStream.set("Stream which camera", 0, 0, cameraMgr.getNumCameras()-1));
    
    ofSetLogLevel(OF_LOG_ERROR);
    
    currentMode = MODE_GENERAL;
    
    ofAddListener(ofEvents().keyPressed, this, &CameraApp::keyPressed);
}

//--------------------------------------------------------------
void CameraApp::update(){
    // try to stream all the time, image streamer will handle by framerate
    auto * camera = cameraMgr.getCamera( whichStream.get());
    if ( camera != nullptr ){
#ifndef DEBUG_CAMERA
        streamMgr.stream( camera->getImage() );
#else
        streamMgr.stream( *camera );
#endif
    }
    
    if ( cameraMgr.getNumCameras() > 1 ){
        
        int t = cameraTop.get() == 0 ? 0 : 1;
        int b = cameraTop.get() == 0 ? 1 : 0;
        
#ifndef DEBUG_CAMERA
        auto & img1 = cameraMgr.getCamera(t)->getImage();
        auto & img2 = cameraMgr.getCamera(b)->getImage();
        if ( !img1.isAllocated() || !img2.isAllocated() ) return;
        recordMgr.update(img1.getPixels(), img2.getPixels());
    }
#else
        for ( auto * c : cameraMgr.getCameras()){
            c->update();
        }
        
        auto * img1 = cameraMgr.getCamera(t);
        auto * img2 = cameraMgr.getCamera(t);
        
        static int bEverNewA = false;
        static int bEverNewB = false;
        
        if ( !bEverNewA ){
            if ( img1->isFrameNew() ) bEverNewA = true;
        }
        
        if ( !bEverNewB ){
            if ( img2->isFrameNew() ) bEverNewB = true;
        }
        if ( !bEverNewA || !bEverNewB ) return;
        
        recordMgr.update(img1->getPixels(), img2->getPixels());
    }
#endif
}

//--------------------------------------------------------------
void CameraApp::draw(){
    ofPushMatrix();
#ifndef DEBUG_CAMERA
    ofScale(.5, .5);
#endif
    cameraMgr.drawDebug(0, 0);
    ofPopMatrix();
    
    ofDrawBitmapStringHighlight( "Press 'm' to switch configure modes", 20, ofGetHeight()-40, ofColor::yellow, ofColor::black);
    
    switch (currentMode){
        case MODE_GENERAL:
            gui.draw();
            break;
            
        case MODE_CAMERAS:
            cameraMgr.drawGui();
            break;
            
        case MODE_NONE:
        default:
            // shhh
            ;
            
    }
}

//--------------------------------------------------------------
void CameraApp::keyPressed(ofKeyEventArgs & e ){
    if ( e.key == 'm' ){
        currentMode = (Mode)((int) currentMode + 1);
        if ( currentMode > MODE_NONE ){
            currentMode = MODE_GENERAL;
        }
    }
}

//--------------------------------------------------------------
void CameraApp::setStreamCamera( int & which ){
    if (which < cameraMgr.getNumCameras()){
        whichStream.set(which);
    }
}