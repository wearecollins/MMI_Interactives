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
