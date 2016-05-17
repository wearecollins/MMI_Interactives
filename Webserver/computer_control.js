//standard libraries
var Exec = require('child_process').exec;
//external dependencies
var Logger = require('log4js');

/**
 * @namespace
 */
var ComputerControl = {};

ComputerControl.control = function control(){
  var logger = Logger.getLogger('CompControl');
  return function handleControl(req, res, next){
    if (req.method !== 'POST'){
      logger.debug('[control] not POST, passing');
      next();
    } else {
      if (req.path === '/shutdown'){
        logger.info('[control] shutting down computer');
        Exec('sudo /sbin/shutdown -h now', function shutdown(error, stdout, stderr){
          if (error){
            logger.error('[shutdown] error with command',error);
          }
          if (stdout){
            logger.debug('[shutdown] stdout:',stdout);
          }
          if (stderr){
            logger.warn('[shutdown] stderr:',stderr);
          }
        });
        res.sendStatus(200);
      } else if (req.path === '/restart'){
        logger.info('[control] restarting computer');
        Exec('sudo /sbin/shutdown -r now', function restart(error, stdout, stderr){
          if (error){
            logger.error('[restart] error with command',error);
          }
          if (stdout){
            logger.debug('[restart] stdout:',stdout);
          }
          if (stderr){
            logger.warn('[restart] stderr:',stderr);
          }
        });
        res.sendStatus(200);
      } else {
        logger.debug('[control] unrecognized action',req.path);
        next();
      }
    }
  };
};

module.exports = ComputerControl;
