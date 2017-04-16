//
//  CameraManager.h
//  CameraTest
//
//  Created by Brett Renfer on 3/21/16.
//  .
//

#pragma once

#include "ofMain.h"
#include "ofxGui.h"

#define DEBUG_CAMERA

#ifndef DEBUG_CAMERA
#include "BlackFlyCamera.h"
#else
#include "DebugCamera.h"
#endif

namespace mmi {
    
#ifndef DEBUG_CAMERA
    typedef BlackFlyCamera Camera;
#else
    typedef WebCamera Camera;
    
#endif
    
    enum DrawMode {
        MODE_FILL_MAX = 0,
        MODE_FILL_MIN,
        MODE_ACTUAL
    };
    
    class CameraManager
    {
    public:
        
        void setup( bool bSmall = false, string settingsFile = "anythingmuppets" );
        
        void clearCameras();
        void setupCameras();
        void discoverCameras();
        
        void draw(int x, int y, int which = 0 );
        void drawDebug( int x, int y );
        void drawGui();
        
        shared_ptr<Camera> getCamera( int which = 0 );
        int getNumCameras();
        vector<shared_ptr<Camera> > & getCameras();
        
        ofParameter<string> settingsFile;
        
    protected:
        ofxPanel * gui;
        ofParameter<bool> lowRes;
        ofParameter<int> drawMode;
        
        vector<shared_ptr<Camera> > cameras;
        void saveSettings();
    };

}
