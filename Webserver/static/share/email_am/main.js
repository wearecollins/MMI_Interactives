var email_am = function(data, configHandler){
	var currentAM = null;

	window.addEventListener("selectAM", selectShare);

	function selectShare(evt) {
		currentAM = evt.detail;
		document.getElementById("amEmImg").src = currentAM.image;
	}

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
