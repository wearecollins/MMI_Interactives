/**
 * Manage persistent configuration
 * @module configer
 */

var FileSystem = require('fs');
var ReadWriteLock = require('rwlock');

/**
 * the current config
 * @type {Object}
 */
var config;
/**
 * filename to load/save config
 * @type {string}
 */
var filename;
/**
 * ensures we don't try to read/write simultaneously
 */
var fileLock = new ReadWriteLock();

var logger;

/**
 * @constructor
 * @param {Logger} logger
 */
var Configer = function(a_logger){
  logger = a_logger;
};

/**
 * load config from a specific file. 
 *  Will attempt to load from <filename>.bak if anything goes wrong.
 * @param {string} a_filename the file to load the config from
 * @returns {Promise<Configer,string>}
 */
Configer.prototype.load = function load(a_filename){
  filename = a_filename;
  var self = this;
  var resolve, reject;
  var promise = new Promise(function (a_resolve, a_reject){
    resolve = a_resolve;
    reject = a_reject;
  });
  fileLock.writeLock(function (release){
    loadJson(filename).
      catch( function f_reject(reason){
        logger.info('problem loading '+filename+': '+reason);
        return loadJson(filename+'.bak').
          then( function f_resolve(json){
            logger.info('initializing from '+filename+'.bak');
            return writeConfig(filename, json).
              catch( 
                reason => 
                  logger.warn('problem writing '+filename+': '+reason) ).
              //return json to continue the chain
              then( () => json );
          });
      }).
      then( 
        function f_resolve(json){
          config = json;
          release();
          resolve(self);
        },
        function f_reject(reason){
          //set default empty config
          config = {};
          release();
          reject(reason);
        });
  });
  return promise;
};

/**
 * load and parse JSON-formatted data from the specified file
 * @param {string} filename file to read from
 * @returns {Promise<Object,string>} 
 *   resolves to the Object parsed from the JSON-formatted file contents
 */
function loadJson(filename){
  return new Promise(function(resolve, reject){
    FileSystem.readFile(filename, 'utf8', function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

/**
 * @param {string} key Key to fetch from config
 * @returns {*} the value associated with the provided key
 * @throws {Error} if no config has been loaded
 */
Configer.prototype.getConfig = function getConfig(key){
  if (config == undefined){
    throw new Error('config not loaded');
  } else {
    return config[key];
  }
};

/**
 * @returns {string} JSON-encoded configs
 */
Configer.prototype.getConfigString = function getConfigString(){
  return JSON.stringify({config});
};

/**
 * @param {string} filename
 * @param {Object} config
 * @returns {Promise<undefined,Error|string>}
 */
function writeConfig(filename, config){
  return new Promise( function(resolve, reject){
    var contents = JSON.stringify(config);
    FileSystem.writeFile(filename, contents, 'utf8', function(err){
      if (err){
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Updates the current config and writes the updates to disk
 * @param {Object} json message to update config based on
 * @returns {Promise} resolves after config has been updated and saved
 * @throws {Error} if no config has been loaded
 */
Configer.prototype.updateConfig = function updateConfig(json){
  if (config == undefined){
    throw new Error('config not loaded');
  } else {
    return new Promise(function(resolve/*, reject*/){
      fileLock.readLock(function(release){
        //merge json into config
        var inKeys = Object.keys(json.config);
        var myKeys = Object.keys(config);
        var mergedKeys = [];
        var updated = false;
        for(var keyI = inKeys.length - 1;
            keyI >= 0;
            keyI--){
          var key = inKeys[keyI];
          if (myKeys.indexOf(key) >= 0){
            mergedKeys.push(key);
            config[key] = json.config[key];
            updated = true;
          }
        }
        //write results
        if (updated){
          logger.debug('[Configer::updateConfig] updated', mergedKeys);
          writeConfig(filename, config).
            catch( 
              reason => 
                logger.warn('cannot write '+filename+': '+reason) ).
            then( () => {release(); resolve();} );
        } else {
          logger.debug(
            '[Configer::updateConfig] no provided keys exist to update');
          release();
          resolve();
        }
      });
    });
  }
};

module.exports = Configer;
