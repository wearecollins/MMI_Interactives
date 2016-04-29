var share_am = function(data, configHandler){

	var currentData = {
		"images":[
		]
	}

	window.addEventListener("amData", updateData);

	function isImage( str ){
		str = str.toLowerCase();
		return (str == "jpg" || str == "png" || str == "jpeg" || str == "gif");
	}

	// performance comes in as Array
	function updateData(e) {
		var paths = configHandler.get('additionalStatic', [{"diskPath":"", "webPath":"/media"}]);
		var base_path  = paths[0].webPath + "/anythingmuppets";

		var videoList = e.detail;
		currentData.images = [];
		for ( var i in videoList ){
			var path = videoList[i];
			var ext  = path.split(".");
			ext = ext[ext.length-1];
			if ( isImage( ext ) ){
				// fmt = 2016-04-26-16-31-29-705.mp4
				var ts = path.split(".")[0].split("-");
				var am = ts[3] <= 11;
				if ( !am ){
					ts[3] -= 12;
				}
				var timestamp = "" + ts[1] +"/" + ts[2] +"/" + ts[0] +" " + ts[3]+":"+ts[4] + (am ? "AM" : "PM");
				var obj = {
					"timestamp":ts,
					"image": base_path + "/" + path,
					"path": path
				}
				currentData.images.push(obj);
			}
		}

		reloadList();
	}


	function selectShare(evt) {
		// listening on next frame!
		window.events.dispatchEvent(new Event('next'));
	}

	this.enter = function(/*evt*/){
		window.addEventListener("selectAM", selectShare);
	};
	this.exit = function(/*evt*/){
		window.removeEventListener("selectAM", selectShare);
	};

	function reloadList() {
		var container = document.getElementById("amContainer");

		var templatePromise = Loader.loadHTML('share/share_am/entries.hbr', currentData);
		templatePromise.
	      then( function resolve(html){
	        container.innerHTML = html;
	      }).
	      catch(function reject(reason){
	        log.warn('AM entries not loaded wah',reason);
	      });
	}
}
