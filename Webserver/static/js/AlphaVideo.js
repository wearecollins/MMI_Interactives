function AlphaVideo() {
    var bufferCanvas, bufferCtx;
    var outputCanvas, outputCtx;
    var video;
    var pRef, sRef;
    var width, height;
    var overlaidAlpha;
    var dropshadowX, dropshadowY;
    var animFrameID;

    /**
     * @param  {String}  bufferCanvasID ID of DOM element (real)
     * @param  {String}  outputCanvasID ID of DOM element to be displayed
     * @param  {String}  videoID        ID of video DOM element
     * @param  {Number}  inWidth        Width of video
     * @param  {Number}  inHeight       *Final* height of video
     * @param  {Boolean} _overlaidAlpha False if the alpha channel 
     *   is present as a second video below the first
     * @param  {Number}  _dropshadowX   X-offset for programmatic dropshadow.
     *   doesn't work for negative values.
     * @param  {Number}  _dropshadowY   Y-offset for programmatic dropshadow.
     *   doesn't work for negative values.
     */
    this.setup = function( bufferCanvasID, outputCanvasID, videoID, inWidth, inHeight, _overlaidAlpha, _dropshadowX, _dropshadowY ) {
        width = inWidth,
        height = inHeight;
        overlaidAlpha = _overlaidAlpha || false;
        dropshadowY = Math.abs(_dropshadowY || 0);
        dropshadowX = Math.abs(_dropshadowX || 0);

        // get stuff from DOM
        video = document.getElementById( videoID );
        bufferCanvas = document.getElementById(bufferCanvasID),
        bufferCtx = bufferCanvas.getContext('2d'),
        outputCanvas = document.getElementById(outputCanvasID),
        outputCanvas.width = inWidth, 
        outputCanvas.height = inHeight,
        outputCanvas.setAttribute("width", inWidth + dropshadowX),
        outputCanvas.setAttribute("height", inHeight + dropshadowY),
        outputCtx = outputCanvas.getContext('2d'),
        pRef = this.update.bind(this),
        sRef = this.stop.bind(this);
    }

    var _onEnded = null;
    var looping  = false;

    this.play = function( onEnded, loop ){
        video.play();
        looping = (loop === undefined ? false : loop);
        // video.addEventListener( "ended", onEnded );
        if (!looping)
            video.addEventListener( "ended", sRef );

        _onEnded = onEnded;
        animFrameID = window.requestAnimationFrame(pRef);
    }

    this.update = function(){
        bufferCtx.drawImage(video, 0, 0);
        var image = 
            bufferCtx.getImageData(0, 
                                   0, 
                                   width + dropshadowX, 
                                   height + dropshadowY);

        var imageData = image.data;
        var alphaData;
        if (overlaidAlpha){
            alphaData = bufferCtx.getImageData(0, 0, width, height).data;
        } else {
            alphaData = bufferCtx.getImageData(0, height, width, height).data;
        }

        //migrate one component of the source video to the alpha layer
        for (var sourceY = 0; sourceY < height; sourceY++){
            for(var sourceX = 0,
                    sourceI = sourceY * width * 4 + 2,
                    destI = sourceY * (width + dropshadowX) * 4 + 3;
                sourceX < width;
                sourceX++,
                sourceI+=4,
                destI+=4){
                imageData[destI] = alphaData[sourceI];
            }
        }

        //if we are programmatically adding dropshadow,
        // then go through the image again and offset the alpha
        if (dropshadowX || dropshadowY){
            var dsOffset = (((dropshadowY * 
                              (width + dropshadowX)) + 
                             dropshadowX) * 
                            4);
            for (var sourceY = 0; sourceY < height; sourceY++){
                for(var sourceX = 0,
                        sourceI = sourceY * width * 4 + 2,
                        destI = ((((sourceY + dropshadowY) * 
                                   (width + dropshadowX)) +
                                  dropshadowX) * 
                                 4) + 
                                3;
                    sourceX < width;
                    sourceX++,
                    sourceI+=4,
                    destI+=4){
                    //we don't want to overwrite positive space
                    imageData[destI] = 
                        Math.max(alphaData[sourceI], imageData[destI]);
                }
            }
        }
     
        //extra parameters are optional, and not necessary in our case
        outputCtx.putImageData(image, 
                               0, 0);/*, 
                               0, 0, 
                               width + dropshadowX, 
                               height + dropshadowY);*/
        
        // // failsafe to check against 'ended' not firing
        // if ( video.currentTime > 1.0 ){
        //  if ( looping ){
        //      video.currentTime = 0;
        //  } else {
        //      this.stop();
        //      return;
        //  }
        // }

        animFrameID = window.requestAnimationFrame(pRef);
    }

    this.stop = function(){
        if ( _onEnded != null ){
            _onEnded();
        }
        _onEnded = null;
        
        // video.removeEventListener( "ended", _onEnded );
        video.removeEventListener( "ended", sRef );

        video.pause();
        video.currentTime = 0;
        window.cancelAnimationFrame(animFrameID);
    }
}