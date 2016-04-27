var share_am = function(data){

	// how does this get populated?
	var currentData = {
		"images":[
			{
				"timestamp":"04/07/2016 / 07:46 PM",
				"image":"output/anythingmuppets/2016-04-07-19-46-36-095.png"
			},
			{
				"timestamp":"04/07/2016 / 07:55 PM",
				"image":"output/anythingmuppets/2016-04-07-19-55-10-562.png"
			},
			{
				"timestamp":"04/07/2016 / 07:57 PM",
				"image":"output/anythingmuppets/2016-04-07-19-57-18-741.png"
			},
			{
				"timestamp":"04/07/2016 / 07:57 PM",
				"image":"output/anythingmuppets/2016-04-07-19-57-20-544.png"
			},
			{
				"timestamp":"04/07/2016 / 09:44 AM",
				"image":"output/anythingmuppets/2016-04-08-09-44-53-934.png"
			},
			{
				"timestamp":"04/07/2016 / 09:46 AM",
				"image":"output/anythingmuppets/2016-04-08-09-46-45-890.png"
			}
		]
	}

	window.addEventListener("updateAMData", updateData);

	function updateData(data) {
		//...
	}


	function selectShare(evt) {
		// listening on next frame!
		window.events.dispatchEvent(new Event('next'));
	}

	this.enter = function(/*evt*/){
		window.addEventListener("selectAM", selectShare);
		reloadList();
	};
	this.exit = function(/*evt*/){
		window.removeEventListener("selectAM", selectShare);
	};

	function reloadList() {
		var container = document.getElementById("amContainer");

		var templatePromise = Loader.loadHTML('share/share_am/entries.hbr', currentData);
		templatePromise.
	      then( function resolve(html){
	        container.innerHTML = html;
	      }).
	      catch(function reject(reason){
	        log.warn('AM entries not loaded wah',reason);
	      });
	}
}
