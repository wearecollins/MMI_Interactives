var share = function( data, configHandler ){

	var currentVideo = null;
	var canPlay = false;

	var tryInterval;

	var shareOnlineRef;

	var name;

	function onTimeupdate(){
	    if ( this.currentTime >= this.duration ){
			document.getElementById("shareOnlineContainer").classList.add("enabled");

			var video = document.getElementById("share_video");
			video.currentTime = 0;
			video.play();
	    }
	}

	function setVideo(e){
		currentVideo = e.detail;
		canPlay = false;

		var cont = document.getElementById("shareBackground");
		cont.innerHTML = "";

		var data = {
			"video":"output/performance/" + e.detail
		}

		var templatePromise = Loader.loadHTML('performance/share/video.hbr', data);
		templatePromise.
		then( function resolve(html){
			// first, hide "saving"
			MMI.hide("shareSaving");

			cont.innerHTML = html;
			var video = document.getElementById("share_video");
			video.play();

    		video.addEventListener("timeupdate", onTimeupdate);
			
		}).
		catch(function reject(reason){
			log.warn('video not created!',reason);
		});

		// get next name
	    var index = configHandler.get('currentName', 0);
	    name = "Perf"+ index;

	    // set 'name' on share screen
	    var un = document.getElementById("uniqueName");
	    un.innerHTML = name;
	}

	window.addEventListener("videoRecorded", setVideo);

	this.enter = function(){
		if ( currentVideo === null ){
			// show 'saving'
			MMI.show("shareSaving", "flex");
		}
	    shareOnlineRef = shareOnline.bind(this);
    	window.addEventListener("share_online", shareOnlineRef);
	}

	this.exit = function(/*evt*/){
		clearInterval(tryInterval);
    	window.removeEventListener("share_online", shareOnlineRef);

		var video = document.getElementById("share_video");
		if ( video ){
			video.pause();
			video.removeEventListener("timeupdate", onTimeupdate);
		}
		// var source = document.getElementById("shareSource");
		// source.setAttribute("src","");
		// video.load(); //safari requires you to 'load' to know it no longer has a src
		
		setTimeout( cleanup, 1500);

		currentVideo = null;
	}

	function cleanup() {
		document.getElementById("shareOnlineContainer").classList.remove("enabled");
		document.getElementById("shareLocalContainer").classList.remove("enabled");
		document.getElementById("shareOnlineContainer").classList.remove("disabled");
		document.getElementById("shareLocalContainer").classList.remove("disabled");

		var cont = document.getElementById("shareBackground");
		cont.innerHTML = "";

	    var btn = document.getElementById("shareOnlineBtn");
	    btn.classList.remove("disabled");
	}

	function shareOnline() {
	    var shareServer = configHandler.get('shareServer', "http://localhost:8013");
	    var url = shareServer + "/video";
	    var filename = "performance/" + currentVideo;

	    try {
		    var xhttp = new XMLHttpRequest();
		    xhttp.open("POST", url, true);
		    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		    xhttp.send( "filename=" + filename );
		} catch(e){}

	    // then hide the button...
	    window.removeEventListener("share_online", shareOnlineRef);
	    var btn = document.getElementById("shareOnlineBtn");
	    btn.classList.add("disabled");

	    var showLocalShare = configHandler.get("showLocalShare", false);
	    if ( showLocalShare ){
			document.getElementById("shareOnlineContainer").classList.remove("enabled");
			document.getElementById("shareOnlineContainer").classList.add("disabled");
			setTimeout(function(){
				document.getElementById("shareLocalContainer").classList.add("enabled");
			}, 1000);
	    } else {
		    window.events.dispatchEvent( new Event("next") );
	    }
	  }
};
