## Table of Contents

* [Updating Audio](#updating-audio)
* [Updating Videos](#updating-videos)
  - [View-only Videos](#view-only-videos)
  - [Perform-to Videos](#perform-to-videos)
* [Applying Updates](#applying-updates)

# Updating Audio

Voice overs and sound effects are stored in 
`MMI_Interactives/Webserver/static/vo/`.
When updating these with new files, it is important 
to keep the format the same (.mp3) and to keep the name the file the same.

It is fine if you change the length of the clip.

Audio associated with the video clips that people can perform to 
is sourced directly from the video itself.
There are no separate audio files for those.

# Updating Videos

## View-only Videos

Videos that are displayed as part of the user introduction, 
or on the attract screen, 
are stored in `MMI_Interactives/Webserver/static/video/`.

When updating these files, make sure they stay the same format (.mp4)
and keep the same filename as the original video you are replacing.

It is fine if you change the length of the video.

## Perform-to Videos

The video clips that people perform to are stored in two places:

* `MMI_Interactives/Webserver/static/video/`
* `MMI_Interactives/Frontend/bin/Performance.app/Contents/Resources/clips/`

It is important to keep the file format the same (.mp4) 
and to maintain the same filename. 
Changes to video clip length will require additional 
(but simple) updates and testing.

# Applying Updates

It is important to remember that media updates will be overwritten when using the update script to install an updated version of the installation.