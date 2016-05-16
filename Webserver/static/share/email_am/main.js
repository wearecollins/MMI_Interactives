var email_am = function(data, configHandler){
	var currentAM = null;

	function selectShare(evt) {
		currentAM = evt.detail;
		document.getElementById("amEmImg").src = currentAM.image;
		document.getElementById("amEmName").innerHTML = currentAM.name;
	}

	function getCanShare( evt ){
		var file = evt.detail.image;
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
		        		document.getElementById("amEmSh").classList.remove("disabled");
		        	} else {
		        		document.getElementById("amEmSh").classList.add("disabled");
		        	}
		        }
		    }
		};
	    xhttp.open("GET", url, true);
	    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xhttp.send();
	}

	window.addEventListener("selectAM", selectShare);
	window.addEventListener("selectAM", getCanShare);

	var shareOnlineRef;

	this.enter = function(/*evt*/){
		shareOnlineRef = shareOnline.bind(this);
		window.addEventListener("shareAmMMI", shareOnlineRef );
	};

	this.exit = function(/*evt*/){
		window.removeEventListener("shareAmMMI", shareOnlineRef );
		setTimeout( function() {
			var input = document.getElementById("anEmEmail");
			input.value = "";

		    var btn = document.getElementById("amOnlineBtn");
		    btn.classList.remove("disabled");

		    document.getElementById("amEmSh").classList.add("disabled");
		}, 1000);
	};

	function shareOnline() {
	    var shareServer = configHandler.get('shareServer', "http://localhost:8013");
	    var url = shareServer + "/photo";
	    var filename = "anythingmuppets/" + currentAM.path;

	    var xhttp = new XMLHttpRequest();
	    xhttp.open("POST", url, true);
	    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xhttp.send( "filename=" + filename );

	    // then hide the button...
	    window.removeEventListener("share_online", shareOnlineRef);
	    var btn = document.getElementById("amOnlineBtn");
	    btn.classList.add("disabled");
	}

	var setupListener = false;
	var inError = false;

	function checkEmail() {
		var input = document.getElementById("anEmEmail");
		if (!setupListener){
			input.addEventListener('change', function () {
				if (inError ){
					inError = false;
					document.getElementById("amEmError").classList.add("hidden");
				}
			});

		}
		var email = input.value;
		if ( MMI.validateEmail(email) ){
			// grey out?
			window.events.dispatchEvent( new CustomEvent("sendEmail", {detail:{"data":currentAM, "email":email, "type":"performance"}}));
			window.events.dispatchEvent(new Event("next"));

		} else {
			//do something
			document.getElementById("amEmError").classList.remove("hidden");
			inError = true;
		}
	}

	window.addEventListener("shareAmEmail", checkEmail);

}
