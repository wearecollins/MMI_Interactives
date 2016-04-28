//
//  DebugCamera.h
//  Camera
//
//  Created by Brett Renfer on 4/27/16.
//
//

#pragma once

#ifdef USE_PS3
#include "ofPS3Eye.h"
#endif

namespace mmi {
    class BaseCamera {
    public:
        
        BaseCamera(){
            
        }
        
        ~BaseCamera(){
            
        }
        
        virtual bool setup( string guid = "", int width = 2080, int height = 1552 ){
            this->guid = guid;
            return false;
        }
        
        virtual void update(){}
        
        virtual void draw( float x, float y, float w = -1, float h=-1){
            
        }
        virtual void drawDebug( int x, int y, float w, float h ){}
        virtual void close(){}
        
        bool isSetup() const{
            return bSetup;
        }
        
        virtual bool isAllocated(){
            return false;
        }
        
//        template<class T>
//        virtual T & getImage(){
//            return buffer;
//        }
        
        virtual int getWidth(){
            return 0;
        }
        virtual int getHeight(){
            return 0;
        }
        
        ofParameterGroup params;
        
        const string getGuid(){
            return guid;
        }
        
        void reloadShader(){};
        
    protected:
        ofImage buffer;
        string guid;
        bool bSetup;
    };
    
#ifdef USE_PS3
    
    //PS3 Eye
    class WebCamera : public BaseCamera {
    public:
        bool setup( string guid = "", int width = 2080, int height = 1552 ){
            this->guid = guid;
            
            static int ps3N = 0;
            
            camera.setDimensions(640,480);
            camera.setup(ps3N);
            ps3N++;
            
            bSetup = true;
            params.add(camera.params);
            return bSetup;
        }
        
        void update(){
            camera.update();
        }
        
        void draw( float x, float y, float w = -1, float h=-1){
            w = w == -1 ? camera.getWidth() : w;
            h = h == -1 ? camera.getHeight() : h;
            camera.draw(x,y,w,h);
        }
        
        void drawDebug( int x, int y, float w, float h ){
            draw(x,y,w,h);
        }
        
        void close(){
            camera.close();
        }
        
        bool isAllocated(){
            return false;
        }
        
        ofPS3Eye & getImage(){
            return camera;
        }
        
        ofPixels & getPixels(){
            return camera.getPixels();
        }
        
        int getWidth(){
            return camera.getWidth();
        }
        int getHeight(){
            return camera.getHeight();
        }
        
        bool isFrameNew(){
            return camera.isFrameNew();
        }
        
    protected:
        ofPS3Eye camera;
    };
    
#else
    //ofVideoGrabber
    class WebCamera : public BaseCamera {
    public:
        WebCamera(){
            uid = -1;
        }
        
        bool setup( string guid = "", int width = 2080, int height = 1552 ){
            this->guid = guid;
            this->uid  = ofToInt(guid);
            
            camera.setDeviceId(uid);
            bSetup = camera.setup(width,height);
            return bSetup;
        }
        
        void update(){
            camera.update();
        }
        
        void draw( float x, float y, float w = -1, float h=-1){
            w = w == -1 ? camera.getWidth() : w;
            h = h == -1 ? camera.getHeight() : h;
            camera.draw(x,y,w,h);
        }
        
        void drawDebug( int x, int y, float w, float h ){
            draw(x,y,w,h);
        }
        
        void close(){
            camera.close();
        }
        
        bool isAllocated(){
            return false;
        }
        
        ofVideoGrabber & getImage(){
            return camera;
        }
        
        ofPixels & getPixels(){
            return camera.getPixels();
        }
        
        int getWidth(){
            return camera.getWidth();
        }
        int getHeight(){
            return camera.getHeight();
        }
        
        bool isFrameNew(){
            return camera.isFrameNew();
        }
        
    protected:
        ofVideoGrabber camera;
        int uid;
    };
#endif
}
