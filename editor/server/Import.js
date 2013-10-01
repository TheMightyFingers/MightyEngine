"use strict";
var that = this;

this.Define = function(scope, args)
{
	if(!scope || scope.length === 0) { return; }
	
	var scopeBuffer = scope.split(".");

	var item = "";
	var numItems = scopeBuffer.length;
	var prevScope = that.Import;

	for(var i = 0; i < numItems; i++){
		item = scopeBuffer[i];
		if(prevScope[item] === void(0)) {
			prevScope[item] = {};
		}

		prevScope = prevScope[item];
	}

	//
	if(args.length === 0) { return; }

	for(var key in args) {
		if(!args.hasOwnProperty(key)) {continue;}
		prevScope[args[key]] = 1;

	}

	that.OrderBuffer(prevScope);
};

this.DefineConst = function(scope, args)
{
	if(!scope || !scope.length) { return; }

	var scopeBuffer = scope.split(".");

	var item = "";
	var numItems = scopeBuffer.length;
	var prevScope = that.Import;

	for(var i = 0; i < numItems; i++)
	{
		item = scopeBuffer[i];
		if(prevScope[item] === void(0)) {
			prevScope[item] = {};
		}

		prevScope = prevScope[item];
	}

	//
	if(args.length === 0) { return; }

	for(var key in args) {
		if(!args.hasOwnProperty(key)) {continue;}
		prevScope[key] = args[key];
	}
};

this.DefineObj = function(scope, args)
{
	var importScope = Import[scope];
	if(typeof(importScope) === "undefined") {
		Import[scope] = {};
		importScope = Import[scope];
	}

	var importType = importScope["Obj"];
	if(typeof(importType) === "undefined") {
		importScope["Obj"] = {};
		importType = importScope["Obj"];
	}

	for(var key in args) {
		if (!args.hasOwnProperty(key)) {continue;}
		importType[key] = args[key];
	}
};

this.DefineObjData = function(scope, args)
{
	// ImportDef.Brush
	var importDef = ImportDef[scope];
	if(typeof(importDef) === "undefined") {
		ImportDef[scope] = {};
		importDef = ImportDef[scope];
	}

	// ImportDef.Brush
	var importDataDef = importDef["ObjData"];
	if(typeof(importDataDef) === "undefined") {
		importDef["ObjData"] = {};
		importDataDef = importDef["ObjData"];
	}

	for(var key in args) {
		if (!args.hasOwnProperty(key)) {continue;}
		importDataDef[key] = args[key];
	}
};


if(typeof(ImportDef["Brush"]) === "undefined") {
	ImportDef["Brush"] = {};
}
this.DefineStages = function(args)
{
	// Brush
	var importScope = that.Import["Brush"];
	if(typeof(importScope) === "undefined") {
		that.Import["Brush"] = {};
		importScope = that.Import["Brush"];
	}

	// Brush.Stages
	var importStages = importScope["Stage"];
	if(typeof(importStages) === "undefined") {
		importScope["Stage"] = {};
		importStages = importScope["Stage"];
	}

	// ImportDef.Brush
	var importDef = ImportDef["Brush"];

	// ImportDef.Brush.Stage
	var importStagesDef = importDef["Stage"];
	if(typeof(importStagesDef) === "undefined") {
		importDef["Stage"] = {};
		importStagesDef = importDef["Stage"];
	}

	for(var key in args)
	{
		var buffer = args[key];
		var length = buffer.length;

		importStagesDef[key] = buffer;

		for(var i = 0; i < length; ++i) {
			var item = buffer[i];
			importStages[item] = 1;
		}
	}

	that.OrderBuffer(importStages);
};

if(typeof(this.ImportDef["Cfg"]) === "undefined") {
	this.ImportDef["Cfg"] = {};
}

if(typeof(ImportDef["Addon"]) === "undefined") {
	this.ImportDef["Addon"] = {};
}

this.DefinePlugin = function(scope, args)
{
	var importDef = ImportDef["Cfg"];
	// ImportDef.Cfg
	var importCfgDef = importDef[scope];

	if(typeof(importCfgDef) === "undefined") {
		importDef[scope] = {};
		importCfgDef = importDef[scope];
	}

	for(var key in args) {
		if (!args.hasOwnProperty(key)) {continue;}
		importCfgDef[key] = args[key];
	}
};

