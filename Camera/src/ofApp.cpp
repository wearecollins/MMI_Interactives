#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
    ofSetLogLevel(OF_LOG_VERBOSE);
    gui.add(cameraTop.set("Which camera top", 0, 0, 1));
    
    cameraMgr.setup();
    recordMgr.setup();
    
    for ( int i=0; i<cameraMgr.getNumCameras(); i++){
        streamers.push_back( new mmi::ImageStreamer);
        streamers.back()->setup();
        gui.add( streamers.back()->params );
    }
    
    gui.add(recordMgr.params);
    
    gui.setup("Settings");
    ofSetLogLevel(OF_LOG_ERROR);
    
    currentMode = MODE_GENERAL;
}

//--------------------------------------------------------------
void ofApp::update(){
    // try to stream all the time, image streamer will handle by framerate
    for ( int i=0; i<streamers.size(); i++){
        auto * c = cameraMgr.getCamera(i);
        if ( c != nullptr ){
            streamers[i]->stream(c->getImage());
        }
    }
    
    if ( cameraMgr.getNumCameras() > 1 ){
        
        int t = cameraTop.get() == 0 ? 0 : 1;
        int b = cameraTop.get() == 0 ? 1 : 0;
        
        auto & img1 = cameraMgr.getCamera(t)->getImage();
        auto & img2 = cameraMgr.getCamera(b)->getImage();
        
        if ( !img1.isAllocated() || !img2.isAllocated() ) return;
        
        recordMgr.update(img1.getPixels(), img2.getPixels());
    }
}

//--------------------------------------------------------------
void ofApp::draw(){
    ofPushMatrix();
    ofScale(.5, .5);
    cameraMgr.drawDebug(0, 0);
    ofPopMatrix();
    
    ofDrawBitmapStringHighlight( "Press 'm' to switch configure modes", 20, ofGetHeight()-40, ofColor::yellow, ofColor::black);
    
    switch (currentMode){
        case MODE_GENERAL:
            gui.draw();
            break;
            
        case MODE_CAMERAS:
            cameraMgr.drawGui();
            break;
            
        case MODE_NONE:
        default:
            // shhh
            ;
            
    }
    
    auto fps = ofToString(ofGetFrameRate(),3);
    ofSetWindowTitle(fps);
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){
    if ( key == 'm' ){
        currentMode = (Mode)((int) currentMode + 1);
        if ( currentMode > MODE_NONE ){
            currentMode = MODE_GENERAL;
        }
    }
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseEntered(int x, int y){

}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}
