//
//  RecordManager.h
//  EW_Perf_Camera
//
//  Created by Brett Renfer on 2/1/16.
//
//

#pragma once

#include "ofMain.h"
#include "ofxGui.h"
#include "ofxVideoRecorder.h"

namespace mmi {

    class RecordManager {
    public:
        
        void setup();
        void update( const ofPixels & cameraOne, const ofPixels & cameraTwo );
        
        void startRecording( string backgroundClip = "");
        void stopRecording();
        void close();
        
        ofParameterGroup params;
        
        ofEvent<string> onFinishedRecording;
        
    protected:
        
        ofParameter<string> fileName;
        ofParameter<string> fileExt;
        ofParameter<uint64_t> recordInterval;
        ofParameter<uint64_t> recordLength;
        ofParameter<int>    camWidth;
        ofParameter<int>    camHeight;
        
        string currentFileName, currentBgClip;
        
        // recording
        ofxVideoRecorder    vidRecorder;
        bool bRecording;
        
        uint64_t startTime, lastTime;
        int whichCamera;
        
        float frameRate;
        uint64_t lastFrameAdded;
    };
}
