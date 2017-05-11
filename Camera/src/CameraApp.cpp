//
//  CameraApp.cpp
//  Camera
//
//  Created by Brett Renfer on 3/25/16.
//

#include "CameraApp.h"

namespace mmi {

    //--------------------------------------------------------------
    void CameraApp::setup( bool bDoStream, string settingsFile ){
        this->bStreaming = bDoStream;
        
        gui = new ofxPanel();
        ofLogNotice("Camera.CameraApp") <<
            "loading settings file " << settingsFile;
        gui->setup("Settings", settingsFile);
        
        gui->registerMouseEvents();
        gui->add(whichSetup.set("Performance or AM", 0, 0, 1 ));
        gui->add(reloadCameras.set("Reload cameras", false));
        gui->add(discoverCameras.set("Discover cameras", false));
        gui->add(cameraTop.set("Which camera top", 0, 0, 1));
        
        // first: get what camera setup we want
        ofXml settings;
        string xml = "anythingmuppets";
        if ( settings.load( ofToDataPath( settingsFile ) ) ){
            int mode = settings.getValue(whichSetup.getEscapedName(), 0);
            ofLogNotice("Camera.CameraApp") <<
                whichSetup.getEscapedName() << ": " << mode;
            if ( mode == 0 ){
                xml = "performance";
            } else {
                xml = "anythingmuppets";
            }
        }
        
        cameraMgr.setup(this->bStreaming, xml);
        recordMgr.setup();
        
        if ( this->bStreaming ){
            streamMgr.setup("", 9091);
            gui->add( streamMgr.params );
        }
        
        // load videos for sound playback
        ofDirectory vDir;
        int n = vDir.listDir(ofToDataPath("clips"));
        for ( auto i=0; i<n;i++){
            auto n = vDir.getName(i);
            n = ofSplitString(n, ".")[0];
            
            videos[n] = ofVideoPlayer();
            videos[n].load(ofToDataPath(vDir.getPath(i)));
            videos[n].setLoopState(OF_LOOP_NONE);
            videos[n].stop();
        }
        
        // setup message handler, which opens its own ws:// client
        messageHdlr.setup();
        
        // listen to events from message parser
        ofAddListener(messageHdlr.onSwitchCamera,
                      this,
                      &CameraApp::setStreamCamera);
        
        ofAddListener(messageHdlr.onResetCameras,
                      this,
                      &CameraApp::resetCameras);
        
        ofAddListener(messageHdlr.onStartRecording,
                      &recordMgr,
                      &mmi::RecordManager::startRecordingEvt);
        ofAddListener(messageHdlr.onStartRecording,
                      this,
                      &mmi::CameraApp::startRecordingEvt);
        
        ofAddListener(messageHdlr.onCaptureImage,
                      &recordMgr,
                      &mmi::RecordManager::takePhotoEvt);
        
        ofAddListener(messageHdlr.onConfirmImage,
                      &recordMgr,
                      &mmi::RecordManager::confirmPhotoEvt);
        
        ofAddListener(recordMgr.onFinishedRecording,
                      &messageHdlr,
                      &mmi::MessageHandler::onVideoRecorded);
        ofAddListener(recordMgr.onFinishedRecording,
                      this,
                      &mmi::CameraApp::onVideoRecorded);
        
        ofAddListener(recordMgr.onFinishedCapture,
                      &messageHdlr,
                      &mmi::MessageHandler::onImageCaptured);
        
        // complete gui setup
        
        gui->add( recordMgr.params );
        
        // add text fields from gui
        recFolder = new ofxTextField();
        recFolder->setup(recordMgr.folderDest);
        gui->add(recFolder);
        
        gui->add( whichStream.set("Stream which camera", 0, 0, cameraMgr.getNumCameras()-1));
        
        gui->loadFromFile( ofToDataPath( settingsFile ) );
        
        currentMode = MODE_NONE;
        
        ofAddListener(ofEvents().keyPressed, this, &CameraApp::keyPressed, OF_EVENT_ORDER_BEFORE_APP);
    }

