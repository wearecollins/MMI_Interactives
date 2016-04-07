/*global Handlebars, log4javascript, Loader, 
 *       Page, StreamHandler, StateHandler, 
 *       WebsocketHandler, EventHandler,
 *       ConfigHandler*/

function Manager(states, transitions){
  if (states === undefined ||
      !Array.isArray(states)){
    throw 'no states defined, or states is not an array.';
  }
  var ws;
  var configHandler;
  var streamHandler;
  var eventHandler;
  var stateHandler;
  
  function init(){
    //first we need to load up the logging framework
    var loggingPromise = initLogging();

    //load library in parallel
    var libraryPromise = loggingPromise.then(loadLibrary);

    //initialize everything
    libraryPromise.
      then(instantiateHandlers).
      then(connectWebsockets).
      //wait for the persistent config to come from the server
      // must come after connectWebsockets
      then(initConfigHandler).
      then(configHandlebars).
      //load the basic DOM structure
      then(initStructure).
      //populate the basic DOM structure with all the pages
      // must come immediately after initStructure
      then(loadStates).
      //link the stream handler with the DOM
      // must come after initStructure
      then(initStreamHandler).
      then(initEventHandler).
      then( function(){log.info('[Manager::init] done')} );  
      //could also wait to connect to websockets until very end...
  }
  
  window.onload = init;

  function instantiateHandlers(){
    ws = new WebsocketHandler();
    streamHandler = new StreamHandler();
    eventHandler = new EventHandler();
    stateHandler = new StateHandler();
    configHandler = new ConfigHandler();
  }

  function configHandlebars(){
    //TODO: if !Handlebars, the load via Loader
    Handlebars.registerHelper('switch', function(value, options) {
      this._switch_value_ = value;
      var html = options.fn(this); // Process the body of the switch block
      delete this._switch_value_;
      return html;
    });
    Handlebars.registerHelper('case', function() {
      // Convert "arguments" to a real array - stackoverflow.com/a/4775938
      var args = Array.prototype.slice.call(arguments);

      var options    = args.pop();
      var caseValues = args;

      if (caseValues.indexOf(this._switch_value_) === -1) {
        return '';
      } else {
        return options.fn(this);
      }
    });
  }

  function loadLibrary(){
    var promises = [];
    var path = 'js';
    var files = ['Page.js','StateHandler.js','EventHandler.js',
                 'WebsocketHandler.js','StreamHandler.js',
                 'ConfigHandler.js'];
    for (var fileI = files.length - 1;
         fileI >= 0;
         fileI--){
      promises.push(Loader.loadJS(path+'/'+files[fileI]));
    }

    return Promise.all(promises);
  }

  function initStreamHandler(){
    streamHandler.init(document.getElementById('liveView'));
    //link publishers with subscribers
    ws.addBinaryHandler(streamHandler.handleImage.bind(streamHandler));
  }

  function initEventHandler(){
    eventHandler.init(stateHandler, configHandler);
    //link publishers with subscribers
    ws.addTextHandler(eventHandler.handleJson.bind(eventHandler));
    eventHandler.addJsonNotifier(ws.send.bind(ws));
  }

  function initConfigHandler(){
    var configPromise = configHandler.init();
    //link publishers with subscribers
    ws.addTextHandler(configHandler.handleJson.bind(configHandler));
    configHandler.addJsonUpdater(ws.send.bind(ws));
    return configPromise;
  }

  function initLogging(){
    window.log = console;
    var loggingPromise = Loader.loadJS('js/vendor/log4js-1.4.13.js');
    return loggingPromise.
      then(function resolve(){
        //reference the logger from the window for global availability
        window.log = log4javascript.getLogger();
        // set up browser logging
        var browserConsoleAppender = 
          new log4javascript.BrowserConsoleAppender();
        var timestampedLayout = 
          new log4javascript.PatternLayout('%-5p %d{HH:mm:ss,SSSS} - %m%n');
        browserConsoleAppender.setLayout(timestampedLayout);
        window.log.addAppender(browserConsoleAppender);
        // set up AJAX logging
        var ajaxAppender = 
          new log4javascript.AjaxAppender(window.location.origin+'/');
        //ensure messages log in-order on the server
        ajaxAppender.setWaitForResponse(true);
        window.log.addAppender(ajaxAppender);
      }).
      then(function resolve(){
        log.info('loaded Log4JS');
      });
  }

  function initStructure(){
    var structurePromise = Loader.loadHTML('structure.html');

    return structurePromise.
      then( function resolve(html){
        document.body.innerHTML = html;
        var pageContainer = document.getElementById('pages');
        return pageContainer;
      }).
      catch(function reject(reason){
        log.warn('structure not loaded',reason);
        return document.body;
      });
  }

  function loadStates(container){
    var promise = stateHandler.init(states, 
                                    transitions, 
                                    container, 
                                    configHandler);
    //link publishers with subscribers
    stateHandler.addJsonNotifier(ws.storeAndForward.bind(ws));
    stateHandler.addStreamNotifier( function(show){
      if (show){
        streamHandler.showStream();
      } else {
        streamHandler.hideStream();
      }
    });
    return promise;
  }
  
  function connectWebsockets(){
    ws.connect('ws://'+window.location.host, 'node');
    ws.connect('ws://localhost:9091', 'oF');
  }
  
/*
  //from
  // http://stackoverflow.com/a/32362233/5953457
  Promise.prototype.finally = function(cb) {
    const res = () => this;
    return this.then(value =>
                       Promise.resolve(cb({state:'fulfilled', value})).
                               then(res),
                     reason =>
                       Promise.resolve(cb({state:'rejected', reason})).
                               then(res));
  };
*/
}
