var Game = function(socket){
	this.init(socket);
};

Game.prototype = {
	init: function(socket) {
		this.socket = socket;
		this.fs = require("fs");
	},
	
	a_Ping: function(data, cb) {
		if(typeof cb == "function"){
			cb("Pong",data);
		}
		this.socket.emitAll("Pong from client", this.socket.socket.id);
	},
	
	a_GetConfig: function(data, cb) {
		console.log("Game.CFG",Game.cfg);
		if(typeof cb == "function"){
			cb(Game.cfg);
		}
	},
	
	a_LoadLevel: function(levelId, cb)
	{	
		console.error("LoadLevel", this.socket);
		
		this.socket.leaveAllRooms();
		this.socket.joinRoom(levelId);
		this.fs.readFile(Game.cfg.mapsLocation+"/"+levelId+".map", "utf-8", function(err, content){
			if(err != null){
				cb(null);
				return;
			}
			cb(content);
		});
	},
	
	a_SaveLevel: function(data, cb) {
		var dataParsed = JSON.parse(data);
		var levelId = dataParsed.id;
		
		var that = this;
		
		this.fs.mkdir(Game.cfg.mapsLocation+"/offline",function() {
			that.fs.writeFile(Game.cfg.mapsLocation+"/"+levelId+".map", data, "utf-8",function(){
				that.fs.writeFile(Game.cfg.mapsLocation+"/offline/"+levelId+".js", "Map['level_"+levelId+"']  = "+data, "utf-8");
			});
		});
		
		cb("Saved");
	},
	
	a_Signal: function(data, cb){
		this.emitAll("Signal",data);
	},
	
	
	socket: null
};

this.Game = Game;
