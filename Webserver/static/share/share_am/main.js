var share_am = function(/*manager*/){
	this.enter = function(/*evt*/){
		reloadList();
	};
	this.exit = function(/*evt*/){
	};

	function reloadList() {
		var container = document.getElementById("amContainer");

		var currentData = {
			"images":[
				{"image":"output/anythingmuppets/2016-04-07-19-46-36-095.png"},
				{"image":"output/anythingmuppets/2016-04-07-19-55-10-562.png"},
				{"image":"output/anythingmuppets/2016-04-07-19-57-18-741.png"},
				{"image":"output/anythingmuppets/2016-04-07-19-57-20-544.png"},
				{"image":"output/anythingmuppets/2016-04-08-09-44-53-934.png"},
				{"image":"output/anythingmuppets/2016-04-08-09-46-45-890.png"}
			]
		}

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
