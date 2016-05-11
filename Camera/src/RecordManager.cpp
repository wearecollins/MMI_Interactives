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
        advancedParams.add(folderAppend.set("Install folder","performance"));
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
        
        ofAddListener(vidRecorder.outputFileCompleteEvent, this, &RecordManager::onFileComplete);
    }

    //--------------------------------------------------------------
    void RecordManager::update( ofPixels & cameraOne, ofPixels & cameraTwo ){
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
            
            static ofPixels yuvOut;
            static ofPixels rgbOut;
            
            static auto code = CV_RGB2YUV;//_I420;
            
            if ( whichCamera == 0){
                if ( cameraOne.getNumChannels() == 1 ){
                    ofxCv::convertColor(cameraOne, rgbOut, CV_GRAY2RGB);
                    ofxCv::convertColor(rgbOut, yuvOut, code);
                } else {
                    ofxCv::convertColor(cameraOne, yuvOut, code);
                }
            } else {
                if ( cameraTwo.getNumChannels() == 1 ){
                    ofxCv::convertColor(cameraTwo, rgbOut, CV_GRAY2RGB);
                    ofxCv::convertColor(rgbOut, yuvOut, code);
                } else {
                    ofxCv::convertColor(cameraTwo, yuvOut, code);
                }
            }
            
            success = vidRecorder.addFrame(yuvOut);
            
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
    void RecordManager::startRecordingEvt( string & backgroundClipAndName ){
        auto strs = ofSplitString(backgroundClipAndName, ":");
        if (strs.size() == 0){
            strs.push_back("black_magic");
            strs.push_back("");
        } else if (strs.size() < 2 ){
            strs.push_back("");
        }
        this->startRecording(strs[0], strs[1]);
    }
    //--------------------------------------------------------------
    void RecordManager::startRecording( string backgroundClip, string fileStart ){
        
        this->currentFileStart = fileStart;
        
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
        
        currentFileName = currentFileStart +"-"+ (fileName.get() +ofGetTimestampString()+fileExt.get() );
        
        currentBgClip = backgroundClip;
        
        vidRecorder.setup(currentFileName, camWidth, camHeight, 30, 0, 0, true  );
        
        vidRecorder.start();
    }

    
    //--------------------------------------------------------------
    void RecordManager::onFileComplete( ofxVideoRecorderOutputFileCompleteEventArgs & args ){
        string outputFile = "";
        if ( currentBgClip != "" ){
            auto fileSplit = ofSplitString(currentFileName, ".");
            
            string lastCmd = "bash --login -c 'ffmpeg -i " + ofToDataPath(currentFileName, true);
            lastCmd +=" -i "+ ofToDataPath("clips/" + currentBgClip + fileExt.get(), true) +" -c copy -map 0:v:0 -map 1:a:0 -shortest "+ofToDataPath(fileSplit[0] +"_final"+fileExt.get(), true)+"'";
            system( lastCmd.c_str() );
            
            auto f = ofFile();
            if (f.open(ofToDataPath(currentFileName, true), ofFile::ReadWrite)){
                f.remove();
            }
            currentFileName = fileSplit[0] + "_final"+fileExt.get();
            
            if (f.open(ofToDataPath(currentFileName, true), ofFile::ReadWrite)){
                outputFile = ofToDataPath( folderDest.get() +"/" + folderAppend.get() );
                f.moveTo( outputFile  );
            }
        } else {
        }
        ofNotifyEvent(onFinishedRecording, currentFileName, this);
        
        // make a thumbnail quick
        if ( outputFile != "" ){
            string fn = ofSplitString(currentFileName, ".")[0];
            string cmd = "bash --login -c 'ffmpeg -i " + outputFile +"/"+currentFileName;
            string file = ofToDataPath(folderDest.get() +"/" + folderAppend.get() + "/" + fn +".png", true);
            cmd +=" -ss 00:00:" + ofToString(recordLength.get()/1000 * .5) + " -vframes 1 " + file +"'";
            system( cmd.c_str() );
            cout << file << endl;
        }
        
        currentBgClip = "";
    }
    
    //--------------------------------------------------------------
    void RecordManager::stopRecording(){
        bRecording = false;
        vidRecorder.close();
        
        // chill... we should get an event shortly (above)
    }

    //--------------------------------------------------------------
    void RecordManager::close(){
        vidRecorder.close();
    }
        
    //--------------------------------------------------------------
    void RecordManager::takePhotoEvt( string & name ){
        currentFileName = name + "-" + (fileName.get() +ofGetTimestampString()+fileExtImage.get() );
        auto outputName = ofToDataPath(folderDest.get() + "/" + folderAppend.get() + "/" + currentFileName, true );
        cout << "saving" <<endl;
        lastImage.save(outputName);
        cout << "saved" <<endl;
        ofNotifyEvent(onFinishedCapture, currentFileName, this);
    }
    
}
