"use strict";

Benchmark.Manager = Plugin.extend
({
	ready: function()
	{
		this.bunnies = [];
		for(var i = 0; i < 1000; i++) {
			this.addBunny();
		}
	},
	
	addBunny: function() {
		var bunny = mighty.CreateEntity("bunny");
		bunny.move(mighty.Random.getNumber(0, Terrain.Cfg.width), 0.0);
		this.bunnies.push(bunny);
	}
});