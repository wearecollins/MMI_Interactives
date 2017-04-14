#!/bin/sh
if [ -z "$1" ]; then
  export EDITOR=$0
  echo "Starting up visudo with $EDITOR as editor"
  visudo
else
  # it seems OSX passes `--` as the first parameter to the visudo editor
  if [ "$1" = "--" ]; then
    FILE=$2
  else
    FILE=$1
  fi
  echo "Appending to $FILE"
  echo "CHANGE_TO_YOUR_USERNAME ALL=(ALL) NOPASSWD: /sbin/shutdown, /usr/bin/pmset" >> $FILE
fi
