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
        
        void startRecordingEvt( string & backgroundClipAndName );
        void startRecording( string backgroundClip = "", string baseName = "");
        void stopRecording();
        void close();
        
        void takePhotoEvt( string & baseName );
        
        ofParameterGroup params;
        
        ofEvent<string> onFinishedRecording;
        ofEvent<string> onFinishedCapture;
        
    protected:
        
        ofParameterGroup        advancedParams;
        ofParameter<string>     folderDest;
        ofParameter<string>     folderAppend;
        ofParameter<string>     fileName;
        ofParameter<string>     fileExt;
        ofParameter<string>     fileExtImage;
        ofParameter<string>     pixFmt;
        ofParameter<string>     codec;
        ofParameter<int>        bitrate;
        
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
