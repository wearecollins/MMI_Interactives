###Preparation steps
0. copy the contents of this directory to a thumb drive to run on each individual computer as you set it up

###Initial steps to run on each computer
0. manually do initial computer setup
	* Username: User
	* Password: SecurePassword
0. run _01_0_setHostnames.command (double-click) to set the hostname as appropriate
0. run _03_0_bootstrap.command to do all bootstrapping etc.
0. load plist into launchd: `launchctl load -w /Users/user/Library/LaunchAgents/com.collins.muppets.frontend.plist`
    * If you want to stop running the app, run `launchctl unload /Users/user/Library/LaunchAgents/com.collins.muppets.frontend.plist`
