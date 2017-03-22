# MMI - The Jim Henson Exhibition

## Table of Contents

1. [Introduction](#Introduction)
   1. [Performance](#performance)
   2. [Anything Muppet](#anything-muppet)
   3. [Sharing Station](#sharing-station)
2. [Setup](#setup)
   1. [Overview](#hardware-overview)
   1. [Production](#production)
3. [Running](#running)
4. [This Folder](#this-folder)

* * *

# Introduction

This repository contains digital portions of a Jim Henson Exhibition for the [Museum of the Moving Image](http://www.movingimage.us/). There are three touchpoints in this repo. They all share a lot of backend infrastructure.

This document will guide you through the overall [setup](#Setup) for the installation, and a general guide to [running](#running) the installation. 

Please see ["This folder"](#this-folder) below for a further guide to other files in this folder.

There are separate Reamde files for each installation (see below) and for setting up a [Development](Development.md) environment.

## Performance

A touchpoint where people are given the chance to learn the Henson performance method. The performance is recorded and the user can retrieve it later from the sharing station. 

Please see the [Performance](Performance.md) guide for details on setting up, running, and troubleshooting the Performance interactive.

## Anything Muppets

A touchpoint where visitors can create a unique Anything Muppet to match a given script. A muppet "blank" is provided with drawers full of eyes, hair, noses, etc. The user can take a picture of their creation and retrieve it later from the sharing station.

Please see the [Anything Muppets](AnythingMuppets.md) guide for details on setting up, running, and troubleshooting the Anything Muppets interactive.

## Sharing Station

An interface for people to find their picture or video and send it to themselves via e-mail.

* * *

# Setup

## Hardware overview

There are 4 computers involved with this whole installation:

* Central Server
  - Serves files to the internet from a _Public Media Directory_
  - Hosts the webserver for the Sharing iPad interface
  - Runs webservices for sending e-mails and posting to MMI&apos;s social network pages
* Anything Muppet Computer
  - Computer that the Anything Muppet touchpoint runs on including
    * Interfacing with industrial camera
    * Hosting webserver for graphic interface
    * Interfacing with 'spin' sensor
    * Syncing pictures to Central Server
* Performance Computer
  - The computer that the Performance touchpoint runs on including
    * Interfacing with two industrial cameras
    * Hosting webserver for graphic interface
    * Syncing videos to Central Server
* Sharing Frontend (iPad/touchscreen)
  - Displays Sharing graphic interface from Central Server

## Production

Follow these general steps for setting up all interactives:

0. Download the latest [release](https://github.com/wearecollins/MMI_Interactives/releases) of this code.
0. Follow the [bootstrapping](Startup/bootstrap/) guide to setup each machine.
1. Setup the [Sharing](Sharing/) webservice on the Central Server
2. Setup the [Performance Frontend](Performance.md) on the Performance computer
3. Setup the [Anything Muppet Frontend](AnythingMuppets.md) on the Anything Muppet computer
5. Setup the [Sync](Sync/) service on both the Performance and Anything Muppet computers
6. Setup the [Share Frontend Webserver](Webserver/README.md#share) on the Central Server
   - including setting up the iPad to be pinned to the Share UI

* * *

# Running

In the bootstrapping steps, you may setup each interactive to run automatically when a user logs in. If not–or to manually run each touchpoint–follow the steps below.

## Anything Muppets
* Double-click the [startup command](Startup/startup_am.command) in Startup/startup_am.command
* This will launch a Terminal window (running the [Webserver](Webserver)) and an instance of the [Anything Muppets Frontend](Frontend)
* You can close the app by quitting the Frontend (command + q OR selecting File/Quit from top menu)

## Peformance
* Double-click the [startup command](Startup/startup_perf.command) in Startup/startup_perf.command
* This will launch a Terminal window (running the [Webserver](Webserver)) and an instance of the [Performance Frontend](Frontend)
* You can close the app by quitting the Frontend (command + q OR selecting File/Quit from top menu)

## Sharing 
* The Sharing app should be running on the Central Server (see 'Hardware Overview' above)
* You can access the Sharing app via a web browser at http://IP.ADDRESS.OF.SERVER:8080
* We recommend pinning this URL to the home screen of your iPad, or setting it as your homescreen (if installation is a touch screen)

* * * 

# This folder
* AM_Input
  - Arduino code for [Adafruit Feather](https://www.adafruit.com/product/2771) interface for Anything Muppet Table
* Camera
  - Stand-alone application for connecting to and streaming cameras for installation
  - Not in use in final installation–recommended only for testing on non-Mac computers
* Frontend
  - Application that bundles a web browser into openFrameworks, shows interactive frontends, and connects to cameras 
* Screenshots
  - Images for documentation
* Sharing
  - Scripts for connecting to Facebook and Tumblr (and information on how to setup/connect to each of these)
* Startup
  - Scripts for bootstrapping and running each machine and touchpoint (respectively)
* Sync
  - Scripts for syncing files from each touchpoint computer to the Central Server
* Utilities
  - Scripts for a) creating a 'Release' zip to be uploaded and b) creating a PDF of Readme documentation
* Webserver
  - All files for application Frontends, including server-side and frontend scripts
  - Does NOT include media files–these are only available via Releases (above) or [Dropbox](https://www.dropbox.com/sh/43la3h7bfgfy4du/AAA9zxHBUFdrLhJ2XLEarvERa?dl=0)
