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
	var typingTimeout;
	var textIndex = 0;

	function typeString( string, dest, onComplete ){
	    clearTimeout(typingTimeout);
		isTag = false;
		text = "";
		str = string;
		typeDest = dest;
		onTypingComplete = onComplete;
		textIndex = 0;
		type();
	}

	function type() {
	    text = str.slice(0, ++textIndex);
	    if (text === str){
	    	clearTimeout(typingTimeout);
	    	onTypingComplete();
	    	return;
	    }
	    
	    typeDest.innerHTML = text;

	    var char = text.slice(-1);
	    if( char === '<' || char == '&' ) isTag = true;
	    if( char === '>' || char == ';' ) isTag = false;

	    if (isTag) return type();
	    typingTimeout = setTimeout(type, 30);
	}

	this.enter = function(/*evt*/){
		clearTimeout(buildTimeout);

		MMI.show( "start", "block" );
		MMI.show( "done", "block" );

		// show a random script
		var parent = document.getElementById("script");
		var scripts = parent.getElementsByClassName("scriptContainer");
		
		if ( scripts.length > 0 ){
			var idx = Math.floor(Math.random() * scripts.length);
			currentScript = scripts[idx];
			currentScriptObject = scriptData[idx];

			// console.log( idx, currentScript, currentScriptObject );

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

		window.currentScriptObject = currentScriptObject;

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

	var promptTimeout;

	function showOpenPrompt(){
		var openDiv = document.getElementById("promptOpenDrawers");
		// show(openDiv);
		openDiv.classList.remove("hideMe");
		openDiv.classList.add("visible");

		var soundA = document.getElementById("drawer_vo");
		soundA.play();

		setTimeout(function(){
			MMI.hide( ("start"));
			MMI.show( ("done"), "block"  );
		}, 1000);

		// timeout prompt
		// 1000 = fade in
		promptTimeout = setTimeout(hideOpenPrompt, 1000 + 10000);
	}

	function hideOpenPrompt(){
		clearTimeout(promptTimeout);

		var soundA = document.getElementById("drawer_vo");
		soundA.pause();
		soundA.currentTime = 0;

		var openDiv = document.getElementById("promptOpenDrawers");
		// hide(openDiv);
		openDiv.classList.remove("visible");
		openDiv.classList.add("hideMe");

		setTimeout(function(){
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

		var sound = document.getElementById("spin_vo");
		sound.play();
	}

	function hideSpinPrompt(){
		var spinDiv = document.getElementById("promptSpinPuppet");
		// hide(spinDiv);
		
		spinDiv.classList.add("hideMe");
		spinDiv.classList.remove("visible");

		MMI.show( ("start"), "block"  );
		MMI.hide( ("done") );

		var soundB = document.getElementById("spin_vo");
		soundB.pause();
		soundB.currentTime = 0;
	}

	this.exit = function(/*evt*/){
		clearTimeout(buildTimeout);

		setTimeout( function(){
			MMI.hide(currentScript.id);

			var spinDiv = document.getElementById("promptSpinPuppet");
			spinDiv.classList.add("hideMe");
			spinDiv.classList.remove("visible");

			var openDiv = document.getElementById("promptOpenDrawers");
			// hide(openDiv);
			openDiv.classList.remove("visible");
			openDiv.classList.add("hideMe");

			var container = currentScript.getElementsByClassName("scriptInfoContainer")[0];
			container.classList.add("disabled");

			var btnContainer = document.getElementById("scriptButtonContainer");
			btnContainer.classList.remove("enabled");
			btnContainer.classList.add("disabled");

			btnContainer = document.getElementById("scriptButtonDoneContainer");
			btnContainer.classList.remove("enabled");
			btnContainer.classList.add("disabled");

			var scriptText = currentScript.getElementsByClassName("scriptText")[0];
			scriptText.innerHTML = "";
			
			currentScript = null;
			currentScriptObject = null;

			MMI.show( ("start"), "block"  );
			MMI.show( ("done"), "block"  );
		}, 1000);

		//cleanup
		window.removeEventListener("start", shareRef);
		window.removeEventListener("openDone", hideRef);
		window.removeEventListener("done", showRef);

		var soundA = document.getElementById("drawer_vo");
		soundA.pause();
		soundA.currentTime = 0;

		var soundB = document.getElementById("spin_vo");
		soundB.pause();
		soundB.currentTime = 0;
	};
};
