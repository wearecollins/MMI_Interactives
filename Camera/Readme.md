An openFrameworks app which interfaces with cameras and provides a Websocket API and Steam.

This application is used in production as a sub-project of the [Frontend](../Frontend/). You can use this app stand-alone during development and run the user interface in Chrome. See the [development instructions](../Development.md) for details.

When using this application standalone, it loads relevant settings from _bin/data/_. If [`FRONTEND_AM` is defined](src/CameraApp.h#L23) then [settings_am.xml](bin/data/settings_am.xml) will be used, otherwise [settings_perf.xml](bin/data/settings_perf.xml) will be loaded.

# Setup

It is important to set the `group/Folder` setting in the setting xml file(s) to the Webserver's _static_ directory. This will probably be `../../../Webserver/static/output`

# Settings File

## settings_...xml

All settings are grouped under a root node called _group_

* **group**
  - **Performance_or_AM** `0` for Performance mode (save video), `1` for Anything Muppet mode (save image)
  - **Reload_cameras** a GUI trigger for hot-reloading camera configuration. No reason to be anything other than `0`
  - **Discover_cameras** a GUI trigger for discovering cameras plugged in after startup. No reason to be anything other than `0`
  - **Which_camera_top** `0` or `1`, used for selecting which camera is the "top" camera for Performance mode.
  - **ImageStreamer_1** These settings are only applicable in development mode. Streaming is not used in production.
    * **JPEQ_quality** (0-100) the quality of the compressed jpeg for Websocket streaming.
    * **Stream_framerate** number of video frames to send via Websocket per second.
  - **Recording_params**
    * **Camera_switch_interval** number of milliseconds to wait between camera cuts for Performance mode.
    * **Recording_length** number of milliseconds of video to record in Performance mode.
    * **Advanced_params**
      - **Bitrate**
      - **Install_folder** The subfolder (see `/group/Folder`) to save video or image output to when it is selected for keeping. value set in config file does not matter, overridden in Camera to `performance` or `anythingmuppets` based on `/group/Performance_or_AM`
      - **Temp_folder** The subfolder (see `/group/Folder`) to save temporary image or video output.
      - **File_extension** extension to use for video files
      - **Video_codec**
      - **File_extension_image**
  - **Folder** Relative path to the folder to save images and video to. See `group/Recording_params/Advanced_params/Install_folder` and `group/Recording_params/Advanced_params/Temp_folder`.
  - **Stream_which_camera**
