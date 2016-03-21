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
    
    bool setup( string guid = "", int width = 960, int height = 600, bool bColor = true);
    void update( ofEventArgs & args );
    void draw( int x, int y);
    void drawDebug( int x, int y );
    void close();
    
    bool isSetup() const;
    ofImage & getImage();
    
    ofParameterGroup params;
    
    const string getGuid();
    
protected:
    ofxLibdc::PointGrey camera;
    bool bSetup;
    
    ofParameter<string>         guid;
    ofParameter<float>          brightness;
    ofParameter<float>          gamma;
    ofParameter<float>          gain;
    ofParameter<float>          exposure;
    ofParameter<float>          shutter;
    ofParameter<ofVec4f>        roi;
    
    // event listeners
    void onBrightnessUpdated( float & v );
    void onGammaUpdated( float & v );
    void onGainUpdated( float & v );
    void onExposureUpdated( float & v );
    void onShutterUpdated( float & v );
    void onRoiUpdated( ofVec4f & v );
    
};

}