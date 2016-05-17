#!/bin/sh
if [ -z "$1" ]; then
  echo "Starting up visudo with this script as first parameter"
  export EDITOR=$0 && sudo -E visudo
else
  echo "Changing sudoers"
  echo "CHANGE_TO_YOUR_USERNAME ALL=NOPASSWD:/sbin/shutdown, /usr/bin/pmset" >> $1
fi
