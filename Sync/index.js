//standard libraries
var Path = require('path');
var FileSystem = require('fs');
//external dependencies
var Logger = require('log4js');
var PID = require('daemon-pid');
var Rsync = require('rsync');

//get configs
var configs = require(Path.join(__dirname, 'configs.json'));

//set up logger
Logger.configure(require(Path.join(__dirname, 'log4js_conf.json')));
var logger = Logger.getLogger('Sync');

//check if a previous process is already running
var pid = PID(Path.join(__dirname, 'process.pid'));
pid.running(function(err, running/*, data*/){
  if (running){
    logger.warn('[checkRunning] process still running, exiting');
  } else {
    writePID();
  }
});

//if it is not, declare this process as the active one
function writePID(){
  pid.write(function(err){
    if (err){
      logger.error('[run] error while creating PID file', err);
    } else {
      checkAccessibility();
    }
  });
}

//check that both source and destination are accessible
function checkAccessibility(){
  Promise.all([checkPathAccessibility(configs.source, 
                                      'source directory'), 
               checkPathAccessibility(configs.destination, 
                                      'destination directory')]).
    then(function resolved(/*results*/){
      cacheLatest();
    },
    function rejected(/*reason*/){
      finish();
    });
}

//cache file info
var files = [];
function cacheLatest(){
  FileSystem.readdir(configs.source, function(err, files){
    if (err){
      logger.error('[cacheLatest] error getting directory listing', err);
      doRsync();
    } else {
      var promises = [];
      files.forEach(function(filename){
        promises.push(new Promise(function(resolve/*, reject*/){
          FileSystem.stat(
            Path.join(configs.source, filename), 
            function(err, stats){
              if (err){
                logger.error('[cacheLatest] error getting file', 
                             filename,'stats',err);
              } else {
                files.push({filename: filename,
                            modified: stats.mtime.getTime()});
              }
              resolve();
            });
        }));
      });
      Promise.all(promises).
        then(function(){
          //sort files most recent first
          files.sort(function(a, b){
            return b.modified - a.modified;
          });
          doRsync();
        });
    }
  });
}

//rsync files
function doRsync(){
  var rsync = new Rsync();
  rsync.
    source(configs.source).
    destination(configs.destination).
    quiet();

  rsync.execute(function(err, code, cmd){
    logger.debug('[doRsync] executed',cmd);
    if(err){
      logger.error('[doRsync] error',err);
      finish();
    } else {
      checkCopy();
    }
  });
}

//check that cached filename was synched
function checkCopy(){
  if (files.length === 0){
    logger.info('[checkCopy] no files to check/clean');
    finish();
  } else {
    checkPathAccessibility(
        Path.join(configs.destination, files[0].filename), 
        files[0].filename).
      then(function resolved(){
        logger.info('[checkCopy] copy appears to be successful');
        removeOld();
      }, function rejected(reason){
        logger.warn('[checkCopy] copy unsuccessful:',reason);
        finish();
      });
  }
}

//cleanup old files
function removeOld(){
  var numRemoved = 0;
  var oldest = Date().getTime() - configs.cleanupMins * 60000;
  var promises = [];
  files.forEach(function(item){
    if (item.modified < oldest){
      promises.push(removePath(Path.join(configs.source, item.filename), 
                               item.filename).
        then(() => numRemoved++,
             () => {/*convert failed promises to resolved promises*/}));
    }
  });
  Promise.all(promises).
    then(() => {
      logger.info('[removeOld] removed',numRemoved);
      finish();
    });
}

//clean up PID file
function finish(){
  pid.delete(function(err){
    if (err){
      logger.error('[finish] error while cleaning up PID file', err);
    } else {
      logger.info('[finish] exiting');
    }
  });
}

/**
 * utility function for checking if a file/directory exists
 */
function checkPathAccessibility(path, name){
  return new Promise(function(resolve, reject){
    FileSystem.access(path, FileSystem.F_OF, function(err){
      if (err){
        logger.error('[checkPathAccessibility]',
                     name,'not found',err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * utility function for removing files
 */
function removePath(path, name){
  return new Promise(function(resolve, reject){
    FileSystem.unlink(path, function(err){
      if (err){
        logger.error('[removePath] error removing',name,'at',path,err);
        reject(err);
      } else {
        logger.debug('[removePath] removed',name);
        resolve();
      }
    });
  });
}
