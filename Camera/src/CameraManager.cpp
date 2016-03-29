//
//  CameraManager.cpp
//  CameraTest
//
//  Created by Brett Renfer on 3/21/16.
//

#include "CameraManager.h"

namespace mmi {
    
    //--------------------------------------------------------------
    void CameraManager::setup( string settingsFile ){
        this->settingsFile.set("Settings file", settingsFile);
        gui = new ofxPanel();
        gui->setup();
        
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
                auto bOpen = camera->setup(guid);
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
    void CameraManager::draw(int x, int y ){
        // todo: should this have a target width? scale/resize?
        for ( auto * c : cameras ){
            c->draw(x, y);
#ifndef DEBUG_CAMERA
            x += c->getImage().getWidth();
#else
            x += c->getWidth();
#endif
        }
    }
    
    //--------------------------------------------------------------
    void CameraManager::drawDebug( int x, int y ){
        ofPushStyle();
        ofSetColor(255);
        
        for ( auto * c : cameras ){
#ifndef DEBUG_CAMERA
            c->drawDebug(x, y);
            x += c->getImage().getWidth();
#else
            c->draw(x, y);
            x += c->getWidth();
#endif
        }
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
