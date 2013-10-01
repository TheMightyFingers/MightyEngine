"use strict";
var global = global || this.window || {};
this.Tools = {
	createMeta: function(item, plugin, onTypeChange, Import, ImportDef){

		Import = Import || global.Import
		ImportDef = ImportDef || global.ImportDef
		plugin = plugin || item.editor.plugin;
		
		var itemType = null;
		var reversedType = null;
		var val;
		if(Import[plugin]){
			itemType = Import[plugin].Type;
			var reversedType = this.reverse(itemType);
			if(item && item.type){
				val = reversedType[item.type];
			}
			else{
				val = reversedType[0];
			}
		}
		
		
		var meta = this.parseImportDef(plugin, val, ImportDef);
		if(!meta){
			//console.error("Failed to create meta "+item.name+ " " +plugin);
			return null;
		}
		
		
		if(itemType){
			meta.type = meta.type || {};
			meta.type._type = meta.type._type || "list";
			meta.type._use = meta.type._use || "Import."+plugin+".Type";
			
			if(onTypeChange){
				var onchange = meta.type.onchange;
				meta.type.onchange = function(){
					if(onchange){
						onchange.call(this);
					}
					onTypeChange.call(this);
				}
			}
		}
		
		
		return meta;
	},
	
	createPluginMeta: function(item, Import, ImportDef){
		return this.parseImportDef("Cfg", item.name, ImportDef);
	},
	
	createAddonMeta: function(item, Import, ImportDef){
		ImportDef = ImportDef || global.ImportDef;
		return this.parseImportDef("Addon", item.name, ImportDef);
	},
	
	parseImportDef: function(plugin, type, importDef){
		
		importDef = importDef || global.ImportDef;
		type = type || plugin.toUpperCase();
		var src,data,ob,o;
		if(plugin == void(0) || importDef[plugin] == void(0)){
			//console.error("ParseImportDef -> cannot find plugin");
			return null;
		}
		src = this.clone(importDef[plugin]);
		data = (src.ObjData || src);
		if(type == void(0) || data[type] == void(0)){
			type = this.ucfirst(type);
			
			if(data[type] == void(0)){
				return data.BASIC;
			}
		}
		ob = data[type];
		if(!ob.extend && type != "BASIC"){
			ob.extend = "BASIC";
		}
		o = this.collectExtend(ob,data);
		if(o.extend){
			delete o.extend;
		}
		return o;
	},

	collectExtend: function(ob,parent){
		if(!ob.extend){
			return ob;
		}

		var exts = [];
		
		var o = ob;
		while(o && o.extend && typeof(o.extend) == "string"){
			exts.push(o.extend);
			o = parent[o.extend];
		}
		
		
		exts.reverse();
		
		var out = {};
		for(var i=0,l=exts.length; i<l; i++){
			out = this.mergeObject(parent[exts[i]], out);
		}
		out = this.mergeObject(ob, out);

		return out;
	},
	
	mergeObject: function(ob1, ob2){
		if(ob1 == void(0)){
			return this.clone(ob2);
		}
		if(ob2 == void(0)){
			return this.clone(ob1);
		}
		
		var ret;
		if(Array.isArray(ob1)){
			ret = [];
		}
		else{
			ret = {};
		}
		var nn = this.clone(ob1);
		
		for(var i in ob2){
			ret[i] = ob2[i];
		}
		
		for(var i in nn){
			var type = typeof(nn[i]);

			if(type === "object" && type !== null){
				ret[i] = this.mergeObject( nn[i], ret[i]);
			}
			else{
				ret[i] = nn[i];
			}
		}
		return ret;
	},
	
	clone: function(obj) {
		// Handle the 3 simple types, and null or undefined
		if (null == obj || typeof(obj) != "object"){return obj;}
		var copy = null;
		// Handle Date
		if (obj instanceof Date) {
			copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			copy = [];
			for (var i = 0,len = obj.length; i < len; i++) {
				copy[i] = this.clone(obj[i]);
			}
			return copy;
		}
		
		if( obj instanceof RegExp){
			return new RegExp(obj);
		}
		
		// Handle Object
		copy = {};
		for (var attr in obj) {
			if (!obj.hasOwnProperty(attr)) {continue;}
			copy[attr] = this.clone(obj[attr]);
		}
		return copy;
	},
	
	reverse: function(obj){
		var out = {};
		for(var i in obj){
			out[obj[i]] = i;
		}
		return out;
	},
	
	isNumber: function (n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},
	
	ucfirst: function(str){
		if(typeof(str) !== "string"){
			console.warn("Not string",str);
			return str;
		}
		return str.charAt(0).toUpperCase() + str.substring(1);
	},
	
	inArray: function(arr,str){
		for(var i=0,l=arr.length; i<l; i++){
			if(arr[i] == str){
				return i;
			}
		}
		return -1;
	},
	
	strToFn: function(str){
		var body = str.substring(str.indexOf("{") + 1, str.lastIndexOf("}"));
		var args = str.substring(str.indexOf("(") + 1, str.indexOf(")"));
		args = args.split(" ").join("");
		
		return new Function(args.split(","),body);
	},
	
	fixImportDef: function (importDef){
		var out = null;
		
		if(typeof importDef == "object"){
			if(Array.isArray(importDef)){
				out = [];
			}
			else{
				out = {};
			}
		}
		
		
		for(var i in importDef){
			
			
			if(typeof importDef[i] === "object" && importDef[i] !== null){
				out[i] = this.fixImportDef(importDef[i]);
				continue;
			}
			if(importDef['__fn_src___'+i]){
				continue;
			}
			if(importDef['__fn__'+i]){
				out[i] = this.strToFn(importDef[i]);//.toString();
				continue;
			}
			out[i] = importDef[i];
		}
		return out;
	}
};

Object.size = Object.size || function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

