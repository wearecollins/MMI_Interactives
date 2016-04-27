var email_perf = function(/*manager*/){
	var currentPerf = null;

	window.addEventListener("selectPerf", selectShare);

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
	}

	this.enter = function(/*evt*/){

	};

	this.exit = function(/*evt*/){
		setTimeout( function() {
			var input = document.getElementById("pEmEmail");
			input.value = "";
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
