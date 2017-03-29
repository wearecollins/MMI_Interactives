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
 * @param  {ConfigHandler} configHandler incoming object from global confighandler
 */
var script = function(data, configHandler){

	var buildTimeout;
	var spinTimeout;

	var voIntro = new SoundPlayer();
	var voSpin = new SoundPlayer();

	// the 'voIntro' is a generic clip.
	// if it is not commented out in the template.hbr,
	// it will play. if it is, it will play a character-specific
	// VO, which is setup in the data.json
	var voScript = new SoundPlayer();

	/**************************************************
		Section: Enter
	**************************************************/

	this.enter = function(/*evt*/){
		clearTimeout(buildTimeout);
		clearTimeout(spinTimeout);

		window.addEventListener("done", showSpinPrompt);

		// setup VOs
		voIntro.setup("vo_script");
		voSpin.setup("vo_spin");

		// build stuff in
		buildTimeout = setTimeout(function(){
			var container = currentScript.getElementsByClassName("scriptInfoContainer")[0];
			container.classList.remove("disabled");
			container.classList.add("enabled");

			buildTimeout = setTimeout(function(){

				if ( voIntro.exists() ){
					voIntro.play();
				} else {
					var vo = "vo_script_"+currentScriptObject.name_clean;
					voScript.setup(vo);
					voScript.play();
				}

				// set timeout to show spin
				spinTimeout = setTimeout(showSpinPrompt, 30 * 1000 );

			}, 1000);

		}, 1500);
	};

	/**************************************************
		Section: Exit
	**************************************************/

	this.exit = function(/*evt*/){
		clearTimeout(buildTimeout);
		clearTimeout(spinTimeout);

		setTimeout( function(){
			MMI.hide(currentScript.id);

			var spinDiv = document.getElementById("promptSpinPuppet");
			spinDiv.classList.add("hideMe");
			spinDiv.classList.remove("visible");

			var container = currentScript.getElementsByClassName("scriptInfoContainer")[0];
			container.classList.add("disabled");

			var scriptText = currentScript.getElementsByClassName("scriptText")[0];
			scriptText.innerHTML = "";
			
			currentScript = null;
			currentScriptObject = null;

		}, 1000);

		//cleanup
		window.removeEventListener("done", showSpinPrompt);

		voIntro.stop();
		voSpin.stop();
		voScript.stop();
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
