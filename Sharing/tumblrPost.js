//standard libraries
var FileSystem = require('fs');
var Path = require('path');
//external dependencies
var OAuth = require('oauth').OAuth;
var Logger = require('log4js');

/**
 * @constructor
 * @param {string} a_configFilename path to the config json
 */
var TumblrPoster = function(a_configFilename){
  this.configs = require(a_configFilename);
  this.logger = Logger.getLogger('TumblrPoster');

  this.oauth = new OAuth('https://www.tumblr.com/oauth/request_token',
                         'https://www.tumblr.com/oauth/access_token',
                         this.configs.tumblr.app.key,
                         this.configs.tumblr.app.secret,
                         "1.0A",
                         "http://momi-auth.ngrok.io/auth/tumblr/done",
                         "HMAC-SHA1");
  this.logger.debug('initialized');
};

/**
 * Attempt to post all provided assets to Facebook
 * @param {Postee[]} postList
 * @returns {Postee[]} provided Postees with updated results
 */
TumblrPoster.prototype.post = function(postList){
  //TODO: investigate uploading en masse
  //get config
  var configPromise = getUploadConfig();

  return configPromise.
    //upload all items
    then(function resolved(apiData){
      this.logger.debug('loaded tokens');
      var promises = [];
      this.logger.debug('need to post',postList.length);
      //go through each Postee
      postList.forEach(function(item){
        this.logger.debug('posting', item.filename);
        var promise;
        //post it using the correct API (video/photo)
        if (item.type === 'video'){
          promise = this.postVideo(item, apiData);
        } else if (item.type === 'photo'){
          promise = this.postImage(item, apiData);
        } else {
          item.result.error = 'unrecognized media type';
          promise = Promise.reject(item);
        }
        promises.push(promise.catch(function(item){
          this.logger.debug('[post] failed:',
                             item);
          return item;
        }.bind(this)));
      },this);
      return Promise.all(promises);
    }.bind(this),
    //if this errors, mark all Postees as errored
    function(reason){
      this.logger.debug('could not load tokens', reason);
      postList.forEach(function(item){
        item.result.error = reason;
      });
      return postList;
    }.bind(this));
};

///**
// * @param {Postee} video to post
// * @returns {Promise<string>} resolves/rejects when FB responds
// */
//FBPoster.prototype.postVideo = function(item, apiData){
//  var options = 
//    {access_token:             apiData.page.token,
//     //no_story seems to have no affect when published: false
//     no_story:                 true,
//     published:                false,
//     unpublished_content_type: 'DRAFT',
//     file_url:                 this.configs.media.netpath + item.filename};
//
//  //cannot load videos directly to list
//  this.logger.debug('[postVideo] to page');
//  var rootId = apiData.page.id;
//
//  var APIPromise = this.postAPI(rootId+'/videos', options).
//    then(function resolved(response){
//      item.result.success = response;
//      return this.linkVideo(apiData, response.id).
//        then(function linkResolved(/*response*/){
//          return item;
//        },
//        function linkRejected(response){
//          item.result.error = response;
//          return Promise.reject(item);
//        });
//    }.bind(this),
//    function rejected(reason){
//      item.result.error = reason;
//      return Promise.reject(item);
//    });
//
//  return APIPromise;
//};
//
////TODO: we could link all successful videos at once at end
//FBPoster.prototype.linkVideo = function(apiData, videoId){
//  if (apiData.videoList){
//    this.logger.debug('[linkVideo] linking');
//    return this.postAPI(apiData.videoList.id+'/videos', 
//                   {access_token: apiData.page.token,
//                    video_ids:    JSON.stringify([videoId])});
//  } else {
//    return Promise.resolve();
//  }
//};

/**
 * @param {Postee} image to post
 * @returns {Promise<Postee>} resolves/rejects when Tumblr responds
 */
TumblrPoster.prototype.postImage = function(item, apiData){
  return new Promise(function(resolve, reject){
    this.oauth.post('https://api.tumblr.com/v2/blog/'+apiData.blog+'/post',
                    apiData.accessToken,
                    apiData.accessSecret,
                    {type:  'photo',
                     state: 'draft',
                     source: this.configs.media.netpath + item.filename},
                    function(err, data){
                      if (err){
                        this.logger.debug('[postImage] error from Tumblr', 
                                          err);
                        item.result.error = err;
                        reject(item);
                      } else {
                        this.logger.debug('[postImage] posted');
                        item.result.success = data;
                        resolve(item);
                      }
                    }.bind(this));
  }.bind(this));
};

/**
 * @param {Postee} image to post
 * @returns {Promise<Postee>} resolves/rejects when Tumblr responds
 */
TumblrPoster.prototype.postVideo = function(item, apiData){
  return new Promise(function(resolve, reject){
    var url = this.configs.media.netpath + item.filename
    this.oauth.post('https://api.tumblr.com/v2/blog/'+apiData.blog+'/post',
                    apiData.accessToken,
                    apiData.accessSecret,
                    {type:  'video',
                     state: 'draft',
                     embed: url},
                    function(err, data){
                      if (err){
                        this.logger.debug('[postVideo] error from Tumblr for', 
                                          url,
                                          err);
                        item.result.error = err;
                        reject(item);
                      } else {
                        this.logger.debug('[postVideo] posted');
                        item.result.success = data;
                        resolve(item);
                      }
                    }.bind(this));
  }.bind(this));
};

///**
// * generalized posting/errer handling
// * @returns {Promise}
// */
//FBPoster.prototype.postAPI = function(endpoint, options){
//  this.logger.debug('[postAPI]', endpoint, options.url || options.file_url);
//  return new Promise(function(resolve, reject){
//    Facebook.api(
//      endpoint,
//      'post',
//      options,
//      function posted(res){
//        this.logger.debug('[postAPI]', res);
//        if (!res || res.error){
//          reject( res ? res.error : undefined );
//        } else {
//          resolve(res);
//        }
//      }.bind(this));
//  }.bind(this));
//};

/**
 * @returns {Promise<map,Error>} 
 *  the config file containing the Tumblr tokens and other upload info
 */
function getUploadConfig(){
  return new Promise(function(resolve, reject){
    var filename = Path.join(__dirname, 'tumblrToken.json');
    FileSystem.readFile(
      filename, 
      'utf8', 
      function loadedFile(err, data){
        if (err){
          reject(err);
        } else {
          try {
            var json = JSON.parse(data);
            resolve(json);
          } catch (e){
            reject(e);
          }
        }
      });
  });
}

module.exports = TumblrPoster;
