//
//  RecordManager.cpp
//  Camera
//
//  Created by Brett Renfer on 3/24/16.
//

#include "RecordManager.h"

namespace mmi {

    //--------------------------------------------------------------
    void RecordManager::setup(){
        // todo: settings
        
        // setup recorder
        vidRecorder.setVideoCodec("mpeg4");
        vidRecorder.setVideoBitrate("800k");
        vidRecorder.setAudioCodec("mp3");
        vidRecorder.setAudioBitrate("192k");
        vidRecorder.setPixelFormat("rgb24");
        
        fileName = "mmi_performance_";
        fileExt = ".mp4";
        fileExtImage = ".png";
        
        params.setName("Recording params");
        params.add(recordInterval.set("Camera switch interval", 5000, 0, 15000));
        params.add(recordLength.set("Recording length", 15000, 1, 60000));
        params.add(camWidth.set("Video width", 1040, 1, 2080) );
        params.add(camHeight.set("Video height", 776, 1, 1552) );
        
        advancedParams.setName("Advanced params");
        advancedParams.add(folderDest.set("Output Folder","../../../data"));
        advancedParams.add(fileName.set("File name",""));
        advancedParams.add(fileExt.set("File extension",".mp4"));
        advancedParams.add(pixFmt.set("Pixel Format","rgb24"));
        advancedParams.add(codec.set("Video codec","mpeg4"));
        advancedParams.add(bitrate.set("Bitrate",800, 1, 10000));
        advancedParams.add(fileExtImage.set("File extension image",".png"));
        
        params.add(advancedParams);

        bRecording = false;
        currentBgClip = "";
        
        frameRate = 1000./30.;
    }

    //--------------------------------------------------------------
    void RecordManager::update( const ofPixels & cameraOne, const ofPixels & cameraTwo ){
        if(bRecording){
            auto t = ofGetElapsedTimeMillis();
            
            //            if ( t - lastFrameAdded < frameRate ) return;
            
            if (( t - lastTime ) >= recordInterval){
                whichCamera = !whichCamera;
                lastTime = t;
            }
            
            if ( t - startTime >= recordLength.get() ){
                ofLogError()<<"STOPPING "<< t <<":"<<(t-startTime)<<":"<<recordLength<<endl;
                stopRecording();
                return;
            }
            
            bool success = false;
            
            if ( whichCamera == 0){
                success = vidRecorder.addFrame(cameraOne);
            } else {
                success = vidRecorder.addFrame(cameraTwo);
            }
            
            lastFrameAdded = t;
            
            if (!success) {
                ofLogWarning("This frame was not added!");
                //                stopRecording();
            }
        }
    }

    
    //--------------------------------------------------------------
    void RecordManager::update( const ofPixels & cameraOne ){
        lastImage.setFromPixels(cameraOne);
    }
    
    //--------------------------------------------------------------
    void RecordManager::startRecordingEvt( string & backgroundClip ){
        this->startRecording(backgroundClip);
    }
    //--------------------------------------------------------------
    void RecordManager::startRecording( string backgroundClip ){
        
        if ( bRecording ){
            ofLogWarning()<<"Already recording, try again in "<<((ofGetElapsedTimeMillis()-startTime)/1000.)<<" seconds";
            return;
        }
        
        // update params
        
        vidRecorder.setVideoCodec(codec);
        vidRecorder.setVideoBitrate(ofToString(bitrate)+"k");
        vidRecorder.setPixelFormat(pixFmt);
        
        startTime = lastTime = ofGetElapsedTimeMillis();
        bRecording = true;
        whichCamera = 0;
        
        currentFileName = (fileName.get() +ofGetTimestampString()+fileExt.get() );
        
        currentBgClip = backgroundClip;
        
        vidRecorder.setup(currentFileName, camWidth, camHeight, 30, 0, 0, true  );
        
        vidRecorder.start();
    }

    //--------------------------------------------------------------
    void RecordManager::stopRecording(){
        bRecording = false;
        vidRecorder.close();
        
        // this is stupid!
        ofSleepMillis(1000);
        
        // after that, copy in the audio
        if ( currentBgClip != "" ){
            string lastCmd = "bash --login -c 'ffmpeg -i " + ofToDataPath(currentFileName, true);
            lastCmd +=" -i "+ ofToDataPath("clips/" + currentBgClip + fileExt.get(), true) +" -c copy -map 0:v:0 -map 1:a:0 -shortest "+ofToDataPath(currentFileName +"_final"+fileExt.get(), true)+"'";
            system( lastCmd.c_str() );
            
            auto f = ofFile();
            if (f.open(ofToDataPath(currentFileName, true), ofFile::ReadWrite)){
                f.remove();
            }
            currentFileName = currentFileName + "_final"+fileExt.get();
            
            if (f.open(ofToDataPath(currentFileName, true), ofFile::ReadWrite)){
                f.moveTo( ofToDataPath( folderDest.get()) );
            }
        } else {
        }
        ofNotifyEvent(onFinishedRecording, currentFileName, this);
        currentBgClip = "";
    }

    //--------------------------------------------------------------
    void RecordManager::close(){
        vidRecorder.close();
    }
        
    //--------------------------------------------------------------
    void RecordManager::takePhotoEvt(){
        currentFileName = (fileName.get() +ofGetTimestampString()+fileExtImage.get() );
        auto outputName = ofToDataPath(folderDest.get() + "/" + currentFileName, true );
        cout << "saving" <<endl;
        lastImage.save(outputName);
        cout << "saved" <<endl;
        ofNotifyEvent(onFinishedCapture, currentFileName, this);
    }
    
}
