var share_perf = function(data, configHandler){

	var currentData = {
		"videos":[
		]
	}
	
	window.addEventListener("perfData", updateData);

	// performance comes in as Array
	function updateData(e) {
		var paths = configHandler.get('additionalStatic', [{"diskPath":"", "webPath":"/media"}]);
		var base_path  = paths[0].webPath + "/performance";

		var videoList = e.detail;
		videoList.reverse();
		
		currentData.videos = [];
		for ( var i in videoList ){
			var path = videoList[i];
			var thumb = "";
			var th_split = path.split(".");
			for ( var i=0; i<th_split.length-1; i++){
				thumb += th_split[i] + ".";
			}

			thumb += "png";

			var ext  = path.split(".");
			ext = ext[ext.length-1];
			if ( ext == "mp4"){// fmt = AM_2-2016-04-26-16-31-29-705.mp4
				var base  = path.split(".")[0];
				var ts = base.split("-");
				var name = "Performance";
				if (ts[0].indexOf("_") >= 0 ){
					name = ts.shift().replace("_"," ");
				} else {
					name = ts.shift();
				}

				var am = ts[3] <= 11;
				if ( !am ){
					ts[3] -= 12;
				}
				var timestamp = "" + ts[1] +"/" + ts[2] +"/" + ts[0] +" " + ts[3]+":"+ts[4] + (am ? "AM" : "PM");
				var obj = {
					"timestamp":timestamp,
					"video": base_path + "/" + path,
					"thumb": base_path + "/" + thumb,
					"path": path,
					"name": name
				}
				currentData.videos.push(obj);
			}
		}

		reloadList();
	}


	function selectShare(evt) {
		// listening on next frame!
		window.events.dispatchEvent(new Event('next'));
	}

	this.enter = function(/*evt*/){
		whichVideo = 0;
		// scroll to top
		var container = document.getElementById("perfContainer");
		container.scrollTop = 0;

		window.addEventListener("selectPerf", selectShare);

		var videos = document.querySelectorAll(".srVideo");
		for ( var i=0; i<videos.length; i++ ){
			// setTimeout(function(v){v.play()}, 0, videos[i]);
		}
		playVideo(videos[0]);

		// this was an idea, but it didn't work so well...
		//container.addEventListener("scroll", onScroll);
	};

	var currentVideo = null;
	var currentImage = null;

	function playVideo( video ){
		if ( currentVideo === video ){
			currentVideo.play();
			return;
		}

		if (currentVideo !== null ){
			currentVideo.pause();
			currentVideo.style.visibility = "hidden";
			currentVideo.style.display = "none";
			currentVideo.autoplay = false;
			currentImage.style.visibility = "visible";
			currentImage.style.display = "block";
		}
		currentImage = document.getElementById(video.id+"_thumb");
		currentVideo = video;
		currentImage.style.visibility = "hidden";
		currentImage.style.display = "none";
		currentVideo.style.visibility = "visible";
		currentVideo.style.display = "block";
		currentVideo.load();
		currentVideo.play();
	}

	function ofMap(value, inputMin, inputMax, outputMin, outputMax, clamp) {
		outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
	
		if( clamp ){
			if(outputMax < outputMin){
				if( outVal < outputMax )outVal = outputMax;
				else if( outVal > outputMin )outVal = outputMin;
			}else{
				if( outVal > outputMax )outVal = outputMax;
				else if( outVal < outputMin )outVal = outputMin;
			}
		}
		return outVal;

	}


	function onScroll(){
		// pick a video and play it
		var c = document.getElementById("perfContainer");

		var scroll = c.scrollTop;

		var videos = document.querySelectorAll(".srVideo");
		var lastVid = videos[videos.length-1].parentElement;
		var videoHeight = lastVid.getBoundingClientRect().bottom - lastVid.getBoundingClientRect().top;
		var videoWidth = lastVid.getBoundingClientRect().right - lastVid.getBoundingClientRect().left;
		
		var max = c.scrollHeight;

		var incX 	= (c.getBoundingClientRect().right / videoWidth);
		var inc 	= Math.ceil(videos.length/incX);
		var whichY = Math.ceil(ofMap(scroll, 0, max, 0,inc, true));
		var whichX = Math.ceil(ofMap(scroll % videoHeight, 0, videoHeight, 0, Math.floor(incX), true));

		var index =  Math.floor( whichX + (whichY * incX) ) ;

		playVideo( videos[index] );
	}

	this.exit = function(/*evt*/){
		document.getElementById("perfContainer").removeEventListener("scroll", onScroll);
		window.removeEventListener("selectPerf", selectShare);

		var videos = document.querySelectorAll(".srVideo");
		for ( var i=0; i<videos.length; i++ ){
			// setTimeout(function(v){v.pause()}, 0, videos[i]);
		}
	};

	function reloadList() {
		var container = document.getElementById("perfContainer");

		var templatePromise = Loader.loadHTML('share/share_perf/entries.hbr', currentData);
		templatePromise.
	      then( function resolve(html){
	        container.innerHTML = html;
	      }).
	      catch(function reject(reason){
	        log.warn('AM entries not loaded wah',reason);
	      });
	}
}
