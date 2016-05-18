var share = function( data, configHandler ){

	var currentVideo = null;
	var canPlay = false;

	var tryInterval;

	var shareOnlineRef;

	var name;

	// 0 = start, 1 = share online, 2 = share local
	var currentState = 0;

	// Override timeout: instead of going back to '0',
	// we go to 'thanks'
	var nextTimeout;

	var haveShownShare = false;

	function onTimeupdate(){
	    if ( this.currentTime >= this.duration ){
	    	if (haveShownShare === false ){
	    		haveShownShare = true;
				document.getElementById("shareOnlineContainer").classList.remove("disabled");
				document.getElementById("shareOnlineContainer").classList.add("enabled");
			}
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
		haveShownShare = false;
		if ( currentVideo === null ){
			// show 'saving'
			MMI.show("shareSaving", "flex");
		}
	    shareOnlineRef = shareOnline.bind(this);
    	window.addEventListener("share_online", shareOnlineRef);
    	window.addEventListener("share_done", shareDone);

	    var to = configHandler.get('timeout', 60) * 1000;

	    nextTimeout = setTimeout(function(){
	      window.events.dispatchEvent(new Event('next'));
	    }, to);
	}

	this.exit = function(/*evt*/){
		clearTimeout(nextTimeout);

		clearInterval(tryInterval);
    	window.removeEventListener("share_online", shareOnlineRef);
    	window.removeEventListener("share_done", shareDone);

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
		document.getElementById("shareOnlineContainer").classList.add("disabled");
		document.getElementById("shareLocalContainer").classList.add("disabled");
		document.getElementById("shareOnlineContainer").classList.remove("freezeAnim");
		document.getElementById("shareLocalContainer").classList.remove("freezeAnim");

		var cont = document.getElementById("shareBackground");
		cont.innerHTML = "";

	    var btn = document.getElementById("shareOnlineBtn");
	    btn.classList.remove("disabled");
	}

	function shareDone(){
		var showLocalShare = configHandler.get("showLocalShare", false);
	    if ( showLocalShare ){
			document.getElementById("shareOnlineContainer").classList.remove("enabled");
			document.getElementById("shareOnlineContainer").classList.add("disabled");
			setTimeout(function(){
				document.getElementById("shareLocalContainer").classList.add("enabled");
				document.getElementById("shareLocalContainer").classList.remove("disabled");
				document.getElementById("shareOnlineContainer").classList.add("freezeAnim")

				setTimeout(function(){
					document.getElementById("shareLocalContainer").classList.add("freezeAnim");
				}, 1000)

			}, 1000);
	    } else {
			document.getElementById("shareOnlineContainer").classList.add("freezeAnim");
			document.getElementById("shareLocalContainer").classList.add("freezeAnim");
		    window.events.dispatchEvent( new Event("next") );
	    }
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
				document.getElementById("shareLocalContainer").classList.remove("disabled");
				document.getElementById("shareOnlineContainer").classList.add("freezeAnim");

				setTimeout(function(){
					document.getElementById("shareLocalContainer").classList.add("freezeAnim");
				}, 1000)

			}, 1000);
	    } else {
			document.getElementById("shareOnlineContainer").classList.add("freezeAnim");
			document.getElementById("shareLocalContainer").classList.add("freezeAnim");
		    window.events.dispatchEvent( new Event("next") );
	    }
	  }
};
