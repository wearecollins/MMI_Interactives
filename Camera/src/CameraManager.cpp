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
        gui.setup();
        
        ofXml settings;
        if (settings.load(settingsFile)){
            
            settings.setTo("settings");
            auto n = settings.getNumChildren();
            for ( auto i =0; i<n; i++ ){
                settings.setToChild(i);
                
                Camera * camera = new Camera();
                string guid = settings.getValue("guid");
                ofLogVerbose()<<"[CameraManager] Setting up camera "<<guid;
                auto bOpen = camera->setup(guid);
                if ( bOpen || true ){
                    cameras.push_back(camera);
                    gui.add(camera->params);
                }
                settings.setToParent();
                
            }
            settings.setToParent();
            
        } else {
            ofLogError()<<"[CameraManager] No settings file loaded. Trying to open 1 camera";
            Camera * camera = new Camera();
            auto bOpen = camera->setup();
            if ( bOpen ){
                cameras.push_back(camera);
            }
            
            saveSettings();
        }
        
        gui.loadFromFile("settings.xml");
    }
    
    //--------------------------------------------------------------
    void CameraManager::draw(int x, int y ){
        // todo: should this have a target width? scale/resize?
        for ( auto * c : cameras ){
            c->draw(x, y);
            x += c->getImage().getWidth();
        }
    }
    
    //--------------------------------------------------------------
    void CameraManager::drawDebug( int x, int y ){
        for ( auto * c : cameras ){
            c->drawDebug(x, y);
            x += c->getImage().getWidth();
        }
    }
    
    //--------------------------------------------------------------
    void CameraManager::drawGui(){
        gui.draw();
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
                xml.addValue("guid", c->getGuid());
                idx++;
                xml.setToParent();
            }
        } xml.setToParent();
        xml.save(settingsFile.get());
    }
    
    //--------------------------------------------------------------
    Camera * CameraManager::getCamera( int which ){
        if ( cameras.size() < which ){
            return cameras[ which ];
        } else {
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
