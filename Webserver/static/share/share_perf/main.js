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
		currentData.videos = [];
		for ( var i in videoList ){
			var path = videoList[i];
			var ext  = path.split(".");
			ext = ext[ext.length-1];
			if ( ext == "mp4"){
				// fmt = 2016-04-26-16-31-29-705.mp4
				var ts = path.split(".")[0].split("-");
				var am = ts[3] <= 11;
				if ( !am ){
					ts[3] -= 12;
				}
				var timestamp = "" + ts[1] +"/" + ts[2] +"/" + ts[0] +" " + ts[3]+":"+ts[4] + (am ? "AM" : "PM");
				var obj = {
					"timestamp":ts,
					"video": base_path + "/" + path
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
		window.addEventListener("selectPerf", selectShare);

		var videos = document.querySelectorAll(".srVideo");
		for ( var i=0; i<videos.length; i++ ){
			// setTimeout(function(v){v.play()}, 0, videos[i]);
		}
	};

	this.exit = function(/*evt*/){
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
