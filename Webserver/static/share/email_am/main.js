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
		setTimeout( function() {
			var input = document.getElementById("anEmEmail");
			input.value = "";
		}, 1000);
	};

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
			window.dispatchEvent( new CustomEvent("sendEmail", {detail:{"data":currentAM, "email":email, "type":"performance"}}));
			window.dispatchEvent(new Event("next"));

		} else {
			//do something
			document.getElementById("amEmError").classList.remove("hidden");
			inError = true;
		}
	}

	window.addEventListener("shareAmEmail", checkEmail);

}
