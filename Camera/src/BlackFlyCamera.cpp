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
            close();
        }
    }

    //--------------------------------------------------------------
    bool BlackFlyCamera::setup( string guid, int width, int height, bool bColor){
        if ( isSetup() ){
            return false;
        }
        
        bSetup = false;
        
        if ( bColor ){
            camera.setBayerMode(DC1394_COLOR_FILTER_RGGB);
        }
        
        camera.set1394b(true);
        camera.setFormat7(true, 0);
        camera.setSize(2080,1552);
        camera.setFrameRate(60);
        
        ofSetLogLevel(OF_LOG_VERBOSE);
        if ( guid == "" ){
            bSetup = camera.setup();
//            camera.getTextureReference().allocate(width, height, GL_RGB);
        } else {
            bSetup = camera.setup(guid);
//            camera.getTextureReference().allocate(width, height, GL_LUMINANCE);
        }
//        camera.setMaxFramerate();
        ofSetLogLevel(OF_LOG_ERROR);
        
        static int bfCamIdx = 0;
        bfCamIdx++;
        
        if ( isSetup() ){
            // setup GUI
            this->params.setName("Camera " + ofToString( bfCamIdx ) + " settings");
            this->params.add(this->guid.set("Guid", guid));
            this->params.add(this->brightness.set("Brightness", .5, 0., 1.0));
            this->params.add(this->gamma.set("gamma", .5, 0., 1.0));
            this->params.add(this->gain.set("gain", .5, 0., 1.0));
            this->params.add(this->exposure.set("exposure", .5, 0., 1.0));
            
            // unclear if this is a good idea yet
            this->params.add(this->roi.set("roi", ofVec4f(0,0,width,height), ofVec4f(0,0,0,0), ofVec4f(0,0,width,height)));
            
            this->brightness.addListener(this, &BlackFlyCamera::onBrightnessUpdated);
            this->gamma.addListener(this, &BlackFlyCamera::onGammaUpdated);
            this->gain.addListener(this, &BlackFlyCamera::onGainUpdated);
            this->exposure.addListener(this, &BlackFlyCamera::onExposureUpdated);
            this->shutter.addListener(this, &BlackFlyCamera::onShutterUpdated);
            this->roi.addListener(this, &BlackFlyCamera::onRoiUpdated);
            
            return true;
        }
        
        // something went wrong :(
        return false;
    }

    //--------------------------------------------------------------
    void BlackFlyCamera::update(){
        camera.update();
        auto v = camera.isFrameNew();
    }

    //--------------------------------------------------------------
    void BlackFlyCamera::draw( int x, int y, int w, int h){
        camera.draw(x,y);
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
    void BlackFlyCamera::close(){
        //todo: camera close?
        
        this->brightness.removeListener(this, &BlackFlyCamera::onBrightnessUpdated);
        this->gamma.removeListener(this, &BlackFlyCamera::onGammaUpdated);
        this->gain.removeListener(this, &BlackFlyCamera::onGainUpdated);
        this->exposure.removeListener(this, &BlackFlyCamera::onExposureUpdated);
        this->shutter.removeListener(this, &BlackFlyCamera::onShutterUpdated);
        this->roi.removeListener(this, &BlackFlyCamera::onRoiUpdated);
    }
    
    //--------------------------------------------------------------
    int BlackFlyCamera::getWidth() {
        return camera.getWidth();
    }
    
    //--------------------------------------------------------------
    int BlackFlyCamera::getHeight() {
        return camera.getHeight();
    }
    
#pragma mark events
    
    //--------------------------------------------------------------
    const string BlackFlyCamera::getGuid(){
        return guid.get();
    }
    
    
    //--------------------------------------------------------------
    ofImage & BlackFlyCamera::getImage(){
        return camera.getBuffer();
    }
    
    
#pragma mark events
    
    //--------------------------------------------------------------
    void BlackFlyCamera::onBrightnessUpdated( float & v ){
        if (isSetup()){
            camera.setBrightness(v);
        }
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::onGammaUpdated( float & v ){
        if (isSetup()){
            camera.setGamma(v);
        }
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::onGainUpdated( float & v ){
        if (isSetup()){
            camera.setGain(v);
        }
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::onExposureUpdated( float & v ){
        if (isSetup()){
            camera.setExposure(v);
        }
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::onShutterUpdated( float & v ){
        if (isSetup()){
            camera.setShutter(v);
        }
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::onRoiUpdated( ofVec4f & v ){
        if (isSetup()){
        }
    }
    
}