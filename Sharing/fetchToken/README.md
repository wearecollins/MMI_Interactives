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
  - if your network does not make this possible, I suggest using [ngrok](../../Readme.md#using-ngrok)

# setup

0. Ensure your server has a publicly-accessible URL
  - The token-fetching server binds to port 8012. Make sure requests are forwarded to the appropriate port before continuing.
  - If your computer or network configuration make this impractical, read through [using ngrok](../Readme.md#using-ngrok). You will want to start ngrok and keep it running until the entire token fetching process is done, or else you will be assigned a new random **Public URL** and have to edit your Facebook/Tumblr Apps to reflect the new URL.
    * `ngrok http 8012`
1. Go through the [Facebook](../#facebook) and [Tumblr](../#tumblr) setup instructions for the Sharing webservice.
2. run `npm install` in the [parent directory](../) to ensure all Node.js dependencies are downloaded.
3. run `npm run token` from the [parent directory](../). This will start the token-fetching server on port 8012
4. double-check that port 8012 is accessible from the internet. (see first step)
5. confirm that the internet-accessible URL is configured as your App's Domain on both Facebook and Tumblr.
  - If you are using [ngrok](../../Readme.md#using-ngrok), once you run the ngrok command an _http_ address will be listed next to "Forwarding". Use the supplied _http://***.ngrok.io_ address for your Facebook and Tumblr apps.
6. access the Token server in your browser from the internet-accessible URL (not _localhost_ or _127.0.0.1_)
7. follow the prompts to get a Token from Facebook and Tumblr and select the appropriate options for where you want media to be posted.
8. verify that [../facebookToken.json](../facebookToken.json) and [../tumlbrToken.json](../tumblrToken.json) were created. These are the files that contain your selected options and long-live authentication tokens.
9. now you can shutdown the Token server (and ngrok if it is running)

# Troubleshooting

* make sure you run `npm run token` from the _parent directory_, not this directory
* The token server uses [log4js](https://npmjs.com/package/log4js) 
  - The script will normally log to rolling files in the [log/](log/) directory
  - to enable console logging add `{"type":"console"}` to the **appenders** array in [log4js_conf.json](log4js_conf.json)
  - you can change the logging detail by changing the value of **levels.[all]**, **levels.fetchToken**, **levels.facebook**, and/or **levels.tumblr** in [log4js_conf.json](log4js_conf.json) to `"INFO"`, `"DEBUG"`, `"TRACE"`, or `"ALL"`

