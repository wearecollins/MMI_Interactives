//standard libraries
var FileSystem = require('fs');
var Path = require('path');
//external dependencies
var Logger = require('log4js');
var Express = require('express');
var BodyParser = require('body-parser');
var Facebook = require('fb');

Logger.configure(require(Path.join(__dirname, 'log4js_conf.json')));
var logger = Logger.getLogger('fetchToken');

var configs = require(process.argv[2]);

Facebook.options({appId:     configs.facebook.app.id,
                  appSecret: configs.facebook.app.secret,
                  version:   'v2.5'});

var app = Express();
app.use(Express.static(Path.join(__dirname, 'static')));
app.use(BodyParser.urlencoded({extended:false}));
app.post('/', function (client_req, client_res){
  var shortToken = client_req.body.token;
  var pageId = client_req.body.page;
  var albumId = client_req.body.album;
  var videoListId = client_req.body.video_list;
  var albumName = client_req.body.new_album;
  var videoListName = client_req.body.new_video_list;

  logger.debug('[server::post::/] token:', shortToken);
  logger.debug('[server::post::/] page:', pageId);

  //elevate token to long-live token
  var longTokenPromise = shortTokenToLong(shortToken);
  longTokenPromise.catch(
    function reject(reason){
      logger.error('[server::longTokenPromise]', 
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
        return {page:{token: pageToken,
                      id:    pageId}};
      }).
    //create album if necessary
    then(
      function(data){
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
    then(storeData).
    then(
      function(/*filename*/){
        client_res.redirect('/thanks.html');
      });
});

function shortTokenToLong(shortToken){
  return new Promise(function(resolve, reject){
    Facebook.api(
      'oauth/access_token',
      {grant_type:        'fb_exchange_token',
       client_id:         configs.facebook.app.id,
       client_secret:     configs.facebook.app.secret,
       fb_exchange_token: shortToken},
      function gotLongToken(res){
        if (!res || res.error){
          reject( res ? res.error : undefined );
        } else {
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
          reject( res ? res.error : undefined );
        } else {
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
          reject( res ? res.error : undefined );
        } else {
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
          reject( res ? res.error : undefined );
        } else {
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

function storeData(data){
  return new Promise(function(resolve, reject){
    //store token
    var filename = Path.join(__dirname, '..', 'token.json');
    FileSystem.writeFile(
      filename, 
      JSON.stringify(data),
      function wroteFile(err){
        if (err){
          reject(err);
        } else {
          resolve(filename);
        }
      });
  });
}

var port = 8012;
/*var server = */app.listen(port, function(){
  logger.info('server listening on port',port);
});
