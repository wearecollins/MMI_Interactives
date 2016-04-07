This is a work-in-progress proof-of-concept for how to structure the frontend apps in a way that will be easy to define and manage.

## Setup
The app uses a Node.js server.

1. Install Node.js or create a NodeEnv. Developed using Node.js 5.9.1
2. `npm install`

## Running
### v1: Frontend
1. ```npm start```
2. Startup openFrameworks [Frontend]()

### v2: Streaming camera

1. `npm start`
2. start up openFrameworks [camera app](https://github.com/wearecollins/MMI_Interactives/tree/develop/Camera)
3. visit [localhost:8080]()

## Instructions

The server defaults to serving demo.html and using static/demo/config.json as the persistent configuration. You can use a different html file and config using the `--station` parameter: `npm start -- --station performance`

use the 'a' key to access the Admin page.

## Structure
The design is as follows:

* main.js manages the core setup, event management, and websocket communication functionality
* demo.html contains a small script element that defines 
    - a list of "pages" to be loaded
    - a set of custom transitions for various modes
* for each "page" (with path <PagePath>) defined in demo.html, there is expected to be the following subdirectory structure:
    - <PagePath>/main.js
    - <PagePath>/style.css
    - <PagePath>/template.hbr
    - <PagePath>/data.json
