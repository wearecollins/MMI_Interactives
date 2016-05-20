
#Development

1. [Overview](#overview)
2. [Setting up](#setting-up)
  0. [Setup codebase](#Setup-codebase)
  1. [Setup scripts](#Setup-scripts)
3. [Running](#running)
4. [Contributing](#contributing)

* * *

##Overview

These instructions assume you are testing everything on one computer. It should be relatively straight-forward to adapt to a multiple-computer setup.

There are usually 7 processes which should be run:

1. A simple webserver to serve media files for sharing
2. A service to setup a publicly-accessible web address 
  - If your development machine has a publicly-accessible web address already, ignore this
  - We use [ngrok](https://ngrok.com/) to make our dev machine(s) accessible via the internet (see setup guide below)
3. A [Sync](Sync/) service to sync Anything Muppet images to your _media/_ directory
4. A [Sync](Sync/) service to sync Performance videos to your _media/_ directory
5. A [Webserver](Webserver/) instance to host whichever frontend you are testing
6. The [Frontend](Frontend/) app for interfacing with cameras and displaying the Performance or Anything Muppet frontend
  - Or [Camera](Camera/) app and separate web browser directed at [http://localhost:8080/?stream=true]() if not on OSX
7. The [Sharing](Sharing/) webservice to enable posting to social media

* * *

##Setting Up

Firstly, clone this repository. We recommend cloning into ~Documents.
- You must have [git](https://git-scm.com/) installed to do the following
- You also need to setup and download Xcode (Mac OS X App Store) to setup/develop some code.

### Setup codebase
1. Download and install FFMPEG
	* Easiest is via homebrew
	* Open Terminal, and run the following two lines:
	```
	$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
	$ brew install ffmpeg
	```
2. Download [openFrameworks 0.9.3](http://openframeworks.cc/versions/v0.9.3/of_v0.9.3_osx_release.zip)
3. Unzip openFrameworks and place in your Documents folder
4. Clone this repository into openFrameworks/apps (including all submodules)
```
	$ cd ~/Documents/openFrameworks/apps
	$ git clone --recursive https://github.com/wearecollins/MMI_Interactives.git
```
5. Build in Xcode
 * Open [Frontend/Frontend.xcodeproj]
 * Build the Anthing Muppets and Performance interactives by selecting Product/Build (or pressing command + b)

### Setup individual scripts
Follow these steps for setting up everything:

1. Create a _media/_ directory to serve media files for sharing.
  - This directory should have two subdirectories: _performance/_ and _anythingmuppets/_
  - I set up my _media/_ directory parallel to the cloned repository.
2. Set up a server to serve files from your _media/_ directory.
  - I set up the server to use port 8012. Suggestions include:
    * python&apos;s [SimpleHTTPServer](https://docs.python.org/2/library/simplehttpserver.html) 
    `python -m SimpleHTTPServer 8012`
    * Node&apos;s [http-server](https://www.npmjs.com/package/http-server)
    * `http-server -p 8014`
3. Ensure your _media/_ server is accessible from the internet
    * if your computer or network configuration makes this impossible, I suggest using [ngrok](#using-ngrok) to tunnel internet traffic to the media server you have running.
        - `./ngrok http 8012`
4. [Setup and configure your Sync services](Sync/README.md#configure)
5. [Setup and configure your Webserver](Webserver/README.md#configure)
6. If testing the Performance or Anything Muppet stations, configure/compile/run the [Frontend app](Frontend/)
  - or [Camera app](Camera/) if you are not on OSX

### using [ngrok](https://ngrok.com/)

ngrok is used for accessing local servers from the internet. 

An altertative to using ngrok would be to use a domain you own, 
and host the server at that address.

After downloading and unzipping ngrok, you can run in using 
`./ngrok http [PORT]` where _[PORT]_ is the port number you want to forward 
requests to. If you are running a server on your computer attached to port 
8080, then you would run `./ngrok http 8080`. Once ngrok is running it will 
display (among other things) the _Forwarding_ address that can be used to 
access your server from the internet. This address will be referred to in the 
rest of the documentation as your **Public URL** ([Screenshot](ngrok.png)).

Every time you run ngrok it will provide you with a new randomized 
**Public URL**.

### Prototypes
* Additional prototypes for this and other exhibits are hosted [here](https://github.com/wearecollins/MMI-Prototypes.git)

* * *

## Running

0. This assumes you have a _media_ directory setup as above (steps 1-3)
1. Run sync services
  1. `node loop.js anythingmuppet.json`
  2. `node loop.js performance.json`
2. Run the webserver
  - `npm start -- --station [STATION]` where _[STATION]_ is one of `performance`, `anythingmuppets`, or `share`
3. If testing the Performance or Anything Muppet stations, run the corresponding app in [Frontend/bin]
  - You may run the corresponding [Startup](Startup/) script (e.g. startup_am.command) in lieu of steps 2 and 3.

* * *

## Contributing

In general, we try to make all edits in the 'develop' branch.
1. In terminal, change to this directory and switch to the develop branch
```
$ cd ~/Documents/openFrameworks/apps/MMI_Interactives
$ git checkout develop
```
2. When your code is tested and ready to be moved into the 'master' branch, merge your changes in
```
$ cd ~/Documents/openFrameworks/apps/MMI_Interactives
$ git checkout master
$ git merge master
$ git push
```
3. If you are unfamiliar in general with Git, check out the [https://guides.github.com/](Github guides) for tutorials and information