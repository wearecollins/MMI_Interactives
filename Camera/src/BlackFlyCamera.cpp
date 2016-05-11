//
//  BlackFlyCamera.cpp
//  CameraTest
//
//  Created by Brett Renfer on 3/18/16.
//  .
//

#include "BlackFlyCamera.h"

namespace mmi {
    // from ofxLibdc::PointGrey
    #define readBits(x, pos, len) ((x >> (pos - len)) & ((1 << len) - 1))
    
    // mode 4 = 1/2 res, mode 0 = full res
    int fmt7Mode = 0;
    bool lastBayer = false;
    bool lastColor = true;
    bool softwareTrigger = false;
    bool isFirstFrame = true;
    
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
        this->params.add(this->mirror.set("Mirror on/off", true));
        
        // unclear if this is a good idea yet
        this->params.add(this->aspect_x.set("Aspect x", 0, 0, 16 ));
        this->params.add(this->aspect_y.set("Aspect y", 0, 0, 16 ));
        
        this->brightness.addListener(this, &BlackFlyCamera::onBrightnessUpdated);
        this->gamma.addListener(this, &BlackFlyCamera::onGammaUpdated);
        this->gain.addListener(this, &BlackFlyCamera::onGainUpdated);
        this->exposure.addListener(this, &BlackFlyCamera::onExposureUpdated);
        this->shutter.addListener(this, &BlackFlyCamera::onShutterUpdated);
//        this->roi.addListener(this, &BlackFlyCamera::onRoiUpdated);
        
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
        this->params.setName("Camera " + ofToString( guid ));
        
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
        isFirstFrame = true;
        
        fmt7Mode = this->resMode.get() == 0 ? 0 : 4;
        
        // reset bus
        camera.resetBus(guid);
        
        if ( imageColor.get() && gpuBayer.get() == 2 ){
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
        } else {
            camera.setImageType(OF_IMAGE_GRAYSCALE);
            camera.disableBayer();
        }
        
        camera.setFormat7(true, fmt7Mode);
        this->width = 2080 * (fmt7Mode == 0 ? 1 : .5);
        this->height = 1552 * (fmt7Mode == 0 ? 1 : .5);
        
        ofLogVerbose()<<"[PointGrey Camera] Setting up at "<<this->width<<","<<this->height;
        
        camera.setSize(this->width,this->height);
        
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
            
            setMaxFramerate();
//            getTriggerMode();
            
