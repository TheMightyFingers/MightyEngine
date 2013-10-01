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

mighty.OnDomLoad(function() {
	mighty.Loader.load(main);
});