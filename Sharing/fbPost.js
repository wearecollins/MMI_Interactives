//standard libraries
var FileSystem = require('fs');
var Path = require('path');
//external dependencies
var Facebook = require('fb');
var Logger = require('log4js');

/**
 * @constructor
 * @param {string} a_configFilename path to the config json
 */
var FBPoster = function(a_configFilename){
  this.configs = require(a_configFilename);
  this.logger = Logger.getLogger('FBPoster');

  Facebook.options({appId:     this.configs.facebook.app.id,
                    appSecret: this.configs.facebook.app.secret,
                    version:   'v2.5'});
  this.logger.debug('initialized');
};

/**
 * Attempt to post all provided assets to Facebook
 * @param {Postee[]} postList
 * @returns {Postee[]} provided Postees with updated results
 */
FBPoster.prototype.post = function(postList){
  //TODO: investigate uploading en masse
  //get config
  var configPromise = getGraphConfig();

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

/**
 * @param {Postee} video to post
 * @returns {Promise<string>} resolves/rejects when FB responds
 */
FBPoster.prototype.postVideo = function(item, apiData){
  var options = 
    {access_token:             apiData.page.token,
     //no_story seems to have no affect when published: false
     no_story:                 true,
     file_url:                 this.configs.media.netpath + item.filename};

  if (this.configs.facebook.draft){
    options.published = false;
    options.unpublished_content_type = 'DRAFT';
  }

  //cannot load videos directly to list
  this.logger.debug('[postVideo] to page');
  var rootId = apiData.page.id;

  var APIPromise = this.postAPI(rootId+'/videos', options).
    then(function resolved(response){
      item.result.success = response;
      item.item.fbID = response.id;
      item.item.fbURL = 'http://www.facebook.com/' + 
                        apiData.page.id +
                        '/videos/' +
                        response.id;
      return Promise.all([
        this.linkVideo(apiData, response.id).
          then(function linkResolved(/*response*/){
            return item;
          },
          function linkRejected(response){
            item.result.error = response;
            return Promise.reject(item);
          }),
        this.getEmbed(apiData, response.id).
          then(function embedResolved(response){
            this.logger.debug('[postVideo:embedResolved]', response.embed_html);
            item.item.fbEmbed = response.embed_html;
            return item;
          }.bind(this),
          function embedRejected(reason){
            this.logger.warn('[postVideo:embedRejected]',reason);
            return item;
          }.bind(this))]).
      then( () => item );
    }.bind(this),
    function rejected(reason){
      item.result.error = reason;
      return Promise.reject(item);
    });

  return APIPromise;
};

FBPoster.prototype.getEmbed = function(apiData, videoId){
  //TODO: use a proper template provided via config?
  var width = 560;
  var height = 315;
  var videoURI = 'https://www.facebook.com/'+apiData.page.id+'/videos/vb.'+apiData.page.id+'/'+videoId+'/?type=3';
  var encodedURI = encodeURIComponent(videoURI);
  var iframeURI = 'https://www.facebook.com/plugins/video.php?href='+encodedURI+'&show_text=0&width='+width;
  var style = 'border:none;overflow:hidden';
  return Promise.resolve({embed_html:'<iframe src="'+iframeURI+'" width="'+width+'" height="'+height+'" style="'+style+'" scrolling="no" frameborder="0" allowTransparency="true" allowFullScreen="true"></iframe>'});
  /*
  return new Promise(function(resolve, reject){
    this.logger.debug('[getEmbed] requesting embed html');
    Facebook.api(videoId, 
                 {fields:       ['embed_html'],
                  access_token: apiData.page.token},
                 function (res){
                   if (!res || res.error){
                     var err = res ? res.error : undefined;
                     this.logger.debug('[getEmbed] error',err);
                     reject(err);
                   } else {
                     this.logger.debug('[getEmbed] got!');
                     resolve(res);
                   }
                 }.bind(this));
  }.bind(this));
  */
};

//TODO: we could link all successful videos at once at end
FBPoster.prototype.linkVideo = function(apiData, videoId){
  if (apiData.videoList){
    this.logger.debug('[linkVideo] linking');
    return this.postAPI(apiData.videoList.id+'/videos', 
                   {access_token: apiData.page.token,
                    video_ids:    JSON.stringify([videoId])});
  } else {
    return Promise.resolve();
  }
};

/**
 * @param {Postee} image to post
 * @returns {Promise<Postee>} resolves/rejects when FB responds
 */
FBPoster.prototype.postImage = function(item, apiData){
  var options = 
    {access_token:             apiData.page.token,
     //no_story seems to have no affect when published: false
     no_story:                 true,
     url:                      this.configs.media.netpath + item.filename};

  if (this.configs.facebook.draft){
    options.published = false;
    options.unpublished_content_type = 'DRAFT';
  }

  var rootId;
  //if we have an Album ID, upload to the Album
  // otherwise upload to the Page
  if (apiData.album){
    rootId = apiData.album.id;
    this.logger.debug('[postImage] to album');
  } else {
    rootId = apiData.page.id;
    this.logger.debug('[postImage] to page');
  }
  return this.postAPI(rootId+'/photos', options).
    then(function resolved(response){
      this.logger.debug('[postImage] published');
      item.result.success = response;
      return item;
    }.bind(this),
    function rejected(reason){
      this.logger.debug('[postImage] failed');
      item.result.error = reason;
      return Promise.reject(item);
    }.bind(this));
};

/**
 * generalized posting/errer handling
 * @returns {Promise}
 */
FBPoster.prototype.postAPI = function(endpoint, options){
  this.logger.debug('[postAPI]', endpoint, options.url || options.file_url);
  return new Promise(function(resolve, reject){
    Facebook.api(
      endpoint,
      'post',
      options,
      function posted(res){
        this.logger.debug('[postAPI]', res);
        if (!res || res.error){
          reject( res ? res.error : undefined );
        } else {
          resolve(res);
        }
      }.bind(this));
  }.bind(this));
};

/**
 * @returns {Promise<map,Error>} 
 *  the config file containing the Facebook page token and other FB-API info
 */
function getGraphConfig(){
  return new Promise(function(resolve, reject){
    var filename = Path.join(__dirname, 'facebookToken.json');
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

module.exports = FBPoster;
