1. [Introduction](#MMI---The-Jim-Henson-Exhibition)
  1. [Performance](#performance)
  2. [Anything Muppet](#anything-muppet)
  3. [Sharing Station](#sharing-station)
2. [Setup](#setup)
  1. [Production](#production)
  2. [Development](#development)
  3. [Using ngrok](#using-ngrok)

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
  - runs webservices for sending e-mails and posting to MotMI&apos;s social network pages
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
* Sharing Frontend (iPad/touchscreen)
  - displays Sharing graphic interface from Central Server

Follow these steps for setting up everything:

0. Bootstrap the Anything Muppet and Performance computers using the scripts in [bootstrapping](Startup/bootstrap/)
1. Setup the [Sharing](Sharing/) webservice on the Central Server
2. Setup the [Share Frontend Webserver](Webserver/README.md#share) on the Central Server
  - including setting up the iPad to be pinned to the Share UI
3. Setup the [Performance Frontend](Frontend/Readme.md#performance) on the Performance computer
4. Setup the [Anything Muppet Frontend](Frontend/Readme.md#anything-muppet) on the Anything Muppet computer
5. Setup the [Sync](Sync/) service on both the Performance and Anything Muppet computers

## Development

These instructions assume you are testing everything on one computer. It should be relatively straight-forward to adapt to a multiple-computer setup.

There are usually 7 processes which should be run:

* A simple webserver to serve media files for sharing
* [ngrok](https://ngrok.com/) to make your simple server accessible via the internet
  - Unless your development machine has a publicly-accessible web address already
* A [Sync](Sync/) service to sync Anything Muppet images to your _media/_ directory
* A [Sync](Sync/) service to sync Performance videos to your _media/_ directory
* A [Webserver](Webserver/) instance to host whichever frontend you are testing
* The [Frontend](Frontend/) app for interfacing with cameras and displaying the Performance or Anything Muppet frontend
  - Or [Camera](Camera/) app and separate web browser directed at [http://localhost:8080/?stream=true]() if not on OSX
* The [Sharing](Sharing/) webservice to enable posting to social media

Follow these steps for setting up everything:

1. create a _media/_ directory to serve media files for sharing.
  - This directory should have two subdirectories: _performance/_ and _anythingmuppets/_
  - I set up my _media/_ directory parallel to the cloned repository.
2. set up a server to serve files from your _media/_ directory.
  - I set up the server to use port 8014. Suggestions include:
    * python&apos;s (SimpleHTTPServer)[https://docs.python.org/2/library/simplehttpserver.html] `python -m SimpleHTTPServer 8014`
    * Node&apos;s (http-server)[https://www.npmjs.com/package/http-server] `http-server -p 8014`
3. Ensure your _media/_ server is accessible from the internet
    * if your computer or network configuration makes this impossible, I suggest using [ngrok](#using-ngrok) to tunnel internet traffic to the media server you have running.
        - `./ngrok http 8014`
5. [Configure your Sync services](Sync/README.md#configure)
6. run sync services
  1. `node loop.js anythingmuppet.json`
  2. `node loop.js performance.json`
7. [Configure your Webserver](Webserver/README.md#configure)
8. run the webserver
  - `npm start -- --station [STATION]` where _[STATION]_ is one of `performance`, `anythingmuppets`, or `share`
9. If testing the Performance or Anything Muppet stations, configure/compile/run the [Frontend app](Frontend/)
  - or [Camera app](Camera/) if you are not on OSX

## using [ngrok](https://ngrok.com/)

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
* Prototypes for this and other exhibits are hosted [here](https://github.com/wearecollins/MMI-Prototypes.git)
