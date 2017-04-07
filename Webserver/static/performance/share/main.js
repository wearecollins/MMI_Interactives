var share = function( data, configHandler ){

	var currentVideo = null;
	var canPlay = false;

	var tryInterval;

	var shareOnlineRef;

	var name;

	// 0 = start, 1 = share online, 2 = share local
	var currentState = 0;

	// Override timeout: instead of going back to '0',
	// we go to 'thanks'
	var nextTimeout, nextDelay;
	var emailDisplayStartSize;

	var haveShownShare = false;

	var typeList = ['type_med', 'type_sm', 'type_tiny', 'type_mini', 'type_micro'];
	var currTypeSize = 0;

	document.getElementById('shareNextBtn').onclick = submitEmail;

	function onTimeupdate(){
	    if ( this.currentTime >= this.duration ){
	    	if (haveShownShare === false ){
	    		haveShownShare = true;
				document.getElementById("shareOnlineContainer").classList.remove("disabled");
				document.getElementById("shareOnlineContainer").classList.add("enabled");
			}
			var video = document.getElementById("share_video");
			video.currentTime = 0;
			video.play();
	    }
	}

	function toggleShift(key){
		var keyboard = document.getElementById('keyboard');
		if (!keyboard.classList.contains('show_symbols')){
			if (key.classList.contains('active')){
				key.classList.remove('active');
			} else {
				key.classList.add('active');
			}
		}
	}

	function toggleSymbols(){
		var keyboard = document.getElementById('keyboard');
		if (keyboard.classList.contains('show_symbols')){
			keyboard.classList.remove('show_symbols');
		} else {
			keyboard.classList.add('show_symbols');
			var shiftKey = document.getElementById('keyboardShift');
			shiftKey.classList.remove('active');
		}
	}

	function deleteCharacter(){
		var display = document.getElementById('emailDisplay');
		if (display.innerText.length > 1){
			display.innerText = display.innerText.slice(0, -1);
		}
	}

	function getCharacterForKey(key){
		if (key.tagName === "LI" && key.childElementCount > 0){
			if (document.getElementById('keyboard').classList.contains('show_symbols')){
				key = key.getElementsByClassName('on')[0];
			} else {
				key = key.getElementsByClassName('off')[0];
			}
		}
		var char = key.innerHTML;
		if (key.classList.contains('pipeKey')){
			char = '|';
		}
		var shiftKey = document.getElementById('keyboardShift');
		if (!shiftKey.classList.contains('active')){
			char = char.toLowerCase();
		} else {
			shiftKey.classList.remove('active');
		}
		return char;
	}

	function addCharacter(char){
		var emailDisplay = document.getElementById('emailDisplay');
		emailDisplay.innerHTML += char;
		if (getSize(emailDisplay) > emailDisplayStartSize){
			setTypeSize(currTypeSize + 1);
		}
	}

	function keyboardPressed(evt){
		var key = evt.target;
		if (key.classList.contains('shift')){
			toggleShift(key);
		} else if (key.classList.contains('enter')){
			submitEmail();
		} else if (key.classList.contains('symbols')){
			toggleSymbols();
		} else if (key.classList.contains('delete')){
			deleteCharacter();
		} else {
			var char = getCharacterForKey(key);
			addCharacter(char);
		}
		resetTimeout();
	}

	function getSize(elem){
		return elem.scrollWidth;
	}

	function resetTimeout(){
		clearTimeout(nextTimeout);
	    nextTimeout = setTimeout(function(){
	      window.events.dispatchEvent(new Event('next'));
	    }, nextDelay);
	}

	document.getElementById('keyboard').onclick = keyboardPressed;

	function submitEmail(){
		resetTimeout();
		var display = document.getElementById('emailDisplay');
		var email = display.innerText.trim();

		if (checkEmail(email)){
			sendEmail(email);
			//TODO: do this after callback/timeout 
			//from sharing server?
			window.events.dispatchEvent(new Event('next'));
		} else {
			console.log('error with e-mail address');
			//TODO: display warning?
		}
	}

	function sendEmail(email){
		console.log("sending email to", email, currentVideo);
		var url = configHandler.get("emailURL");

		var xhttp = new XMLHttpRequest();
	    xhttp.open("POST", url, true);
	    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xhttp.send( "email=" + email + "&performance=" + currentVideo.video );
	}

	function checkEmail(email){
		var valid = /^.+@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
		return valid;
	}

	function setVideo(e){
		currentVideo = e.detail;
	}

	window.addEventListener("videoRecorded", setVideo);

	function initEmailDisplay(){
		var emailDisplay = document.getElementById('emailDisplay');
		emailDisplay.innerHTML = '&nbsp;';
		setTypeSize(0);
		emailDisplayStartSize = getSize(emailDisplay);
	}

	function setTypeSize(num){
		if (num === currTypeSize ||
			num >= typeList.length){
			//nothing to do here
		} else {
			emailDisplay.classList.remove(typeList[currTypeSize]);
			currTypeSize = num;
			emailDisplay.classList.add(typeList[currTypeSize]);
		}
	}

	this.enter = function(){
		initEmailDisplay();

	    nextDelay = configHandler.get('timeout', 60) * 1000;

	    nextTimeout = setTimeout(function(){
	      window.events.dispatchEvent(new Event('next'));
	    }, nextDelay);
	}

	this.exit = function(/*evt*/){
		clearTimeout(nextTimeout);

		// clearInterval(tryInterval);
  //   	window.removeEventListener("share_online", shareOnlineRef);
  //   	window.removeEventListener("share_done", shareDone);

		// var video = document.getElementById("share_video");
		// if ( video ){
		// 	video.pause();
		// 	video.removeEventListener("timeupdate", onTimeupdate);
		// }
		// // var source = document.getElementById("shareSource");
		// // source.setAttribute("src","");
		// // video.load(); //safari requires you to 'load' to know it no longer has a src
		
		// setTimeout( cleanup, 1500);

		// currentVideo = null;
	}

	function cleanup() {
		document.getElementById("shareOnlineContainer").classList.remove("enabled");
		document.getElementById("shareLocalContainer").classList.remove("enabled");
		document.getElementById("shareOnlineContainer").classList.add("disabled");
		document.getElementById("shareLocalContainer").classList.add("disabled");
		document.getElementById("shareOnlineContainer").classList.remove("freezeAnim");
		document.getElementById("shareLocalContainer").classList.remove("freezeAnim");

		var cont = document.getElementById("shareBackground");
		cont.innerHTML = "";

	    var btn = document.getElementById("shareOnlineBtn");
	    btn.classList.remove("disabled");
	}

	function shareDone(){
		var showLocalShare = configHandler.get("showLocalShare", false);
	    if ( showLocalShare ){
			document.getElementById("shareOnlineContainer").classList.remove("enabled");
			document.getElementById("shareOnlineContainer").classList.add("disabled");

			setTimeout(function(){
				document.getElementById("shareLocalContainer").classList.add("enabled");
				document.getElementById("shareLocalContainer").classList.remove("disabled");

				setTimeout(function(){
					document.getElementById("shareLocalContainer").classList.add("freezeAnim");
				}, 1000)

			}, 1000);
	    } else {
			document.getElementById("shareOnlineContainer").classList.add("freezeAnim");
		    window.events.dispatchEvent( new Event("next") );
	    }
	}

	function shareOnline() {
	    var shareServer = configHandler.get('shareServer', "http://localhost:8013");
	    var url = shareServer + "/video";
	    var filename = "performance/" + currentVideo;

	    try {
		    var xhttp = new XMLHttpRequest();
		    xhttp.open("POST", url, true);
		    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		    xhttp.send( "filename=" + filename );
		} catch(e){}

	    // then hide the button...
	    window.removeEventListener("share_online", shareOnlineRef);
	    var btn = document.getElementById("shareOnlineBtn");
	    btn.classList.add("disabled");

	    var showLocalShare = configHandler.get("showLocalShare", false);
	    if ( showLocalShare ){
			document.getElementById("shareOnlineContainer").classList.remove("enabled");
			document.getElementById("shareOnlineContainer").classList.add("disabled");
			setTimeout(function(){
				document.getElementById("shareLocalContainer").classList.add("enabled");
				document.getElementById("shareLocalContainer").classList.remove("disabled");

				setTimeout(function(){
					document.getElementById("shareLocalContainer").classList.add("freezeAnim");
				}, 1000)

			}, 1000);
	    } else {
			document.getElementById("shareOnlineContainer").classList.add("freezeAnim");
		    window.events.dispatchEvent( new Event("next") );
	    }
	  }
};
