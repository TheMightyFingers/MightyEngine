"use strict";

Entity.Bunny = Entity.Geometry.extend
({
	load: function()
	{
		this.vx = 300 - 600 * Math.random();
		this.vy = 300 * Math.random();
		
		this.x = mighty.camera.width * Math.random() - mighty.camera.x;
		this.lifetime = 3000 * Math.random();
		
		this.addToUpdate();

		var self = this;
		this.addTimer(function(){
			self.replace();
		}, this.lifetime, 1);
	},
	
	replace: function()
	{
		this.removeFromUpdate();
		this.remove();
		Benchmark.plugin.addBunny();
	},

	update: function(delta)
	{
		if(this.vx > 0 && this.x > mighty.camera.width - mighty.camera.x) {
			this.vx = -this.vx;
		}
		else if(this.x < -mighty.camera.x) {
			this.vx = -this.vx;
		}
		
		if(this.vy > 0 && this.y > mighty.camera.height - mighty.camera.y) {
			this.vy = -this.vy;
		}
		else if(this.y < mighty.camera.y) {
			this.vy = -this.vy;
		}
		
		this.move(this.x + this.vx * delta, this.y + this.vy * delta);
	},


	//
	lifetime: 10000
});