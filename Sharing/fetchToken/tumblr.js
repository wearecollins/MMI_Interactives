//standard libraries
var FileSystem = require('fs');
var Path = require('path');
var URL = require('url');
//external dependencies
var Logger = require('log4js');
var OAuth = require('oauth').OAuth;

var logger = Logger.getLogger('tumblr');
var oauthTokens = {};

var tumblAuth = function(configs, netpath){
  this.configs = configs;
  this.oauth = new OAuth('https://www.tumblr.com/oauth/request_token',
                         'https://www.tumblr.com/oauth/access_token',
                         this.configs.app.key,
                         this.configs.app.secret,
                         '1.0A',
                         netpath + 'auth/tumblr/done',
                         'HMAC-SHA1');
};

tumblAuth.prototype.startAuth = function startAuth(req, res, next){
  this.oauth.getOAuthRequestToken(
      function(err, token, token_secret, parsedQueryString){
        if (err){
          logger.error('[startAuth] error fetching request token:',err);
          res.sendStatus(500);
        } else {
          oauthTokens[token] = {request_secret: token_secret};
          logger.debug('[startAuth] redirecting to Tumblr');
          res.redirect(302,
                       'https://www.tumblr.com/oauth/authorize?oauth_token=' +
                         token);
        }
  });
};

tumblAuth.prototype.endAuth = function endAuth(req, res, next){
  var requestToken = req.query.oauth_token;
  var tokenData = oauthTokens[requestToken];
  var token_secret = tokenData ? tokenData.request_secret : undefined;
  if (token_secret){
    this.oauth.getOAuthAccessToken(
        requestToken, 
        token_secret, 
        req.query.oauth_verifier,
        function(err, oauth_access_token, oauth_access_token_secret, results){
          if (err){
            logger.error('[endAuth] problem retrieving access token:', err);
            res.sendStatus(500);
          } else {
            logger.debug('[endAuth] got access token');
            tokenData.access_token = oauth_access_token;
            tokenData.access_secret = oauth_access_token_secret;
            this.oauth.get(
              'https://api.tumblr.com/v2/user/info',
              oauth_access_token,
              oauth_access_token_secret,
              function gotInfo(err, data){
                if (err){
                  logger.error(
                    '[endAuth:gotInfo] got error from user/info endpoint', 
                    err);
                  res.sendStatus(500);
                } else {
                  logger.debug('[endAuth:gotInfo] got!');
                  var blogs = [];
                  var json = JSON.parse(data);
                  json.response.user.blogs.forEach(function(blog){
                    blogs.push(URL.parse(blog.url).hostname);
                  });
                  res.redirect('/tumblr.html?rt='+requestToken+
                                 '&blogs='+blogs);
                }
              });
          }
        }.bind(this));
  }
};

tumblAuth.prototype.getConfs = function getConfs(req, res, next){
  res.send({appId: this.configs.app.id});
};

tumblAuth.prototype.postAuth = function postAuth(client_req, client_res, next){
  var requestToken = client_req.body.rt;
  var tokenData = oauthTokens[requestToken];
  var blog = client_req.body.blog;
  var accessToken = tokenData.access_token;
  var accessSecret = tokenData.access_secret;

  storeData({accessToken:  accessToken,
             accessSecret: accessSecret,
             blog:         blog},
            'tumblrToken.json').
    then(function resolved(filepath){
      logger.debug('[endAuth] saved file');
      client_res.redirect('/thanks.html');
    }, function rejected(reason){
      logger.error('[endAuth] failed to save file');
      client_res.sendStatus(500);
    });
};

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

module.exports = tumblAuth;
