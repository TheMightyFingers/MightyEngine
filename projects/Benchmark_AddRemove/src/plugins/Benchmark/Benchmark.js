"use strict";

Benchmark.Manager = Plugin.extend
({
	ready: function()
	{
		// Initialize statistics.
		var stats = new Stats();
		stats.setMode(2);
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
		document.body.appendChild(stats.domElement);
		this.stats = stats;
		this.stats.begin();

		for(var i = 0; i < 1000; i++) {
			this.addBunny();
		}
	},
	
	addBunny: function() {
		var bunny = mighty.CreateEntity("bunny");
		bunny.move(mighty.Random.getNumber(0, Terrain.Cfg.width), 0.0);
	},

	render: function()
	{
		this.stats.end();
		this.stats.begin();
	}
});