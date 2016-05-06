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

## Modules

### Log4Javascript to Log4js

Takes Log4Javascript logs transmitted from the frontend via AJAX requests
and logs them via Log4js so they can appear 
in the terminal and file-based logging. 
This is implemented as an Express middleware:

```
var Express = require('express');
var bodyParser = require('body-parser');
var Logger = require('log4js');
var RemoteLogs = require('./log4javascript_to_log4js.js');

// optionally configure log4js via config file
Logger.configure(require('./log4js_conf.json'));

var app = Express();

//requires body parser to pre-parse POST body
app.use(bodyParser.urlencoded({extended:true}));
app.use(RemoteLogs.log(Logger));
```

### Configer

Provides and updates persistent configs. 

```
var Configer = require('./configer.js');

var config = new Configer(console);
//you can pass in any logger that has debug/info/warn/error methods

// .load returns a Promise
config.load('relative/path/to/config.json').
  catch( function rejected(reason){
    //config will default to: {}
    console.log('could not load config',reason);
  }).
  then( function resolved(){
    console.log('config loaded');
  });
```

### Dirlister

Provides an endpoint for getting directory listings of the various 
static directories being served. Implemented as an Express Middleware.

```
var Express = require('express');
var DirLister = require('./dirlister.js');

var app = Express();
app.use('/list', DirLister.list([{diskPath:'static/', webPath:'/'}]));
app.use(express.static('static'));
```

## Endpoints

* **GET /list** Returns a directory listing of any queried directory:
`curl http://localhost:8080/list?path=static/`
* **POST /** Logs the value of _message_ in the POST body
at the log level specified by the _level_ entry in the POST body:
`logger[request.body.level.toLowerCase()](request.body.message);`
* **Websocket**
  - Connects to a shared event bus
  - Provides access to persistent configs
