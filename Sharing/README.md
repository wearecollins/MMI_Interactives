This Node.js® server posts videos and photos to the Museum's Facebook and Tumblr pages.

0. [dependencies](#dependencies)
0. [setup](#setup)
  0. [platform authentication](#platform-authentication)
    1. [facebook](#facebook)
    2. [tumblr](#tumblr)
0. [configuration](#configuration)
  1. [config.json](#configjson)
  2. [facebookToken.json](#facebooktokenjson)
  3. [tumblrToken.json](#tumblrtokenjson)
0. [Running](#running)
  0. [Endpoints](#endpoints)
0. [Troubleshooting](#troubleshooting)

# dependencies
developed/tested/used with

* Node.js
  - 5.9.1 
  - 4.3.1
* npm 
  - 3.7.3
* -nix OS
  - Ubuntu 14.04
  - OSX 10.11
* [Facebook app](https://developers.facebook.com/apps/) setup directions [below](#facebook)
* [Tumblr app](https://www.tumblr.com/oauth/apps) setup directions [below](#tumblr)
* server for serving images and videos to the internet
  - [ngrok](ngrok)

# setup
This webservice requires a lot of setup. You need to authenticate against
each network you want to post to, and set up a server to be able to serve
media to the internet.

1. `npm install` to download all Node.js dependencies
2. go through [Platform Authentication](#platform-authentication)

## platform authentication
First we need to set up the ability to post media to Tumblr and Facebook.
These instructions were current as of May 2016.

1. Set up a Facebook App ([below](#facebook)) and Tumblr App ([below](#tumblr))
2. Follow the instructions for the [Token Fetching Service](fetchToken/)

### facebook
You will need a [Facebook App](https://developers.facebook.com/apps/) to be
able to post to Facebook. The app needs to either be:

* public (requires Facebook review since we need 
the *pages_show_list*, *manage_pages*, and *publish_pages* permissions)
* have the user that will be used to post assigned a Role 
(_Administrator_, _Developer_, or _Tester_) in the App

The URL for accessing the server used for setting up authentication
needs to be listed in the _App Domains_ list 
and set up as the _Site URL_ for a Website Platform associated with the App.
Both these settings are accessible in the _Basic_ section of the
_Settings_ tab of your Facebook App. [Screenshot](facebook_app.jpg)

Enter the Facebook App's ID and Secret into [config.json](#configjson)

### tumblr
You will need a [Tumblr app](https://www.tumblr.com/oauth/apps) to be 
able to post to Tumblr. 

The URL for accessing the server used for setting up authentication needs to 
be set up as the _Default callback URL_ of the Tumblr App. [Screenshot](tumblr_app.jpg)

Enter the Tumblr App's Key and Secret into [config.json](#configjson)

# configuration

## config.json
configuration settings go in config.json. 
A sample is in [config.json.sample](config.json.sample) with sensitive data removed.

* **processInterval** number of milliseconds between processing the queue of media to post
* **maxAttempts** the number of consecutive upload failures for any particular item before it is removed from the queue.
* **media**
  - **localpath** the relative path from [server.js](server.js) to the directory where the media files are served from
  - **netpath** the web address used to reach the media files
* **facebook**
  - **app** details of the Facebook App being used for posting
    * **id** the App ID
    * **secret** the App Secret
* **tumblr**
  - **app** details of the Tumblr App being used for posting
    * **key** OAuth consumer key
    * **secret** OAuth consumer secret

### notes

For both **media.localpath** and **media.netpath** 
the _filename_ that is supplied to the sync webservice 
is simply concatenated to the end. 
Lets assume **media.localpath** is `"../../media/"` 
and **media.netpath** is `"http://www.movingimage.us/muppets/"`, 
then the filename _performance/video.mp4_ will result in 
_../../media/performance/video.mp4_ 
and _http://www.movingimage.us/muppets/performance/video.mp4_. 
If your server configuration is such that simple concatenation 
is not appropriate, extra development will be necessary.

## facebookToken.json
This file should not be created or edited manually. Use the [fetchToken](fetchToken/) app to create this file.

* **page** details for the page to post media to
  - **token** long-live token for authenticating requests
  - **id** the Facebook ID of the page
* **album** _optional_ details for the album to post photos to
  - **id** the Facebook ID of this album
* **videoList** _optional_ details for the video list to post videos to
  - **id** the Facebook Id of this video list

## tumblrToken.json
This file should not be created or edited manually. Use the [fetchToken](fetchToken/) app to create this file.

* **accessToken** the Tumblr access token to use for authenticating requests
* **accessSecret** the associated token secret for authenticating requests
* **blog** the name of the blog to post to

# Running

start this server with `npm start`.
It will start an HTTP server on port 8013. 
The Sharing server itself does not need to be accessible from the internet, 
but the media files you want to post will need to be.

In production this will probably be set up to start on boot using Upstart 
or init.d in which case you will configure those services to execute 
`/PATH/TO/node /PATH/TO/REPO/Sharing/server.js ./config.json` 
where _/PATH/TO/node_ can be determined by running `which node`.

If the computer you are working from cannot serve files to the internet, 
you can use ngrok and a static server to open a tunnel to the media directory 
(**media.localpath** in _config.json_). 
Follow the instructions in [#setup-ngrok]() 

## endpoints

* **POST /video** In order to upload Videos, 
post the filename (relative to **media.localpath** in _config.json_) 
of the video to `/video` like so: 
`curl --data "filename=performance/myvideo.mov" http://localhost:8013/video`
* **POST /photo** In order to upload Photos, 
post the filename (relative to **media.localpath** in _config.json_) 
of the photo to `/photo` like so: 
`curl --data "filename=anythingmuppets/myphoto.png" http://localhost:8013/photo`
* **GET /state** You can check the status of files like so:
`curl http://localhost:8013/state?filename=anythingmuppets/myphoto.png`
  - This endpoint returns a JSON-formatted response: `{"filename":"FILENAME","type":"TYPE","state":"STATE"}`
    * _FILENAME_ will match the queried filename
    * _TYPE_ will be either `photo` or `video`
    * _STATE_ will be either `unknown`, `posting`, `posted`, or `failed`
      - _unknown_ means the file was never submitted for posting, or it has since been deleted from the server.
      - _failed_ means the file failed to post too many times. It can be re-submitted for posting.

# Troubleshooting

* Make sure the media files are accessible from the internet.
* Make sure the **media.localpath** and **media.netpath** values are correct and resolve POST-ed _filename_ values to the correct relative path and internet address.
* Make sure the Sync service is properly and periodically copying files from the touchpoint computers to the server.
* The Sharing server uses [log4js](https://npmjs.com/package/log4js) 
  - The script will normally log to rolling files in the [log/](log/) directory
  - to enable console logging add `{"type":"console"}` to the **appenders** array in [log4js_conf.json](log4js_conf.json)
  - you can change the logging detail by changing the value of **levels.[all]** (and/or any other key in the **levels** object) in [log4js_conf.json](log4js_conf.json) to `"INFO"`, `"DEBUG"`, `"TRACE"`, or `"ALL"`

# setup [ngrok](https://ngrok.com/)

ngrok is used for accessing local servers from the internet. 

An altertative to using ngrok would be to configure the FB App's 
allowed domains to be a domain you own, and host the server at that address.

* download & unzip [ngrok](https://ngrok.com/download)
* create an [ngrok](https://ngrok.com/) account
* following the instructions after you sign in, authenticate the ngrok app using your authtoken
    - eg. `~/Downloads/ngrok authtoken [YOUR AUTHTOKEN HERE]`
