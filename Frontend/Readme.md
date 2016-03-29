#Frontend
* _Brief_: This application wraps a WebKit frontend, a light webserver, and native code (via openFrameworks) to merge a web-based GUI with advanced functionality such as speaking to industrial cameras and creating videos.

##Setting up
* Download [openFrameworks 0.9.3](http://openframeworks.cc/versions/v0.9.3/of_v0.9.3_osx_release.zip)
* Clone this repository into openFrameworks/apps (including all submodules)
	* ```git clone --recursive https://github.com/wearecollins/MMI_Interactives.git```
* Build in Xcode

##Configuring
* WIP
* This app can be configured to open one or more cameras, using the "cameras.xml" file in Resources
	* Add ```camera`` nodes to the XML to adjust the count, GUID, and other settings (TBD!)
	* Default:
	```
	<settings>
		<camera>
			<guid>b09d0100eefbf3</guid>
		</camera>
		<camera>
			<guid>b09d0100eefc0c</guid>
		</camera>
	</settings>
	```
	* This opens two cameras, with GUIDs of ```b09d0100eefbf3``` and ```b09d0100eefc0c```
* The "web" folder contains a) the webserver and b) all of the content to be served by the app. Its structure is arbitrary, aside for the server script: it expects a node script called ```index.js``` that calls any server functionality that you may require.