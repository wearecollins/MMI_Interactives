var share = function( data, configHandler ){

	var currentVideo = null;
	var canPlay = false;

	var tryInterval;

	var shareOnlineRef;

	var name;

	function setCanPlay(){
	   	// Video is loaded and can be played
		canPlay = true;

		var video = document.getElementById("share_video");
		video.removeEventListener('loadeddata', setCanPlay, false);
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
			cont.innerHTML = html;
			var video = document.getElementById("share_video");
			video.play();
		}).
		catch(function reject(reason){
			log.warn('video not created!',reason);
		});

		// var source = document.getElementById("shareSource");
	    // source.setAttribute("src", "output/performance/" + e.detail);

		// var video = document.getElementById("share_video");
		// video.addEventListener('loadeddata', setCanPlay, false);

		// get next name
	    var index = configHandler.get('currentName', 0);
	    name = "Perf"+ index;

	    // set 'name' on share screen
	    var un = document.getElementById("uniqueName");
	    un.innerHTML = name;
	}

	window.addEventListener("videoRecorded", setVideo);

	this.enter = function(/*evt*/){
	    shareOnlineRef = shareOnline.bind(this);
    	window.addEventListener("share_online", shareOnlineRef);

		// var video = document.getElementById("share_video");
		// video.play();
		// if (!canPlay){
		// 	tryInterval = setInterval(function(){
		// 		if ( canPlay ){
		// 			var video = document.getElementById("share_video");
		// 			video.play();
		// 			clearInterval(tryInterval);
		// 		} else {
		// 		}
		// 	}, 10);
		// }

		document.getElementById("shareAnimateContainer").classList.add("enabled");
	}

	this.exit = function(/*evt*/){
		clearInterval(tryInterval);
    	window.removeEventListener("share_online", shareOnlineRef);
		var video = document.getElementById("share_video");
		video.pause();

		// var source = document.getElementById("shareSource");
		// source.setAttribute("src","");
		// video.load(); //safari requires you to 'load' to know it no longer has a src
		
		setTimeout( cleanup, 1000);
	}

	function cleanup() {
		document.getElementById("shareAnimateContainer").classList.remove("enabled");

		var cont = document.getElementById("shareBackground");
		cont.innerHTML = "";

	    var btn = document.getElementById("shareOnlineBtn");
	    btn.classList.remove("disabled");
	}

	function shareOnline() {
	    var shareServer = configHandler.get('shareServer', "http://localhost:8013");
	    var url = shareServer + "/video";
	    var filename = "performance/" + currentVideo;

	    var xhttp = new XMLHttpRequest();
	    xhttp.open("POST", url, true);
	    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xhttp.send( "filename=" + filename );

	    // then hide the button...
	    window.removeEventListener("share_online", shareOnlineRef);
	    var btn = document.getElementById("shareOnlineBtn");
	    btn.classList.add("disabled");
	  }
};
