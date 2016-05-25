//standard libraries
var Path = require('path');
var FileSystem = require('fs');
//external dependencies
var Logger = require('log4js');
var PID = require('daemon-pid');
var Rsync = require('rsync');

//get configs
var configs = require(Path.join(__dirname, process.argv[2]));

//set up logger
Logger.configure(require(Path.join(__dirname, 'log4js_conf.json')));
var logger = Logger.getLogger('Sync');

//check if a previous process is already running
var pid = PID(Path.join(__dirname, 'process.pid'));
pid.running(function(err, running/*, data*/){
  if (running){
    logger.warn('[checkRunning] process still running, exiting');
  } else {
    logger.debug('[checkRunning] process not running');
    writePID();
  }
});

//if it is not, declare this process as the active one
function writePID(){
  pid.write(function(err){
    if (err){
      logger.error('[writePID] error while creating PID file', err);
      if (err.code === 'EEXIST'){
        logger.info('[writePID] removing stale PID file');
        pid.delete(function(err){
          if (err){
            logger.error('[writePID] error deleting stale file',err);
          } else {
            logger.debug('writePID] removed stale file');
            writePID();
          }
        });
      }
    } else {
      logger.debug('[writePID] created PID file');

      checkAccessibility();
    }
  });
}

//check that both source and destination are accessible
function checkAccessibility(){
  Promise.all([checkPathAccessibility(configs.sync.source, 
                                      'source directory'), 
               checkPathAccessibility(configs.sync.destination, 
                                      'destination directory')]).
    then(function resolved(/*results*/){
      logger.debug('[checkAccessibility] directories accessible');
      cacheLatest();
    },
    function rejected(/*reason*/){
      finish();
    });
}

/**
 * @returns {Promise<[string]>}
 */
function getFileList(basePath, excludePaths, relativePath){
  relativePath = relativePath || '';
  excludePaths = excludePaths || [];
  var fullPath = Path.join(basePath, relativePath);
  return new Promise(function (resolve/*, reject*/){
    var files = [];
    FileSystem.readdir(fullPath, function(err, filenames){
      if (err){
        logger.error('[getFileList] error getting',fullPath,'listing', err);
        resolve(files);
      } else {
        logger.debug('[getFileList]',fullPath,'has',
                     filenames.length,'contents');
        var statPromises = [];
        var subdirPromises = [];
        filenames.forEach(function(filename){
          var relativeFilename = Path.join(relativePath, filename);
          statPromises.push(new Promise(function(resolve/*, reject*/){
            FileSystem.stat(
              Path.join(basePath, relativeFilename), 
              function(err, stats){
                if (err){
                  logger.error('[getFileList] error getting file', 
                               relativeFilename,'stats',err);
                } else {
                  if (stats.isFile()){
                    files.push({filename: relativeFilename,
                                modified: stats.mtime.getTime()});
                  } else if (stats.isDirectory()){
                    if (excludePaths.indexOf(relativeFilename) >= 0){
                      logger.debug('[getFileList] excluding',relativeFilename);
                    } else {
                      subdirPromises.push(
                        getFileList(basePath, 
                                    excludePaths,
                                    Path.join(relativePath, filename)));
                    }
                  } else {
                    logger.debug('[getFileList]',
                                 relativeFilename,'not file or directory');
                  }
                }
                resolve();
              });
          }));
        });
        Promise.all(statPromises).
          then(() => Promise.all(subdirPromises)).
          then( subFilenames => files.concat.apply(files, subFilenames)).
          then( allFiles => resolve(allFiles)).
          catch( reason => {
            logger.error('[getFileList] problem resolving',reason);
            resolve(files);
          });
      }
    });
  });
}

//cache file info
var files = [];
function cacheLatest(){
  getFileList(configs.sync.source, configs.sync.exclude).
    then( function(fileList){
      logger.debug('[cacheLatest] sorting',fileList.length,'file stats');
      files = fileList;
      //sort files most recent first
      files.sort(function(a, b){
        return b.modified - a.modified;
      });
      doRsync();
    });
}

//rsync files
function doRsync(){
  var rsync = new Rsync();
  rsync.
    source(configs.sync.source).
    destination(configs.sync.destination).
    recursive().
    quiet();

  if (configs.sync.exclude){
    rsync.exclude(configs.sync.exclude);
  }

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
    logger.info('[checkCopy] no files to check');
    removeOld();
  } else {
    checkPathAccessibility(
        Path.join(configs.sync.destination, files[0].filename), 
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
  var oldest = new Date().getTime() - configs.cleanup.mins * 60000;
  getFileList(configs.sync.source, configs.cleanup.exclude).
    then( function(files){
      logger.debug('[removeOld] checking',files.length,'files');
      var promises = [];
      files.forEach(function(item){
        if (item.modified < oldest){
          promises.push(removePath(Path.join(configs.sync.source, 
                                             item.filename), 
                                   item.filename).
            then(() => numRemoved++,
                 () => {/*convert failed promises to resolved promises*/}));
        }
      });
      Promise.all(promises).
        then(() => {
          logger.info('[removeOld] removed',numRemoved);
          finish();
        },
        () => logger.error(
                '[removeOld] Promises should not be able to reject'));
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
