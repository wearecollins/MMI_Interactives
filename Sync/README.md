This is a Node.js® script which uses rsync to copy files between two directories.

1. [dependencies](#dependencies)
2. [setup](#setup)
   1. [production](#production)
3. [running in development](#running-in-development)
4. [configuration](#configuration)
   1. [Sync configuration file](#sync-configuration-file)
   2. [loop_conf.json](#loop_confjson)
5. [Troubleshooting](#troubleshooting)

# dependencies
developed/tested/used with 

* Node.js
  - 6.10.0 (LTS)
  - 5.9.1 
  - 4.3.1
* npm 
  - 3.10.10
  - 3.7.3
* -nix OS
  - Ubuntu 14.04
  - OSX 10.11
  - OSX 10.12.3

# setup
* `npm install`
* create _configs.json_ based on [configs.json.sample](configs.json.sample)
  - the actual name of the file can be different since it is passed in as a
command-line parameter
  - documentation [below](#configsjson)

## production
This will be set up as a CRON job.

execute `crontab -e` to open the CRON file for editing.
Place this at the bottom of that file to run the Sync script every minute: 

* `* * * * * /PATH/TO/node /PATH/TO/REPO/Sync/index.js RELATIVE/CONFIG.JSON`
  - _/PATH/TO/node_ can be found using `which node`
  - _RELATIVE/CONFIG.JSON_ is the relative path from _index.js_ for the configuration file to use

# running in development
* to run once for testing
  - `npm start` or `node index.js configs.json`
* to run repeatedly for simulating the production setup without editing your crontab
  - `npm run loop` or `node loop.js configs.json`

**note**: _configs.json_ can be any relative path to a config file

# configuration

## Sync configuration file
_index.js_ uses a configuration file. There is a sample included in the 
repository at [configs.json.sample](configs.json.sample). 
The name of the configuration file is provided when you run the script.

* **sync**
  * **source** The source directory to copy files from. This should be an absolute path _with_ a trailing slash.
  * **destination** The directory to copy files to. This should be an absolute path _without_ a trailing slash.
  * **exclude** An array of relative paths (from **sync.source**) to ignore during sync. do not include trailing or leading slashes.
* **cleanup**
  * **mins** Number of minutes to leave files in the _source_ directory before cleaning them up. The modified time is used to determine file age.
  * **exclude** An array of relative paths (from **sync.source**) to ignore during cleanup. do not include trailing or leading slashes.

## loop_conf.json
There is also a configuration file for the loop script. The loop script is meant to be used only in development.

* **intervalMillis** The number of milliseconds between repeated runs of the Sync script.

# Troubleshooting

* The sync script does not handle nested directories. Make sure the _source_ directory does not contain any directories.
* The sync service has not been tested with ssh/remote directories. It is expected that any remote locations will be mounted locally before this script is run.
* The sync script uses [log4js](https://npmjs.com/package/log4js) 
  - The script will normally log to rolling files in the [log/](log/) directory
  - to enable console logging add `{"type":"console"}` to the **appenders** array in [log4js_conf.json](log4js_conf.json)
  - you can change the logging detail by changing the value of **levels.[all]** in [log4js_conf.json](log4js_conf.json) to `"INFO"`, `"DEBUG"`, `"TRACE"`, or `"ALL"`
* The script uses a PID file in this directory to ensure that only one instance of the script is running at a time. Make sure the user that is running the script has read/write access to this directory.
