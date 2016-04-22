var share_perf = function(data){

	// how does this get populated?
	var currentData = {
		"videos":[
			{
				"timestamp":"04/07/2016 / 07:46 PM",
				"video":"output/performance/mmi_performance_2016-03-09-11-11-36-287.mp4_final.mp4"
			},
			{
				"timestamp":"04/07/2016 / 07:55 PM",
				"video":"output/performance/mmi_performance_2016-03-09-11-11-36-287.mp4_final.mp4"
			},
			{
				"timestamp":"04/07/2016 / 07:57 PM",
				"video":"output/performance/mmi_performance_2016-03-09-11-11-36-287.mp4_final.mp4"
			},
			{
				"timestamp":"04/07/2016 / 07:57 PM",
				"video":"output/performance/mmi_performance_2016-03-09-11-11-36-287.mp4_final.mp4"
			},
			{
				"timestamp":"04/07/2016 / 09:44 AM",
				"video":"output/performance/mmi_performance_2016-03-09-11-11-36-287.mp4_final.mp4"
			},
			{
				"timestamp":"04/07/2016 / 09:46 AM",
				"video":"output/performance/mmi_performance_2016-03-09-11-11-36-287.mp4_final.mp4"
			}
		]
	}

	window.addEventListener("updatePerfData", updateData);

	function updateData(data) {
		//...
	}


	function selectShare(evt) {
		// listening on next frame!
		window.dispatchEvent(new Event('next'));
	}

	this.enter = function(/*evt*/){
		window.addEventListener("selectPerf", selectShare);
		reloadList();
	};

	this.exit = function(/*evt*/){
		window.removeEventListener("selectPerf", selectShare);
	};

	function reloadList() {
		var container = document.getElementById("perfContainer");

		var templatePromise = Loader.loadHTML('share/share_perf/entries.hbr', currentData);
		templatePromise.
	      then( function resolve(html){
	        container.innerHTML = html;
	      }).
	      catch(function reject(reason){
	        log.warn('AM entries not loaded wah',reason);
	      });
	}
}
