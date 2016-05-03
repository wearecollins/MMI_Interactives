# MMI - The Jim Henson Exhibition

This repo contains digital portions of a Jim Henson exhibit for the [Museum of the Moving Image](http://www.movingimage.us/) 

There are two touchpoints in this repo. They both share a lot of backend infrastructure.

## Performance

A touchpoint where people are given the chance to control a muppet along to an audiotrack. The performance is recorded and the user can retrieve it later from the sharing station.

## Anything Muppet

A touchpoint where visitors can create a unique muppet to match a given script. A muppet "blank" is provided with drawers full of eyes, hair, noses, etc. The user can take a picture of their creation and retrieve it later from the sharing station.

## Sharing Station

An interface for people to find their picture or video and send it to themselves via e-mail.

# Setup

## Production

There are 4 computers involved with this whole installation:

* Central Server
  - serves files to the internet from a _Public Media Directory_
  - hosts the webserver for the Sharing iPad interface
  - runs webservices for sending e-mails and posting to MotMI%39s social network pages
* Anything Muppet Computer
  - the computer that the Anything Muppet touchpoint runs on including
    * interfacing with industrial camera
    * hosting webserver for graphic interface
    * interfacing with Arduino
    * syncing pictures to Central Server
* Performance Computer
  - the computer that the Performance touchpoint runs on including
    * interfacing with two industrial cameras
    * hosting webserver for graphic interface
    * syncing videos to Central Server
* Sharing iPad
  - displays Sharing graphic interface from Central Server

Follow these steps for setting up everything:

0. Bootstrap the Anything Muppet and Performance computers
  - TODO
1. Setup the [Sharing](Sharing/) webservice on the Central Server
2. Setup the [Share Webserver](Webserver/README.md#share) on the Central Server
  - including setting up the iPad to be pinned to the Share UI
3. Setup the [Performance Frontend](Frontend/Readme.md#performance) on the Performance computer
4. Setup the [Anything Muppet Frontend](Frontend/Readme.md#anything-muppet) on the Anything Muppet computer
5. Setup the [Sync](Sync/) service on both the Performance and Anything Muppet computers

## Development

These instructions assume you are testing everything on one computer. It should be relatively straight-forward to adapt to a multiple-computer setup.

There are usually 7 processes which should be run:

* A simple webserver to serve media files for sharing. 
* [ngrok](https://ngrok.com/) to make your simple server accessible via the internet
* A [Sync](Sync/) service to sync Anything Muppet images to your _media/_ directory
* A [Sync](Sync/) service to sync Performance videos to your _media/_ directory
* A [Webserver](Webserver/) instance to host whichever frontend you are testing
* The [Camera](Camera/) app for interfacing with cameras
* The [Sharing](Sharing/) webservice to enable posting to social media

Follow these steps for setting up everything:

1. create a _media/_ directory to serve media files for sharing.
  - This directory should have two subdirectories: _performance/_ and _anythingmuppets/_
  - I set up my _media/_ directory parallel to the cloned repository.
2. set up a server to serve files from your _media/_ directory.
  - I set up the server to use port 8014. Suggestions include:
    * python%39s (SimpleHTTPServer)[https://docs.python.org/2/library/simplehttpserver.html] `python -m SimpleHTTPServer 8014`
    * Node$39s (http-server)[https://www.npmjs.com/package/http-server] `http-server -p 8014`
3. [Setup ngrok](#setup-ngrok) if you have not done this before
4. run ngrok to make your simple server accessible from the internet
  - `PATH/TO/ngrok http 8014`
  - If you want to upload to Facebook or Tumblr, your ngrok URL will need to be registered with your Facebook/Tumblr app.
5. [Configure your Sync services](Sync/README.md#configure)
6. run sync services
  1. `node loop.js anythingmuppet.json`
  2. `node loop.js performance.json`
7. [Configure your Webserver](Webserver/README.md#configure)
8. run the webserver
  - `npm start -- --station [STATION]` where _[STATION]_ is one of `performance`, `anythingmuppets`, or `share`
9. [Configure the Camera App](Camera/Readme.md#configure)
10. Compile the Camera App
11. run the Camera app
  - `make run` or run from within your IDE


# Overview
### Structure & Technical breakdown
* Webserver
	* Each exhibit is hosted by a general [webserver](Webserver/)
	* Individual exhibit files (e.g. ["performance"](Webserver/static/performance/)) live inside this general server
* Camera
	* LINK TO BELOW

## Setting Up
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

## Shared resources
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


## Interactive Exhibits

### Puppetry for the Screen
* _Brief_:
* _App components_:
	* Frontend: 

### Design an Anything Muppet
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

### Share Your Creation
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

### Prototypes
* Prototypes for this and other exhibits are hosted [here](https://github.com/wearecollins/MMI-Prototypes.git)
