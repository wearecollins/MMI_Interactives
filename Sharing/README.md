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

## platform authentication
First we need to set up the ability to post media to Tumblr and Facebook.
These instructions were current as of May 2016.

First you need to set up a Facebook App ([below](#facebook)) and Tumblr App ([below](#tumblr))

Make sure when the authorization server is running, it will be accessible 
from the internet. If your network is not configured to allow your 
computer to be accessible from the internet, 
I suggest using ngrok to provide an internet-accessible tunnel to the 
Node.js server.

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
_Settings_ tab of your Facebook App.

Enter the Facebook App's ID and Secret into [config.json](#configjson)

### tumblr
You will need a [Tumblr app](https://www.tumblr.com/oauth/apps) to be 
able to post to Tumblr. 

The URL for accessing the server used for setting up authentication needs to 
be set up as the _Default callback URL_ of the Tumblr App.

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

In order to get the appropriate Access Tokens from Facebook, 
you need to follow the instructions in [#get-tokens]().

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

## usage

start this server with `npm start` (after `npm install`-ing dependencies). 
It will start an HTTP server on port 8013.

In order to upload Videos, post the _publicly-accessible_ url of the video to 
`/video` like so: 
`curl --data "url=http://momi-auth.ngrok.io/myvideo.mov" http://localhost:8013/video`

In order to upload Photos, post the _publicly-accessible_ url of the photo to
`/photo` like so: 
`curl --data "url=http://momi-auth.ngrok.io/myphoto.png" http://localhost:8013/photo`

If the computer you are working from cannot serve files to the internet, 
you can use ngrok and a static server to open a tunnel to the media directory 
(configured in config.json). 
Follow the instructions in [#setup-ngrok]() 
and [#startup-ngrok]() to get it running.

## get tokens

### setup [ngrok](https://ngrok.com/)

ngrok is used for accessing local servers from the internet. 

An altertative to using ngrok would be to configure the FB App's 
allowed domains to be a domain you own, and host the server at that address.

* download & unzip [ngrok](https://ngrok.com/download)
* create an [ngrok](https://ngrok.com/) account
* following the instructions after you sign in, authenticate the ngrok app using your authtoken
    - eg. `~/Downloads/ngrok authtoken [YOUR AUTHTOKEN HERE]`

### startup the token-fetching server

from the same directory as this README:

* `npm install`
* `npm run token`

### startup ngrok

* `~/Downloads/ngrok http -subdomain=momi-auth 8012`
    - you need to register for an account in order to use the `-subdomain` flag

### authenticate

Authenticate the FB App, and select the Page/Album/Video List to upload to

* visit [http://momi-auth.ngrok.io/]()
* once you reach the Thank You screen, 
you can shutdown the ngrok and the server
