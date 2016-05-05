//standard dependencies
var FileSystem = require('fs');
var Path = require('path');
//external dependencies
var Logger = require('log4js');
var Lowdb = require('lowdb');
var storage = require('lowdb/file-async');

var Persister = function(a_configFilename){
  this.configs = require(a_configFilename);
  this.db = Lowdb('db.json', {storage});
  this.logger = Logger.getLogger('persister');
  this.cleanupInterval = setInterval(this.cleanup.bind(this), this.configs.persistCheckIntervalMins * 60000);
  this.cleanup();
  this.logger.info('initialized');
};

Persister.prototype.cleanup = function(){
  this.logger.info('[cleanup] starting');
  var filenames = this.db('files').map('filename');
  if (filenames instanceof Promise){
    filenames.then(checkFiles.bind(this));
  } else {
    checkFiles.bind(this)(filenames);
  }

  function checkFiles(filenames){
    this.logger.debug('[cleanup] checking',filenames.length,'files');
    var promises = [];
    var numRemoved = 0;
    filenames.forEach(function(filename){
      promises.push(new Promise(function(resolve/*, reject*/){
        FileSystem.access(
          Path.join(this.configs.media.localpath, filename), 
          FileSystem.F_OK, 
          function(err){
            if (err){
              this.logger.debug('[cleanup]',filename,'not found');
              this.db('files').
                remove({filename}).
                then( function(){
                  numRemoved++;
                  resolve();
                }, function(reason){
                  this.logger.error('[cleanup] problem removing',filename,reason);
                  resolve();
                }.bind(this));
            } else {
              this.logger.trace('[cleanup]',filename,'exists');
              resolve();
            }
          }.bind(this));
      }.bind(this)));
    }.bind(this));

    Promise.all(promises).
      then(function(){ 
        this.logger.info('[cleanup] removed',numRemoved,'files');
      }.bind(this));
  }
};

/**
 * @returns {Promise}
 */
Persister.prototype.put = function(filename, type, state){
  this.logger.debug('[put] adding',filename, type, state);
  return this.db('files')
    .push({filename, type, state});
};

/**
 * @returns {Promise}
 */
Persister.prototype.get = function(filename){
  this.logger.debug('[get] retrieving', filename);
  var result = this.db('files').find({filename});
  if (result instanceof Promise){
    return result;
  } else {
    return Promise.resolve(result);
  }
};

/**
 * @returns {Promise}
 */
Persister.prototype.update = function(filename, state){
  this.logger.debug('[update] updating', filename,'to',state);
  return this.db('files').
    chain().
    find({filename}).
    assign({state}).
    value();
};

module.exports = Persister;
