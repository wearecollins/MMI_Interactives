//
//  RecordManager.h
//  EW_Perf_Camera
//
//  Created by Brett Renfer on 2/1/16.
//
//

#pragma once

#include "ofMain.h"
#include "ofxCv.h"
#include "ofxGui.h"
#include "ofxVideoRecorder.h"

namespace mmi {

    class RecordManager {
        friend class CameraApp;
        friend class ofxVideoRecorder;
    public:
        
        void setup();
        // update for video-based app(s)
        void update( ofPixels & cameraOne, ofPixels & cameraTwo );
        
        // update for image-based app(s)
        void update( const ofPixels & cameraOne );
        
        // update pixel format automatically
        void updatePixelFormat( const ofPixels & camera );
        
        void startRecordingEvt( string & backgroundClipAndName );
        void startRecording( string backgroundClip = "", string baseName = "");
        void stopRecording();
        void close();
        
        void takePhotoEvt( string & baseName );
        void confirmPhotoEvt( string & baseName );
        
        ofParameterGroup params;
        
        ofEvent<string> onFinishedRecording;
        ofEvent<string> onFinishedCapture;
        
        // public parameters to allow for text fields
        ofParameter<string>     folderDest;
        
    protected:
        
        ofParameterGroup        advancedParams;
        ofParameter<string>     fileExt;
        ofParameter<string>     fileExtImage;
        ofParameter<string>     fileName;
        ofParameter<string>     pixFmt;
        ofParameter<string>     codec;
        ofParameter<int>        bitrate;
        ofParameter<string>     folderAppend;
        ofParameter<string>     tempAppend;
        
        ofParameter<uint64_t>   recordInterval;
        ofParameter<uint64_t>   recordLength;
        ofParameter<int>        camWidth;
        ofParameter<int>        camHeight;
        
        string currentFileName, currentFileStart, currentBgClip;
        
        // recording
        ofxVideoRecorder    vidRecorder;
        bool bRecording;
        void onFileComplete( ofxVideoRecorderOutputFileCompleteEventArgs & args );
        
        uint64_t startTime, lastTime;
        int whichCamera;
        
        float frameRate;
        uint64_t lastFrameAdded;
        
        // image capture
        ofImage lastImage;
    };
}
