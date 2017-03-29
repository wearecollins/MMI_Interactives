var attract = function(/*manager*/){
	var videoDiv;
	var me;
	this.enter = function(/*evt*/){
		var me = document.getElementById("attract");;
		videoDiv = me.getElementsByClassName("attractVideo")[0];
		videoDiv.play();

		//setTimeout(showContent, 1000);
	};

	function showContent(){
		var d = document.getElementById("attractNextButton");
		d.classList.remove("disabled");
		d.classList.add("enabled");
		d = document.getElementById("attractText");
		d.classList.remove("disabled");
		d.classList.add("enabled");
	}

	function hideContent(){
		var d = document.getElementById("attractNextButton");
		d.classList.remove("enabled");
		d.classList.add("disabled");
		d = document.getElementById("attractText");
		d.classList.remove("enabled");
		d.classList.add("disabled");
	}

	this.exit = function(/*evt*/){
		videoDiv.pause();
		videoDiv.currentTime = 0;

		//hideContent();
	};
}
