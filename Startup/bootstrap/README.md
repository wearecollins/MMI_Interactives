###Preparation steps
0. make sure the scripts in this directory (primarily bootstrapping.command and visudo_edit.sh) include the appropriate username in the scripts
  - you can get the correct username via `whoami` in the terminal after logging in as the appropriate user
0. copy the contents of this directory to a thumb drive to run on each individual computer as you set it up

###Initial steps to run on each computer
0. manually do initial computer setup using the same username and password for all OSX computers
0. run _01_0_setHostnames.command (double-click) to set the hostname as appropriate
0. run _03_0_bootstrap.command to do all bootstrapping etc.
0. mount the central-server's SAMBA drive on the computer, saving the credentials. Then drag the mounted drive into _Startup Items_ in the OSX Settings to make sure the drive gets mounted on boot
0. clone the repository to _~/Documents/repo_
0. copy a compiled version of the _Frontend_ app to _~/Documents/repo/Frontend/bin/_
0. copy _com.collins.muppets.frontend.plist_ to _~/Library/LaunchAgents/_
0. load plist into launchd: `launchctl load -w /Users/user/Library/LaunchAgents/com.collins.muppets.frontend.plist`
    * If you want to stop running the app, run `launchctl unload /Users/user/Library/LaunchAgents/com.collins.muppets.frontend.plist`
0. install Node.js
0. configure the Sync service as a cron job as specified [here](../../Sync/README.md#setup)
0. configure the computers for automatic shutdown/startup as preferred.
