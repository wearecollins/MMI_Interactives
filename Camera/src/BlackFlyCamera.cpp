//
//  BlackFlyCamera.cpp
//  CameraTest
//
//  Created by Brett Renfer on 3/18/16.
//  Copyright (c) 2016 __MyCompanyName__. All rights reserved.
//

#include "BlackFlyCamera.h"

namespace mmi {
    // from ofxLibdc::PointGrey
    #define readBits(x, pos, len) ((x >> (pos - len)) & ((1 << len) - 1))
    
    // mode 4 = 1/2 res, mode 0 = full res
    int fmt7Mode = 0;
    bool lastBayer = false;
    bool lastColor = true;
    
    //--------------------------------------------------------------
    BlackFlyCamera::BlackFlyCamera() :
    bSetup(false){
        
        static int bfCamIdx = 0;
        bfCamIdx++;
        
        // setup GUI
        this->params.setName("Camera " + ofToString( bfCamIdx ) + " settings");
        this->params.add(this->guid.set("Guid", guid));
        this->params.add(this->resMode.set( "Hi-res/lo-res", 1, 0, 1 ));
        this->params.add(this->gpuBayer.set("Bayer GPU on/cv/off", 1,0,2));
        this->params.add(this->brightness.set("Brightness", .5, 0., 1.0));
        this->params.add(this->gamma.set("gamma", .5, 0., 1.0));
        this->params.add(this->gain.set("gain", .5, 0., 1.0));
        this->params.add(this->exposure.set("exposure", .5, 0., 1.0));
        this->params.add(this->shutter.set("shutter", .5, 0., 1.0));
        this->params.add(this->doReset.set( "Reset camera", false ));
        this->params.add(this->imageColor.set("Color/BW", true));
        
        // unclear if this is a good idea yet
        this->params.add(this->roi.set("roi", ofVec4f(0,0,this->width,this->height), ofVec4f(0,0,0,0), ofVec4f(0,0,this->width,this->height)));
        
        this->brightness.addListener(this, &BlackFlyCamera::onBrightnessUpdated);
        this->gamma.addListener(this, &BlackFlyCamera::onGammaUpdated);
        this->gain.addListener(this, &BlackFlyCamera::onGainUpdated);
        this->exposure.addListener(this, &BlackFlyCamera::onExposureUpdated);
        this->shutter.addListener(this, &BlackFlyCamera::onShutterUpdated);
        this->roi.addListener(this, &BlackFlyCamera::onRoiUpdated);
        
        reloadShader();
    }
    
    //--------------------------------------------------------------
    BlackFlyCamera::~BlackFlyCamera(){
        if ( bSetup ){
            close();
        }
    }

    //--------------------------------------------------------------
    bool BlackFlyCamera::setup( string guid, int width, int height ){
        if ( isSetup() ){
            return false;
        }
        
        this->width = width;
        this->height = height;
        
        if ( this->width < 2080 ){
            fmt7Mode = 4;
        } else {
            fmt7Mode = 0;
        }
        
        bSetup = false;
        
        // setup stuff
        this->guid.set(guid);
        
        openCamera();
        
        if ( isSetup() ){
            ofLogVerbose()<<"Camera "<<this->guid.get()<<" setup";
            return true;
        } else {
            ofLogVerbose()<<"Camera "<<this->guid.get()<<" failed to open";
        }
        
        
        // something went wrong :(
        return false;
    }

