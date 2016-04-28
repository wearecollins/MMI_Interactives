This is a Nodejs script which uses rsync to copy files between two directories.

# setup
* `npm install`
* create [config.json]() based on [config.json.sample]()

# running
`npm start`

This will be set up as a CRON job via `crontab -e`, 
probably to run every minute:

`* * * * * /PATH/TO/node /PATH/TO/REPO/Sync/index.js`

where /PATH/TO/node can be found using `which node`
