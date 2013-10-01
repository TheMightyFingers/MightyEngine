(function () { "use strict";
var $estr = function() { return js.Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var DynamicResponse = function(req,res,fileName) {
	res.writeHead(404);
	res.end();
	return;
};
DynamicResponse.__name__ = true;
DynamicResponse.prototype = {
	__class__: DynamicResponse
}
var Socket = function(socket) {
	var _g = this;
	this.socket = socket;
	this.emitData = { action : null, data : null};
	this.rooms = [];
	this.socket.on("action",function(data,cb) {
		var data1 = _g.action(data.action,data.data,cb);
		if(data1 != null && cb != null) cb(data1);
	});
};
Socket.__name__ = true;
Socket.emitAllStatic = function(action,data,room) {
	var data1 = { action : action, data : data};
	Server.io.sockets["in"](room).emit("action",data1);
}
Socket.prototype = {
	emitAll: function(action,data) {
		var _g = 0, _g1 = this.rooms;
		while(_g < _g1.length) {
			var room = _g1[_g];
			++_g;
			this.emitData.action = action;
			this.emitData.data = data;
			Server.io.sockets["in"](room).emit("action",this.emitData);
		}
	}
	,emit: function(action,data) {
		this.emitData.action = action;
		this.emitData.data = data;
		this.socket.emit("action",this.emitData);
	}
	,leaveAllRooms: function() {
		var _g = 0, _g1 = this.rooms;
		while(_g < _g1.length) {
			var room = _g1[_g];
			++_g;
			this.leaveRoom(room);
		}
	}
	,leaveRoom: function(roomName) {
		HxOverrides.remove(this.rooms,roomName);
		this.socket.leave(roomName);
	}
	,joinRoom: function(roomName) {
		var _g = 0, _g1 = this.rooms;
		while(_g < _g1.length) {
			var room = _g1[_g];
			++_g;
			if(room == roomName) return;
		}
		
		this.rooms.push(roomName);
		//this.emitAll("room joined", "new participant");
		this.socket.join(roomName);
	}
	,action: function(action,data,cb) {
		var field = Reflect.field(this,"a_" + action);
		if(Reflect.isFunction(field)) return field.apply(this,[data,cb]); else {
			this.emit("FIXME",[action,data]);
			Server.debug("Not an action function",action);
			if(cb != null) cb();
		}
		return null;
	}
	,__class__: Socket
}
var FS = function() { }
FS.__name__ = true;
FS.mkdir = function(name,cb) {
	FS.queue.push(function() {
		FS._mkdir(name,function() {
			cb();
			if(FS.queue.length > 0) (FS.queue.shift())(); else FS.inProgress = false;
		});
	});
	if(!FS.inProgress) {
		FS.inProgress = true;
		(FS.queue.shift())();
	}
}
FS._mkdir = function(name,cb) {
	Server.fs.mkdir(name,function(err) {
		if(err) {
			if(err.errno == Server["const"][err.code]) {
				cb(true);
				return;
			}
			var dirname = Server.path.dirname(name);
			if(dirname == name) {
				Server.debug("FS::mkdir -> Error","too many recurse callbacks",name);
				Server.debug("error: ",err,cb.toString());
				cb(true);
				return;
			}
			FS._mkdir(dirname,function(fail) {
				if(fail) {
					cb(fail);
					return;
				}
				FS._mkdir(name,cb);
			});
			return;
		}
		cb();
	});
}
FS.scanDir = function(dir,cb,filterFn,filesList) {
	FS.queue.push(function() {
		FS._scanDir(dir,function(fileList) {
			if(cb) cb(fileList);
			if(FS.queue.length > 0) (FS.queue.shift())(); else FS.inProgress = false;
		},filterFn,filesList);
	});
	if(!FS.inProgress) {
		FS.inProgress = true;
		(FS.queue.shift())();
	}
}
FS._scanDir = function(dir,cb,filterFn,filesList) {
	var allFiles;
	if(filesList) allFiles = filesList; else allFiles = [];
	Server.fs.readdir(dir,function(err,files) {
		if(err) {
			Server.debug("FS::scanDir::readdir -> error",err);
			files = [];
		}
		var i = 0;
		var skipDirectory = false;
		var filterOut = false;
		var cbx = function() {
			if(i < files.length) {
				var file = dir + Server.path.sep + files[i];
				Server.fs.stat(file,function(err1,stats) {
					if(err1) {
						Server.debug("FS::scanDir::cbx -> error",err1);
						cb(allFiles);
					}
					skipDirectory = false;
					filterOut = false;
					if(filterFn) {
						if(!filterFn(files[i],file,stats)) {
							filterOut = true;
							skipDirectory = true;
						}
					}
					if(stats.isDirectory() && !skipDirectory) {
						i++;
						FS._scanDir(file,cbx,filterFn,allFiles);
						return;
					}
					if(!filterOut) allFiles.push(file);
					i++;
					cbx();
				});
			} else cb(allFiles);
		};
		cbx();
	});
}
FS.collectSources = function(files,cb) {
	FS.queue.push(function() {
		FS._collectSources(files,function(sources) {
			if(cb) cb(sources);
			if(FS.queue.length > 0) (FS.queue.shift())(); else FS.inProgress = false;
		});
	});
	if(!FS.inProgress) {
		FS.inProgress = true;
		(FS.queue.shift())();
	}
}
FS._collectSources = function(files,cb) {
	var i = 0;
	var sources = { };
	var cbx = function() {
		if(i < files.length) {
			Server.fs.stat(files[i],function(err,stats) {
				if(err) {
					Server.debug("FS::collectSources -> error",err);
					i++;
					cbx();
					return;
				}
				if(stats.isDirectory()) {
					i++;
					cbx();
					sources[files[i]] = "";
					return;
				}
				Server.fs.readFile(files[i],function(err1,contents) {
					if(err1) Server.debug("FS::collectSources -> failed to read file contents",err1);
					sources[files[i]] = contents.toString();
					i++;
					cbx();
				});
				return;
			});
			return;
		}
		cb(sources);
	};
	cbx();
}
var Server = function() {
	var server = Server.http.createServer($bind(this,this.response));
	server.listen(Server.cfg.port,Server.cfg.host);
	server.on("error",function(e) {
		Server.debug("Server::Error",e);
	});
	try {
		this.initSocket(server,$bind(this,this.onSocketReady));
	} catch( e ) {
		Server.debug("Server::SOCKET error",e);
	}
	Server.callbacks = [];
};
Server.__name__ = true;
Server.require = function(plugin) {
	return require(plugin);;
}
Server.initModules = function() {
	Server.http = Server.require("http");
	Server.fs = Server.require("fs");
	Server.sio = Server.require("socket.io");
	Server.path = Server.require("path");
	Server.sys = Server.require("util");
	Server.child = Server.require("child_process");
	Server.domain = Server.require("domain");
	Server.os = Server.require("os");
	Server["const"] = { EEXIST : 47};
	Server.mkzip = Server.mkzipN;
	Server.unzip = Server.unzipN;
	process.env.PATH = Server.path.resolve("./bin") + Server.path.delimiter + process.env.PATH;
	Server.debug(process.env.PATH);
}
Server.main = function(addCfg) {
	Server.initModules();
	var cfg;
	try {
		cfg = Server.require("./config.js").config;
	} catch( err ) {
		Server.debug("reading config failed, continue with default config",err);
		cfg = Server.require("./configDefault.js").config;
	}
	if(addCfg) cfg = Tools.mergeObjects(addCfg,cfg);
	Server.cfg = cfg;
	if(!Server.fs.exists) Server.fs.exists = Server.path.exists;
	Server.fs.exists(Server.path.resolve(Server.cfg.tmpPath),function(exists) {
		if(exists) return;
		FS.mkdir(Server.path.resolve(Server.cfg.tmpPath),Server.emptyFn);
	});
}
Server.emptyFn = function() {
}
Server.mkzipN = function(zipfile,path,cb) {
	Server.debug("executing zip",zipfile,path);
	var d = Server.domain.create();
	d.on("error",function(err) {
		Server.debug("ZIP:Error",err);
		Server.mkzip = Server.mkzipJs;
		Server.mkzipJs(zipfile,path,cb);
	});
	d.run(function() {
		var opts;
		opts = { cwd : Server.path.resolve(path), env : process.env};
		Server.debug("ZIP CMD::",Server.progs.zip + " -rvq " + Std.string(Server.path.resolve(zipfile)) + " ./");
		var zip = Server.child.spawn(Server.progs.zip,["-rvq",Server.path.resolve(zipfile),"./"],opts);
		zip.on("exit",function(code) {
			if(code != 0) {
				Server.debug("Server::Core","Falling back to zip JS");
				Server.mkzip = Server.mkzipJs;
				Server.mkzipJs(zipfile,path,cb);
				return;
			}
			cb("ZIP DONE");
		});
		zip.stdout.on("data",function(data) {
			Server.debug("ZIP:",data.toString());
		});
	});
}
Server.unzipN = function(zipfile,path,cb) {
	Server.debug("ZIP called",zipfile,path);
	var opts = null;
	var d = Server.domain.create();
	d.on("error",function(err) {
		Server.debug("spawn failed",err);
		Server.debug("Server::Core","Falling back to unzip JS");
		Server.unzip = Server.unzipJs;
		Server.unzipJs(zipfile,path,cb);
	});
	d.run(function() {
		var zip = Server.child.spawn("unzip",["-d",path,zipfile],null);
		zip.on("exit",function(code) {
			cb();
		});
		zip.stdout.on("data",function(data) {
			Server.debug("UNZIP:",data.toString());
		});
	});
}
Server.mkzipJs = function(zipfile,path,cb) {
	var Zip = Server.require("node-native-zip");
	var zip = new Zip();
	FS.scanDir(path,function(fileList) {
		FS.collectSources(fileList,function(list) {
			var keys = Object.keys(list);
			var _g = 0;
			while(_g < keys.length) {
				var file = keys[_g];
				++_g;
				try {
					zip.add(file.substring(path.length + 1),list[file]);
				} catch( e ) {
					Server.debug("zip add failed",e);
					continue;
				}
			}
			Server.fs.writeFile(zipfile,zip.toBuffer(),function(err) {
				cb("ZIP DONE");
			});
		});
	});
}
Server.unzipJs = function(zipfile,path,cb) {
	Server.debug("unzip to:",path);
	Server.debug("unZIP called",zipfile,path);
	var ZIP = Server.require("zip");
	Server.fs.readFile(zipfile,function(err,data) {
		var reader = ZIP.Reader(data);
		reader.toObject();
		var jobs = new Jobs(0,function() {
			if(cb != null) cb();
		});
		reader.forEach(function(entry) {
			var filename = entry.getName();
			var tmp = filename.split("/");
			tmp.pop();
			var tmpdir = path + "/" + tmp.join("/");
			jobs.add();
			FS.mkdir(tmpdir,function() {
				var data1 = entry.getData();
				Server.fs.writeFile(path + "/" + Std.string(filename),data1,$bind(jobs,jobs.done));
			});
		});
		$iterator(reader)();
	});
}
Server.handleError = function(fileName,err,res) {
	res.setHeader("Content-Type","text/plain");
	res.writeHead(404);
	res.write("Error");
	res.write(fileName + "\r\n<br />");
	res.write(haxe.Json.stringify(err));
	res.write("\r\n");
	res.end("Not found\n");
	return;
}
Server.getMime = function(mime) {
	return Server.cfg.mimes[mime];
}
Server.debug = function(type,obj,obj2) {
	return;
	console.log("\n");
	console.log(type);
	if(obj != null) console.log(obj);
	if(obj2 != null) console.log(obj2);
}
Server.prototype = {
	onDirectoryRequest: function(request,response,path) {
	}
	,onFileNotFound: function(request,response,fileName,path) {
	}
	,onHttpRequest: function(request,response,fileName) {
		return false;
	}
	,onSocketReady: function(socket) {
	}
	,initSocket: function(server,cb) {
		var sio = Server.sio;
		Server.io = sio.listen(server);
		Server.io.set("log level",Server.cfg.logLevel);
		Server.io.set("transports",["websocket","jsonp-polling","htmlfile","xhr-polling"]);
		Server.io.set("close timeout",9000);
		Server.io.sockets.on("connection",cb);
	}
	,streamFile: function(fileName,ext,res) {
		var readStream = Server.fs.createReadStream(fileName);
		try {
			readStream.on("open",function() {
				res.setHeader("Content-Type",Server.getMime(ext));
				res.setHeader("Connection","keep-alive");
				res.writeHead(200);
				readStream.pipe(res);
				return;
			});
			readStream.on("error",function(err) {
				res.writeHead(404);
				res.end("ERROR");
				return;
			});
		} catch( e ) {
			Server.debug("Server::Error get filename",fileName);
		}
	}
	,stat: function(fileName,ext,req,res,onFail,onDir) {
		var _g = this;
		Server.fs.stat(fileName,function(err,stats) {
			if(err != null) {
				onFail(stats);
				return;
			}
			if(stats.isDirectory()) {
				onDir(stats);
				return;
			}
			if(stats.size < 100000) {
				Server.fs.readFile(fileName,function(err1,content) {
					if(err1 != null) {
						Server.handleError(fileName,err1,res);
						return;
					}
					res.setHeader("Content-Type",Server.cfg.mimes[ext]);
					res.setHeader("Connection","keep-alive");
					res.writeHead(200);
					res.end(content);
				});
				return;
			}
			_g.streamFile(fileName,ext,res);
		});
	}
	,getFile: function(fileName,req,res,ext,i) {
		if(i == null) i = 0;
		var _g = this;
		if(Server.cfg.webRoot.length == i) {
			Server.debug("File not found",Server.path.resolve(fileName,Server.cfg.webRoot[i - 1] + fileName));
			this.onFileNotFound(req,res,fileName,Server.cfg.webRoot[i - 1]);
			return;
		}
		var fullPathToFile = Server.cfg.webRoot[i] + fileName;
		this.stat(fullPathToFile,ext,req,res,function(stats) {
			if(Server.cfg.webRoot.length > i - 1) _g.getFile(fileName,req,res,ext,++i);
		},function(stats) {
			_g.onDirectoryRequest(req,res,fileName);
		});
	}
	,response: function(req,res) {
		var index = req.url.indexOf("?");
		var fileName = req.url, ext = "";
		if(index > -1) fileName = req.url.substring(0,index);
		if(this.onHttpRequest(req,res,fileName)) return;
		if(fileName == "/") {
			fileName = "/index.html";
			ext = "html";
		} else ext = fileName.substring(fileName.lastIndexOf(".") + 1);
		res.setHeader("Access-Control-Allow-Origin","*");
		this.getFile(fileName,req,res,ext);
	}
	,__class__: Server
}
var GameServer = function() {
	Server.call(this);
};
GameServer.__name__ = true;
GameServer.main = function() {
	var cfg = { port : 8081};
	var cmdArgs = process.argv;
	if(cmdArgs.length > 2) cfg.port = cmdArgs[2];
	Server.main(cfg);
	new GameServer();
}
GameServer.__super__ = Server;
GameServer.prototype = $extend(Server.prototype,{
	onDirectoryRequest: function(req,res,path) {
		this.getFile(path + "index.html",req,res,"html");
	}
	,onSocketReady: function(socket) {
		new GameSocket(socket);
	}
	,onFileNotFound: function(req,res,fileName,path) {
		new DynamicResponse(req,res,fileName);
	}
	,onHttpRequest: function(req,res,fileName) {
		if(fileName == "/upload") return true;
		if(fileName.indexOf("level.php") > -1) return true;
		return false;
	}
	,__class__: GameServer
});
var GameSocket = function(socket) {
	Server.debug(Server.path.resolve("./game.js"));
	var g = Server.require("./game.js");
	Server.debug(Server.cfg);
	g.Game.cfg = Server.cfg;
	Socket.call(this,socket);
	var that = this;
	that.myGame = new g.Game(this);
};
GameSocket.__name__ = true;
GameSocket.__super__ = Socket;
GameSocket.prototype = $extend(Socket.prototype,{
	action: function(action,data,cb) {
		if(Tools.getType(this.myGame["a_" + action]) == "function") {
			Server.debug(action,data,cb);
			this.myGame["a_" + action](data,cb);
			return null;
		}
		var field = Reflect.field(this,"a_" + action);
		if(Reflect.isFunction(field)) return field.apply(this,[data,cb]); else {
			this.emit("FIXME",[action,data]);
			Server.debug("Not an action function",action);
		}
		return null;
	}
	,__class__: GameSocket
});
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
}
HxOverrides.remove = function(a,obj) {
	var i = 0;
	var l = a.length;
	while(i < l) {
		if(a[i] == obj) {
			a.splice(i,1);
			return true;
		}
		i++;
	}
	return false;
}
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
}
var Jobs = function(count,cb,debug) {
	if(debug == null) debug = false;
	this.count = count;
	this.cb = cb;
	this.debug = debug;
};
Jobs.__name__ = true;
Jobs.prototype = {
	add: function(count) {
		if(count == null) count = 1;
		if(this.debug) Server.debug("Jobs::add",count);
		this.count += count;
	}
	,done: function() {
		this.count--;
		if(this.debug) Server.debug("Jobs::done",this.count);
		if(this.count == 0) this.cb();
	}
	,__class__: Jobs
}
var IMap = function() { }
IMap.__name__ = true;
var Reflect = function() { }
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	} catch( e ) {
	}
	return v;
}
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
}
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
}
var Std = function() { }
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
StringBuf.prototype = {
	__class__: StringBuf
}
var Tools = function() { }
Tools.__name__ = true;
Tools.clone = function(obj) {
	var out;
	var type = typeof obj;
	if(!obj || type != "object") return obj;
	if(Tools.isArray(obj)) {
		out = [];
		var tmpArr = obj;
		var _g = 0;
		while(_g < tmpArr.length) {
			var item = tmpArr[_g];
			++_g;
			if(typeof(item) === "object" && item != null) out.push(Tools.clone(item)); else out.push(item);
		}
		return out;
	}
	out = { };
	var keys = Object.keys(obj);
	var _g = 0;
	while(_g < keys.length) {
		var key = keys[_g];
		++_g;
		var o = obj[key];
		if(typeof(o) === "object" && o != null) out[key] = Tools.clone(o); else out[key] = o;
	}
	return out;
}
Tools.mergeObjects = function(ob1,ob2) {
	if(ob1 == null) return Tools.clone(ob2);
	if(ob2 == null) return Tools.clone(ob1);
	var ret = Tools.clone(ob1);
	var t1;
	var t2;
	t1 = typeof(ob1);
	t2 = typeof(ob2);
	if(t2 != "object") return ret;
	var keys = Object.keys(ob2);
	var _g = 0;
	while(_g < keys.length) {
		var key = keys[_g];
		++_g;
		var type = Type["typeof"](ob1[key]);
		var type2 = Type["typeof"](ob2[key]);
		if(type != null) {
			if(type2 == "undefined") continue;
			ret[key] = Tools.mergeObjects(ret[key],Tools.clone(ob2[key]));
		} else {
			if(type != "undefined") continue;
			ret[key] = ob2[key];
		}
	}
	return ret;
}
Tools.getType = function(obj) {
	return typeof obj;
}
Tools.isArray = function(a) {
	return Array.isArray(a);
}
var ValueType = { __ename__ : true, __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] }
ValueType.TNull = ["TNull",0];
ValueType.TNull.toString = $estr;
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.toString = $estr;
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.toString = $estr;
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.toString = $estr;
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.toString = $estr;
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.toString = $estr;
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; }
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; }
ValueType.TUnknown = ["TUnknown",8];
ValueType.TUnknown.toString = $estr;
ValueType.TUnknown.__enum__ = ValueType;
var Type = function() { }
Type.__name__ = true;
Type["typeof"] = function(v) {
	var _g = typeof(v);
	switch(_g) {
	case "boolean":
		return ValueType.TBool;
	case "string":
		return ValueType.TClass(String);
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	case "object":
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c = v.__class__;
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	case "function":
		if(v.__name__ || v.__ename__) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
}
Type.enumIndex = function(e) {
	return e[1];
}
var haxe = {}
haxe.Json = function() {
};
haxe.Json.__name__ = true;
haxe.Json.stringify = function(value,replacer) {
	return new haxe.Json().toString(value,replacer);
}
haxe.Json.prototype = {
	quote: function(s) {
		this.buf.b += "\"";
		var i = 0;
		while(true) {
			var c = s.charCodeAt(i++);
			if(c != c) break;
			switch(c) {
			case 34:
				this.buf.b += "\\\"";
				break;
			case 92:
				this.buf.b += "\\\\";
				break;
			case 10:
				this.buf.b += "\\n";
				break;
			case 13:
				this.buf.b += "\\r";
				break;
			case 9:
				this.buf.b += "\\t";
				break;
			case 8:
				this.buf.b += "\\b";
				break;
			case 12:
				this.buf.b += "\\f";
				break;
			default:
				this.buf.b += String.fromCharCode(c);
			}
		}
		this.buf.b += "\"";
	}
	,toStringRec: function(k,v) {
		if(this.replacer != null) v = this.replacer(k,v);
		var _g = Type["typeof"](v);
		var $e = (_g);
		switch( $e[1] ) {
		case 8:
			this.buf.b += "\"???\"";
			break;
		case 4:
			this.objString(v);
			break;
		case 1:
			var v1 = v;
			this.buf.b += Std.string(v1);
			break;
		case 2:
			this.buf.b += Std.string(Math.isFinite(v)?v:"null");
			break;
		case 5:
			this.buf.b += "\"<fun>\"";
			break;
		case 6:
			var c = $e[2];
			if(c == String) this.quote(v); else if(c == Array) {
				var v1 = v;
				this.buf.b += "[";
				var len = v1.length;
				if(len > 0) {
					this.toStringRec(0,v1[0]);
					var i = 1;
					while(i < len) {
						this.buf.b += ",";
						this.toStringRec(i,v1[i++]);
					}
				}
				this.buf.b += "]";
			} else if(c == haxe.ds.StringMap) {
				var v1 = v;
				var o = { };
				var $it0 = v1.keys();
				while( $it0.hasNext() ) {
					var k1 = $it0.next();
					o[k1] = v1.get(k1);
				}
				this.objString(o);
			} else this.objString(v);
			break;
		case 7:
			var i = Type.enumIndex(v);
			var v1 = i;
			this.buf.b += Std.string(v1);
			break;
		case 3:
			var v1 = v;
			this.buf.b += Std.string(v1);
			break;
		case 0:
			this.buf.b += "null";
			break;
		}
	}
	,objString: function(v) {
		this.fieldsString(v,Reflect.fields(v));
	}
	,fieldsString: function(v,fields) {
		var first = true;
		this.buf.b += "{";
		var _g = 0;
		while(_g < fields.length) {
			var f = fields[_g];
			++_g;
			var value = Reflect.field(v,f);
			if(Reflect.isFunction(value)) continue;
			if(first) first = false; else this.buf.b += ",";
			this.quote(f);
			this.buf.b += ":";
			this.toStringRec(f,value);
		}
		this.buf.b += "}";
	}
	,toString: function(v,replacer) {
		this.buf = new StringBuf();
		this.replacer = replacer;
		this.toStringRec("",v);
		return this.buf.b;
	}
	,__class__: haxe.Json
}
haxe.ds = {}
haxe.ds.StringMap = function() { }
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,__class__: haxe.ds.StringMap
}
var js = {}
js.Boot = function() { }
js.Boot.__name__ = true;
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) {
					if(cl == Array) return o.__enum__ == null;
					return true;
				}
				if(js.Boot.__interfLoop(o.__class__,cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
}
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; };
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; };
if(Array.prototype.indexOf) HxOverrides.remove = function(a,o) {
	var i = a.indexOf(o);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
Math.__name__ = ["Math"];
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i) {
	return isNaN(i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.prototype.__class__ = Array;
Array.__name__ = true;
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
if(typeof(JSON) != "undefined") haxe.Json = JSON;
FS.queue = new Array();
FS.inProgress = false;
Server.progs = { zip : "zip"};
GameServer.main();
})();

//@ sourceMappingURL=server.js.map