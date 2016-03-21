//
//  BlackFlyCamera.cpp
//  CameraTest
//
//  Created by Brett Renfer on 3/18/16.
//  Copyright (c) 2016 __MyCompanyName__. All rights reserved.
//

#include "BlackFlyCamera.h"

namespace mmi {

//--------------------------------------------------------------
BlackFlyCamera::~BlackFlyCamera(){
    if ( bSetup ){
        ofRemoveListener( ofEvents().update, this, &BlackFlyCamera::update);
    }
}

//--------------------------------------------------------------
void BlackFlyCamera::setup( string guid, int width, int height, bool bColor){
    if ( isSetup() ){
        return;
    }
    
    bSetup = false;
    
    if ( bColor ){
        camera.setBayerMode(DC1394_COLOR_FILTER_RGGB);
        capture.allocate(width,height, OF_IMAGE_COLOR);
    } else {
        capture.allocate(width,height, OF_IMAGE_GRAYSCALE);
    }
    
    camera.setFormat7(true, 0);
    
    if ( guid == "" ){
        bSetup = camera.setup();
    } else {
        bSetup = camera.setup(guid);
    }
    
    if ( isSetup() ){
        ofAddListener( ofEvents().update, this, &BlackFlyCamera::update);
    }
}

//--------------------------------------------------------------
void BlackFlyCamera::update( ofEventArgs & args ){
    auto v = camera.grabVideo(capture);
    
    if(v) {
        capture.update();
    }
}

//--------------------------------------------------------------
void BlackFlyCamera::draw( int x, int y){
    capture.draw(x,y);
}

//--------------------------------------------------------------
void BlackFlyCamera::drawDebug( int x, int y ){
    draw(x,y);
    ofDrawBitmapStringHighlight("Camera guid: "+camera.getGuid(), x, y + 20);
}
//--------------------------------------------------------------
bool BlackFlyCamera::isSetup() const {
    return bSetup;
}

//--------------------------------------------------------------
ofImage & BlackFlyCamera::getImage(){
    return capture;
}
}