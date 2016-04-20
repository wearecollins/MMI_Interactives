#!/bin/bash

#This is Brett's wack startup script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

screen -dmS webserver sh "$DIR/am_launch.sh"
sleep 1
screen -dmS frontend sh "$DIR/frontend_launch.sh"