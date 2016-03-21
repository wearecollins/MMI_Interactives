#MMI - The Jim Henson Exhibition
##Interactive Exhibits

###Puppetry for the Screen
* _Brief_:
* _App structure_:
	* Puppetry/
		* app.js
		* package.json
		* static
			* js
			* css
			* img
			* index.html
		* Readme.md

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

###Shared resources
* _Brief_: Pieces all of the apps talk to, e.g. server that accepts and manages files from each application
* _Apps_
	* Share_Server/
		* ???
		* videos/
		* images/
		* Readme.md

	* Camera/
		* _Brief_: Separate test app for testing/working with cameras. Also includes ability to stream compressed Camera image via WebSockets. Saves out settings to camera.xml.
		* *project files (Camera.xcodeproj, etc)*
		* addons/
			* ofxCocoaGLView/ (git submodule)
			* ofxLibdc/ (git submodule)
			* ofxTurboJpeg/
			* websocketpp/
		* data/
		* src/

	* Utilities/
		* Readme.md
		* ???

	* Documentation/
		* Readme.md

###Prototypes
* Prototypes for this and other exhibits are hosted [here](https://github.com/wearecollins/MMI-Prototypes.git)