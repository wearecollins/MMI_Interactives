## Instructions

The server defaults to serving [demo.html](static/demo.html) and using [static/demo/config.json]() as the persistent configuration. You can use a different html file and config using the `--station` parameter: `npm start -- --station [STATION]`. This will default to serving _static/[STATION].html_ and loading configs from _static/[STATION]/config.json_

use the 'a' key to access the Admin page.

## Structure
The design is as follows:

* [main.js](static/js/main.js) manages the core setup, event management, and websocket communication functionality
* the starting html file (specified using the _--station_ parameter, defaulting to [demo.html](static/demo.html)) contains a small script element that defines 
    - a list of "pages" to be loaded
    - a set of custom transitions for various modes
* for each "page" (with path <PagePath>) defined in the starting html file, there is expected to be the following subdirectory structure:
    - <PagePath>/main.js
    - <PagePath>/style.css
    - <PagePath>/template.hbr
    - <PagePath>/data.json
