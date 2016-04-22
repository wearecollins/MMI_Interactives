var email_am = function(/*manager*/){
	var currentAM = null;

	window.addEventListener("selectAM", selectShare);

	function selectShare(evt) {
		currentAM = evt.detail;
		document.getElementById("amEmImg").src = currentAM.image;
	}

	this.enter = function(/*evt*/){

	};

	this.exit = function(/*evt*/){

	};

	//ty internets http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
	function validateEmail(email) {
	    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	}

	function checkEmail() {
		var input = document.getElementById("anEmEmail");
		var email = input.value;
		if ( validateEmail(email) ){
			console.log("VALID?");
			// grey out?
			window.dispatchEvent( new CustomEvent("sendEmail", {detail:{"data":currentAM, "email":email}}));
			window.dispatchEvent(new Event("next"));
		} else {
			//do something
		}
	}

	window.addEventListener("shareAmEmail", checkEmail);
}
