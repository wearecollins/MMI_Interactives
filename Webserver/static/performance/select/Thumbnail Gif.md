I used ffmpeg to generate GIFs from the sample videos. Hopefully the GIFs will be lower impact on loading/processing and will improve performance in the OSX Web View.

you can just run `./gifenc.sh [video_name] [gif_name]`


details:
* Low-Fi version -- Uses default color map
  * `ffmpeg -ss 5 -t 3 -i horse_named_bill.mp4 -vf fps=15,scale=307:-1 horse_named_bill.gif`
* Hi-Fi version -- Uses custom color map
  1. Generate a color palette
     * `ffmpeg -y -ss 5 -t 3 -i horse_named_bill.mp4 -vf fps=15,scale=307:-1:flags=lanczos,palettegen palette.png`
       - `-ss 5` means to start 5 seconds into the video clip
       - `-t 3` means to capture 3 seconds of video footage
       - `-ss` and `-t` are input arguments because they appear before `-i`
  1. Generate the GIF
     * `ffmpeg -ss 5 -t 3 -i horse_named_bill.mp4 -i palette.png -filter_complex "fps=15,scale=307:-1:flags=lanczos[x];[x][1:v]paletteuse" horse_named_bill.gif`