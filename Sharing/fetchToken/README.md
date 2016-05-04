This Node.js® server allows you to fetch tokens from Facebook and Tumblr.
These tokens are necessary to authenticate subsequent request
for posting media to those platforms.

0. [dependencies](#dependencies)
0. [setup](#setup)
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
* [Facebook app](https://developers.facebook.com/apps/) setup directions [here](../#facebook)
* [Tumblr app](https://www.tumblr.com/oauth/apps) setup directions [here](../#tumblr)
* server accessible from the internet.
  - if your network does not make this possible, I suggest using [ngrok](ngrok)

# setup

1. Go through the [Facebook](../#facebook) and [Tumblr](../#tumblr) setup instructions for the Sharing webservice.
2. run `npm install` in the [parent directory](../) to ensure all Node.js dependencies are downloaded.
3. run `npm run token` from the [parent directory](../). This will start the token-fetching server on port 8012
4. ensure that port 8012 is accessible from the internet. If not, I suggest using ngrok to tunnel that port to the internet: `ngrok http 8012`
5. ensure that the internet-accessible URL is configured as your App's Domain on both Facebook and Tumblr.
6. access the Token server in your browser from the internet-accessible URL (not _localhost_ or _127.0.0.1_)
7. follow the prompts to get a Token from Facebook and Tumblr and select the appropriate options for where you want media to be posted.
8. verify that [../facebookToken.json](../facebookToken.json) and [../tumlbrToken.json](../tumblrToken.json) were created. These are the files that contain you selected options and long-live authentication tokens.

now you can shutdown the Token server (and ngrok if it is running)

# Troubleshooting

* make sure you run `npm run token` from the _parent directory_, not this directory
* The token server uses [log4js](https://npmjs.com/package/log4js) 
  - The script will normally log to rolling files in the [log/](log/) directory
  - to enable console logging add `{"type":"console"}` to the **appenders** array in [log4js_conf.json](log4js_conf.json)
  - you can change the logging detail by changing the value of **levels.[all]**, **levels.fetchToken**, **levels.facebook**, and/or **levels.tumblr** in [log4js_conf.json](log4js_conf.json) to `"INFO"`, `"DEBUG"`, `"TRACE"`, or `"ALL"`

