#!/bin/bash
#
# This script makes a 'release' zip, zipping all 
# compiled files but ignoring logs, sharing configs,
# and output files

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEST="$DIR/.."

cd "$DIR/../../"

SRC="MMI_Interactives/"

# CMD="zip -r Interactives.zip $SRC -x $DOTS $M_SHARE $C_SHARE $F_SHARE $T_SHARE $M_SYNC $L_SYNC $M_WS $MED_WS $L_WS"

CMD="zip -r Interactives.zip $SRC -x@$DIR/exclude.lst"

$CMD
# echo $CMD