            // this is slow & unwieldy. don't do it!
            if ( softwareTrigger ){
                //            camera.setFeatureAbs( DC1394_FEATURE_TRIGGER_DELAY, 0.);
                auto err = dc1394_feature_set_power(c,DC1394_FEATURE_TRIGGER,DC1394_ON);
                
                DC1394_ERR_RTN(err, "Could not set trigger on.");
                err = dc1394_feature_set_power(c,DC1394_FEATURE_TRIGGER_DELAY,DC1394_OFF);
                DC1394_ERR_RTN(err, "Could not set trigger delay off.");
                err=dc1394_external_trigger_set_mode(c, softwareTrigger ? DC1394_TRIGGER_MODE_0 : DC1394_TRIGGER_MODE_3);
                DC1394_ERR_RTN(err, "Could not set trigger mode.");
                if ( softwareTrigger ){
                    err=dc1394_external_trigger_set_source(c, DC1394_TRIGGER_SOURCE_SOFTWARE);
                    DC1394_ERR_RTN(err, "Could not set trigger source.");
                } else {
                    err=dc1394_external_trigger_set_source(c, DC1394_TRIGGER_SOURCE_0);
                    DC1394_ERR_RTN(err, "Could not set trigger source.");
                }
            }
            
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
    void BlackFlyCamera::sendSoftwareTrigger( dc1394camera_t* c ){
        auto err = dc1394_software_trigger_set_power(c,DC1394_ON);
        auto power = DC1394_OFF;
        while( power == DC1394_OFF){
            err = dc1394_software_trigger_get_power(c, &power);
        }
        err = dc1394_software_trigger_set_power(c, DC1394_OFF);
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
        
        // aspect ratio/cropping stuff
        
        float aspect = 1;
        if ( aspect_x.get() != 0 && aspect_y.get() != 0 ){
            aspect = (float) aspect_x.get() / aspect_y.get();
        }
        float tw = ((float) this->height) * aspect;
        float th = this->height;
        float cx = (float) this->width/2.0 - tw/2.0;
        float cy = (float) this->height/2.0 - th/2.0;
        
        if ( gpuBayer == 2){
            if (imageColor.get() && buffer.getImageType() != OF_IMAGE_COLOR ){
                buffer.allocate(width, height, OF_IMAGE_COLOR);
                buffer.getPixels().setColor(ofColor::black);
                camera.setBayerMode(DC1394_COLOR_FILTER_RGGB, DC1394_BAYER_METHOD_NEAREST);
                camera.setImageType(OF_IMAGE_COLOR);
            } else if ( !imageColor.get() && buffer.getImageType() != OF_IMAGE_GRAYSCALE ){
                buffer.allocate(width, height, OF_IMAGE_GRAYSCALE);
                buffer.getPixels().setColor(ofColor::black);
                camera.setImageType(OF_IMAGE_GRAYSCALE);
                camera.disableBayer();
                buffer.update();
            }
            
            auto v = camera.grabVideo(buffer);
            if ( v ){
                if ( aspect != 1.0&&
                    (!ofIsFloatEqual(buffer.getWidth(), tw) ||
                     !ofIsFloatEqual(buffer.getHeight(), th)) )
                {
                    cropped.clone(buffer);
                    cropped.crop(cx, cy, tw, th);
                    if ( mirror.get() ) cropped.mirror(false, true);
                    cropped.update();
                } else {
                    if ( mirror.get() ) buffer.mirror(false, true);
                    buffer.update();
                }
            }
        } else {
            if (buffer.getImageType() != OF_IMAGE_GRAYSCALE ){
                buffer.allocate(width, height, OF_IMAGE_GRAYSCALE);
                camera.setImageType(OF_IMAGE_GRAYSCALE);
            }
            
            bool remaining;
            int i = 0;
            
            auto * c = camera.getLibdcCamera();
            dc1394video_mode_t vm = (dc1394video_mode_t) ((int) DC1394_VIDEO_MODE_FORMAT7_0 + fmt7Mode);
            auto capturePolicy = DC1394_CAPTURE_POLICY_POLL; //non-blocking
            
            if ( imageColor.get() ){
                dc1394_format7_set_color_coding(c, vm, DC1394_COLOR_CODING_RAW8);
            } else {
                dc1394_format7_set_color_coding(c, vm, DC1394_COLOR_CODING_MONO8);
            }
            
            if ( isFirstFrame && softwareTrigger ){
                sendSoftwareTrigger( c );
            }
            
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
                    
                    memcpy(dst, src, width * height);
                    
                    if ( softwareTrigger ){
                        sendSoftwareTrigger( c );
                    }
                    
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
                    if (!cvBuffer.isAllocated())
                    {
                        cvBuffer.allocate(this->width, this->height, OF_IMAGE_COLOR);
                    }
                    ofxCv::convertColor(buffer,cvBuffer, CV_BayerRG2BGR);
                    
                    // either update crop or buffer
                    if ( aspect != 1.0 &&
                        (!ofIsFloatEqual(cvBuffer.getWidth(), tw) ||
                         !ofIsFloatEqual(cvBuffer.getHeight(), th))
                        )
                    {
                        
                        cropped.clone(cvBuffer);
                        cropped.crop(cx, cy, tw, th);
                        if ( mirror.get() ) cropped.mirror(false, true);
                        cropped.update();
                    } else {
                        if ( mirror.get() ) cvBuffer.mirror(false, true);
                        cvBuffer.update();
                    }
                } else {
                    if ( aspect != 1.0&&
                        (!ofIsFloatEqual(buffer.getWidth(), tw) ||
                         !ofIsFloatEqual(buffer.getHeight(), th)) )
                    {
                        cropped.clone(buffer);
                        cropped.crop(cx, cy, tw, th);
                        if ( mirror.get() ) cropped.mirror(false, true);
                        cropped.update();
                    } else {
                        if ( mirror.get() ) buffer.mirror(false, true);
                        buffer.update();
                    }
                }
            }
        }
        
        if ( isFirstFrame ){
            auto sh = getEmbeddedInfo(buffer.getPixels().getData(), ofxLibdc::PTGREY_EMBED_SHUTTER);
            auto em = getEmbeddedInfo(buffer.getPixels().getData(), ofxLibdc::PTGREY_EMBED_GAIN);
            auto br = getEmbeddedInfo(buffer.getPixels().getData(), ofxLibdc::PTGREY_EMBED_BRIGHTNESS);
            auto ex = getEmbeddedInfo(buffer.getPixels().getData(), ofxLibdc::PTGREY_EMBED_EXPOSURE);
            auto wb = getEmbeddedInfo(buffer.getPixels().getData(), ofxLibdc::PTGREY_EMBED_WHITE_BALANCE);
            auto sp = getEmbeddedInfo(buffer.getPixels().getData(), ofxLibdc::PTGREY_EMBED_STROBE_PATTERN);
            
//            cout <<"SHUTTER "<<sh<<endl;
//            cout <<"GAIN "<<em<<endl;
//            cout <<"BRIGHTNESS "<<br<<endl;
//            cout <<"EXPOSURE "<<ex<<endl;
//            cout <<"WHITE_BALANCE "<<wb<<endl;
//            cout <<"STROBE "<<sp<<endl;
        }
        
        isFirstFrame = false;
    }

    //--------------------------------------------------------------
    void BlackFlyCamera::draw( float x, float y, float w, float h){
        src->begin();
        ofClear(0);
        if ( gpuBayer.get() == 0 ){
            bayerShader.begin();
            bayerShader.setUniformTexture("source", buffer.getTexture(), 1);
            bayerShader.setUniform4f("sourceSize", buffer.getWidth(), buffer.getHeight(), 1./buffer.getWidth(), 1./buffer.getHeight());
            bayerShader.setUniform2f("firstRed", 0, 0);
            
//            ofPlanePrimitive plane(w,h,2,2);
//            plane.mapTexCoordsFromTexture(buffer.getTexture());
//            plane.draw();
            
            getImage().draw(0,0);
        } else {
            getImage().draw(0,0);
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
    bool BlackFlyCamera::isAllocated(){
        return getImage().isAllocated();
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::close(){
        //todo: camera close?
        
        this->brightness.removeListener(this, &BlackFlyCamera::onBrightnessUpdated);
        this->gamma.removeListener(this, &BlackFlyCamera::onGammaUpdated);
        this->gain.removeListener(this, &BlackFlyCamera::onGainUpdated);
        this->exposure.removeListener(this, &BlackFlyCamera::onExposureUpdated);
        this->shutter.removeListener(this, &BlackFlyCamera::onShutterUpdated);
//        this->roi.removeListener(this, &BlackFlyCamera::onRoiUpdated);
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
        
        float aspect = 1;
        float inv_aspect = 1;
        if ( aspect_x.get() != 0 && aspect_y.get() != 0 ){
            aspect = (float) aspect_x.get() / aspect_y.get();
        }
        
        if ( aspect != 1.0)
        {
            return cropped;
        }
        
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
            
//            minValue |= 0x82000000;
//            cout << minValue << endl;
//            dc1394_set_control_register(c, PTGREY_SHUTTER, minValue);
        }
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::onRoiUpdated( ofVec4f & v ){
        if (isSetup()){
        }
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::setMaxFramerate(){
        if (isSetup()){
            auto * c = camera.getLibdcCamera();
            // set maximum framerate
            unsigned int framerateInq;
            dc1394_get_control_register(c, PTGREY_FRAME_RATE_INQ, &framerateInq);
            unsigned int minValue = readBits(framerateInq, 24, 12);
            minValue |= 0x82000000;
            dc1394_set_control_register(c, PTGREY_FRAME_RATE, minValue);
        }
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::clearEmbeddedInfo() {
        if(isSetup()) {
            auto * c = camera.getLibdcCamera();
            dc1394_set_control_register(c, PTGREY_FRAME_INFO, 0x80000000);
        }
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::setEmbeddedInfo(int embeddedInfo, bool enable) {
        if(isSetup()) {
            auto * c = camera.getLibdcCamera();
            unsigned int reg;
            dc1394_get_control_register(c, PTGREY_FRAME_INFO, &reg);
            if(enable)
                reg |= 1 << embeddedInfo;
            else
                reg &= ~(1 << embeddedInfo);
            dc1394_set_control_register(c, PTGREY_FRAME_INFO, reg);
        }
    }
    
    //--------------------------------------------------------------
    unsigned int BlackFlyCamera::getEmbeddedInfoOffset(int embeddedInfo) {
        if(isSetup() ) {
            auto * c = camera.getLibdcCamera();
            unsigned int reg;
            dc1394_get_control_register(c, PTGREY_FRAME_INFO, &reg);
            int total = 0;
            for(int i = 0; i < embeddedInfo; i++)
                if(reg & (1 << i))
                    total++;
            return total;
        } else {
            return 0;
        }
    }
    
    //--------------------------------------------------------------
    unsigned int BlackFlyCamera::getEmbeddedInfo(unsigned char* pixels, int embeddedInfo) {
        if(isSetup() ) {
            unsigned int offset = getEmbeddedInfoOffset(embeddedInfo);
            return ((unsigned int*) pixels)[offset];
        } else {
            return 0;
        }
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::getShutterValue(){
        if(isSetup() ) {
            auto * c = camera.getLibdcCamera();
            // set shutter
            unsigned int shutterInq;
            dc1394_get_control_register(c, PTGREY_SHUTTER_INQ, &shutterInq);
            unsigned int isAbs    = readBits(shutterInq, 1, 1);
            unsigned int minValue = readBits(shutterInq, 8, 12);
            unsigned int maxValue = readBits(shutterInq, 20, 12);
            cout << isAbs << endl;
            cout << minValue << endl;
            cout << maxValue << endl;
        }
    }
    
    //--------------------------------------------------------------
    void BlackFlyCamera::getTriggerMode(){
        if(isSetup() ) {
            auto * c = camera.getLibdcCamera();
            
            unsigned int triggerInq;
            dc1394_get_control_register(c, PTGREY_TRIGGER_INQ, &triggerInq);
            
            unsigned int isSource0  = readBits(triggerInq, 8, 1);
            unsigned int isSource1  = readBits(triggerInq, 9, 1);
            unsigned int isSource2  = readBits(triggerInq, 10, 1);
            unsigned int isSource3  = readBits(triggerInq, 11, 1);
            unsigned int isSoftware  = readBits(triggerInq, 15, 1);
            
            unsigned int isMode0  = readBits(triggerInq, 16, 1);
            unsigned int isMode1  = readBits(triggerInq, 17, 1);
            unsigned int isMode2  = readBits(triggerInq, 18, 1);
            unsigned int isMode3  = readBits(triggerInq, 19, 1);
            unsigned int isMode4  = readBits(triggerInq, 20, 1);
            unsigned int isMode5  = readBits(triggerInq, 21, 1);
            unsigned int isMode14  = readBits(triggerInq, 30, 1);
            unsigned int isMode15  = readBits(triggerInq, 31, 1);
            
            cout << isSource0 << endl;
            cout << isSource1 << endl;
            cout << isSource2 << endl;
            cout << isSource3 << endl;
            cout << isSoftware << endl;
            
            cout << isMode0 << endl;
            cout << isMode1 << endl;
            cout << isMode2 << endl;
            cout << isMode3 << endl;
            cout << isMode4 << endl;
            cout << isMode5 << endl;
            cout << isMode14 << endl;
            cout << isMode15 << endl;
            cout <<"-------"<<endl;
        }
    }
    
}