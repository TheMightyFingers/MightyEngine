Server.Manager = Plugin.extend
({
	init: function()
	{
		this.initSocket();

		var self = this;
		SubscribeChannel(this, "Server", function(type, data) {
			return self.handleChannel(type,data);
		});
	},
	
	initSocket: function()
	{
		if(!window.io || !Server.Cfg.useSocket)
		{
			this.loadLevel = this.loadLevelAlien;
			this.saveLevel = this.saveLevelAlien;
			if(!window.location.hostname || Server.Cfg.offlineMode) {
				this.loadLevel = this.loadLevelOffline;
			}
			return;
		}
		
		if(Server.Cfg.offlineMode) {
			this.loadLevel = this.loadLevelOffline;
		}
		
		var self = this;
		var loc = window.location;
		this.socket = io.connect(loc.protocol + '//' + loc.hostname+ ':' + loc.port);
		this.socket.on("action", function(data) {
			var rAction = 'a_' + data.action;
			if(typeof(self[rAction]) === 'function') {
				self[rAction](data.data);
				return;
			}

			console.error("SOCKET ON", data);
		});
	},
	
	handleChannel: function(type, data)
	{
		switch(type)
		{
			case Server.Event.LOAD_LEVEL: {
				this.loadLevel(data);
			} break;
			
			case Server.Event.SAVE_LEVEL:
			{
				if(data.id === void(0)) {
					data.id = data.name || 0;
				}
				if(data.id === 0) {
					console.warn("Saving bad level 0");
				}
				var dataStr = JSON.stringify(data);
				this.saveLevel(dataStr, data.id);
			} break;
		}
	},
	
	loadLevel: function(data)
	{
		var scene = this.scene;
		this.emit("LoadLevel", data.id, function(levelData){
			if(levelData){
				scene.loadLevelData(JSON.parse(levelData), false);
				//SendSignal("Server",Server.Event.LEVEL_DATA_RECEIVED, levelData);
			}
			else{
				//SendSignal("Server",Server.Event.LEVEL_DATA_FAILED, data);
				scene.createEmptyLevel(data);
			}
		});
	},
	
	loadLevelAlien: function(data)
	{
		var scene = this.scene;
		mighty.Ajax({
			type: "POST",
			url: Server.Cfg.path + "/level.php",
			data: {
				id: data.id,
				action: "load",
				offlineMode: Server.Cfg.offlineMode
			},
			success: function(levelData) {
				console.log("(Scene Loaded)");
				scene.loadLevelData(JSON.parse(levelData), false);
			},
			fail: function() {
				console.log("(Error) loadLevel()", arguments);
				scene.createEmptyLevel(data);
			},
			error: function() {
				console.log("(Error) loadLevel()", arguments);
				scene.createEmptyLevel(data);
			}
		});
	},
	
	loadLevelOffline: function(data)
	{
		var scene = this.scene;
		var scriptTag = document.createElement("script");
		scriptTag.setAttribute("type", "text/javascript");
		scriptTag.setAttribute("src", "server/map/offline/" + data.id + ".js");
		scriptTag.onerror = function() { scene.createEmptyLevel(data); }
		scriptTag.onload = function() { scene.loadLevelData(Palettes.Map.getByID(data.id), true); }
		document.getElementsByTagName("head")[0].appendChild(scriptTag);
	},
	
	saveLevel: function(data, id)
	{
		this.emit("SaveLevel", data, function(levelData){
			console.log("level data -> saved");
			//SendSignal("Server",Server.Event.RECEIVE_LEVEL_DATA, levelData);
		});
	},

	// Php, ruby or another strange stuff.
	saveLevelAlien: function(data, id){
		var scene = this.scene;
		var fail = function(){
			scene.createEmptyLevel(data);
		};
		mighty.Ajax({
			type: "POST",
			url: Server.Cfg.path + "/level.php",
			data: {
				data: data,
				id: id,
				action: "save"
			},
			dataType: "json",
			success: function(levelData) {
				if(!levelData) {
					fail();
					return;
				}
				scene.loadLevelData(levelData, false);
			},
			fail: fail,
			error: fail
		});
	},
	
	a_Signal: function(data) {
		console.log("ServerSignal", data);
	},
	
	install: function(){
		//this.catchSignal("Input");
	},
	
	catchSignal: function(name)
	{
		var self = this;
		SubscribeChannel(this, name, function(type, obj) {
			self.socket.emit({
				action: "Signal",
				channel: name,
				type: type,
				obj: {
					x: obj.x,
					y: obj.y
				}
			});

			console.log(type, obj);
		});
	},
	
	emit: function(action, data, cb)
	{
		this.socket.emit("action", {
			action: action,
			data: data
		}, cb);
	},


	//
	socket: null
}); 
