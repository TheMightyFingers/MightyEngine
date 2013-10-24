"use strict";

mighty.TemplateJS.FPS = function()
{
	this.init = function()
	{
		var self = this;
		SubscribeChannel(this, "Scene", function(event, obj) { return self.handleSignal_Scene(event, obj); });
		SubscribeChannel(this, "Particle", function(event, obj) { return self.handleSignal_Particle(event, obj); });
	};


	this.handleSignal_Scene = function(event, data)
	{
		switch(event)
		{
			case Scene.Event.STATE:
			{
				this.ui.data.fps = data.fps;
			} return true;
		}

		return false;
	};

	this.handleSignal_Particle = function(event, data)
	{
		this.ui.data[event] = data;
		return true;
	}
};