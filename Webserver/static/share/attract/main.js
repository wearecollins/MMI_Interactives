var attract = function(data, configHandler){
	
	// rate at which to refresh all data
	var lastRefreshed = 0;//Date().now();
	var refreshRate	  = 60 * 5 * 1000; // every 5 minutes

	// Config on whether to show image grid
	// (Off by default)
	var doGridBackground = false;

	var images = {"data":[]};
	var videos = {"data":[]};

	function refreshData() {
		//http://localhost:8080/list?path=/media/performance
		
	    getPerformance();
	    getAnything();
	}

	function getPerformance(){
		var xhttp = new XMLHttpRequest();
	    xhttp.onreadystatechange = function() {
		    if (xhttp.readyState == 4 && xhttp.status == 200) {
		        var perf = JSON.parse(xhttp.responseText);
		        window.events.dispatchEvent(new CustomEvent('perfData', {detail: perf }));
		    }
		};
	    xhttp.open("GET", 'list?path=/media/performance', true);
	    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xhttp.send();
	}

	function getAnything(){
		var xhttp = new XMLHttpRequest();
	    xhttp.onreadystatechange = function() {
		    if (xhttp.readyState == 4 && xhttp.status == 200) {
		        var ams = JSON.parse(xhttp.responseText);
		        window.events.dispatchEvent(new CustomEvent('amData', {detail: ams }));
		    }
		};
	    xhttp.open("GET", 'list?path=/media/anythingmuppets', true);
	    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xhttp.send();
	}

	var refreshInterval = null;
	
	this.enter = function(/*evt*/){

		gridBackground = configHandler.get('gridBackground', false);

		// ignore data events unless we're building background
		// (these events are still picked up in other views!)
		if ( gridBackground ){
			window.addEventListener( "perfData", buildPerfBg );
			window.addEventListener( "amData", buildAMBG );
		}

		var now = Date.now();
		if (lastRefreshed == 0 || now -lastRefreshed > refreshRate ){
			refreshData();
			
			lastRefreshed = now;
		} else {
			var videos = document.querySelectorAll(".introVideo");
			for ( var i=0; i<videos.length; i++){
				// videos[i].play();
			}
		}

		refreshInterval = setInterval( refreshData, refreshRate);
	};

	this.exit = function(/*evt*/){
		clearInterval(refreshInterval);
		window.removeEventListener( "perfData", buildPerfBg );
		window.removeEventListener( "amData", buildAMBG );

		var videos = document.querySelectorAll(".introVideo");
		for ( var i=0; i<videos.length; i++){
			// videos[i].pause();
		}
	};

	function isImage( str ){
		str = str.toLowerCase();
		return (str == "jpg" || str == "png" || str == "jpeg" || str == "gif");
	}

	function isVideo( str ){
		str = str.toLowerCase();
		return (str == "mp4" || str == "webm" || str == "mov");
	}

	function parseData( data, rp, array ){
		var paths = configHandler.get('additionalStatic', [{"diskPath":"", "webPath":"/media"}]);
		var base_path  = paths[0].webPath + "/" + rp;

		var list = data;
		for ( var i in list ){
			var path = list[i];
			var ext  = path.split(".");
			ext = ext[ext.length-1];
			if ( isImage( ext ) ){
				array.push({"image":base_path + "/" + path});
			} else if ( isVideo(ext) ){

				var path = list[i];
				var thumb = "";
				var th_split = path.split(".");
				for ( var i=0; i<th_split.length-1; i++){
					thumb += th_split[i] + ".";
				}

				thumb += "png";

				array.push({
					"image":base_path + "/" + path,
					"thumb":base_path + "/" + thumb,
				});
			}
		}
	}

	function buildAMBG( e ){
		images.data = [];
		parseData( e.detail, "anythingmuppets", images.data );
		var bg = document.getElementById("shareAmBg");

		var templatePromise = Loader.loadHTML('share/attract/images.hbr', images);
		templatePromise.
	      then( function resolve(html){
	        bg.innerHTML = html;

			var videos = document.querySelectorAll(".introVideo");
			for ( var i=0; i<videos.length; i++){
				// videos[i].play();
			}
	      }).
	      catch(function reject(reason){
	        log.warn('AM entries not loaded wah',reason);
	      });
	}

	function buildPerfBg( e ){
		videos.data = [];

		var vidArray = [];
		for ( var i in e.detail){
			var p = e.detail[i];
			var ext  = p.split(".");
			ext = ext[ext.length-1];

			if ( isVideo( ext ) ){
				vidArray.push( p );
			}
		}
		parseData( vidArray, "performance", videos.data );
		var bg = document.getElementById("sharePerfBg");

		var templatePromise = Loader.loadHTML('share/attract/videos.hbr', videos);
		templatePromise.
	      then( function resolve(html){
	        bg.innerHTML = html;
	      }).
	      catch(function reject(reason){
	        log.warn('Perf entries not loaded wah',reason);
	      });
	}
}
