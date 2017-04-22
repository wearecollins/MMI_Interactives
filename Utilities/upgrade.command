#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $DIR

InstallDir=~/Documents/MMI_Interactives
BackupDir=~/Documents/backup/`date +%Y-%m-%d-%H-%M-%S`

echo ""
echo "move previous installation"
mkdir -p ~/Documents/backup/
mv $InstallDir $BackupDir

echo "copy in new installation"
cp -r $DIR/../ $InstallDir

echo "copy over old Performance.app configs"
rpath=Frontend/bin/Performance.app/Contents/Resources
cp $BackupDir/$rpath/*.xml $InstallDir/$rpath/

echo "copy over old AnythingMuppets.app configs"
rpath=Frontend/bin/AnythingMuppets.app/Contents/Resources
cp $BackupDir/$rpath/*.xml $InstallDir/$rpath/

echo "copy over old Performance web configs"
rpath=Webserver/static/performance/config.json
cp $BackupDir/$rpath $InstallDir/$rpath

echo "copy over old AnythingMuppets web configs"
rpath=Webserver/static/anythingmuppets/config.json
cp $BackupDir/$rpath $InstallDir/$rpath

echo "copy over old Performance attract video"
rpath=Webserver/static/video/perf_attract.mp4
cp $BackupDir/$rpath $InstallDir/$rpath

echo "initialize Webserver"
cd "$InstallDir/Webserver/"
npm install

echo ""
echo "*************************************************"
echo "done!"
echo "Please delete your downloaded copy and configure for launch on login"
