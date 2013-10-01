"use strict";

Benchmark.Manager = Plugin.extend
({
	install: function()
	{
		this.container = [];
		this.numItemsToAdd = 5;
		this.isAdding = false;

		var self = this;
		mighty.OnInputDown(function(data) {
			self.isAdding = true;
		});

		mighty.OnInputUp(function(data) {
			self.isAdding = false;
		});

		// Initialize statistics.
		var stats = new Stats();
		stats.setMode(2);
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
		document.body.appendChild(stats.domElement);
		this.stats = stats;
		this.stats.begin();

		mighty.LoadTexture({ path: "assets/digger_icon" });
	},

	load: function()
	{
		this.width = Terrain.Cfg.width;
		this.height = Terrain.Cfg.height;

		var entity = new Entity.Geometry({ texture: "digger_icon" });
		entity.speedX = mighty.Random.getNumber(10, 30) * 0.5;
		entity.speedY = mighty.Random.getNumber(10, 30) * 0.5;
		Entity.plugin.addEntity(entity);
		this.container.push(entity);

		SendSignal("Scene", Scene.Event.ITEMS, this.container.length);
	},


	render: function(tDelta)
	{
		this.stats.end();
		this.stats.begin();

		var entity = null;
		var x = 0, y = 0;

		if(this.isAdding)
		{
			for(var n = 0; n < this.numItemsToAdd; n++)
			{
				entity = new Entity.Geometry({ texture: "digger_icon" });
				entity.speedX = mighty.Random.getNumber(10, 30) * 0.5;
				entity.speedY = mighty.Random.getNumber(10, 30) * 0.5;
				Entity.plugin.addEntity(entity);
				this.container.push(entity);
			}

			SendSignal("Scene", Scene.Event.ITEMS, this.container.length);
		}

		var numItems = this.container.length;
		for(var i = 0; i < numItems; i++)
		{
			entity = this.container[i];
			x = entity.x + entity.speedX;
			y = entity.y + entity.speedY;

			if(entity.x > this.width) {
				entity.speedX *= -1;
				x = this.width - entity.volume.sizeX;
			}
			else if(entity.x < 0) {
				entity.speedX *= -1;
				x = 0;
			}

			if(entity.y > this.height) {
				entity.speedY *= -1;
				y = this.height - entity.volume.sizeY;
			}
			else if(entity.y < 0) {
				entity.speedY *= -1;
				y = 0;
			}

			entity.forceMove(x, y);
		}
	}
});