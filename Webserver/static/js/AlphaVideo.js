function AlphaVideo() {
	var bufferCanvas, bufferCtx;
	var outputCanvas, outputCtx;
	var video;
	var pRef, sRef;
	var width, height;

	/**
	 * @param  {String} bufferCanvasID ID of DOM element (real)
	 * @param  {String} outputCanvasID ID of DOM element to be displayed
	 * @param  {String} videoID        ID of video DOM element
	 * @param  {Number} inWidth        Width of video
	 * @param  {Number} inHeight       *Final* height of video
	 */
	this.setup = function( bufferCanvasID, outputCanvasID, videoID, inWidth, inHeight ) {
		width = inWidth,
		height = inHeight;

		// get stuff from DOM
		video = document.getElementById( videoID );
		bufferCanvas = document.getElementById(bufferCanvasID),
		bufferCtx = bufferCanvas.getContext('2d'),
		outputCanvas = document.getElementById(outputCanvasID),
		outputCanvas.width = inWidth, 
		outputCanvas.height = inHeight,
		outputCanvas.setAttribute("width", inWidth),
		outputCanvas.setAttribute("height", inHeight),
		outputCtx = outputCanvas.getContext('2d'),
		pRef = this.update.bind(this),
		sRef = this.stop.bind(this);
	}

	var _onEnded = null;
	var looping	 = false;

	this.play = function( onEnded, loop ){
		video.play();
		looping = (loop === undefined ? false : loop);
		// video.addEventListener( "ended", onEnded );
		if (!looping)
			video.addEventListener( "ended", sRef );

		_onEnded = onEnded;
		window.requestAnimationFrame(pRef);
	}

	this.update = function(){
	    bufferCtx.drawImage(video, 0, 0);
	    var image = bufferCtx.getImageData(0, 0, width, height);

	    var imageData = image.data;
	    var alphaData = bufferCtx.getImageData(0, height, width, height).data;
	 
	    for (var i = 3, len = imageData.length; i < len; i = i + 4) {
	    	imageData[i] = alphaData[i-1];
	    }
	 
		outputCtx.putImageData(image, 0, 0, 0, 0, width, height);
		
		// failsafe to check against 'ended' not firing
		if ( video.currentTime > 1.0 ){
			if ( looping ){
				video.currentTime = 0;
			} else {
				this.stop();
				return;
			}
		}

		window.requestAnimationFrame(pRef);
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
		window.cancelAnimationFrame(pRef);
	}
}