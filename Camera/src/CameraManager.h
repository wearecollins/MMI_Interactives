//
//  CameraManager.h
//  CameraTest
//
//  Created by Brett Renfer on 3/21/16.
//  Copyright (c) 2016 __MyCompanyName__. All rights reserved.
//

#pragma once

#include "ofMain.h"
#include "ofxGui.h"

#define DEBUG_CAMERA

#ifndef DEBUG_CAMERA
#include "BlackFlyCamera.h"
#endif

namespace mmi {
    
#ifndef DEBUG_CAMERA
    typedef mmi::BlackFlyCamera Camera;
#else
    typedef ofVideoGrabber Camera;
    
#endif
    
    class CameraManager
    {
    public:
        
        void setup( string settingsFile = "cameras.xml" );
        void draw(int x, int y );
        void drawDebug( int x, int y );
        void drawGui();
        
        Camera * getCamera( int which = 0 );
        int getNumCameras();
        vector<Camera *> & getCameras();
        
    protected:
        ofxPanel gui;
        ofParameter<string> settingsFile;
        
        vector<Camera *> cameras;
        void saveSettings();
    };

}