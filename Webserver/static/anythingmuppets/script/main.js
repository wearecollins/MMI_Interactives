/**
 * Page: Script
 * Much is built in the template, from the 'data.json' file.
 * Code below is for moving between states:
 * 1 - Prompt + 'start building'
 * 2 - 'Open drawers' arrow
 * 3 - Prompt + 'done building'
 * 4 - 'Spin the puppet' arrow

 * @param  {Object} data JSON from data.json, including
 * all script info
 */
var script = function(data){
	var scriptData = data.scripts;

	var currentScript = null;
	var currentScriptObject = null;

	var buildTimeout;

	var voIntro = new SoundPlayer();
	var voDrawer = new SoundPlayer();
	var voDone = new SoundPlayer();
	var voSpin = new SoundPlayer();

	/**************************************************
		Section: Enter
	**************************************************/

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

			// show the script content
			MMI.show(currentScript.id, "block");
		} else {
			log.error("Script: no divs found");
		}

		// listen for "start" and "done" events
		window.addEventListener("start", showOpenPrompt);
		window.addEventListener("openDone", hideOpenPrompt);
		window.addEventListener("done", showSpinPrompt);

		window.currentScriptObject = currentScriptObject;

		// setup VOs
		voIntro.setup("vo_script");
		voDrawer.setup("vo_drawer");
		voDone.setup("vo_done");
		voSpin.setup("vo_spin");

		// build stuff in
		buildTimeout = setTimeout(function(){
			var container = currentScript.getElementsByClassName("scriptInfoContainer")[0];
			container.classList.remove("disabled");
			container.classList.add("enabled");

			buildTimeout = setTimeout(function(){

				if ( voIntro.exists() ){
					voIntro.play();
				}

				var dest = currentScript.getElementsByClassName("scriptText")[0];
				typeString(currentScriptObject.text, dest, showButtons);
			}, 1000);

		}, 1500);
	};

	/**************************************************
		Section: Exit
	**************************************************/

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
		window.removeEventListener("start", showOpenPrompt);
		window.removeEventListener("openDone", hideOpenPrompt);
		window.removeEventListener("done", showSpinPrompt);

		voIntro.stop();
		voDrawer.stop();
		voDone.stop();
		voSpin.stop();
	};

	/**************************************************
		Section: 'typing' animation
	**************************************************/

	var isTag = false;
	var text, str;
	var typeDest;
	var onTypingComplete;
	var typingTimeout;
	var textIndex = 0;

	var typingSpeed = 15;

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
	    typingTimeout = setTimeout(type, typingSpeed);
	}

	/**************************************************
		Section: Show/Hide each state
	**************************************************/

	var promptTimeout;

	function showButtons(){
		var btnContainer = document.getElementById("scriptButtonContainer");
		btnContainer.classList.remove("disabled");
		btnContainer.classList.add("enabled");
	}

	function showOpenPrompt(){
		voIntro.stop();

		var openDiv = document.getElementById("promptOpenDrawers");
		// show(openDiv);
		openDiv.classList.remove("hideMe");
		openDiv.classList.add("visible");
		
		if ( voDrawer.exists() ){
			voDrawer.play();
		}

		setTimeout(function(){
			MMI.hide( "start");
			MMI.show( "done", "block"  );

		}, 1000);

		// timeout prompt
		// 1000 = fade in
		promptTimeout = setTimeout(hideOpenPrompt, 1000 + 10000);
	}

	function hideOpenPrompt(){
		clearTimeout(promptTimeout);

		voDrawer.stop();

		var openDiv = document.getElementById("promptOpenDrawers");
		// hide(openDiv);
		openDiv.classList.remove("visible");
		openDiv.classList.add("hideMe");

		setTimeout(function(){
			var btnContainer = document.getElementById("scriptButtonDoneContainer");
			btnContainer.classList.remove("disabled");
			btnContainer.classList.add("enabled");

			if ( voDone.exists() ){
				voDone.play();
			}
		}, 1000);
	}

	function showSpinPrompt(){
		var spinDiv = document.getElementById("promptSpinPuppet");
		// show(spinDiv);
		spinDiv.classList.remove("hideMe");
		spinDiv.classList.add("visible");

		if ( voSpin.exists() ){
			voSpin.play();
		}
	}

	function hideSpinPrompt(){
		var spinDiv = document.getElementById("promptSpinPuppet");
		// hide(spinDiv);
		
		spinDiv.classList.add("hideMe");
		spinDiv.classList.remove("visible");

		MMI.show( ("start"), "block"  );
		MMI.hide( ("done") );

		voSpin.stop();
	}
};
