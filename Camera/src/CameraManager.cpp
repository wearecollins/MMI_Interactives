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
        gui = new ofxPanel();
        gui->setup("Camera Settings", settingsFile + "_camera.xml");
        this->settingsFile.set("Settings file", settingsFile);
        this->lowRes.set("Lo-res/hi-res", bSmall);
        
        setupCameras();
    }
    
    //--------------------------------------------------------------
    void CameraManager::clearCameras(){
        
        for ( auto & c : cameras ){
            c.get()->close();
        }
        gui->clear();
        
        cameras.clear();
    }
    
    //--------------------------------------------------------------
    void CameraManager::discoverCameras(){
        ofLogNotice("Camera.CameraManager")<<"discovering cameras";
#ifndef DEBUG_CAMERA
        auto v = ofxLibdc::Camera::listDevices();
        ofLogNotice("Camera.CameraManager") <<
            "found " << v.size() << " devices";
        
        ofXml xml;
        xml.addChild("settings");
        xml.setTo("settings");{
            int idx = 0;
            for ( auto & c : v ){
                xml.addChild("camera");
                xml.setTo("camera["+ofToString(idx)+"]");
                xml.addValue("guid", c.guid);
                ofLogNotice("Camera.CameraManager") <<
                    "added device " << c.guid << " to xml";
                idx++;
                xml.setToParent();
            }
        } xml.setToParent();
        xml.save(settingsFile.get() + ".xml");
#endif
        gui->loadFromFile(settingsFile.get() + "_camera.xml");
    }
    
    //--------------------------------------------------------------
    void CameraManager::setupCameras(){
        clearCameras();
        
        gui->add(drawMode.set("Mode", (int) MODE_FILL_MAX, (int) MODE_FILL_MAX, (int) MODE_ACTUAL));
        
        ofXml settings;
        bool loadedCams = false;
        ofLogNotice("Camera.CameraManager") <<
            "loading settings file " << settingsFile.get();
        if (settings.load(settingsFile.get() + ".xml" ) ){
            
            settings.setTo("settings");
            auto n = settings.getNumChildren();
            for ( auto i =0; i<n; i++ ){
                settings.setToChild(i);
                
                shared_ptr<Camera> camera = make_shared<Camera>();
                string guid = settings.getValue("guid");
                ofLogNotice("Camera.CameraManager")<<"Setting up camera "<<guid;
                
                // attempt to load default settings, if they exist
                camera->setDefaultSettings( settingsFile.get() );
                
                auto bOpen = camera->setup(guid, this->lowRes.get()
                                                 ? 1040
                                                 : 2080 );
                if ( bOpen ){
                    gui->add(camera->params);
                    cameras.push_back(std::move( camera ) );
                }
                settings.setToParent();
                loadedCams = true;
                
            }
            settings.setToParent();
            
        }
        
        if (!loadedCams) {
            ofLogError("Camera.CameraManager") <<
                "No (or empty) settings file loaded. Trying to open 1 camera";
            shared_ptr<Camera> camera = make_shared<Camera>();
            
            auto bOpen = camera->setup();
            if ( bOpen ){
                cameras.push_back(std::move( camera ) );
                gui->add(camera->params);
            }
            
            saveSettings();
        }
        
        gui->loadFromFile(settingsFile.get() + "_camera.xml");
        ofLogVerbose("Camera.CameraManager") <<
            "loading settings " << settingsFile.get() << "_camera.xml";
    }
    
    //--------------------------------------------------------------
    void CameraManager::draw(int x, int y, int which ){
        if ( which >= cameras.size() ){
            return;
        }
        auto & c = cameras[which];
        
        float w = c->getWidth();
        float h = c->getHeight();
        
        switch ((DrawMode) drawMode.get()) {
            case MODE_FILL_MAX:
            {
                float scale = (float) ofGetWidth()/c->getWidth();
                
                w *= scale;
                h *= scale;
            }
                break;
                
            case MODE_FILL_MIN:
            {
                float scale = (float) ofGetHeight()/c->getHeight();
                
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
        
        for ( auto & c : cameras ){
            c->drawDebug(x, y, c->getWidth(), c->getHeight());
            x += c->getImage().getWidth();
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
            for ( auto & c : cameras ){
                xml.addChild("camera");
                xml.setTo("camera["+ofToString(idx)+"]");
#ifndef DEBUG_CAMERA
                xml.addValue("guid", c->getGuid());
#endif
                idx++;
                xml.setToParent();
            }
        } xml.setToParent();
        xml.save(settingsFile.get() + ".xml");
    }
    
    void CameraManager::closeCameras(){
#ifndef DEBUG_CAMERA
        for ( auto & c : cameras ){
            c->closeCamera = true;
        }
#endif
    }
    
    void CameraManager::openCameras(){
#ifndef DEBUG_CAMERA
        for ( auto & c : cameras ){
            c->closeCamera = false;
        }
#endif
    }
    
    //--------------------------------------------------------------
    shared_ptr<Camera> CameraManager::getCamera( int which ){
        if ( getNumCameras() > which ){
            return cameras[ which ];
        } else {
//            ofLogError()<<"[CameraManager] Asking for camera "<<which<<" which does not exist";
            return nullptr;
        }
    }
    
    //--------------------------------------------------------------
    int CameraManager::getNumCameras(){
        return cameras.size();
    }
    
    //--------------------------------------------------------------
    vector<shared_ptr<Camera> > & CameraManager::getCameras(){
        return cameras;
    }
}
