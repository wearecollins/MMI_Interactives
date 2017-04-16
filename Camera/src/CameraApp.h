//
//  CameraApp.h
//  Camera
//
//  Created by Brett Renfer on 3/25/16.
//  .
//

#pragma once

#include "ofMain.h"
#include "ofxGui.h"
#include "ofxInputField.h"

#include "CameraManager.h"
#include "ImageStreamer.h"
#include "RecordManager.h"
#include "MessageHandler.h"

// comment out to turn off keyboard debugging!
//#define DEBUG_ZONE

#ifdef FRONTEND_AM
#define SETTINGS_FILE "settings_am.xml"
#else
#define SETTINGS_FILE "settings_perf.xml"
#endif

namespace mmi {

    enum Mode {
        MODE_GENERAL = 0,
        MODE_CAMERAS,
        MODE_NONE
    };

    class CameraApp
    {
    public:
        void setup( bool bDoStream = true, string settings = SETTINGS_FILE );
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
        ofParameter<bool> discoverCameras;
        ofParameter<bool> reloadCameras;
        ofParameter<int> whichStream;
        
        map<string,ofVideoPlayer> videos;
        ofVideoPlayer * playingVideo;
        bool videoRolling;
        
        void startRecordingEvt( string & video );
        
    protected:
        
        bool bStreaming;
        ofxTextField * recFolder;
    };
}

