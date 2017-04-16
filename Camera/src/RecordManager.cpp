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
        
        advancedParams.setName("Advanced params");
        advancedParams.add(bitrate.set("Bitrate",800, 1, 10000));
        advancedParams.add(folderAppend.set("Install folder","performance"));
        advancedParams.add(tempAppend.set("Temp folder","temp"));
        // this is now automagic
        //advancedParams.add(pixFmt.set("Pixel Format","rgb24"));
        advancedParams.add(fileExt.set("File extension",".mp4"));
        advancedParams.add(codec.set("Video codec","mpeg4"));
        advancedParams.add(fileExtImage.set("File extension image",".png"));
        
        // these are externally editable
        folderDest.set("Folder","../../../data");
        fileName.set("File name","");
        
        params.add(advancedParams);

        bRecording = false;
        bStitched = true;
        currentBgClip = "";
        
        frameRate = 1000./30.;
        
        ofAddListener(vidRecorder.outputFileCompleteEvent, this, &RecordManager::onFileComplete);
    }

    //--------------------------------------------------------------
    void RecordManager::update( ofPixels & cameraOne, ofPixels & cameraTwo ){
        // update 'automatic' parameters
        static ofPixelFormat lastPixFmt = OF_PIXELS_UNKNOWN;
        if ( cameraOne.getPixelFormat() != lastPixFmt ){
            updatePixelFormat(cameraOne);
            lastPixFmt = cameraOne.getPixelFormat();
        }
        
        static int lastCamWidth = camWidth.get();
        static int lastCamHeight = camHeight.get();
        
        int realWidth   = cameraOne.getWidth();
        int realHeight  = cameraOne.getHeight();
        
        if ( lastCamWidth != realWidth ){
            camWidth.set(realWidth);
        }
        if ( lastCamHeight != realHeight ){
            camHeight.set(realHeight);
        }
        
        lastCamWidth = realWidth;
        lastCamHeight = realHeight;
        
        auto t = ofGetElapsedTimeMillis();
        
        // recording time!
        if(bRecording){
            
            //            if ( t - lastFrameAdded < frameRate ) return;
            
            if (( t - lastTime ) >= recordInterval){
                whichCamera = !whichCamera;
                lastTime = t;
            }
            
            if ( t - startTime >= recordLength.get() ){
                ofLogNotice("Camera.RecordManager")<<"Stopping recording: "<< t <<":"<<(t-startTime)<<":"<<recordLength<<endl;
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
                ofLogWarning("Camera.RecordManager")<<"This frame was not added";
            }
        } else if (!bStitched && t >= stitchTime){
            bStitched = true;
            stitchFile();
        }
    }

    
    //--------------------------------------------------------------
    void RecordManager::update( const ofPixels & cameraOne ){
        lastImage.setFromPixels(cameraOne);
    }
    
    //--------------------------------------------------------------
    void RecordManager::updatePixelFormat( const ofPixels & camera ){
        ofPixelFormat fmt = camera.getPixelFormat();
        switch (fmt) {
            case OF_PIXELS_GRAY:
                pixFmt.set("gray");
                break;
                
            case OF_PIXELS_BGR:
                pixFmt.set("bgr24");
                break;
                
            case OF_PIXELS_BGRA:
                pixFmt.set("bgra");
                break;
                
            case OF_PIXELS_I420:
                pixFmt.set("yuv420p");
                break;
                
            case OF_PIXELS_RGB:
                pixFmt.set("rgb24");
                break;
                
            case OF_PIXELS_RGBA:
                pixFmt.set("rgba");
                break;
                
            default:
                pixFmt.set("rgb24");
                break;
        }
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
        currentBgClip = strs[0];
        currentFileStart = strs[1];
        //this->startRecording(strs[0], strs[1]);
    }
    
    //--------------------------------------------------------------
    void RecordManager::startRecording(/* string backgroundClip, string fileStart */){
        
        //this->currentFileStart = fileStart;
        
        if ( bRecording ){
            ofLogWarning("Camera.RecordManager")<<"Already recording, try again in "<<((ofGetElapsedTimeMillis()-startTime)/1000.)<<" seconds";
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
        
        //currentBgClip = backgroundClip;
        
        vidRecorder.setup(currentFileName, camWidth, camHeight, 30, 0, 0, true  );
        
        vidRecorder.start();
        
        ofLogNotice("Camera.RecordManager")<<"beginning video capture";
    }
    
    void RecordManager::stitchFile(){
        ofLogNotice("Camera.RecordManager")<<"begin video stitching :"<<currentFileName;
        string outputFile = "";
        if ( currentBgClip != "" ){
            auto fileSplit = ofSplitString(currentFileName, ".");
            
            string lastCmd = "bash --login -c 'ffmpeg -i " + ofToDataPath(currentFileName, true);
            lastCmd +=" -i "+ ofToDataPath("clips/" + currentBgClip + fileExt.get(), true) +" -c copy -map 0:v:0 -map 1:a:0 -shortest "+ofToDataPath(fileSplit[0] +"_tCvht"+fileExt.get(), true)+"'";
            system( lastCmd.c_str() );
            
            string toCvt = ofToDataPath(fileSplit[0] +"_tCvht"+fileExt.get(), true);
            
            lastCmd = "bash --login -c 'ffmpeg -i "+toCvt+" -vcodec h264 -strict -2 " + ofToDataPath(fileSplit[0] +"_final"+fileExt.get(), true)+"'";
            
            system( lastCmd.c_str() );
            
            auto f = ofFile();
            
            // remove original
            if (f.open(ofToDataPath(currentFileName, true), ofFile::ReadWrite)){
                f.remove();
            }
            // remove 'to convert'
            if (f.open(ofToDataPath(toCvt, true), ofFile::ReadWrite)){
                f.remove();
            }
            currentFileName = fileSplit[0] + "_final"+fileExt.get();
            
            if (f.open(ofToDataPath(currentFileName, true), ofFile::ReadWrite)){
                outputFile = ofToDataPath( folderDest.get() +"/" + folderAppend.get() );
                ofDirectory outDir(outputFile);
                if ( !outDir.exists() ){
                    outDir.create();
                }
                f.moveTo( outputFile  );
            } else {
                ofLogError("Camera.RecordManager")<<"error moving video file :"<<outputFile;
            }
            
            ofLogNotice("Camera.RecordManager")<<"video completed stitching :"<<currentFileName;
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
            
            ofLogNotice("Camera.RecordManager")<<"video thumbnail saved :"<<file;
        }
        
        currentBgClip = "";
    }

    
    //--------------------------------------------------------------
    void RecordManager::onFileComplete( ofxVideoRecorderOutputFileCompleteEventArgs & args ){
        ofLogNotice("Camera.RecordManager")<<"video completed recording :"<<currentFileName;
        //stitch one second from now
        stitchTime = ofGetElapsedTimeMillis() + 1000;
        bStitched = false;
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
        auto outputName = ofToDataPath(folderDest.get() + "/" + tempAppend.get() + "/" + currentFileName, true );
        lastImage.save(outputName);
        
        ofLogNotice("Camera.RecordManager")<<"temp photo saved :"<<outputName;
        
        ofNotifyEvent(onFinishedCapture, currentFileName, this);
    }
    
    //--------------------------------------------------------------
    void RecordManager::confirmPhotoEvt( string & baseName ){
        auto outputName = ofToDataPath(folderDest.get() + "/" + tempAppend.get() + "/" + currentFileName, true );
        ofFile img;
        if (img.open(outputName, ofFile::Mode::ReadOnly, true)){
            string dest = ofToDataPath(folderDest.get() + "/" + folderAppend.get() + "/" + currentFileName, true );
            img.copyTo(dest, false);
            ofLogNotice("Camera.RecordManager")<<"final photo saved :"<<dest;
        } else {
            ofLogError("Camera.RecordManager")<<"photo not found :"<<outputName;
            
        }
    }
}
