# Webserver 

A Node.js® server and frontend framework for making single-page,multi-state web apps. The framework is detailed in [STRUCTURE.md](STRUCTURE.md)

This server contains code for **all** installations, in the 'static' folder: Anything Muppets, Performance, and Sharing (deprecated). 
It also contains examples for how to create new applications ('blank' and 'demo') and a suite of test scripts ('test' folder).

1. [Dependencies](#dependencies)
1. [Setup](#setup)
   - [Anything Muppets](#anythingmuppets)
   - [Performance](#performance)
1. [Running](#running)

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

# Running
The station this instance is hosting is passed in via a _--station_ parameter.

* `npm start -- --station [STATION]` where _[STATION]_ is one of `anythingmuppets` or `performance`
  - yes, there is an extra `--` when running via _npm_
  - without npm: `node server.js --station [STATION]`
* open frontend
  - if using the [Frontend App](../Frontend/), just run that app and it will load the webpage.
  - otherwise, start up the [Camera App](../Camera/) and open your browser to [http://localhost:8080/?stream=true]()

