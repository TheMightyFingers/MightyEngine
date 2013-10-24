"use strict";

Scene.Default = Scene.Base.extend
({
	setup: function() 
	{
		mighty.Template.init();
		mighty.Template.create("Loading");
		mighty.Template.create("FPS").show();
	},


	ready: function()
	{
		Input.Cfg.preventDefault = false;

		this.particle = new Entity.Particle({ x: 300, y: 400 });
		this.particle.loadPreset("fire");
		this.particle.texture = new Resource.Texture();
		this.particle.texture.load("http://mightyfingers.com/tutorial/gfx/particle.png");
		Entity.plugin.add(this.particle);

		var data = {};
		data.play = function() {
			if(self.particle.isPaused) { self.particle.play(); }
			else { self.particle.pause(); }
		};
		data.reset = function() {
			self.particle.loadPreset(data.preset);
		};
		data.enableTexture = false;
		data.preset = "fire";
		data.followInput = false;
		data.relativePosition = false;

		var self = this;
		var presets = { Clean: "clean", Fire: "fire", Fountain: "fountain", Raindrops: "raindrops" };

		//
		this.gui = new dat.GUI();
		this.gui.width = 320;

		var element = this.gui.add(data, "play").name("Pause");
		element.onChange(function()
		{
			if(!particle.isPaused) {
				element.name("Play");
			}
			else {
				element.name("Pause");
			}
		});

		this.gui.add(data, "reset").name("Reset");

		// BASIC
		var preset = this.gui.addFolder("Preset");
		preset.add(data, "preset", presets).onChange(function(value) {
			data.preset = value;
			self.particle.loadPreset(value);
		});

		var basic = this.gui.addFolder("Basic");
		basic.add(this.particle, "maxParticles").min(0);
		basic.add(this.particle.preset, "emissionRate");
		basic.add(this.particle.preset, "life");
		basic.add(this.particle.preset, "lifeVar");

		basic.add(data, "followInput").onChange(function(value) {
			if(value)
			{
				mighty.OnInputMove(this, function(data) {
					self.particle.move(data.x, data.y);
				});
			}
			else {
				mighty.RemoveOnInputMove(this);
			}
		});
		basic.add(data, "relativePosition").onChange(function(value) {
			self.particle.relativePosition = value;
			self.particle.reset()
		});

		// POSITION
		var position = this.gui.addFolder("Position");
		position.add(this.particle, "x").min(0).max(mighty.engine.width).step(1).onChange(function(x) {
			self.particle.forceMove(x, self.particle.y);
		});
		position.add(this.particle, "y").min(0).max(mighty.engine.height).step(1).onChange(function(y) {
			self.particle.forceMove(self.particle.x, y);
		});
		position.add(this.particle.preset, "xVar").min(0).max(mighty.engine.width).step(1);
		position.add(this.particle.preset, "yVar").min(0).max(mighty.engine.height).step(1);

		var physics = this.gui.addFolder("Physics");
		physics.add(this.particle.preset, "speed").min(-300).max(300).step(0.1);
		physics.add(this.particle.preset, "speedVar").min(-300).max(300).step(0.1);
		physics.add(this.particle.preset, "angle").min(-360).max(360).step(0.1);
		physics.add(this.particle.preset, "angleVar").min(-360).max(360).step(0.1);
		physics.add(this.particle.preset, "gravityX").min(-300).max(300);
		physics.add(this.particle.preset, "gravityY").min(-300).max(300);
		physics.add(this.particle.preset, "radialAccel").min(-300).max(300);
		physics.add(this.particle.preset, "radialAccelVar").min(-300).max(300);
		physics.add(this.particle.preset, "tangentialAccel").min(-300).max(300);
		physics.add(this.particle.preset, "tangentialAccelVar").min(-300).max(300);

		// APPEARANCE
		var appearance = this.gui.addFolder("Appearance");
		var startColor = appearance.addFolder("startColor");
		startColor.add(this.particle.preset.startColor, "r").min(0).max(255).step(1).name("red");
		startColor.add(this.particle.preset.startColor, "g").min(0).max(255).step(1).name("green");
		startColor.add(this.particle.preset.startColor, "b").min(0).max(255).step(1).name("blue");
		startColor.add(this.particle.preset.startColor, "a").min(0.0).max(1.0).step(0.1).name("alpha");
		var startColorVar = appearance.addFolder("startColorVar");
		startColorVar.add(this.particle.preset.startColorVar, "r").min(0).max(255).step(1).name("red");
		startColorVar.add(this.particle.preset.startColorVar, "g").min(0).max(255).step(1).name("green");
		startColorVar.add(this.particle.preset.startColorVar, "b").min(0).max(255).step(1).name("blue");
		startColorVar.add(this.particle.preset.startColorVar, "a").min(0.0).max(1.0).step(0.1).name("alpha");
		var endColor = appearance.addFolder("endColor");
		endColor.add(this.particle.preset.endColor, "r").min(0).max(255).step(1).name("red");
		endColor.add(this.particle.preset.endColor, "g").min(0).max(255).step(1).name("green");
		endColor.add(this.particle.preset.endColor, "b").min(0).max(255).step(1).name("blue");
		endColor.add(this.particle.preset.endColor, "a").min(0.0).max(1.0).step(0.1).name("alpha");
		var endColorVar = appearance.addFolder("endColorVar");
		endColorVar.add(this.particle.preset.endColorVar, "r").min(0).max(255).step(1).name("red");
		endColorVar.add(this.particle.preset.endColorVar, "g").min(0).max(255).step(1).name("green");
		endColorVar.add(this.particle.preset.endColorVar, "b").min(0).max(255).step(1).name("blue");
		endColorVar.add(this.particle.preset.endColorVar, "a").min(0.0).max(1.0).step(0.1).name("alpha");
		appearance.add(this.particle.preset, "radius").min(0).max(100).step(1);
		appearance.add(this.particle.preset, "radiusVar").min(0).max(100).step(1);
		appearance.add(this.particle.preset, "startScale").min(0).max(10).step(0.1);
		appearance.add(this.particle.preset, "startScaleVar").min(0).max(10).step(0.1);
		appearance.add(this.particle.preset, "endScale").min(0).max(10).step(0.1);
		appearance.add(this.particle.preset, "endScaleVar").min(0).max(10).step(0.1);

		appearance.addTextArea(data, "enableTexture").onChange(function(value) {
			self.particle.preset.enableTexture = value;
		});

		appearance.add(this.particle, "additiveTexture");

		// Override loadPreset, so that if new preset is loaded it should update UI too.
		var prevLoadPreset = this.particle.loadPreset;
		this.particle.loadPreset = function(preset) {
			prevLoadPreset.call(self.particle, preset);
			self.updateUI();
		};

		this.tStart = Date.now();
		this.chnParticle = CreateChannel("Particle");
	},


	update: function(tDelta)
	{
		var tNow = Date.now();
		if(tNow - this.tStart >= 1000) {
			this.chnParticle.signal("numParticlesLive", this.particle.numParticlesLive);
			this.tStart = tNow;
		}
	},


	updateUI: function()
	{
		var ctrl, numCtrl, i;
		for(i in this.gui.__controllers) {
			this.gui.__controllers[i].updateDisplay();
		}

		for(i in this.gui.__folders) {
			ctrl = this.gui.__folders[i].__controllers;
			numCtrl = ctrl.length;
			for(var n = 0; n < numCtrl; n++) {
				ctrl[n].updateDisplay();
			}
		}
	}
});