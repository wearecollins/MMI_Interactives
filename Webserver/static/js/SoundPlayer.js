function SoundPlayer() {
	this.div = null;
	this.id  = null;
	this.onComplete = null;	
	this._onTimeUpdate = null;
	this.playing = false;
}

/**
 * Setup a player object
 * @param  {String} pageName [description]
 * @return {Boolean} True or false if this div exists
 */
SoundPlayer.prototype.setup = function( divId ) {
	this.div = document.getElementById(divId);

	if ( this.div === null ){
		// this div does not exist!
		return false;
	} else {
		return true;
	}
};

/**
 * Utility: Does this VO exist?
 * @return {Boolean} True or false if a) we're setup 
 * and/or b) we don't actually exist
 */
SoundPlayer.prototype.exists = function() {
	return (this.div !== null);
};

/**
 * Play the sound!
 * @param  {Function} onComplete (Optional) pass in a function to call when the sound completes
 * @return {[type]}            [description]
 */
SoundPlayer.prototype.play = function(onComplete) {
	var mainScope = this;
	if ( this.playing ){
		this.stop();
	}
	
	this.playing = true;

	function onTimeUpdate(){
		if ( this.currentTime >= this.duration ){
			if ( mainScope.onComplete != null
					&& typeof(mainScope.onComplete) == "function" ){
				mainScope.onComplete();
			}
			mainScope.onComplete = null;
			mainScope.div.removeEventListener("timeupdate", mainScope._onTimeUpdate);
		}
	}

	this._onTimeUpdate = onTimeUpdate;

	if ( this.div !== null ){
		this.onComplete = onComplete;
		this.div.currentTime = 0;
		this.div.play();
		this.div.addEventListener("timeupdate", this._onTimeUpdate);
	}
};

/**
 * Stop!
 */
SoundPlayer.prototype.stop = function() {
	this.playing = false;
	if ( this.div !== null ){
		this.onComplete = null;
		this.div.pause();
		this.div.currentTime = 0;
		this.div.removeEventListener("timeupdate", this._onTimeUpdate);
	}
};