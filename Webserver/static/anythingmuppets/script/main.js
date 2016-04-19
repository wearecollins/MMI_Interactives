var script = function(data){
	var scriptData = data.scripts;

	var currentScript = null;
	var currentScriptObject = null;

	var shareRef, hideRef, showRef;

	var buildTimeout;

	var isTag = false;
	var text, str;
	var typeDest;
	var onTypingComplete;

	function typeString( string, dest, onComplete ){
		isTag = false;
		text = "";
		str = string;
		typeDest = dest;
		onTypingComplete = onComplete;
		type();
	}
	function type() {
	    text = str.slice(0, ++i);
	    if (text === str){
	    	onTypingComplete();
	    	return;
	    }
	    
	    typeDest.innerHTML = text;

	    var char = text.slice(-1);
	    if( char === '<' || char == '&' ) isTag = true;
	    if( char === '>' || char == ';' ) isTag = false;

	    if (isTag) return type();
	    setTimeout(type, 30);
	}

	this.enter = function(/*evt*/){
		// show a random script
		var parent = document.getElementById("script");
		var scripts = parent.getElementsByClassName("scriptContainer");
		
		if ( scripts.length > 0 ){
			var idx = Math.floor(Math.random() * scripts.length);
			currentScript = scripts[idx];
			currentScriptObject = scriptData[idx];

			MMI.show(currentScript.id, "block");
		} else {
			log.warn("Script: no divs found");
		}

		shareRef = showOpenPrompt.bind(this);
		hideRef = hideOpenPrompt.bind(this);
		showRef = showSpinPrompt.bind(this);

		// listen for "start" and "done" events
		window.addEventListener("start", shareRef);
		window.addEventListener("openDone", hideRef);
		window.addEventListener("done", showRef);

		// build stuff in
		buildTimeout = setTimeout(function(){

			var container = currentScript.getElementsByClassName("scriptInfoContainer")[0];
			container.classList.remove("disabled");
			container.classList.add("enabled");

			buildTimeout = setTimeout(function(){
				var dest = currentScript.getElementsByClassName("scriptText")[0];
				typeString(currentScriptObject.text, dest, showButtons);

			}, 1000);

		}, 1500);
	};

	function showButtons(){
		var btnContainer = document.getElementById("scriptButtonContainer");
		btnContainer.classList.remove("disabled");
		btnContainer.classList.add("enabled");
	}

	var openClasses = "parchBg bottomCenteredContainer fillAbs";
	var spinClasses = "parchBg bottomCenteredContainer fillAbs";

	function showOpenPrompt(){
		var openDiv = document.getElementById("promptOpenDrawers");
		// show(openDiv);
		openDiv.classList.remove("hideMe");
		openDiv.classList.add("visible");

		setTimeout(function(){
			MMI.hide( ("start") );
			MMI.show( ("done") );
		}, 1000);
	}

	function hideOpenPrompt(){
		var openDiv = document.getElementById("promptOpenDrawers");
		// hide(openDiv);
		openDiv.classList.remove("visible");
		openDiv.classList.add("hideMe");

		setTimeout(function(){
			// openDiv.className = openClasses;
			
			var btnContainer = document.getElementById("scriptButtonDoneContainer");
			btnContainer.classList.remove("disabled");
			btnContainer.classList.add("enabled");
		}, 1000);
	}

	function showSpinPrompt(){
		var spinDiv = document.getElementById("promptSpinPuppet");
		// show(spinDiv);
		spinDiv.classList.remove("hideMe");
		spinDiv.classList.add("visible");
	}

	function hideSpinPrompt(){
		var spinDiv = document.getElementById("promptSpinPuppet");
		// hide(spinDiv);
		
		spinDiv.classList.add("hideMe");
		spinDiv.classList.remove("visible");

		setTimeout(function(){
			// spinDiv.className = spinClasses;
		}, 1000);

		MMI.show( ("start") );
		MMI.hide( ("done") );
	}

	this.exit = function(/*evt*/){
		clearTimeout(buildTimeout);
		currentScript.style.visibility = "hidden";
		currentScript.style.display = "none";
		setTimeout( function(){
			hideSpinPrompt();
			hideOpenPrompt();

			var container = currentScript.getElementsByClassName("scriptInfoContainer")[0];
			container.classList.add("disabled");

			var btnContainer = document.getElementById("scriptButtonContainer");
			btnContainer.classList.add("disabled");

			btnContainer = document.getElementById("scriptButtonDoneContainer");
			btnContainer.classList.add("disabled");

		}, 1000);

		//cleanup
		window.removeEventListener("start", shareRef);
		window.removeEventListener("openDone", hideRef);
		window.removeEventListener("done", showRef);
	};
};
