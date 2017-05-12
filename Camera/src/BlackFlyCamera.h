//
//  BlackFlyCamera.h
//  CameraTest
//
//  Created by Brett Renfer on 3/18/16.
//  .
//

#pragma once

#include "ofxLibdc.h"
#include "ofxCv.h"

namespace mmi {

class BlackFlyCamera
{
public:
    
    BlackFlyCamera();
    ~BlackFlyCamera();
    
    bool setup( string guid = "", int width = 2080, int height = 1552 );
    void update();
    void draw( float x, float y, float w = -1, float h=-1);
    void drawDebug( int x, int y, float w, float h );
    void close();
    bool closeCamera;
    
    bool isSetup() const;
    bool isAllocated();
    ofImage & getImage();
    
    int getWidth();
    int getHeight();
    
    ofParameterGroup params;
    
    const string getGuid();
    
    void reloadShader();
    
    void setDefaultSettings( string preset );
    
    void logInfo();
    void resetBus();
    
    //Stolen from oF 0.10
    /// \brief Compare two floating point types for equality.
    ///
    /// From C++ FAQ:
    ///
    /// Floating point arithmetic is different from real number arithmetic.
    /// Never use `==` to compare two floating point numbers.
    ///
    /// This solution is not completely symmetric, meaning it is possible for
    /// `ofIsFloatEqual(x, y) != ofIsFloatEqual(y, x)`. From a practical
    /// standpoint, this does not usually occur when the magnitudes of x and y are
    /// significantly larger than epsilon, but your mileage may vary.
    ///
    /// \sa https://isocpp.org/wiki/faq/newbie#floating-point-arith
    /// \sa https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html
    /// \tparam The floating point data type.
    /// \param a The first floating point type variable to compare.
    /// \param b The second floating point type variable to compare.
    /// \returns True if `std::abs(x - y) <= std::numeric_limits<Type>::epsilon() * std::abs(x)`.
    template<typename Type>
    typename std::enable_if<std::is_floating_point<Type>::value, bool>::type ofIsFloatEqual(const Type& a, const Type& b)
    {
        return std::abs(a - b) <= std::numeric_limits<Type>::epsilon() * std::abs(a);
    }
    
protected:
    ofxLibdc::Camera camera;
    ofFpsCounter trackedCamerafps;
    int configuredColorCoding;
    bool bSetup;
    bool closedCamera;
    
    bool openCamera();
    
    ofImage buffer, cvBuffer, cropped;
    ofFbo   pingPong[2];
    ofFbo * src;
    ofFbo * dst;
    
    ofParameter<string>         guid;
    ofParameter<int>            gpuBayer;
    ofParameter<int>            resMode;    // 0 = hi-res, 1 = lo-res
    ofParameter<bool>           imageColor;
    ofParameter<bool>           mirror;
    ofParameter<float>          brightness;
    ofParameter<float>          gamma;
    ofParameter<float>          gain;
    ofParameter<float>          exposure;
    ofParameter<float>          shutter;
    ofParameter<int>            aspect_x;
    ofParameter<int>            aspect_y;
    ofParameter<bool>           doReset;
    
    int width, height;
    
    // event listeners
    void onBrightnessUpdated( float & v );
    void onGammaUpdated( float & v );
    void onGainUpdated( float & v );
    void onExposureUpdated( float & v );
    void onShutterUpdated( float & v );
    void onRoiUpdated( ofVec4f & v );
    
    // utils from PointGrey libdc stuff
    void setMaxFramerate();
    unsigned int getEmbeddedInfo(unsigned char* pixels, int embeddedInfo);
    unsigned int getEmbeddedInfoOffset(int embeddedInfo);
    void clearEmbeddedInfo();
    void setEmbeddedInfo(int embeddedInfo, bool enable = true);
    
    // software triggering (experimental, mostly unused)
    void sendSoftwareTrigger( dc1394camera_t* camera );
    
    // pointgrey-specific
    void getShutterValue();
    void getTriggerMode();
};

}
