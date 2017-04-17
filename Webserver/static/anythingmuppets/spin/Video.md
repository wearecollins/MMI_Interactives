For the spinning arrow, we had a 600x600 video that I wanted to add dropshadow to.

At first I did this programmatically, but it seemed to have a lot of extra logic
to handle the dropshadow with out wrapping. I realized I could construct
a new clip with the necessary alpha layer using ffmpeg:

In the following commands, we use `-vb 20M` to keep the bitrate high and compression to a minimum so we don't get any artifacts.

1. first offset the video
   * `ffmpeg -i arrow_ccw.mp4 -vb 20M -filter:v "crop=594:585:6:15" arrow_ccw_off.mp4`
1. then pad the offset video back to full size
   * `ffmpeg -i arrow_ccw_off.mp4 -vb 20M -vf pad=600:600:0:0 arrow_ccw_off_pad.mp`
1. now create the alpha layer to expose the content AND the shadow
   * `ffmpeg -i arrow_ccw.mp4 -i arrow_ccw_off_pad.mp4 -vb 20M -filter_complex "blend=all_mode='or'" arrow_ccw_or.mp`
1. and stack the videos to match the format expected by the AlphaVideo class
   * `ffmpeg -i arrow_ccw_off_pad.mp4 -i arrow_ccw_or.mp4 -vb 20M -filter_complex vstack arrow_ccw_stacked.mp4`
     - note we are using `_off_pad` as the visible content