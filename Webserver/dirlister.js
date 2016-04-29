/**
 * Provides an Express middleware for 
 *  getting directory listings for static-ly served directories
 * @module dirlister
 */

//standard libraries
var FileSystem = require('fs');
var Path = require('path');
//external dependencies
var Logger = require('log4js');

/**
 * @namespace
 */
var DirLister = {};

/**
 * A middleware for providing directory listings
 * @callback DirLister.middleware
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {function} next
 */

/**
 * Get middleware that will return directory listings for requested paths.
 * @param {Array} a_Mapping array of webpath <-> filepath mappings. 
 * @returns {DirLister.middleware}
 */
DirLister.list = function list(a_Mapping){
  var logger = Logger.getLogger('DirLister');
  return function handleListReq(req, res, next){
    if (req.method !== 'GET'){
      logger.debug('[list] not GET, passing');
      next();
    } else {
      var path = req.query.path;
      logger.debug('[list] got request for', path);
      if (path === undefined){
        logger.warn('[list] path parameter not provided');
        res.sendStatus(400);
      } else if (typeof(path) !== 'string'){
        logger.warn('[list] path parameter is not a string');
        res.sendStatus(400);
      } else {
        var foundMatch = false;
        for(var i = 0; i < a_Mapping.length && !foundMatch; i++){
          var map = a_Mapping[i];
          if (path.startsWith(map.webPath)){
            foundMatch = true;
            logger.debug('[list]',path,'matches',map.webPath);
            var relativePath = path.substring(map.webPath.length);
            var absolutePath = Path.join(map.diskPath, relativePath);
            //check that the path exists
            FileSystem.access(absolutePath, FileSystem.R_OK, function(err){
              if (err){
                logger.warn('[list] invalid path',absolutePath);
                res.sendStatus(404);
              } else {
                logger.debug('[list] getting list for',absolutePath);
                //get directory listing
                FileSystem.readdir(absolutePath, function(err, filenames){
                  if (err){
                    logger.error('[list]', err);
                    res.sendStatus(500);
                  } else {
                    logger.debug('[list] contains',filenames.length,'items');
                    res.send(filenames);
                  }
                });
              }
            });
          }
        }
        if (!foundMatch){
          logger.warn('[list] requested path not found:', path);
          res.sendStatus(400);
        }
      }
    }
  };
};

module.exports = DirLister;
