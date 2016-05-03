//
//  CameraApp.cpp
//  Camera
//
//  Created by Brett Renfer on 3/25/16.
//

#include "CameraApp.h"

namespace mmi {

    //--------------------------------------------------------------
    void CameraApp::setup( bool bDoStream ){
        this->bStreaming = bDoStream;
        
        ofSetLogLevel(OF_LOG_VERBOSE);
        gui = new ofxPanel();
        gui->setup("Settings");
        
        gui->registerMouseEvents();
        gui->add(whichSetup.set("Performance or AM ", 0, 0, 1 ));
        gui->add(reloadCameras.set("Reload cameras", false));
        gui->add(cameraTop.set("Which camera top", 0, 0, 1));
        
        // first: get what camera setup we want
        ofXml settings;
        string xml = "anythingmuppets.xml";
        if ( settings.load( ofToDataPath( "settings.xml") ) ){
            int mode = settings.getValue("Mode", 0);
            if ( mode == 0 ){
                xml = "performance.xml";
            } else {
                xml = "anythingmuppets.xml";
            }
        }
        
        cameraMgr.setup(this->bStreaming, xml);
        recordMgr.setup();
        
        if ( this->bStreaming ){
            streamMgr.setup("", 9091);
            gui->add( streamMgr.params );
        }
        
        // setup message handler, which opens its own ws:// client
        messageHdlr.setup();
        
        // listen to events from message parser
        ofAddListener(messageHdlr.onSwitchCamera, this, &CameraApp::setStreamCamera);
        ofAddListener(messageHdlr.onStartRecording, &recordMgr, &mmi::RecordManager::startRecordingEvt);
        ofAddListener(messageHdlr.onCaptureImage, &recordMgr, &mmi::RecordManager::takePhotoEvt);
        ofAddListener(recordMgr.onFinishedRecording, &messageHdlr, &mmi::MessageHandler::onVideoRecorded);
        ofAddListener(recordMgr.onFinishedCapture, &messageHdlr, &mmi::MessageHandler::onImageCaptured);
        
        gui->add( recordMgr.params );
        gui->add( whichStream.set("Stream which camera", 0, 0, cameraMgr.getNumCameras()-1));
        
        gui->loadFromFile("settings.xml");
        
        ofSetLogLevel(OF_LOG_ERROR);
        
        currentMode = MODE_NONE;
        
        ofAddListener(ofEvents().keyPressed, this, &CameraApp::keyPressed);
    }

    //--------------------------------------------------------------
    void CameraApp::update(){
        // update managers
        messageHdlr.update();
        
        static int lastSetup = -1;
        
        if ( whichSetup.get() != lastSetup ){
            auto & p = recordMgr.folderAppend;
            p.set(whichSetup.get() == 0 ? "performance" : "anythingmuppets");
    //
        }
        lastSetup = whichSetup.get();
        
        // switch camera setup?
        if (reloadCameras.get()){
            reloadCameras.set(false);
            
            string settings = whichSetup.get() == 0 ? "performance.xml" : "anythingmuppets.xml";
            cameraMgr.settingsFile.set(ofToDataPath(settings));
            cameraMgr.setupCameras();
        }
        
        for ( auto & c : cameraMgr.getCameras()){
            c->update();
        }
        
        shared_ptr<mmi::Camera> camera = cameraMgr.getCamera( whichStream.get() );
        if ( this->bStreaming && camera != nullptr ){
            // try to stream all the time, image streamer will handle by framerate
            
            if ( camera != nullptr && camera->isAllocated() ){
                streamMgr.stream( camera->getImage() );
            }
        }
        
        // update recording, if 2x camera app
        if ( cameraMgr.getNumCameras() > 1 ){
            
            int t = cameraTop.get() == 0 ? 0 : 1;
            int b = cameraTop.get() == 0 ? 1 : 0;
            
            auto & img1 = cameraMgr.getCamera(t)->getImage();
            auto & img2 = cameraMgr.getCamera(b)->getImage();
            if ( !cameraMgr.getCamera(t)->isAllocated() || !cameraMgr.getCamera(b)->isAllocated() ) return;
            recordMgr.update(img1.getPixels(), img2.getPixels());
        } else if ( cameraMgr.getNumCameras() > 0 ) {
            auto & img1 = cameraMgr.getCamera(0)->getImage();
            recordMgr.update(img1.getPixels());
        }
    }

    //--------------------------------------------------------------
    void CameraApp::draw(){
        ofSetColor(255);
        
        ofPushMatrix();
        if ( currentMode != MODE_NONE ){
            cameraMgr.drawDebug(0, 0);
        } else {
            cameraMgr.draw(0, 0, whichStream);
        }
        ofPopMatrix();
        
        switch (currentMode){
            case MODE_GENERAL:
                gui->draw();
                ofDrawBitmapStringHighlight( "Press 'm' to switch configure modes", 20, ofGetHeight()-40, ofColor::yellow, ofColor::black);
                break;
                
            case MODE_CAMERAS:
                cameraMgr.drawGui();
                ofDrawBitmapStringHighlight( "Press 'm' to switch configure modes", 20, ofGetHeight()-40, ofColor::yellow, ofColor::black);
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
        
        // Debugging
    #ifdef DEBUG_ZONE
        if ( e.key == 's' ){
            int whichCamera = whichStream.get() == 0 ? 1 : 0;
            messageHdlr.onSwitchCamera.notify(whichCamera);
        } else if ( e.key == 'H' ){
            string whichVideo = "black_magic";
            messageHdlr.onStartRecording.notify(whichVideo);
        } else if ( e.key == 'R'){
            for (auto & c : cameraMgr.getCameras() ){
                c->reloadShader();
            }
        }
    #endif
    }

    //--------------------------------------------------------------
    void CameraApp::setStreamCamera( int & which ){
        if (which < cameraMgr.getNumCameras()){
            whichStream.set(which);
        }
    }
}