this.DefineAddon = function(scope, args)
{
	var importDef = ImportDef["Addon"];
	// ImportDef.Addon
	var importCfgDef = importDef[scope];
	if(typeof(importCfgDef) === "undefined") {
		importDef[scope] = {};
		importCfgDef = importDef[scope];
	}

	for(var key in args) {
		if (!args.hasOwnProperty(key)) {continue;}
		importCfgDef[key] = args[key];
	}
};

this.OrderBuffer = function(buffer)
{
	var i = 0;

	for(var key in buffer) {
		buffer[key] = i++;
	}
};

this.ConvertKeyToID = function(buffer, idBuffer)
{
	for(var key in buffer)
	{
		var id = parseInt(idBuffer[key]);
		if(isNaN(id) || id === void(0)) { continue; }

		buffer[id] = buffer[key];
	}
};

this.FinalizeKeys = function(buffer)
{
	for(var key in buffer)
	{
		if(isNaN(key)) {
			delete buffer[key];
		}
	}
};

this.DefineEntity = function(obj)
{
	for(var key in obj)
	{
		if(key && obj[key])
		{
			Define("Entity.Type", [ key ]);
			DefineObj("Entity", obj);

			var dataObj = {};
			dataObj[key] = { extend: "GEOMETRY" };
			DefineObjData("Entity", dataObj);
		}
	}
};

this.DefineBrush = function(obj)
{
	for(var key in obj)
	{
		if(key && obj[key])
		{
			Define("Brush.Type", [ key ]);
			DefineObj("Brush", obj);

			var dataObj = {};
			dataObj[key] = { extend: "BASIC" };
			DefineObjData("Brush", dataObj);
		}
	}
};

this.DefineComponent = function(obj)
{
	for(var key in obj)
	{
		if(key && obj[key])
		{
			Define("Component.Type", [ key ]);
			DefineObj("Component", obj);

			var dataObj = {};
			dataObj[key] = { extend: "BASIC" };
			DefineObjData("Component", dataObj);
		}
	}
};


this.FixImport = function (){
	var needSave = 0;
	for(var i in that.Import){
		if(that.Import[i].Obj !== void(0)){
			this.ConvertKeyToID(that.Import[i].Obj, that.Import[i].Type);
			this.FinalizeKeys(that.Import[i].Obj);
		}
	}
	
	var enumStr = "__enum__.";
	var enumsToStrings = function(enums, toCopy, str){
		for(var key in enums){
			var type = typeof enums[key];
			if(type == 'object' && enums[key] != null){
				enumsToStrings(enums[key], toCopy[key], str+'.'+key);
				continue;
			}
			toCopy[key] = enumStr + str + '.' + key;
		}
	}
	
	var overwriteObject = function(a,b){
		for(var i in a){
			if(!a.hasOwnProperty(i)){
				continue;
			}
			
			if(typeof a[i] == "object"){
				if(Array.isArray(a[i])){
					b[i] = [];
				}
				else{
					b[i] = {};
				}
				overwriteObject(a[i],b[i]);
				continue;
			}
			b[i] = a[i];
		}
	};
	
	
	var mkClientImportDef = function(importDef, clientImportDef){
		for(var i in importDef){
			if(!importDef.hasOwnProperty(i)){
				continue;
			}
			
			if(typeof importDef[i] === "object" && importDef[i] !== null){
				if(Array.isArray(importDef[i])){
					clientImportDef[i] = [];
				}
				else{
					clientImportDef[i] = {};
				}
				mkClientImportDef(importDef[i], clientImportDef[i]);
				continue;
			}
			if(typeof importDef[i] === "function"){
				var fn = importDef[i];
				clientImportDef[i] = importDef[i].toString();
				clientImportDef['__fn__'+i] = "function";
				clientImportDef['__fn_src__'+i] = fn;
				continue;
			}
			clientImportDef[i] = importDef[i];
		}
	};

	mkClientImportDef(ImportDef, ClientImportDef);
	
	overwriteObject(Import, that.ImportUnResolvedEnums);
	
	enumsToStrings(Import, Import, "Import");
};
