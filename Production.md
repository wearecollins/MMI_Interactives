## Table of Contents

1. [Initial Configuration and Install](initial_configuration_and_install)
2. [Upgrade Guide](upgrade_guide)

Instructions for setting up for production.

## Initial Configuration and Install

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
0. **If setting up the _Performance_ interactive**
   1. Install _ffmpeg_
      - Open Terminal, and run the following two lines to install via Homebrew:
        ```
        $ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
        $ brew install ffmpeg
        ```
   1. Create the directory _MMI_Interactives/Webserver/static/output/performance/_
   1. Create the directory _MMI_Interactives/Frontend/bin/data/_
0. Start up the Webserver for the interactive you are setting up
   * For _Design an Anything Muppet_ run `npm start -- --station anythingmuppets`
   * For _Performance_ run `npm start -- --station performance`
0. Make sure your camera(s) are plugged in. You may need to review the [Camera Setup](Frontend/README.md#setup-cameras) instructions to get them configured correctly.
0. Launch the corresponding Frontend app.
   * For _Design an Anything Muppet_ you can simply double-click on _MMI_Interactives/Frontend/bin/AnythingMuppets.app_
   * For _Performance_ you must run `Documents/MMI_Interactives/Frontend/bin/Performance.app/Contents/MacOS/Performance` from the Terminal
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
0. **If you are configuring Performance**:
   1. **If you are using sharing** We need to copy files to the remote drive
      1. Setup remote drive for sharing if that will be enabled for this installation
         1. Mount the central-server's SAMBA drive on the computer, saving the credentials.
         1. Drag the mounted drive into _Login Items_ (in System Preferences -> Users & Groups) to make sure the drive gets mounted on boot
            * Follow [this guide](https://www.tekrevue.com/tip/automatically-connect-network-drive/) if you need help with this step
      1. Configure the Sync service as a cron job as specified in that services [documentation](Sync/README.md#setup)
   1. **If you are not using sharing** We need to make sure the HD doesn't fill up
      1. Copy *Utilities/Keep Last Three.workflow* to *~/Library/Workflows/Applications/Folder Actions*
         * You could run these two commands in Terminal
           1. `mkdir -p ~/Library/Workflows/Applications/Folder\ Actions/` 
           1. `cp -r ~/Documents/MMI_Interactives/Utilities/Keep\ Last\ Three.workflow ~/Library/Workflows/Applications/`
      1. Right-click (default is [ctrl]-click) on the *MMI_Interactives/Webserver/static/output/performance/* directory and select _Folder Actions Setup..._
      1. In the _Choose a Script to Attach:_ dialog, select _Keep Last Three.workflow_ and click _Attach_
         * If a long list of available actions does not appear, click the + button on the right half of the _Folder Actions Setup_ screen (next to the _Edit Workflow_ button)
      1. Make sure the _Enable Folder Actions_ toggle is checked
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


## Upgrade Guide

When a new release is provided, there are a few steps to setting it up.

1. Close the running interactive
   * If the interactive is running via Launchd:
     1. In Finder, navigate to _~/Library/LaunchAgents/_
     2. Move the _com.mmi...plist_ file to the Desktop
     3. Log out and log back in
     4. Now the interactive should not be running
2. Backup your existing MMI_Interactives directory
   * I suggest moving it to the desktop and labelling it with a date
3. Download and unzip the new release
4. Copy the new release so it is in _~/Documents/_
5. If you made custom camera adjustments in the previous release, copy those settings over
   * In Terminal you can run `cp ~/Desktop/MMI_BACKUP_DIRECTORY/Frontend/bin/Performance.app/Contents/Resources/*.xml ~/Documents/MMI_Interactives/Frontend/bin/Performance.app/Contents/Resources/`
     - Replace `~/Desktop/MMI_BACKUP_DIRECTORY/` with the particular path to your backup
     - for the Build an Anything Muppet interactive, replace `Performance.app` with `AnythingMuppets.app`
6. Install necessary components for the Webserver
   1. Open Terminal
   2. `cd ~/MMI_Interactives/Webserver`
   3. `npm install`
7. Move _com.mmi...plist_ from the Desktop back to _~/Library/LaunchAgents/_
8. Log out and log back in