    //--------------------------------------------------------------
    void CameraApp::update(){
        // update managers
        messageHdlr.update();
        
        static int lastSetup = -1;
        
        if ( whichSetup.get() != lastSetup ){
            auto & p = recordMgr.folderAppend;
            p.set(whichSetup.get() == 0 ? "performance" : "anythingmuppets");
            
            ofLogNotice("Camera.CameraApp")<<"switching frontend mode "<<p.get();
        }
        lastSetup = whichSetup.get();
        
        // switch camera setup?
        if (reloadCameras.get()){
            reloadCameras.set(false);
            
            string settings = whichSetup.get() == 0 ? "performance" : "anythingmuppets";
            cameraMgr.settingsFile.set(ofToDataPath(settings));
            cameraMgr.setupCameras();
        }
        
        // try to discover and setup new cameras?
        if ( discoverCameras.get() ){
            discoverCameras.set(false);
            
            string settings = whichSetup.get() == 0 ? "performance" : "anythingmuppets";
            cameraMgr.settingsFile.set(ofToDataPath(settings));
            cameraMgr.discoverCameras();
            cameraMgr.setupCameras();
        }
        
        //check playback state
        checkRecordingStatus();
        
        for ( auto & c : cameraMgr.getCameras()){
            c->update();
        }
        
        shared_ptr<mmi::Camera> camera = cameraMgr.getCamera( whichStream.get() );
        if ( this->bStreaming && camera != nullptr ){
            // try to stream all the time, image streamer will handle by framerate
            if ( camera != nullptr && camera->isAllocated() ){
                streamMgr.stream( camera->getImage() );
            }
        }
        
        // update recording: performance
        if ( whichSetup.get() == 0 ){
            
            int t = cameraTop.get() == 0 ? 0 : 1;
            int b = cameraTop.get() == 0 ? 1 : 0;
            
            // special debug case with just one camera
            if ( cameraMgr.getNumCameras() == 1 ){
                t = b = 0;
            }
            
            // care: if there are 0 cameras, return
            if ( cameraMgr.getNumCameras() == 0 ){
                return;
            }
            
            auto & img1 = cameraMgr.getCamera(t)->getImage();
            auto & img2 = cameraMgr.getCamera(b)->getImage();
            if ( !cameraMgr.getCamera(t)->isAllocated() ||
                 !cameraMgr.getCamera(b)->isAllocated() ) {
                return;
            }
            recordMgr.update(img1.getPixels(), img2.getPixels());
        } else if ( cameraMgr.getNumCameras() > 0 ) {
            auto & img1 = cameraMgr.getCamera(0)->getImage();
            recordMgr.update(img1.getPixels());
        }
    }
    
    void CameraApp::resetCameras(bool & b){
        reloadCameras.set(true);
    }
    
    //--------------------------------------------------------------
    void CameraApp::onVideoRecorded(string & file){
        ofLogNotice("Camera.CameraApp") <<
            "Done recording, resetting audio source";
        //Re-set the audio source so it will begin playing from the
        // beginning next time.
        playingVideo->stop();
        playingVideo->firstFrame();
        playingVideo = NULL;
    }
    
