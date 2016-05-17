###Preparation steps
0. Make sure the scripts in this directory (_03_2_visudo_edit.sh) include the appropriate username in the scripts
  - You can get the correct username via `whoami` in the terminal after logging in as the appropriate user
  - Change "CHANGE_TO_YOUR_USERNAME" to your username, e.g. 'install'
  - example, for username 'install':
  - ```  echo "install ALL=NOPASSWD:/sbin/shutdown, /usr/bin/pmset" >> $1```
0. Copy the contents of this directory to a thumb drive to run on each individual computer as you set it up

###Initial steps to run on each computer
0. Manually do initial computer setup using the same username and password for all OSX computers
0. Run ```_01_0_setHostnames.command``` (double-click) to set the hostname as appropriate
0. Run ```_03_0_bootstrap.command``` (double-click) to do all bootstrapping
  - This will set default settings, such as power management, turning off Notification Center, etc.
0. Mount the central-server's SAMBA drive on the computer, saving the credentials.
0. Drag the mounted drive into _Startup Items_ in the OSX Settings to make sure the drive gets mounted on boot
  - Follow [this guide](https://www.tekrevue.com/tip/automatically-connect-network-drive/) if you need help with this step
0. Download all code from the [releases section](https://github.com/wearecollins/MMI_Interactives/releases), and copy to _~/Documents/repo_
  - Note: if setting up via ```git``` instead, you must still download the _media_ directory and copy files into place
0. Copy the appropriate _Frontend plist_ to _~/Library/LaunchAgents/_
  - Anything Muppets: _com.collins.muppets.anythingmuppets.plist_
  - Performance for the Screen: _com.collins.muppets.performance.plist_
0. Install [Node.js](https://nodejs.org/en/download/)
0. Configure the Sync service as a cron job as specified [here](../../Sync/README.md#setup)
0. Configure the computers for automatic shutdown/startup as preferred.
  - This step is optional
0. Launch the interactive by either:
  0. Logging out, then logging back in
  0. Loading plist into launchd: 
    - _AM_: `launchctl load -w /Users/user/Library/LaunchAgents/com.collins.muppets.anythingmuppets.plist`
      * If you want to stop running the app, run `launchctl unload /Users/user/Library/LaunchAgents/com.collins.muppets.anythingmuppets.plist`
    - _Performance_: `launchctl load -w /Users/user/Library/LaunchAgents/com.collins.muppets.performance.plist`
      * If you want to stop running the app, run `launchctl unload /Users/user/Library/LaunchAgents/com.collins.muppets.performance.plist`
