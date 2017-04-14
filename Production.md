Instructions for setting up for production.

0. install OSX, finish setup (setting language and account), and install OS updates
0. Install [Node.js](https://nodejs.org/en/download/)
   - This project has been tested against Node.js 6.10.2 LTS
   - If you would rather use a Node version manager, 
     some of the startup scripts may need to be updated 
     since they assume Node and NPM are in `/usr/local/bin/`
0. Download the latest packaged release from the [Github repo's Releases section](https://github.com/wearecollins/MMI_Interactives/releases)
0. Move the unzipped *MMI_Interactives* directory to *~/Documents/*
   * If you use `git` to fetch the code and compile it yourself, follow the directions in the [Development Documentation](Development.md)
0. Run `sudo spctl --master-disable` in Terminal
   * This enables and selects the _Anywhere_ option under 
     _System Preferences -> Security & Privacy -> Allow apps downloaded from:_
0. Run `xcode-select --install` in Terminal
   * This installs xcode command-line tools
0. Run `npm install` from the *MMI_Interactives/Webserver* directory in Terminal
   * `cd Documents/MMI_Interactives/Webserver` to change the Terminal's working directory to the _Webserver_ directory
0. Start up the Webserver for the interactive you are setting up
   * For _Design and Anything Muppet_ run `npm start -- --station anythingmuppets`
   * For _Performance_ run `npm start -- --station performance`
0. Make sure your cameras are plugged in. You may need to review the [Camera Setup](Frontend/README.md#setup-cameras) instructions to get them configured correctly.
0. Launch the corresponding Frontend app. *MMI_Interactives/Frontend/bin/AnythingMuppets.app* or *MMI_Interactives/Frontend/bin/Performance.app*
0. Test the app, make sure it shows the camera feed correctly.
0. Close the app and the Webserver process
   * [esc] or [cmd+Q] to quit the app
   * [ctrl+C] in Terminal to stop the Webserver process
0. Double-click the _.command_ file in *MMI_Interactives/Startup/* that is used to launch the interactive at startup.
   * For _Design an Anything Muppet_ click *startup_am.command*
   * For _Performance_ click *startup_perf.command*
0. Test the app
0. Close the app
0. **Now we will set up the Frontend to auto-start on boot**
0. Run `sudo launchctl config user path /usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin` in Terminal
   - This fixes the PATH for Launch Agents
0. Ensure that *Startup/bootstrap/_03_2_visudo_edit.sh* includes the appropriate username for the computer you are setting up.
   * Replace `CHANGE_TO_YOUR_USERNAME` with the username of the account you are using
     - You can get the name of the account via `whoami` in the Terminal
   * Be careful not to use a text editor that will replace the quote characters with "smart quotes" when editing this file, otherwise it will break
0. Make *Startup/bootstrap/_03_2_visudo_edit.sh* executable.
   * `chmod +x Startup/bootstrap/_03_2_visudo_edit.sh` in Terminal from the *MMI_Interactives* directory
0. Run *Startup/bootstrap/_01_0_setHostname.command*
   * This will ask you what you want the computer's hostname to be. This step is not strictly necessary
0. Run *Startup/bootstrap/_03_0_bootstrap.command*
0. **If you are configuring Performance**
   0. **If you are using sharing** We need to copy files to the remote drive
      0. Setup remote drive for sharing if that will be enabled for this installation
         0. Mount the central-server's SAMBA drive on the computer, saving the credentials.
         0. Drag the mounted drive into _Login Items_ (in System Preferences -> Users & Groups) to make sure the drive gets mounted on boot
         - Follow [this guide](https://www.tekrevue.com/tip/automatically-connect-network-drive/) if you need help with this step
      0. Configure the Sync service as a cron job as specified in that services [documentation](Sync/README.md#setup)
   0. **If you are not using sharing** We need to make sure the HD doesn't fill up
      0. Copy *Utilities/Keep Last Three.workflow* to *~/Library/Workflows/Applications/Folder Actions*
         * You could run these two commands in Terminal
           0. `mkdir -p ~/Library/Workflows/Applications/Folder\ Actions/` 
           1. `cp -r ~/Documents/MMI_Interactives/Utilities/Keep\ Last\ Three.workflow ~/Library/Workflows/Applications/`
      0. Right-click (default is [ctrl]-click) on the *Webserver/static/output/performance/* directory and select _Folder Actions Setup..._
      0. In the _Choose a Script to Attach:_ dialog, select _Keep Last Three.workflow_ and click _Attach_
         * If a long list of available actions does not appear, click the + button on the right half of the _Folder Actions Setup_ screen (next to the _Edit Workflow_ button)
0. Copy the appropriate _Frontend plist_ from *MMI_Interactives/Startup/bootstrap/* to _~/Library/LaunchAgents/_
   - You may need to create the _LaunchAgents_ directory
   - It is important that the plist is in the **User's** _LaunchAgents_ directory rather than the system-wide _LaunchAgents_ directory
   - Edit the executable path inside the plist (`/Users/install/Documents/...`) to match your user account
   - Anything Muppets: _com.mmi.am.plist_
   - Performance for the Screen: _com.mmi.perf.plist_
0. Configure the computer for automatic shutdown/startup as preferred.
   - This step is optional
0. reboot computer
   - This is necessary to load the new PATH into launchd, and launch the Frontend


