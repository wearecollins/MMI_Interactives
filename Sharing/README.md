This Node.js server posts videos and photos to a Page on Facebook.

## configuring

configuration settings go in config.json. 
A sample is in [config.json.sample]() with sensitive data removed.

In order to get the appropriate Access Tokens from Facebook, 
you need to follow the instructions in [#get-tokens]().

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
