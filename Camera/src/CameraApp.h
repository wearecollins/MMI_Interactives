//
//  CameraApp.h
//  Camera
//
//  Created by Brett Renfer on 3/25/16.
//  Copyright (c) 2016 __MyCompanyName__. All rights reserved.
//

#pragma once

#include "ofMain.h"
#include "ofxGui.h"

#include "CameraManager.h"
#include "ImageStreamer.h"
#include "RecordManager.h"
#include "MessageHandler.h"

// comment out to turn off keyboard debugging!
#define DEBUG_ZONE

namespace mmi {

    enum Mode {
        MODE_GENERAL = 0,
        MODE_CAMERAS,
        MODE_NONE
    };

    class CameraApp
    {
    public:
        void setup( bool bDoStream = true );
        void update();
        void draw();
        
        void keyPressed(ofKeyEventArgs & e );
        void setStreamCamera( int & which );
        
        CameraManager cameraMgr;
        RecordManager recordMgr;
        ImageStreamer streamMgr;
        MessageHandler messageHdlr;
        
        Mode currentMode;
        ofxPanel * gui;
        ofParameter<int> cameraTop;
        ofParameter<int> whichSetup;
        ofParameter<bool> reloadCameras;
        ofParameter<int> whichStream;
        
    protected:
        
        bool bStreaming;
    };
}

