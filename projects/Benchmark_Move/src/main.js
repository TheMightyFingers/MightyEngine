"use strict";

function main()
{
	if(!mighty.engine.init("view")) {
		return;
	}

	var sceneMgr = new Scene.Manager();

	var defaultScene = new Scene.Default();
	sceneMgr.setCurrentScene(defaultScene);
	sceneMgr.update();
}

if(window.onload)
{
	var oldLoad = window.onload;
	window.onload = function() {
		oldLoad();
		mighty.Loader.load(main);
	};
}
else {
	window.onload = function() { mighty.Loader.load(main); };
}