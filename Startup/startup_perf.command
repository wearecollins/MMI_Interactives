#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# screen -dmS webserver sh "$DIR/perf_launch.sh"
# sleep 1
# screen -dmS frontend sh "$DIR/frontend_launch.sh"

pids=()
gotsigchld=false
trap '
  if ! "$gotsigchld"; then
    gotsigchld=true
    ((${#pids[@]})) && kill "${pids[@]}" 2> /dev/null
    killall Terminal
  fi
' CHLD

sh "$DIR/perf_launch.sh" & pids+=($!)
sh "$DIR/frontend_p_launch.sh" & pids+=($!)
# sleep 3 & pids+=($!)

set -m
wait
set +m