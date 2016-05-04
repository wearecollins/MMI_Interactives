A Node.js® server and frontend framework for making single-page, 
multi-state web apps.

0. [Dependencies](#dependencies)
0. [Setup](#setup)
0. [Running](#running)

# Dependencies
developed/tested/used with 

* Node.js
  - 5.9.1 
  - 4.3.1
* npm 
  - 3.7.3
* -nix OS
  - Ubuntu 14.04
  - OSX 10.11

# Setup

0. `npm install`

# Running
The station this instance is hosting is passed in via a _--station_ parameter.

* `npm start -- --station [STATION]` where _[STATION]_ is one of `share`, `anythingmuppets`, or `performance`
  - yes, there is an extra _--_ when running via _npm_
  - without npm: `node server.js --station [STATION]`
* open frontend
  - if using the [Frontend App](../Frontend/), just run that app and it will load the webpage.
  - otherwise, start up the [Camera App](../Camera/) and open your browser to [http://localhost:8080/?stream=true]()
