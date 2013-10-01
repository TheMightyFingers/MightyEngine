"use strict";

Scene.Default = Scene.Base.extend
({
	setup: function() 
	{
		this.setupTemplates();
		this.setupLevel();
	},

	setupTemplates: function()
	{
		mighty.Template.init();
		mighty.Template.create("Loading");
		mighty.Template.create("FPS").show();
	},


	setupLevel: function()
	{
		mighty.engine.blockInput = true;
		
		if(!mighty.editor) {
			var levelID = Engine.Cfg.defaultLevel;
			this.loadLevel(Palettes.Map.getByID(levelID));
		}
	}
});