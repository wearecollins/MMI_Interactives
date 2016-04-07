/* global WebsocketHandler */

/**
 * @constructor
 */
function ConfigHandler(){
  var jsonUpdaters = [];
  var config = {};
  var initializedContents = false;
  var resolveInitialization;

  /**
   * @returns {Promise<ConfigHandler>} 
   *  resolves once the current config is received from the server.
   */
  this.init = function init(){
    var self = this;
    return new Promise(function (resolve/*, reject*/){
      resolveInitialization = resolve.bind(this, self);
    });
  };

  /**
   * @param {jsonNotifier} func
   */
  this.addJsonUpdater = function addJsonUpdater(func){
    if (typeof(func) === 'function'){
      jsonUpdaters.push(func);
    }
  };

  /**
   * @param {string} key
   * @param {*} defaultValue value to return if key is not in config
   * @returns {*} the value in the current config 
   *  associated with the provided key
   */
  this.get = function get(key, defaultValue){
    if (config.hasOwnProperty(key)){
      return config[key];
    } else {
      return defaultValue;
    }
  };

  /**
   * @param {string|Object} key
   *  if string, sets the given key to the provided value.
   *  if Object, merges the provided Object/map with the current config
   * @param {*} [value] the value to set the key to in the config. 
   *  Used only if key is a string.
   */
  this.set = function set(key, value){
    var map;
    if (typeof(key) === 'string'){
      map = {key:value};
    } else if (typeof(key) === 'object') {
      map = key;
    } else {
      throw new Error('first argument must be string or Object');
    }
    mergeIn(map);
    update();
  };

  /**
   * handles serialized config updates
   * @param {string} msg stringified config
   */
  this.handleJson = function handleJson(msg){
    var data;
    try{
      data = JSON.parse(msg);
    }catch(e){
      log.error('[ConfigHandler::handleJson] error parsing', msg, e);
      return;
    }
    //if this is a config message
    if (data.config !== undefined){
      mergeIn(data.config);
      //if this is the first config message
      if (!initializedContents){
        //we can resolve the initialization Promise
        initializedContents = true;
        resolveInitialization();
      }
    }
  };

  /**
   * @param {Object} map key/value pairs to merge into config
   */
  function mergeIn(map){
    var keys = Object.keys(map);
    for(var keyI = keys.length - 1;
        keyI >= 0;
        keyI--){
      var currKey = keys[keyI];
      config[currKey] = map[currKey];
    }
  }

  /**
   * send serialized configs to all registered functions
   */
  function update(){
    var json;
    try{
      json = JSON.stringify({config});
    }catch(e){
      log.error('cannot stringify config');
      return;
    }

    for(var updaterI = jsonUpdaters.length - 1;
        updaterI >= 0;
        updaterI--){
      var updater = jsonUpdaters[updaterI];
      updater(json);
    }
  }
}


