DefinePlugin("Server", {
	extend:"BASIC",
	port: {
		_type: "int",
		value: 8081
	},
	"offlineMode": {
		_type: "bool",
		value: false
	},
	"path": {
		_type: "string",
		value: "server"
	},
	useSocket: {
		_type: "bool",
		value: true
	}
});

Define("Server.Event", [
	"LOAD_LEVEL",
	"SAVE_LEVEL",
	"LEVEL_DATA_RECEIVED",
	"LEVEL_DATA_FAILED"
]);

