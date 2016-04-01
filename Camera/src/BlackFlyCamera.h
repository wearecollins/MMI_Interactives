//
//  BlackFlyCamera.h
//  CameraTest
//
//  Created by Brett Renfer on 3/18/16.
//  Copyright (c) 2016 __MyCompanyName__. All rights reserved.
//

#pragma once

#include "ofxLibdc.h"

namespace mmi {

class BlackFlyCamera
{
public:
    
    ~BlackFlyCamera();
    
    bool setup( string guid = "", int width = 2080, int height = 1552 );
    void update();
    void draw( float x, float y, float w = -1, float h=-1);
    void drawDebug( int x, int y, float w, float h );
    void close();
    
    bool isSetup() const;
    bool isAllocated();
    ofImage & getImage();
    
    int getWidth();
    int getHeight();
    
    ofParameterGroup params;
    
    const string getGuid();
    
    void reloadShader();
    
protected:
    ofxLibdc::Camera camera;
    bool bSetup;
    
    ofImage buffer;
    ofFbo   drawer;
    ofShader bayerShader;
    
    ofParameter<string>         guid;
    ofParameter<int>            gpuBayer;
    ofParameter<bool>           imageColor;
    ofParameter<float>          brightness;
    ofParameter<float>          gamma;
    ofParameter<float>          gain;
    ofParameter<float>          exposure;
    ofParameter<float>          shutter;
    ofParameter<ofVec4f>        roi;
    
    int width, height;
    
    // event listeners
    void onBrightnessUpdated( float & v );
    void onGammaUpdated( float & v );
    void onGainUpdated( float & v );
    void onExposureUpdated( float & v );
    void onShutterUpdated( float & v );
    void onRoiUpdated( ofVec4f & v );
    
};

}