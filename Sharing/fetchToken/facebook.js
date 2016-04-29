//standard libraries
var FileSystem = require('fs');
var Path = require('path');
//external dependencies
var Logger = require('log4js');
var Facebook = require('fb');

var logger = Logger.getLogger('facebook');

var fbAuth = function(configs){
  this.configs = configs;
  Facebook.options({appId:     this.configs.app.id,
                    appSecret: this.configs.app.secret,
                    version:   'v2.5'});
};

fbAuth.prototype.startAuth = function startAuth(req, res, next){
  res.redirect('/facebook.html');
};

fbAuth.prototype.endAuth = function endAuth(req, res, next){
  next();
};

fbAuth.prototype.getConfs = function getConfs(req, res, next){
  res.send({appId: this.configs.app.id});
};

fbAuth.prototype.postAuth = function postAuth(client_req, client_res, next){
  var shortToken = client_req.body.token;
  var pageId = client_req.body.page;
  var albumId = client_req.body.album;
  var videoListId = client_req.body.video_list;
  var albumName = client_req.body.new_album;
  var videoListName = client_req.body.new_video_list;

  logger.debug('[postAuth] token:', shortToken);
  logger.debug('[postAuth] page:', pageId);

  //elevate token to long-live token
  var longTokenPromise = shortTokenToLong(shortToken, 
                                          this.configs.app.id, 
                                          this.configs.app.secret);
  longTokenPromise.catch(
    function reject(reason){
      logger.error('[postAuth]', 
                    reason ? reason : 'error');
    });

  //elevate user token to page token
  var pageTokenPromise = 
    longTokenPromise.
      then(longTokenToPageToken.bind(this, pageId));
  pageTokenPromise.catch(
    function reject(reason){
      logger.error('[server::pageTokenPromise]',
                    reason ? reason : 'error');
    });

  pageTokenPromise.
    then(
      function(pageToken){
        logger.trace('[postAuth] formatting data');
        return {page:{token: pageToken,
                      id:    pageId}};
      }).
    //create album if necessary
    then(
      function(data){
        logger.trace('[postAuth] optionally creating/using album');
        if (albumId){
          data.album = {id: albumId};
          return data;
        } else if (albumName){
          return createAlbum(albumName, data);
        } else {
          return data;
        }
      }).
    //create video list if necessary
    then(
      function(data){
        logger.trace('[postAuth] optionally creating/using video list');
        if (videoListId){
          data.videoList = {id: videoListId};
          return data;
        } else if (videoListName){
          return createVideoList(videoListName, data);
        } else {
          return data;
        }
      }).
    //store data for access by posting server
    then(data => storeData(data, 'facebookToken.json')).
    then(
      function(/*filename*/){
        client_res.redirect('/thanks.html');
      });
};

function shortTokenToLong(shortToken, client_id, client_secret){
  return new Promise(function(resolve, reject){
    Facebook.api(
      'oauth/access_token',
      {grant_type:        'fb_exchange_token',
       client_id:         client_id,
       client_secret:     client_secret,
       fb_exchange_token: shortToken},
      function gotLongToken(res){
        if (!res || res.error){
          var err = res ? res.error : undefined;
          logger.debug('[shortTokenToLong] error in response:',err);
          reject(err);
        } else {
          logger.debug('[shortTokenToLong] got long token');
          resolve(res.access_token);
        }
      });
  });
}

function longTokenToPageToken(pageId, longToken){
  return new Promise(function(resolve, reject){
    Facebook.api(
      'me/accounts/'+pageId,
      {access_token: longToken},
      function gotPageToken(res){
        if (!res || res.error){
          var err = res ? res.error : undefined;
          logger.debug('[longTokenToPageToken] error in response:', err);
          reject(err);
        } else {
          logger.debug('[longTokenToPageToken] got page token');
          resolve(res.data[0].access_token);
        }
      });
  });
}

function createAlbum(albumName, data){
  return new Promise(function(resolve, reject){
    Facebook.api(
      data.page.id+'/albums',
      'post',
      {access_token: data.page.token,
       name:         albumName,
       privacy:      JSON.stringify({value:'SELF'})},
      function(res){
        if (!res || res.error){
          var err = res ? res.error : undefined;
          logger.debug('[createAlbum] error in response:', err);
          reject(err);
        } else {
          logger.debug('[createAlbum] created album', res.id);
          data.album = {id: res.id};
          resolve(data);
        }
      });
  });
}

function createVideoList(videoListName, data){
  return new Promise(function(resolve, reject){
    Facebook.api(
      data.page.id+'/video_lists',
      'post',
      {access_token: data.page.token,
       title:        videoListName,
       privacy:      JSON.stringify({value:'SELF'})},
      function(res){
        if (!res || res.error){
          var err = res ? res.error : undefined;
          logger.debug('[createVideoList] error in response:', err);
          reject(err);
        } else {
          logger.debug('[createVideoList] created video list');
          resolve(getVideoListId(videoListName, data));
        }
      });
  });
}

function parseForVideoListId(videoListName, data, resolve, reject, result){
  if (!result || result.error){
    reject( result ? result.error : undefined );
  } else if (result.data.length === 0){
    reject( 'did not find video list', videoListName);
  } else {
    var resolved = false;
    for(var i = 0; i < result.data.length && !resolved; i++){
      var item = result.data[i];
      if (item.title === videoListName){
        data.videoList = {id: item.id};
        resolve(data);
        resolved = true;
      }
    }
    if (!resolved){
      Facebook.api(
        data.page.id+'/video_lists',
        {access_token: data.page.token,
         before:       result.paging.cursors.before},
        parseForVideoListId.bind(this, videoListName, data, resolve, reject));
    }
  }
}

function getVideoListId(videoListName, data){
  return new Promise(function(resolve, reject){
    Facebook.api(
      data.page.id+'/video_lists',
      {access_token: data.page.token},
      parseForVideoListId.bind(this, videoListName, data, resolve, reject));
  });
}

function storeData(data, filename){
  return new Promise(function(resolve, reject){
    //store token
    var filepath = Path.join(__dirname, '..', filename);
    logger.debug('[storeData] attempting to save to',filename);
    FileSystem.writeFile(
      filepath, 
      JSON.stringify(data),
      function wroteFile(err){
        if (err){
          logger.debug('[storeData] error writing file');
          reject(err);
        } else {
          logger.debug('[storeData] stored data in',filepath);
          resolve(filepath);
        }
      });
  });
}

module.exports = fbAuth;
