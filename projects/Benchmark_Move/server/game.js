var Game = function(socket){
	this.init(socket);
};

Game.prototype = {
	init: function(socket){
		this.socket = socket;
	},
	
	a_ping: function(data, cb){
		cb("pong",data);
		
	},
	
	socket: null
};

//export game
this.Game = Game;
