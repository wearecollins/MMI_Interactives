#!/bin/sh
# from http://blog.pkh.me/p/21-high-quality-gif-with-ffmpeg.html

palette="/tmp/palette.png"

filters="fps=15,scale=307:-1:flags=lanczos"

#-ss sets how many seconds to skip
#-t sets how many seconds to read
#-y will overwrite output file without asking

ffmpeg -v warning -ss 5 -t 3 -i $1 -vf "$filters,palettegen" -y $palette
ffmpeg -v warning -ss 5 -t 3 -i $1 -i $palette -lavfi "$filters [x]; [x][1:v] paletteuse" -y $2