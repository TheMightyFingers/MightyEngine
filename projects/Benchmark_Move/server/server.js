(function () { "use strict";
var $estr = function() { return js.Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
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
		this.emitAll("room joined","new participiant");
		this.socket.join(roomName);
	}
	,action: function(action,data,cb) {
		var field = Reflect.field(this,"a_" + action);
		if(Reflect.isFunction(field)) return field.apply(this,[data,cb]); else {
			this.emit("FIXME",[action,data]);
			Server.debug("Not an action function",action);
		}
		return null;
	}
	,__class__: Socket
}
var FS = function(isDebug) {
	if(isDebug == null) isDebug = false;
	this.jobs = 0;
	this.fs = Server.fs;
	this.isDebug = isDebug;
};
FS.__name__ = true;
FS.cp = function(src,dst,cb) {
	var cbCalled = false;
	var done = function(err) {
		if(!cbCalled) {
			if(cb != null) cb(err);
			cbCalled = true;
		}
	};
	var rd = Server.fs.createReadStream(src);
	rd.on("error",function(err) {
		Server.debug("FS::cp -> src error",err,src);
		Server.debug("FS::cp",src,dst);
		done(err);
	});
	var wr = Server.fs.createWriteStream(dst);
	wr.on("error",function(err) {
		Server.debug("FS::cp -> dst error",err);
		Server.debug("FS::cp",src,dst);
		done(err);
	});
	wr.on("close",function(ex) {
		done(null);
	});
	rd.pipe(wr);
}
FS.prototype = {
	mkdir: function(path,cb) {
		var dirs = path.split("/");
		var currDir = "";
		var jobs = new Jobs(1,cb);
		var cbxx = function(index) {
			if(index >= dirs.length) {
				jobs.done();
				return;
			}
			currDir += dirs[index] + "/";
			var path1 = currDir;
			Server.fs.exists(path1,function(exists) {
				if(exists) {
					cbxx(++index);
					return;
				}
				Server.fs.mkdir(path1,function(err) {
					if(err != null) Server.debug("FS::mkdir FAILED to create dir:",path1,err);
					cbxx(++index);
				});
			});
		};
		cbxx(0);
		return;
	}
	,copyFiles: function(src,dst,files,cb,index) {
		if(index == null) index = 0;
		var _g = this;
		if(index >= files.length) {
			cb();
			return;
		}
		var file = files[index];
		if(file == "." || file == "..") {
			this.copyFiles(src,dst,files,cb,++index);
			return;
		}
		this.copy(src + "/" + file,dst + "/" + file,function() {
			_g.copyFiles(src,dst,files,cb,++index);
		});
	}
	,copy: function(src,dst,cb) {
		var _g = this;
		var jobs = new Jobs(1,function() {
			if(cb == null) return;
			cb();
		});
		this.fs.lstat(src,function(err,stat) {
			if(err != null) {
				Server.debug("FS::copy::stat failed",err);
				jobs.done();
				return;
			}
			if(!stat.isDirectory()) {
				FS.cp(src,dst,function(err1) {
					if(err1 != null) Server.debug("FS::cp -> ERROR",err1);
					jobs.done();
				});
				return;
			}
			_g.fs.mkdir(dst,function(err1) {
				if(err1 != null) {
					Server.debug("copy::mkdir failed",dst);
					_g.mkdir(dst,function(err2) {
						_g.fs.readdir(src,function(err3,files) {
							if(err3 != null) {
								Server.debug("FS::copy::readdir",err3);
								jobs.done();
								return;
							}
							_g.copyFiles(src,dst,files,function() {
								jobs.done();
							});
						});
					});
					return;
				}
				_g.fs.readdir(src,function(err2,files) {
					if(err2 != null) {
						Server.debug("FS::copy::readdir",err2);
						jobs.done();
						return;
					}
					_g.copyFiles(src,dst,files,function() {
						jobs.done();
					});
				});
			});
		});
	}
	,__class__: FS
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
};
Server.__name__ = true;
Server.main = function(addCfg) {
	Server.http = js.Node.require("http");
	Server.fs = js.Node.require("fs");
	Server.sio = js.Node.require("socket.io");
	Server.path = js.Node.require("path");
	Server.sys = js.Node.require("util");
	Server.child = js.Node.require("child_process");
	Server.os = js.Node.require("os");
	var cfg;
	try {
		cfg = js.Node.require("./config.js").config;
	} catch( err ) {
		Server.debug("reading config failed, continue with default config",err);
		cfg = js.Node.require("./configDefault.js").config;
	}
	if(addCfg) cfg = Tools.mergeObjects(addCfg,cfg);
	Server.cfg = cfg;
	if(!Server.fs.exists) Server.fs.exists = Server.path.exists;
	Server.fs.exists(Server.path.resolve(Server.cfg.tmpPath),function(exists) {
		if(exists) return;
		var fs = new FS();
		fs.mkdir(Server.path.resolve(Server.cfg.tmpPath),Server.emptyFn);
	});
}
Server.emptyFn = function() {
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
var ServerInterface = function() { }
ServerInterface.__name__ = true;
var GameServer = function() {
	Server.call(this);
};
GameServer.__name__ = true;
GameServer.__interfaces__ = [ServerInterface];
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
	var g = js.Node.require("./game.js");
	Socket.call(this,socket);
	var that = this;
	that.myGame = new g.Game(this);
};
GameSocket.__name__ = true;
GameSocket.__super__ = Socket;
GameSocket.prototype = $extend(Socket.prototype,{
	a_Signal: function(data,cb) {
		this.emitAll("Signal",data);
	}
	,a_SaveLevel: function(data,cb) {
		var dataParsed = haxe.Json.parse(data);
		var levelId = dataParsed.id;
		var fs = new FS();
		fs.mkdir(Std.string(Server.cfg.mapsLocation) + "/offline",function() {
			Server.fs.writeFile(Std.string(Server.cfg.mapsLocation) + "/" + levelId + ".map",data,"utf-8",function() {
				Server.fs.writeFile(Std.string(Server.cfg.mapsLocation) + "/offline/" + levelId + ".js","Map['level_" + levelId + "']  = " + data,"utf-8");
			});
		});
		cb("Saved");
	}
	,a_LoadLevel: function(levelId,cb) {
		this.leaveAllRooms();
		this.joinRoom(levelId);
		Server.fs.readFile(Std.string(Server.cfg.mapsLocation) + "/" + levelId + ".map","utf-8",function(err,content) {
			if(err != null) {
				cb(null);
				return;
			}
			cb(content);
		});
	}
	,action: function(action,data,cb) {
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
var Hash = function() { }
Hash.__name__ = true;
Hash.prototype = {
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
	,__class__: Hash
}
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
}
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
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
	done: function() {
		this.count--;
		if(this.debug) Server.debug("Jobs::done",this.count);
		if(this.count == 0) this.cb();
	}
	,__class__: Jobs
}
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
		if(hasOwnProperty.call(o,f)) a.push(f);
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
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
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
haxe.Json.parse = function(text) {
	return new haxe.Json().doParse(text);
}
haxe.Json.stringify = function(value) {
	return new haxe.Json().toString(value);
}
haxe.Json.prototype = {
	parseNumber: function(c) {
		var start = this.pos - 1;
		var minus = c == 45, digit = !minus, zero = c == 48;
		var point = false, e = false, pm = false, end = false;
		while(true) {
			c = this.str.charCodeAt(this.pos++);
			switch(c) {
			case 48:
				if(zero && !point) this.invalidNumber(start);
				if(minus) {
					minus = false;
					zero = true;
				}
				digit = true;
				break;
			case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
				if(zero && !point) this.invalidNumber(start);
				if(minus) minus = false;
				digit = true;
				zero = false;
				break;
			case 46:
				if(minus || point) this.invalidNumber(start);
				digit = false;
				point = true;
				break;
			case 101:case 69:
				if(minus || zero || e) this.invalidNumber(start);
				digit = false;
				e = true;
				break;
			case 43:case 45:
				if(!e || pm) this.invalidNumber(start);
				digit = false;
				pm = true;
				break;
			default:
				if(!digit) this.invalidNumber(start);
				this.pos--;
				end = true;
			}
			if(end) break;
		}
		var f = Std.parseFloat(HxOverrides.substr(this.str,start,this.pos - start));
		var i = f | 0;
		return i == f?i:f;
	}
	,invalidNumber: function(start) {
		throw "Invalid number at position " + start + ": " + HxOverrides.substr(this.str,start,this.pos - start);
	}
	,parseString: function() {
		var start = this.pos;
		var buf = new StringBuf();
		while(true) {
			var c = this.str.charCodeAt(this.pos++);
			if(c == 34) break;
			if(c == 92) {
				buf.b += HxOverrides.substr(this.str,start,this.pos - start - 1);
				c = this.str.charCodeAt(this.pos++);
				switch(c) {
				case 114:
					buf.b += "\r";
					break;
				case 110:
					buf.b += "\n";
					break;
				case 116:
					buf.b += "\t";
					break;
				case 98:
					buf.b += "";
					break;
				case 102:
					buf.b += "";
					break;
				case 47:case 92:case 34:
					buf.b += String.fromCharCode(c);
					break;
				case 117:
					var uc = Std.parseInt("0x" + HxOverrides.substr(this.str,this.pos,4));
					this.pos += 4;
					buf.b += String.fromCharCode(uc);
					break;
				default:
					throw "Invalid escape sequence \\" + String.fromCharCode(c) + " at position " + (this.pos - 1);
				}
				start = this.pos;
			} else if(c != c) throw "Unclosed string";
		}
		buf.b += HxOverrides.substr(this.str,start,this.pos - start - 1);
		return buf.b;
	}
	,parseRec: function() {
		while(true) {
			var c = this.str.charCodeAt(this.pos++);
			switch(c) {
			case 32:case 13:case 10:case 9:
				break;
			case 123:
				var obj = { }, field = null, comma = null;
				while(true) {
					var c1 = this.str.charCodeAt(this.pos++);
					switch(c1) {
					case 32:case 13:case 10:case 9:
						break;
					case 125:
						if(field != null || comma == false) this.invalidChar();
						return obj;
					case 58:
						if(field == null) this.invalidChar();
						obj[field] = this.parseRec();
						field = null;
						comma = true;
						break;
					case 44:
						if(comma) comma = false; else this.invalidChar();
						break;
					case 34:
						if(comma) this.invalidChar();
						field = this.parseString();
						break;
					default:
						this.invalidChar();
					}
				}
				break;
			case 91:
				var arr = [], comma = null;
				while(true) {
					var c1 = this.str.charCodeAt(this.pos++);
					switch(c1) {
					case 32:case 13:case 10:case 9:
						break;
					case 93:
						if(comma == false) this.invalidChar();
						return arr;
					case 44:
						if(comma) comma = false; else this.invalidChar();
						break;
					default:
						if(comma) this.invalidChar();
						this.pos--;
						arr.push(this.parseRec());
						comma = true;
					}
				}
				break;
			case 116:
				var save = this.pos;
				if(this.str.charCodeAt(this.pos++) != 114 || this.str.charCodeAt(this.pos++) != 117 || this.str.charCodeAt(this.pos++) != 101) {
					this.pos = save;
					this.invalidChar();
				}
				return true;
			case 102:
				var save = this.pos;
				if(this.str.charCodeAt(this.pos++) != 97 || this.str.charCodeAt(this.pos++) != 108 || this.str.charCodeAt(this.pos++) != 115 || this.str.charCodeAt(this.pos++) != 101) {
					this.pos = save;
					this.invalidChar();
				}
				return false;
			case 110:
				var save = this.pos;
				if(this.str.charCodeAt(this.pos++) != 117 || this.str.charCodeAt(this.pos++) != 108 || this.str.charCodeAt(this.pos++) != 108) {
					this.pos = save;
					this.invalidChar();
				}
				return null;
			case 34:
				return this.parseString();
			case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:case 45:
				return this.parseNumber(c);
			default:
				this.invalidChar();
			}
		}
	}
	,invalidChar: function() {
		this.pos--;
		throw "Invalid char " + this.str.charCodeAt(this.pos) + " at position " + this.pos;
	}
	,doParse: function(str) {
		this.str = str;
		this.pos = 0;
		return this.parseRec();
	}
	,quote: function(s) {
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
	,toStringRec: function(v) {
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
			this.buf.b += Std.string(v + 1 == v?null:v);
			break;
		case 5:
			this.buf.b += "\"<fun>\"";
			break;
		case 6:
			var _g_eTClass_0 = $e[2];
			if(_g_eTClass_0 == String) this.quote(v); else if(_g_eTClass_0 == Array) {
				var v1 = v;
				this.buf.b += "[";
				var len = v1.length;
				if(len > 0) {
					this.toStringRec(v1[0]);
					var i = 1;
					while(i < len) {
						this.buf.b += ",";
						this.toStringRec(v1[i++]);
					}
				}
				this.buf.b += "]";
			} else if(_g_eTClass_0 == Hash) {
				var v1 = v;
				var o = { };
				var $it0 = v1.keys();
				while( $it0.hasNext() ) {
					var k = $it0.next();
					o[k] = v1.get(k);
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
			this.toStringRec(value);
		}
		this.buf.b += "}";
	}
	,toString: function(v) {
		this.buf = new StringBuf();
		this.toStringRec(v);
		return this.buf.b;
	}
	,__class__: haxe.Json
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
js.Node = function() { }
js.Node.__name__ = true;
var $_;
function $bind(o,m) { var f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; return f; };
if(Array.prototype.indexOf) HxOverrides.remove = function(a,o) {
	var i = a.indexOf(o);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
}; else null;
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
if(typeof(JSON) != "undefined") haxe.Json = JSON;
js.Node.__filename = __filename;
js.Node.__dirname = __dirname;
js.Node.setTimeout = setTimeout;
js.Node.clearTimeout = clearTimeout;
js.Node.setInterval = setInterval;
js.Node.clearInterval = clearInterval;
js.Node.global = global;
js.Node.process = process;
js.Node.require = require;
js.Node.console = console;
js.Node.module = module;
js.Node.stringify = JSON.stringify;
js.Node.parse = JSON.parse;
GameServer.main();
})();
