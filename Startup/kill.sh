#!/bin/bash

screen -X -S webserver quit
PROCESS=$(screen -ls |grep frontend)
kill -9 $(pgrep -f 'Frontend' | awk '{print $1}')

