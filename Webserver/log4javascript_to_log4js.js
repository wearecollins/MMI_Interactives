/**
 * Provides an Express middleware for 
 *  logging POST messages from log4javascript using log4js
 * @module log4javascript_to_log4js
 */

/**
 * @namespace
 */
var LogHandler = {};

/**
 * A middleware for handling POST messages from log4javascript
 * and logging them via log4js
 * @callback LogHandler.middleware
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {function} next
 */

/**
 * Get middleware that will log using the provided log4js instance.
 * @param {Logger} a_Logger the log4js object. 
 *  This will be used to get the actual logger(s).
 * @returns {LogHandler.middleware}
 */
LogHandler.log = function log(a_Logger){
  var Logger = a_Logger;
  var logger = Logger.getLogger('remote');
  return function handleLogPost(req, res, next){
    if (req.method !== 'POST'){
      next();
    } else {
      try{
        logger[req.body.level.toLowerCase()](req.body.message);
      }catch(e){
        logger.error('problem logging from POST: ',e);
      }
      res.send(' ');
    }
  };
};

module.exports = LogHandler;
