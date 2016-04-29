var attract = function(data, configHandler){
	
	var lastRefreshed = 0;//Date().now();
	var refreshRate	  = 60 * 5 * 1000; // every 5 minutes

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
	
	this.enter = function(/*evt*/){
		window.addEventListener( "perfData", buildPerfBg );
		window.addEventListener( "amData", buildAMBG );

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
	};

	this.exit = function(/*evt*/){
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
			if ( isImage( ext ) || isVideo(ext) ){
				array.push({"image":base_path + "/" + path});
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
		parseData( e.detail, "performance", videos.data );
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
