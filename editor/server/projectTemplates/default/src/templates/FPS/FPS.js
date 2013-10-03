"use strict";

mighty.TemplateJS.FPS = function()
{
	this.init = function()
	{
		var self = this;
		SubscribeChannel(this, "Scene", function(event, obj) { return self.handleSignal_Scene(event, obj); });
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
};