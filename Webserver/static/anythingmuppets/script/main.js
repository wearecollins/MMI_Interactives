var script = function(/*manager*/){
	var currentScript = null;

	function show( div ){
		div.style.visibility = "visible";
		div.style.display = "block";
	}

	function hide( div ){
		div.style.visibility = "hidden";
		div.style.display = "none";
	}

	this.enter = function(/*evt*/){
		// show a random script
		var parent = document.getElementById("script");
		var scripts = parent.getElementsByClassName("scriptContainer");
		
		if ( scripts.length > 0 ){
			var idx = Math.floor(Math.random() * scripts.length);
			console.log(scripts.length +":"+ idx);
			currentScript = scripts[idx];
			show(currentScript);
		} else {
			log.warn("Script: no divs found");
		}

		// listen for "start" and "done" events
		window.addEventListener("start", showOpenPrompt.bind(this));
		window.addEventListener("openDone", hideOpenPrompt.bind(this));
		window.addEventListener("done", showSpinPrompt.bind(this));

	};

	function showOpenPrompt(){
		var openDiv = document.getElementById("promptOpenDrawers");
		show(openDiv);

		hide( document.getElementById("start") );
		show( document.getElementById("done") );
	}

	function hideOpenPrompt(){
		var openDiv = document.getElementById("promptOpenDrawers");
		hide(openDiv);
	}

	function showSpinPrompt(){
		var spinDiv = document.getElementById("promptSpinPuppet");
		show(spinDiv);
	}

	function hideSpinPrompt(){
		var spinDiv = document.getElementById("promptSpinPuppet");
		hide(spinDiv);

		show( document.getElementById("start") );
		hide( document.getElementById("done") );
	}

	this.exit = function(/*evt*/){
		currentScript.style.visibility = "hidden";
		currentScript.style.display = "none";
		hideSpinPrompt();
	};
};
