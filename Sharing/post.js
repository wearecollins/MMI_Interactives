//standard libraries
var FileSystem = require('fs');
var Path = require('path');
//external dependencies
var Logger = require('log4js');
//custom modules
var Posters = [require(Path.join(__dirname, 'fbPost.js'))];//,
               //require(Path.join(__dirname, 'tumblPost.js'))];

/**
 * Used to track posts that need to be made.
 * @constructor
 * @param {string} filename the name of the file to post
 * @param {Postee.Types} type the type of post this is
 */
var Postee = function(filename, type, numPosters){
  this.results = [];
  for(var i = 0; i < numPosters; i++){
    this.results.push({});
  }
  this.attempts = 0;
  this.getFilename = function(){
    return filename;
  };
  this.getType = function(){
    return type;
  };
};

Postee.Types = {};
Postee.Types.PHOTO = 'photo';
Postee.Types.VIDEO = 'video';

/**
 * @constructor
 * @param {string} a_configFilename path to the config json
 */
var Poster = function(a_configFilename){
  this.configs = require(a_configFilename);
  this.logger = Logger.getLogger('Poster');
  this.timeoutTime = this.configs.processInterval;
  this.timeoutId = this.scheduleQueueProcessing();
  this.maxAttempts = this.configs.maxAttempts;
  /**
   * @type {ServicePoster[]}
   */
  this.posters = [];
  for(var posterI = 0;
      posterI < Posters.length;
      posterI++){
    this.posters.push(new Posters[posterI](a_configFilename));
  }
  /**
   * @type {Postee[]}
   */
  this.queue = [];
};

Poster.prototype.addPhoto = function(filename){
  this.queue.push(new Postee(filename, 
                             Postee.Types.PHOTO, 
                             this.posters.length));
};

Poster.prototype.addVideo = function(filename){
  this.queue.push(new Postee(filename, 
                             Postee.Types.VIDEO, 
                             this.posters.length));
};

/**
 * returns {Promise}
 */
Poster.prototype.checkFile = function(filename){
  return new Promise(function(resolve, reject){
    var callback = function(doesExist){
      if (doesExist){
        resolve();
      } else {
        reject('file not found');
      }
    };
    FileSystem.exists(Path.join(this.configs.media.localpath, filename), 
                      callback);
  }.bind(this));
};

/**
 * tells the specific poster to attempt uploading 
 * any items that it has not already successfully uploaded.
 * @returns {Promise}
 */
Poster.prototype.postUsing = function(posterIndex, numItems){

  var addItemIfFileExists = function(item, filename, list){
    this.logger.debug('checking',filename);
    return this.checkFile(filename).
      then(function(){list.push(item);}).
      catch(function(reason){
        this.logger.debug('[Poster::postUsing::aIIFE]',
                          'file not found', 
                          filename);
      }.bind(this));
  }.bind(this);

  var toPost = [];
  var promises = [];
  for(var i = 0; i < numItems; i++){
    this.logger.debug('checking item',i);
    var item = this.queue[i];
    if (!item.results[posterIndex].success){
      var map = {filename: item.getFilename(),
                 type:     item.getType(),
                 item:     item,
                 result:   {}};
      promises.push(addItemIfFileExists(map, map.filename, toPost));
    } else {
      this.logger.debug('item',i,
                        'succeeded for poster',posterIndex,
                        'skipping');
    }
  }
  return Promise.all(promises).
    then(function(/*results*/){
      if (toPost.length > 0){
        var poster = this.posters[posterIndex];
        this.logger.debug('posting',toPost.length,'files');
        return poster.post(toPost).
          then(
            function(posted){
              this.logger.debug('[postUsing] posted all');
              for(var i = posted.length - 1; i >= 0; i--){
                posted[i].item.results[posterIndex] = posted[i].result;
              }
              this.logger.debug('[postUsing] updated items');
            }.bind(this));
      }
      //otherwise it just continues resolving
    }.bind(this));
};

/**
 * schedules the queue to be processed later. cancels any pending processing.
 */
Poster.prototype.scheduleQueueProcessing = function(){
  clearTimeout(this.timeoutId);
  this.timeoutId = setTimeout(this.processQueue.bind(this), this.timeoutTime);
};

/**
 * remove Postees from the queue that have succeeded, 
 *  or failed too many times.
 */
Poster.prototype.cleanQueue = function(numItems){
  var succeeded;
  for(var posteeI = numItems - 1; posteeI >= 0; posteeI--){
    this.logger.debug('[cleanQueue] checking item', posteeI);
    succeeded = true;
    var postee = this.queue[posteeI];
    //check if all posters have succeeded for this item
    for(var posterI = this.posters.length - 1; 
        posterI >= 0 && succeeded; 
        posterI--){
      this.logger.debug('[cleanQueue] checking poster', posterI);
      succeeded &= postee.results[posterI].hasOwnProperty('success');
    }
    //if all posters have succeeded, then remove this one from the queue
    if (succeeded){
      this.logger.debug('[Poster::cleanQueue]',
                        'posted to all services',
                        postee.getFilename());
      this.queue.splice(posteeI, 1);
    }
    //if this item has failed too many times, remove it from the queue
    postee.attempts++;
    if (postee.attempts >= this.maxAttempts){
      this.logger.warn('[Poster::cleanQueue]',
                       'file failed to upload too many times',
                       postee.getFilename());
      this.queue.splice(posteeI, 1);
    }
  }
};

Poster.prototype.processQueue = function(){
  var queueSize = this.queue.length;
  this.logger.debug('[Poster::processQueue] processing', queueSize, 'items');
  /**
   * @type {Promise[]}
   */
  var promises = [];
  for(var i = 0; i < this.posters.length; i++){
    promises.push(this.postUsing(i, queueSize));
  }

  Promise.all(promises).
    then(function(){
      this.logger.debug('[processQueue] done posting')
    }.bind(this)).
    //clean up all succeeded/stale postees
    then(this.cleanQueue.bind(this, queueSize)).
    then(function(){
      this.logger.debug('[processQueue] processed')
    }.bind(this)).
    //set up to process new/failed uploads later
    then(this.scheduleQueueProcessing.bind(this));
};

module.exports = Poster;
