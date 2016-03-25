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
    streamMgr.setup();
    gui.add( streamMgr.params );
    gui.add( recordMgr.params);
    gui.add( whichStream.set("Stream which camera", 0, 0, cameraMgr.getNumCameras()-1));
    
    gui.setup("Settings");
    ofSetLogLevel(OF_LOG_ERROR);
    
    currentMode = MODE_GENERAL;
    
    ofAddListener(ofEvents().keyPressed, this, &CameraApp::keyPressed);
}

//--------------------------------------------------------------
void CameraApp::update(){
    // try to stream all the time, image streamer will handle by framerate
    auto * camera = cameraMgr.getCamera( whichStream.get());
    if ( camera != nullptr ){
        streamMgr.stream( camera->getImage() );
    }
    
    if ( cameraMgr.getNumCameras() > 1 ){
        
        int t = cameraTop.get() == 0 ? 0 : 1;
        int b = cameraTop.get() == 0 ? 1 : 0;
        
        auto & img1 = cameraMgr.getCamera(t)->getImage();
        auto & img2 = cameraMgr.getCamera(b)->getImage();
        
        if ( !img1.isAllocated() || !img2.isAllocated() ) return;
        
        recordMgr.update(img1.getPixels(), img2.getPixels());
    }
}

//--------------------------------------------------------------
void CameraApp::draw(){
    ofPushMatrix();
    ofScale(.5, .5);
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