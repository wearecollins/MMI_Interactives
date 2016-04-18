//
//  CameraManager.cpp
//  CameraTest
//
//  Created by Brett Renfer on 3/21/16.
//

#include "CameraManager.h"

namespace mmi {
    
    //--------------------------------------------------------------
    void CameraManager::setup( bool bSmall, string settingsFile ){
        this->settingsFile.set("Settings file", settingsFile);
        gui = new ofxPanel();
        gui->setup();
        
        gui->add(drawMode.set("Mode", (int) MODE_FILL_MAX, (int) MODE_FILL_MAX, (int) MODE_ACTUAL));
        
        ofXml settings;
        if (settings.load(settingsFile)){
            
            settings.setTo("settings");
            auto n = settings.getNumChildren();
            for ( auto i =0; i<n; i++ ){
                settings.setToChild(i);
                
                Camera * camera = new Camera();
                string guid = settings.getValue("guid");
                ofLogVerbose()<<"[CameraManager] Setting up camera "<<guid;
#ifndef DEBUG_CAMERA
                auto bOpen = camera->setup(guid, bSmall ? 1040 : 2080 );
                if ( bOpen ){
                    cameras.push_back(camera);
                    gui->add(camera->params);
                }
#else
                camera->setDeviceID(2); // just for brett's machine
                auto bOpen = camera->setup(640, 480);
                if ( bOpen ){
                    cameras.push_back(camera);
                }
#endif
                settings.setToParent();
                
            }
            settings.setToParent();
            
        } else {
            ofLogError()<<"[CameraManager] No settings file loaded. Trying to open 1 camera";
            Camera * camera = new Camera();
#ifndef DEBUG_CAMERA
            auto bOpen = camera->setup();
            if ( bOpen ){
                cameras.push_back(camera);
                gui->add(camera->params);
            }
#else
            auto bOpen = camera->setup(640,480);
            if ( bOpen ){
                cameras.push_back(camera);
            }
#endif
            
            saveSettings();
        }
        
        gui->loadFromFile("settings.xml");
    }
    
    //--------------------------------------------------------------
    void CameraManager::draw(int x, int y, int which ){
        if ( which >= cameras.size() ){
            return;
        }
        auto * c = cameras[which];
        
        float w = c->getWidth();
        float h = c->getHeight();
        
        switch ((DrawMode) drawMode.get()) {
            case MODE_FILL_MAX:
            {
                float scale = MAX((float) ofGetWidth()/c->getWidth(), (float) ofGetHeight()/c->getHeight());
                
                if ( scale < 1 ){
                    scale = MAX(c->getWidth() / (float) ofGetWidth(), c->getHeight() /(float)  ofGetHeight());
                }
                
                w *= scale;
                h *= scale;
            }
                break;
                
            case MODE_FILL_MIN:
            {
                float scale = MIN(ofGetWidth()/c->getWidth(), ofGetHeight()/c->getHeight());
                
                if ( scale > 1 ){
                    scale = MIN(c->getWidth() / ofGetWidth(), c->getHeight() / ofGetHeight());
                }
                
                w *= scale;
                h *= scale;
            }
                break;
            case MODE_ACTUAL:
                break;
        }
        c->draw(x, y, w, h);
    }
    
    //--------------------------------------------------------------
    void CameraManager::drawDebug( int x, int y ){
        ofPushStyle();
        ofSetColor(255);
        ofPushMatrix();
        ofScale(.5, .5);
        
        for ( auto * c : cameras ){
#ifndef DEBUG_CAMERA
            c->drawDebug(x, y, c->getWidth(), c->getHeight());
            x += c->getImage().getWidth();
#else
            c->draw(x, y, c->getWidth(), c->getHeight());
            x += c->getWidth();
#endif
        }
        ofPopMatrix();
        ofPopStyle();
    }
    
    //--------------------------------------------------------------
    void CameraManager::drawGui(){
        gui->draw();
    }
    
    //--------------------------------------------------------------
    void CameraManager::saveSettings(){
        ofXml xml;
        xml.addChild("settings");
        xml.setTo("settings");{
            int idx = 0;
            for ( auto * c : cameras ){
                xml.addChild("camera");
                xml.setTo("camera["+ofToString(idx)+"]");
#ifndef DEBUG_CAMERA
                xml.addValue("guid", c->getGuid());
#endif
                idx++;
                xml.setToParent();
            }
        } xml.setToParent();
        xml.save(settingsFile.get());
    }
    
    //--------------------------------------------------------------
    Camera * CameraManager::getCamera( int which ){
        if ( getNumCameras() > which ){
            return cameras[ which ];
        } else {
            ofLogError()<<"[CameraManager] Asking for camera "<<which<<" which does not exist";
            return nullptr;
        }
    }
    
    //--------------------------------------------------------------
    int CameraManager::getNumCameras(){
        return cameras.size();
    }
    
    //--------------------------------------------------------------
    vector<Camera *> & CameraManager::getCameras(){
        return cameras;
    }
}
