#MMI - The Jim Henson Exhibition
##Overview
###Structure & Technical breakdown
* Webserver
	* Each exhibit is hosted by a general webserver
	* Individual exhibit files (e.g. "performance") live inside this general server
* Camera
	* LINK TO BELOW
* _Exhibit_Name_
	* Files and folders inside this directory contain exhibit-specific assets, e.g. wireframes, design files, hardware notes and/or code
	* These *do not* contain the code for exhibit frontends, as these are included in the Webserver

##Setting Up
* Download [openFrameworks 0.9.3](http://openframeworks.cc/versions/v0.9.3/of_v0.9.3_osx_release.zip)
* Clone this folder into openFrameworks/app
	* 
	```
	$ cd openframeworks/apps
	$ git clone --recursive https://github.com/wearecollins/MMI_Interactives.git
	```
* Build Frontend app
	* LINK TO BELOW
* Move files into place
	* TBD
* Bootstrap machine
	* TBD @quinkennedy
	* Documentation/Bootstrap.md?
* Run
	* TBD @quinkennedy
	* Documentation/Run.md?

##Shared resources
* _Brief_: Pieces all of the apps talk to, e.g. server that accepts and manages files from each application
* _Apps_
	* Frontend
		* _Brief_: This OS-X application embeds a Cocoa WebView (i.e. a browser) into an openFrameworks application. This allows for communication with PointGrey cameras integrated into a tradition web frontend. This *does* assume you have a webserver running on a configurable URL.
		* See Frontend/Readme.md for mode details

	* Camera/
		* _Brief_: Separate test app for testing/working with cameras. Also includes ability to stream compressed Camera image via WebSockets. Saves out settings to camera.xml.
		* See Camera/Readme.md for mode details
			* TBD: move this stuff
			* *project files (Camera.xcodeproj, etc)*
			* addons/
				* ofxCv/ (git submodule)
				* ofxLibdc/ (git submodule)
				* ofxLibwebsockets/ (git submodule)
				* ofxTurboJpeg/  (git submodule)
			* data/
			* src/

	* Share_Server/
		* ???
		* videos/
		* images/
		* Readme.md

	* Utilities/
		* Readme.md
		* ???

	* Documentation/
		* Bootstrapping.md
		* Run.md
		* Readme.md


##Interactive Exhibits

###Puppetry for the Screen
* _Brief_:
* _App components_:
	* Frontend: 

###Design an Anything Muppet
* _Brief_:
* _App structure_:
	* Anything_Muppets/
		* app.js
		* package.json
		* static
			* js/
				* vendor/
			* css/
			* img/
			* index.html
			* templates/
		* Readme.md

###Share Your Creation
* _Brief_: A web-based interface, targeted for iPad, where visitors can view and share (via email) their creations
* _App structure_:
	* Share/
		* app.js
		* package.json
		* static
			* js/
				* vendor/
			* css
			* img
			* index.html
			* templates
		* Readme.md

###Prototypes
* Prototypes for this and other exhibits are hosted [here](https://github.com/wearecollins/MMI-Prototypes.git)