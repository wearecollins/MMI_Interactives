#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
    ofSetVerticalSync(false);
    ofSetFrameRate(120);
    cameraApp.setup();
}

//--------------------------------------------------------------
void ofApp::update(){
    cameraApp.update();
}

//--------------------------------------------------------------
void ofApp::draw(){
    cameraApp.draw();
    
    auto fps = ofToString(ofGetFrameRate(),3);
    ofSetWindowTitle(fps);
}