    //--------------------------------------------------------------
    bool BlackFlyCamera::openCamera(){
        bSetup = false;
        
        fmt7Mode = this->resMode.get() == 0 ? 0 : 4;
        
        // reset bus
        camera.resetBus(guid);
        
        if ( imageColor.get() && gpuBayer.get() == 2 ){
            cout << "set bayer?" <<endl;
            /*
             DC1394_BAYER_METHOD_NEAREST=0,
             DC1394_BAYER_METHOD_SIMPLE,
             DC1394_BAYER_METHOD_BILINEAR,
             DC1394_BAYER_METHOD_HQLINEAR,
             DC1394_BAYER_METHOD_DOWNSAMPLE,
             DC1394_BAYER_METHOD_EDGESENSE,
             DC1394_BAYER_METHOD_VNG,
             DC1394_BAYER_METHOD_AHD
             */
            camera.setBayerMode(DC1394_COLOR_FILTER_RGGB, DC1394_BAYER_METHOD_NEAREST);
            
            //todo: query BAYER_TILE_MAPPING (register 0x1040)
        }
        
        camera.setFormat7(true, fmt7Mode);
        this->width = 2080 * (fmt7Mode == 0 ? 1 : .5);
        this->height = 1552 * (fmt7Mode == 0 ? 1 : .5);
        
        ofLogVerbose()<<"[PointGrey Camera] Setting up at "<<this->width<<","<<this->height;
        
        camera.setSize(this->width,this->height);
        //        camera.setFrameRate(60);
        
        
//        ofSetLogLevel(OF_LOG_VERBOSE);
        if ( guid.get() == "" ){
            bSetup = camera.setup();
        } else {
            bSetup = camera.setup(guid);
        }
        
        if ( bSetup ){
            // setup buffers
            if ( imageColor.get() && gpuBayer.get() == 2 ){
                buffer.clear();
                buffer.allocate(this->width, this->height, OF_IMAGE_COLOR);
            } else {
                buffer.clear();
                buffer.allocate(this->width, this->height, OF_IMAGE_GRAYSCALE);
            }
            
            pingPong[0].clear();
            pingPong[1].clear();
            pingPong[0].allocate(this->width, this->height);
            pingPong[1].allocate(this->width, this->height);
            
            src = &pingPong[0];
            dst = &pingPong[1];
            
            // yolo
            auto * c = camera.getLibdcCamera();
            dc1394video_mode_t vm = (dc1394video_mode_t) ((int) DC1394_VIDEO_MODE_FORMAT7_0 + fmt7Mode);
            
            // set maximum framerate
            unsigned int framerateInq;
            dc1394_get_control_register(c, PTGREY_FRAME_RATE_INQ, &framerateInq);
            unsigned int minValue = readBits(framerateInq, 24, 12);
            minValue |= 0x82000000;
            dc1394_set_control_register(c, PTGREY_FRAME_RATE, minValue);
            
            // more chill features
            
            //            camera.setFeatureAbs( DC1394_FEATURE_TRIGGER_DELAY, 0.);
            
            // unclear if this really does anything yet
            /*auto err = dc1394_feature_set_power(c,DC1394_FEATURE_TRIGGER,DC1394_ON);
             DC1394_ERR_RTN(err, "Could not set trigger on.");
             err = dc1394_feature_set_power(c,DC1394_FEATURE_TRIGGER_DELAY,DC1394_OFF);
             DC1394_ERR_RTN(err, "Could not set trigger delay off.");
             err=dc1394_external_trigger_set_mode(c, DC1394_TRIGGER_MODE_3);
             DC1394_ERR_RTN(err, "Could not set trigger mode.");
             err=dc1394_external_trigger_set_source(c, DC1394_TRIGGER_SOURCE_SOFTWARE);
             DC1394_ERR_RTN(err, "Could not set trigger source.");*/
            
            return true;
        } else {
            return false;
        }
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::reloadShader(){
        bayerShader.load("bayer");
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::update(){
        if (!isSetup()){
            return;
        }
        
        // need to reset camera
        if ( doReset.get() ||
            ( fmt7Mode == 4 && resMode.get() == 0) ){
            camera.close();
            openCamera();
            doReset.set(false);
        }
        
        if ( gpuBayer == 2){
            if (imageColor.get() && buffer.getImageType() != OF_IMAGE_COLOR ){
                cout << "set bayer>"<<endl;
                buffer.allocate(width, height, OF_IMAGE_COLOR);
                camera.setBayerMode(DC1394_COLOR_FILTER_RGGB, DC1394_BAYER_METHOD_NEAREST);
                camera.setImageType(OF_IMAGE_COLOR);
            } else if ( !imageColor.get() && buffer.getImageType() != OF_IMAGE_GRAYSCALE ){
                buffer.allocate(width, height, OF_IMAGE_GRAYSCALE);
                camera.setImageType(OF_IMAGE_GRAYSCALE);
                camera.disableBayer();
            }
            
            auto v = camera.grabVideo(buffer);
            if ( v ){
                buffer.update();
            }
        } else {
            if (buffer.getImageType() != OF_IMAGE_GRAYSCALE ){
                buffer.allocate(width, height, OF_IMAGE_GRAYSCALE);
                camera.setImageType(OF_IMAGE_GRAYSCALE);
//                buffer.getTexture().setTextureMinMagFilter(GL_NEAREST, GL_NEAREST);
            }
            
//
//        return;
        
            //todo: custom capture method + bayer in a shader!
            
            bool remaining;
            int i = 0;
            
            auto * c = camera.getLibdcCamera();
            dc1394video_mode_t vm = (dc1394video_mode_t) ((int) DC1394_VIDEO_MODE_FORMAT7_0 + fmt7Mode);
            auto capturePolicy = DC1394_CAPTURE_POLICY_POLL; //non-blocking
            
            // start transmit
            dc1394switch_t cur, target;
            dc1394_video_get_transmission(c, &cur);
            target = DC1394_ON;
            if(cur != target){
                dc1394_video_set_transmission(c, target);
            }
            
            do {
                dc1394video_frame_t *frame;
                dc1394error_t err = dc1394_capture_dequeue(c, capturePolicy, &frame);
                
                auto imageType = buffer.getImageType();
                
                if(frame != NULL) {
                    unsigned char* src = frame->image;
                    unsigned char* dst = buffer.getPixels().getData();
                    auto width = buffer.getWidth();
                    auto height = buffer.getHeight();
                    
                    //            if(imageType == OF_IMAGE_GRAYSCALE) {
                    //                memcpy(dst, src, width * height);
                    //            } else if(imageType == OF_IMAGE_COLOR) {
                    //                unsigned int bits = width * height * buffer.getPixels().getBitsPerPixel();
                    //                dc1394_convert_to_RGB8(src, dst, width, height, 0, DC1394_COLOR_CODING_RAW8, bits);
                    //            }
                    
                    memcpy(dst, src, width * height);
                    
                    dc1394_capture_enqueue(c, frame);
                    remaining = true;
                    i++;
                } else {
                    // silencio
                    remaining = false;
                }

            } while (remaining);
            
            if ( i > 0 ){
                if ( gpuBayer.get() == 1 ){
                    if (!cvBuffer.isAllocated()){
                        cvBuffer.allocate(this->width, this->height, OF_IMAGE_COLOR);
                    }
                    ofxCv::convertColor(buffer,cvBuffer, CV_BayerRG2BGR);
                    cvBuffer.update();
                } else {
                    buffer.update();
                }
            }
        }
    }

    //--------------------------------------------------------------
    void BlackFlyCamera::draw( float x, float y, float w, float h){
        src->begin();
//        ofClear(0);
        if ( gpuBayer.get() == 0 ){
            bayerShader.begin();
            bayerShader.setUniformTexture("source", buffer.getTexture(), 1);
            bayerShader.setUniform4f("sourceSize", buffer.getWidth(), buffer.getHeight(), 1./buffer.getWidth(), 1./buffer.getHeight());
            bayerShader.setUniform2f("firstRed", 0, 0);
            
//            ofPlanePrimitive plane(w,h,2,2);
//            plane.mapTexCoordsFromTexture(buffer.getTexture());
//            plane.draw();
            
            buffer.draw(0,0);
        } else {
            if ( gpuBayer == 1 ){
                cvBuffer.draw(0,0);
            } else {
                buffer.draw(0,0);
            }
        }
        if (gpuBayer.get() == 0){
            bayerShader.end();
        }
        src->end();
        dst->draw(x,y,w,h);
        swap(src, dst);
    }

    //--------------------------------------------------------------
    void BlackFlyCamera::drawDebug( int x, int y,float w, float h ){
        draw(x,y,w,h);
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
//        return buffer;
        if (gpuBayer.get() == 1) {
            return cvBuffer;
        } else {
            return buffer;
        }
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