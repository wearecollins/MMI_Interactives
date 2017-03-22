#Webserver 

A Node.js® server and frontend framework for making single-page,multi-state web apps. The framework is detailed in [STRUCTURE.md](STRUCTURE.md)

This server contains code for **all** installations, in the 'static' folder: Anything Muppets, Performance, and Sharing. 
It also contains examples for how to create new applications ('blank' and 'demo') and a suite of test scripts ('test' folder).

0. [Dependencies](#dependencies)
0. [Setup](#setup)
   - [Anything Muppets](#anythingmuppets)
   - [Performance](#performance)
   - [Share](#share)
0. [Running](#running)

# Dependencies
developed/tested/used with 

* Node.js
  - 6.10.0 (LTS)
  - 5.9.1 
  - 4.3.1
* npm 
  - 3.10.10
  - 3.7.3
* -nix OS
  - Ubuntu 14.04
  - OSX 10.11
  - OSX 10.12.3

# Setup

0. In terminal, `cd` to this directory. 
1. Run the oh-so-simple setup command:
  - `npm install`

## Anything Muppets
- All configurations in the Anything Muppets app can be set in the Admin interface
- Access the Admin interface by swiping from right-to-left across the top of the screen, or by pressing 'a' on a keyboard

## Performance
- All configurations in the Performance app can be set in the Admin interface
- Access the Admin interface by swiping from right-to-left across the top of the screen, or by pressing 'a' on a keyboard

## Share
- The Share server must be configured to list and show files on disk, and to communicate correctly with the [Sharing](https://github.com/wearecollins/MMI_Interactives/Sharing) service
- Open Webserver/static/share/config.json
  - Edit "diskPath": The _absolute path_ to the 'media' folder managed by the [Sync](https://github.com/wearecollins/MMI_Interactives/Sync) service
  - Edit "shareServer": The _URL_ to the [Sharing service](https://github.com/wearecollins/MMI_Interactives/Sharing)
  - TODO: document using "emailURL" with ngrok

# Running
The station this instance is hosting is passed in via a _--station_ parameter.

* `npm start -- --station [STATION]` where _[STATION]_ is one of `share`, `anythingmuppets`, or `performance`
  - yes, there is an extra `--` when running via _npm_
  - without npm: `node server.js --station [STATION]`
* open frontend
  - if using the [Frontend App](../Frontend/), just run that app and it will load the webpage.
  - otherwise, start up the [Camera App](../Camera/) and open your browser to [http://localhost:8080/?stream=true]()

