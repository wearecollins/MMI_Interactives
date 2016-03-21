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
    
    void setup( string guid = "", int width = 960, int height = 600, bool bColor = true);
    void update( ofEventArgs & args );
    void draw( int x, int y);
    void drawDebug( int x, int y );
    
    bool isSetup() const;
    ofImage & getImage();
    
protected:
    ofImage capture;
    bool bSetup;
    
    ofxLibdc::PointGrey camera;
};

}