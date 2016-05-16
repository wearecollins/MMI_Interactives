#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# screen -dmS webserver sh "$DIR/am_launch.sh"
# sleep 1
# screen -dmS frontend sh "$DIR/frontend_launch.sh"

pids=()
gotsigchld=false
trap '
  if ! "$gotsigchld"; then
    gotsigchld=true
    ((${#pids[@]})) && kill "${pids[@]}" 2> /dev/null
  fi
' CHLD

sh "$DIR/am_launch.sh" & pids+=($!)
sleep 1
sh "$DIR/frontend_am_launch.sh" & pids+=($!)
# sleep 3 & pids+=($!)

set -m
wait
set +m