    //--------------------------------------------------------------
    void CameraApp::checkRecordingStatus(){
        if (!videoRolling && playingVideo != NULL){
            //if we are waiting to record,
            // but the audio track isn't even playing...
            if (!playingVideo->isPlaying()){
                ofLogWarning("Camera.CameraApp") <<
                    "video is not playing " <<
                    "and never triggered recording";
                //At this point it might already be too late.
                //When I saw this happening, the video would play
                // all the way through without setting isFrameNew to true.
                //By the time we got here,
                // the "perform" screen was already gone.
                playingVideo->play();
            } else {
                //we are waiting to record, and the video is playing
                // so lets call 'update' on the video to update frame info.
                //Otherwise isFrameNew will always be false.
                playingVideo->update();
                int frameNum = playingVideo->getCurrentFrame();
                
                if (playingVideo->isFrameNew()){
                    //If we have already played this video before,
                    // then the first frame might be a high number.
                    //Now that I am resetting the video after recording
                    // the video seems to start at frame 0 every time.
                    
                    // Playback might skip a frame here and there
                    // so checking for a specific frame number
                    // (like 0 or 1) is prone to error
                    
                    // Here we just look for the second unique new frame
                    // to make sure the video is indeed playing
                    if (seenVideoFrame == -1){
                        ofLogNotice("Camera.CameraApp") <<
                            "started playback at frame " <<
                            frameNum;
                        seenVideoFrame = frameNum;
                    } else if (seenVideoFrame !=
                                playingVideo->getCurrentFrame()){
                        ofLogNotice("Camera.CameraApp") <<
                            "starting recording at frame " <<
                            frameNum;
                        videoRolling = true;
                        recordMgr.startRecording();
                    }
                } else if (seenVideoFrame != -1 && seenVideoFrame != frameNum){
                    //If we have a new frame number, but isFrameNew is false
                    // then we have a problem.
                    //I have not seen this happen.
                    ofLogWarning("Camera.CameraApp") <<
                        "New frame number " << frameNum <<
                        " but not actually a 'new' frame?";
                    videoRolling = true;
                    recordMgr.startRecording();
                }
            }
        }
    }

    //--------------------------------------------------------------
    void CameraApp::draw(){
        ofSetColor(255);
        
        ofPushMatrix();
        if ( currentMode != MODE_NONE ){
            cameraMgr.drawDebug(0, 0);
        } else {
            cameraMgr.draw(0, 0, whichStream);
        }
        ofPopMatrix();
        
        switch (currentMode){
            case MODE_GENERAL:
                gui->draw();
                ofDrawBitmapStringHighlight( "Press 'm' to switch configure modes", 20, ofGetHeight()-40, ofColor::yellow, ofColor::black);
                break;
                
            case MODE_CAMERAS:
                cameraMgr.drawGui();
                ofDrawBitmapStringHighlight( "Press 'm' to switch configure modes", 20, ofGetHeight()-40, ofColor::yellow, ofColor::black);
                break;
                
            case MODE_NONE:
            default:
                // shhh
                ;
                
        }
    }

    //--------------------------------------------------------------
    void CameraApp::keyPressed(ofKeyEventArgs & e ){
        if ( e.key == 'm' ){
            currentMode = (Mode)((int) currentMode + 1);
            if ( currentMode > MODE_NONE ){
                currentMode = MODE_GENERAL;
            }
        }
        
        // Debugging
    #ifdef DEBUG_ZONE
        if (e.key == 'f'){
            gui->saveToFile(ofToDataPath( "settings_out.xml" ));
        }
        else if ( e.key == 's' ){
            int whichCamera = whichStream.get() == 0 ? 1 : 0;
            messageHdlr.onSwitchCamera.notify(whichCamera);
        } else if ( e.key == 'H' ){
            string whichVideo = "black_magic";
            messageHdlr.onStartRecording.notify(whichVideo);
        } else if ( e.key == 'r'){
            for (auto & c : cameraMgr.getCameras() ){
                c->reloadShader();
            }
        }
    #endif
    }

    //--------------------------------------------------------------
    void CameraApp::setStreamCamera( int & which ){
        if (/*which >= 0 && */which < cameraMgr.getNumCameras()){
            whichStream.set(which);
        } else {
            //log?
        }
    }
    
    //--------------------------------------------------------------
    void CameraApp::startRecordingEvt( string & video ){
        // play video sound!
        // this comes in as video:name
        video = ofSplitString(video, ":")[0];
        if ( videos.count(video) > 0 ){
            ofLogNotice("Camera.CameraApp")<<"beginning audio playback from " << video;
            videoRolling = false;
            seenVideoFrame = -1;
            videos[video].play();
            playingVideo = &(videos[video]);
        }
    }
}
