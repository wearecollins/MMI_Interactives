#pragma once

#include "ofMain.h"
#include "CameraManager.h"
#include "ImageStreamer.h"
#include "RecordManager.h"

enum Mode {
    MODE_GENERAL = 0,
    MODE_CAMERAS,
    MODE_NONE
};

class ofApp : public ofBaseApp{

	public:
		void setup();
		void update();
		void draw();

		void keyPressed(int key);
		void keyReleased(int key);
		void mouseMoved(int x, int y );
		void mouseDragged(int x, int y, int button);
		void mousePressed(int x, int y, int button);
		void mouseReleased(int x, int y, int button);
		void mouseEntered(int x, int y);
		void mouseExited(int x, int y);
		void windowResized(int w, int h);
		void dragEvent(ofDragInfo dragInfo);
		void gotMessage(ofMessage msg);
		
        Mode currentMode;
        ofxPanel gui;
        ofParameter<int> cameraTop;
    
        mmi::CameraManager cameraMgr;
        mmi::RecordManager recordMgr;
        vector<mmi::ImageStreamer *> streamers;
};
