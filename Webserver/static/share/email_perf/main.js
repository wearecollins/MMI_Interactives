var email_perf = function(data, configHandler){
	var currentPerf = null;

	function selectShare(evt) {
		currentPerf = evt.detail;
		var video = document.getElementById("pEmImg");
		video.src = currentPerf.video;
		video.parentElement.load();
		function play(){
			video.parentElement.play();
			video.parentElement.removeEventListener('loadeddata', play);
		}
		video.parentElement.addEventListener('loadeddata', play, false);

		document.getElementById("pEmName").innerHTML = currentPerf.name;
	}

	function getCanShare( evt ){
		var file = evt.detail.video;
		var wpObj   = configHandler.get("additionalStatic");
		var webPath = "/media";

		if ( wpObj.length > 0 ){
			webPath = wpObj[0].webPath;
		}

		// file should just be am/image or perf/image
		var ind = file.indexOf(webPath);
		console.log(ind, webPath, file);
		if ( ind >=0 ){
			// include the "/" in removal
			file = file.substr(ind + webPath.length + 1 );
		}

		var url = configHandler.get("shareServer");
		url += '/state?filename=' + file;

		var xhttp = new XMLHttpRequest();
	    xhttp.onreadystatechange = function() {
		    if (xhttp.readyState == 4 && xhttp.status == 200) {
		        var data = JSON.parse(xhttp.responseText);
		        if ( data ){
		        	console.log(data);
		        	//STATE will be either unknown, posting, posted, or failed
		        	var s = data.state;
		        	if ( s === "unknown" || s === "failed" ){
		        		document.getElementById("pEmSh").classList.remove("disabled");
		        	} else {
		        		document.getElementById("pEmSh").classList.add("disabled");
		        	}
		        }
		    }
		};
	    xhttp.open("GET", url, true);
	    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xhttp.send();
	}

	window.addEventListener("selectPerf", selectShare);
	window.addEventListener("selectPerf", getCanShare);

	this.enter = function(/*evt*/){
		var info = document.getElementById("pEmInfo");
		info.scrollTop = window.innerHeight * .6;

		window.addEventListener("sharePerfMMI", shareOnline );

		// are we a touch screen? if so, setup a keyboard
		var isTouch = configHandler.get("isTablet", false);
		if (isTouch){
			$('#pEmEmail').keyboard();
		} else {
		}
	};

	function shareOnline() {
	    var shareServer = configHandler.get('shareServer', "http://localhost:8013");
	    var url = shareServer + "/video";
	    var filename = "performance/" + currentPerf.path;

	    var xhttp = new XMLHttpRequest();
	    xhttp.open("POST", url, true);
	    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xhttp.send( "filename=" + filename );

	    console.log("Posting ",currentPerf);

	    // then hide the button...
	    window.removeEventListener("share_online", shareOnline);
	    var btn = document.getElementById("shareEmOnlineBtn");
	    btn.classList.add("disabled");
	  }

	this.exit = function(/*evt*/){
		window.removeEventListener("sharePerfMMI", shareOnline );
		setTimeout( function() {
			var video = document.getElementById("pEmImg");
			video.src = "";
			// video.parentElement.unload();
			var input = document.getElementById("pEmEmail");
			input.value = "";

		    var btn = document.getElementById("shareEmOnlineBtn");
		    btn.classList.remove("disabled");
		    
    		document.getElementById("pEmSh").classList.add("disabled");
		}, 1000);
	};

	var setupListener = false;
	var inError = false;

	function checkEmail() {
		var input = document.getElementById("pEmEmail");
		if (!setupListener){
			input.addEventListener('change', function () {
				if (inError ){
					inError = false;
					document.getElementById("pEmError").classList.add("hidden");
				}
			});

		}
		var email = input.value;
		if ( MMI.validateEmail(email) ){

			var url = configHandler.getElementById("emailURL");

		    var xhttp = new XMLHttpRequest();
		    xhttp.open("POST", url, true);
		    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		    xhttp.send( "email=" + email + "&performance=" + currentPerf.video );

			// grey out?
			window.events.dispatchEvent( new CustomEvent("sendEmail", {detail:{"data":currentPerf, "email":email, "type":"performance"}}));
			window.events.dispatchEvent(new Event("next"));

		} else {
			//do something
			document.getElementById("pEmError").classList.remove("hidden");
			inError = true;
		}
	}

	window.addEventListener("sharepEmail", checkEmail);

}
