"use strict";
if(typeof Server == "object"){
	console.log = Server.debug;
	console.error = Server.error;
}


var ImportType = {
	bool: "bool",
	boolean: "boolean",
	
	int: "int",
	uint: "uint",
	
	float: "float",
	number: "number",
	
	text: "text",
	string: "string",
	textarea: "textarea",
	
	color: "color",
	
	list: "list",
	
	array: "array",
	add: "add",
	
	upload: "upload",
	
	hidden: "hidden",
	
	link: "link",
	folder: "folder"
};
(function(scope){
	
	var Import = scope.Import;
	var ImportDef = scope.ImportDef;
	var Lists = scope.Lists;
	
	var Otito = function(object, metaIn, cb, parent, key){
		
		this.key = key;
		
		Otito.updateImport();
		Otito.updateImportDef();
		Otito.updateLists();
		
		this.parent = parent || this;
		
		this.object = Tools.clone(object);
		
		if(metaIn == void(0)){
			metaIn = object;
		}
		
		this.origMeta = metaIn;
		this.origObject = object;
		
		this.meta = this.setMeta(Tools.clone(metaIn));
		this.childs = null;
		
		this.parseMeta();
		
		this.cleanUpMeta();
		
		if(parent){
			//this.parent.object[key] = this.object;
		}
		this.cb = cb;
		
		return;
	};
	
	Otito.setImport = function(newImport){
		scope.Import = Import = newImport;
	};
	Otito.setImportDef = function(newImportDef){
		scope.ImportDef = ImportDef = newImportDef;
	};
	Otito.setLists = function(newLists){
		scope.Lists = Lists = newLists;
	};
	
	Otito.updateImport = function(){
		if(scope.Import != void(0)){
			Import = scope.Import;
		}
	};
	Otito.updateImportDef = function(){
		if(scope.Import != void(0)){
			Import = scope.Import;
		}
	};
	Otito.updateLists = function(){
		if(scope.Lists != void(0)){
			Lists = scope.Lists;
		}
	};
	
	Otito.getUse = function(use){
		if(typeof use != "string"){
			return use;
		}
		var uarr = use.split(".");
		var ret = scope;
		for(var i=0; i<uarr.length; i++){
			ret = ret[uarr[i]];
		}
		if(ret == void(0)){
			//console.error("Failed to resolve ", use);
			return {};
		}
		return ret;
	}
	
	
	Otito.prototype = {
		childs: null,
		parent: null,
		object: null,
		meta: null,
		cb: null,
		
		html: null,
		
		head: null,
		headless: false,
		headName: null,
		
		body: null,
		input: null,
		_isChanged: false,
		
		parentNode: null,
		
		empty: function(){},
		
		origObject: null,
		origMeta: null,
		
		setMeta: function(meta){
			var metaType = typeof(meta);
			if(metaType == "function"){
				meta = {
					_make: meta
				};
			}
			if(meta == void(0)){
				console.error("bad meta", this.parent.meta);
				return {};
			}
			
			
			if(meta._make){
				if(typeof(meta._make) === "string"){
					try{
						meta._make = eval(meta._make);
					}
					catch(e){
						console.error("META make eval failed",e);
					}
				}
				
				if(typeof(meta._make) === "string"){
					console.error("META MAKE BAD!!!!!");
					console.error(meta, meta._make);
				}
				else{
					var make = meta._make;
					try{
						meta = make(this, this.parent);
						if(!meta){
							console.error("meta._make returned null", make);
							meta = {};
						}
						else{
							meta._make = make;
						}
					}
					catch(e){
						console.error("Otito -> Make failed", e.message, e.stack);
						meta = {};
					}
					
					metaType = typeof(meta);
				}
			}
			
			if(metaType !== "object"){
				meta = {
					_type: metaType,
					value: meta
				};
			}
			//sometimes gets confusing
			if(typeof(meta.use) == "string"){
				meta._use = meta.use;
				meta.use = {};
			}
			
			if(meta._use){
				try{
					meta.use = Otito.getUse(meta._use);
				}
				catch(e){
					console.error("Import use failed to eval",e, meta._use);
					
				}
			}
			
			if(meta.use){
				var tmpUse = {};
				for(var i in meta.use){
					tmpUse[meta.use[i]] = i;
				}
				if(meta._reverse){
					meta.__reversed = meta.use;
					meta.use = tmpUse;
				}
				else{
					meta.__reversed = tmpUse;
				}
			}
			
			return meta;
		},
		
		metaToObject: function(object, meta){
			if(meta._valueOverride){
				return this.normalizeInput(meta, meta._valueOverride);
			}
			
			if(typeof meta == "object" && meta != void(0) && meta._type === void(0)){
				return new Otito(object, meta, null, this.parent, "xxx");
			}
			
			if(meta._type == ImportType.list){
				
				if( meta.__reversed[object] ){
					return this.normalizeInput(meta, object);
				}
				else{
					this.parent.hasChanged("Otito changed cannot find LIST value: ");
					var keys = Object.keys(meta.__reversed);
					
					var tmp ;
					
					if(meta._reverse){
						tmp = meta.__reversed[meta._value];
					}
					else{
						tmp = meta.use[meta._value];
					}
					
					var val =  tmp || meta.value || keys[0];
					//console.log("item new Value:",val);
					var ret = this.normalizeInput(meta, val);
					//console.log("item normalized value:",ret);
					return ret;//this.normalizeInput(meta, val);
				}
				
			}
			
			return this.normalizeInput(meta, object);
		},
		
		normalizeInput: function(meta, value){
			if(value === void(0)){
				this.parent.hasChanged("Otito changed ->  new value is undefined", this.key, meta); 
			}
			var val;
			if(value == void(0)){
				val = meta.value;
			}
			else{
				val = value;
			}
			
			switch(meta._type){
				case ImportType.bool:
				case ImportType.boolean:
					if(val === "true"){
						return true;
					}
					if(val === "false"){
						return false;
					}
					
					return !!val;
				
				case ImportType.int:
				case ImportType.uint:
					return parseInt(val,10) || 0;
					
				case ImportType.float:
				case ImportType.number:
					return parseFloat(val) || 0;
					
				case ImportType.text:
				case ImportType.string:
				case ImportType.textarea:
					if(val != void(0)){
						return val+"";
					}
					return meta.value || "";
					
				case ImportType.color:
					return val || "#FFFFFF";
					
				case ImportType.list:
					var tmp = parseInt(val)
					if(isNaN(val) || tmp+"" != val){
						return val;
					}
					else{
						return tmp;
					}
					

			}
			
			return val;
		},
		
		parseMeta: function(){
			//simple array
			if(this.meta._type == ImportType.array){
				
				this.object = this.object || [];
				this.childs = [];
				
				this.meta.array = this.setMeta(this.meta.array);
				
				for(var i=0; i<this.object.length; i++){
					
					this.childs[i] = new Otito(this.object[i], this.meta.array, null, this.parent, i);
					this.object[i] = this.childs[i].object;
					this.meta[i] = this.childs[i].meta;
				}
				return;
			}
			
			if(Array.isArray(this.meta)){
				
				this.childs = [];
				this.object = this.object || [];
				
				for(var i=0; i<this.meta.length; i++){
					var head = this.meta[i]._head;
					delete this.meta[i]._head;
					this.childs[i] = new Otito(this.object[i], this.meta[i], null, this.parent, i);
					//save for html
					if(head  != void(0) ){
						this.childs[i].meta._head = head;
					}
					
					this.meta[i] = this.childs[i].meta;
					this.object[i] = this.childs[i].object;
				}
				return;
			}
			
			if(typeof(this.meta) !== "object"){
				console.error("BAD META",this);
				return;
			}
			
			//simple inputs
			if(this.meta._type != void(0)){
				this.object = this.metaToObject(this.object, this.meta);
				return;
			}
			
			if(typeof(this.object) != "object"){
				this.object = {};
			}
			
			this.childs = {};
			this.object = this.object || {};
			
			//rest meta
			for(var i in this.meta){
				//skip some private stuff
				if( i.substring(0,2) == "__"){
					continue;
				}
				if(i == "_make"){
					continue;
				}
				this.childs[i] = new Otito(this.object[i], this.meta[i], null, this.parent, i);
				
				//set fixed meta
				this.meta[i] = this.childs[i].meta;
				this.object[i] = this.childs[i].object;
			}
		},
		
		cleanUpMeta: function(){
			if(typeof this.object !== "object"){
				return;
			}
			for(var i in this.object){
				if(this.meta[i] === void(0)){
					delete this.object[i];
				}
			}
			
			//inherit all child values
			for(var i in this.childs){
				if(!this.childs.hasOwnProperty(i)){
					continue;
				}
				this.object[i] = this.childs[i].object;
			}
			
			
			//save editor data
			
			if(this.object && !this.object.editor && this.origObject && this.origObject.editor && this.parent == this){
				this.object.editor = this.origObject.editor;
			}
			
		},
		
		hasChanged: function(reason){
			this._isChanged = true;
			if(this.origObject && this.origObject.editor){
				this.parent.object.editor = this.origObject.editor;
			}
		},
 
		getChanged: function(){
			return this._isChanged;
		},
		
		createHTML: function(className){
			this.html = document.createElement("div");
			this.html.className = className || "main";
			
			if( Array.isArray(this.childs) ){
				
				var fixed = Array.isArray(this.meta);
				
				for(var j = 0; j < this.childs.length; j++){
					
					var otito = this.childs[j];
					if(otito.childs != void(0) && !this.meta._type){
						var head = otito.meta._head || j;
						
						
						otito.createHTML("content");
						
						var folder = this.createFolder();
						
						//if(head){
							folder.appendChild(this.createHead(head));
						//}
						
						folder.appendChild(otito.html);
						
						this.html.appendChild(folder);
					}
					else{
						if(!this.body){
							this.body = document.createElement("div");
							this.html.appendChild(this.body);
						}
						var addClass = "";
						if(this.meta && this.meta.array && this.meta.array.addClass){
							addClass =  this.meta.array.addClass;
							
						};
						if(otito.childs){
							this.appendArrayElement(otito);
						}
						else{
							if(!this.body){
								this.body = document.createElement("div");
								this.html.appendChild(this.body);
							}
							//var addClass = this.meta.array.addClass || "";
							var item = this.createItemBody(j, "item dynamicBlock "+addClass);
							otito.input = item.input;
							otito.html = item;
							
							if(!fixed){
								var that = this;
								var remBtn = this.createRemoveBtn();
								item.appendChild(remBtn);
							}
							this.body.appendChild(item);
						}
						
					}
				}
				
				if(fixed){
					return;
				}
				if(this.body == void(0)){
					this.body = document.createElement("div");
					this.html.appendChild(this.body);
				}
				this.html.className += " inputDynamic";
				
				//add more button
				var that = this;
				this.html.appendChild(this.createAddButton(function(){
					
					
					var newItem = that.metaToObject(null, that.meta.array);
					if(typeof newItem == "object"){
						that.appendArrayElement(newItem);
						that.object.push(newItem.object);
						return;
					}
					
					that.object.push(newItem);
					var addClass = that.meta.array.addClass || "";
					var item = that.createItemBody(j, "item dynamicBlock "+addClass);
					item.input = item.input;
					item.html = item;
					
					var remBtn = that.createRemoveBtn();
					item.appendChild(remBtn);
					that.body.appendChild(item);
					
					
					
					if(that.parent.beautify){
						that.parent.beautify(that.object.length - 1,{meta: that.meta.array, input: item.input, html: item});
						
						//Otito.beautifyInputs(that, that.parent.beautify);
					}
					
				}));
				return;
			}
			
			var origInput = this.input;
			
			for(var i in this.childs){
				var child = this.childs[i];
				if(child  == void(0)){
					continue;
				}
				var headName = child.meta._head || i;
				if(child.childs){
					this.addFolder("folder" +  " " + (this.meta.__className || "") );
					this.addHead(headName);
					this.childs[i].createHTML("content ");
					this.body.appendChild(this.childs[i].html);
				}
				else{
					var clss = " "+child.meta._type+  " " + (child.meta._variant || "") + " "+ (child.meta.className || "" );
					clss = " "+clss.trim();
					if(!child.meta._headless){
						
						head = this.createHead(headName);
					}
					else{
						head = null;
					}
					
					var iBody = this.createItemBody(i, "item"+clss, head);
					this.childs[i].input = this.input;
					if(iBody != void(0)){
						this.html.appendChild(iBody);
						this.childs[i].html = iBody;
					}
				}
			}
			
			this.input = origInput;
		},
		
		appendArrayElement: function(otito){
			otito.append(this.body);
			otito.html.className = "item dynamicBlock";
			
			var remBtn = this.createRemoveBtn();
			otito.html.appendChild(remBtn);
			
			var clear = document.createElement("div");
			clear.className = "clear";
			otito.html.appendChild(clear);
		},
		
		//html funcs
		addHead: function(key){
			if(this.headless){
				return;
			}
			this.body.appendChild(this.createHead(key));
		},
		createHead: function(key){
			
			var head = document.createElement("div");
			head.className = "head";
			head.innerHTML = this.headName || key;
			head.setAttribute("title",this.headName || key);
			
			return head;
		},
		
		createFolder: function(className){
			if(className === void(0)){
				className = "folder";
			}
			var folder = document.createElement("div");
			folder.className = className;
			folder.appendChild(this.createArrow());
			//folder.appendChild(this.addOpenLink());
			
			return folder;
		},
		
		addOpenLink: function(){
			var l = document.createElement("a");
			l.innerHTML = "OPEN";
			var that = this;
			l.onclick = function(){
				var clone = $(that.body).clone();//.cloneNode(true);
				clone.addClass("main");
				document.body.appendChild(clone[0]);
			}
			return l;
		},
		
		addFolder: function(className){
			this.body = this.createFolder(className);
			this.html.appendChild(this.body);
		},
		
		createArrow: function(){
			var arrow = document.createElement("div");
			arrow.className = "arrow";
			return arrow;
		},
		
		createItemBody: function(key, className, head){
			var inputItem = this.addInput(key);
			if(inputItem == void(0)){
				return;
			}
			
			var itemBody = document.createElement("div");
			itemBody.className = (className || "item");// + " "+this.meta[key]._type;
			
			if(head){
				itemBody.appendChild(head);
			}
			
			itemBody.input = this.input;
			itemBody.appendChild(inputItem);
			return itemBody;
		},
		
		//translate some types
		toInputType: function(type){
			switch(type){
				case ImportType.upload:
					return ImportType.text;
				case ImportType.color:
					return ImportType.color;
				case ImportType.int:
				case ImportType.float:
				case ImportType.uint:
					return ImportType.number;
			}
			
			return type;
			
		},
		
		addInput: function(key){
			var meta  = null;
			if(this.meta._type == ImportType.link){
				this.headless = true;
			}
			
			if(this.meta._type == ImportType.array){
				meta = this.meta.array;
				this.headless = true;
			}
			else{
				meta = this.meta[key];
			}
			
			if(this.meta._type == ImportType.array && Array.isArray(this.meta.array)){
				meta = this.meta.array[key];
			}
			
			
			if(meta == void(0)){
				//console.error("not meta?",key);
				return;
			}
			
			if(meta._head != void(0)){
				this.headName = meta._head;
				this.headless = false;
			}
			
			
			switch(meta._type){
				case ImportType.hidden:{
					this.input = this.createInput(key, meta);
					return;
				} break;
				
				case ImportType.bool:
				case ImportType.boolean:
				
					meta.__reversed = {
						"true": true,
						"false": false
					};
					meta._value = !!meta._value || false;
					//no break here as bool is list with 2 items
					
				case ImportType.list:{
					if(meta.use == void(0) && meta.__reversed == void(0)){
						console.error("no use for list", meta._use);
					}
					this.input = this.createList(meta);
					this.input.value = this.object[key];
					
				} break;
				
				case ImportType.array:
					this.input = this.createInput(key, meta);
					var ret = this.createWrapper();
					ret.appendChild(this.createRemoveBtn());
					return ret;
				break;
				
				
				
				
				case ImportType.textarea: {
					this.input = document.createElement("textarea");
					this.input.value = this.object[key];
				
				} break;
				
				
				case ImportType.int:{
					meta.step = meta.step || 1;
					this.input = this.createInput(key, meta);
				} break;
				case ImportType.uint:{
					meta.step = meta.step || 1;
					meta.min = meta.min || 0;
					this.input = this.createInput(key, meta);
				} break;
				
				case ImportType.link:{
					this.input = this.createLink(key, meta);
				} break;
				
				default: {
					this.input = this.createInput(key, meta);
				} break;
				
			}
			
			if(this.input == void(0)){
				console.error("failed to create input",meta);
				return;
			}
			
			
			
			for(var i in meta){
				if(i.substring(0,1) == "_"){
					if(i=="_type"){
						this.input.setAttribute("type", this.toInputType(meta[i]));
						continue;
					}
					
					continue;
				}
				if(i == "value"){
					continue;
				}
				
				if(typeof(meta[i]) == "object" || typeof(meta[i]) == "function"){
					this.input[i] = meta[i];
					continue;
				}
				this.input[i] = meta[i];
				this.input.setAttribute(i,meta[i]);
			}
			
			
			var that = this;
			this.input.otito = this.parent;
			
			if(meta.oncreate){
				meta.oncreate(this.input, this.parent);
			}
			this.input.onchange = this.input.onkeyup = function(){
				var onchange;
				if(meta.onchange  != void(0)){
					meta.onchange.call(this, that);
				}
				
				if(that.normalizeInput(meta, this.value) != that.object[key]){
					this.setValue(this.value);
				}
				
			};
			
			this.input.cbs = [];
			this.input.setValue = function(val){
				if(this.value !== val){
					this.value = val;
				}
				that.object[key] = that.normalizeInput(meta, this.value);
				
				for(var i in this.cbs){
					this.cbs[i](val);
				}
				
				this.onchange();
				
			};
			return this.createWrapper();
		},
		
		createWrapper: function(){
			var wrapper = document.createElement("div");
			wrapper.className = "input";
			if(this.input != void(0)){
				wrapper.appendChild(this.input);
			}
			return wrapper;
		},
		
		createList: function(meta){
			var sel = document.createElement("select");
			var opt = null;
			var tmp = [];
			for(var k in meta.__reversed){
				tmp.push(k);
			}
			if(meta._sortFn !== null){
				tmp.sort(meta._sortFn);
			}
			
			var i;
			for(var j=0; j<tmp.length; j++){
				i = tmp[j];
				if(meta._filter && !meta._filter(meta.__reversed[i], i)){
					continue;
				}
				opt = document.createElement("option");
				opt.value = i;//meta.use[i];
				opt.innerHTML = meta.__reversed[i];
				sel.appendChild(opt);
			}
			return sel;
			
		},
		
		createLink: function(key){
			var input = document.createElement("a");
			input.innerHTML = key;
			return input;
		},
 
		createInput: function(key, meta){
			var input = document.createElement("input");
			input.value = this.object[key];
			input.type = "text";
			input.meta = meta;
			return input;
		},
		
		createAddButton: function(cb){
			var button = document.createElement("span");
			button.className = "button";
			
			var a = document.createElement("a");
			a.innerHTML = "Add more";
			a.onclick = cb;
			
			button.appendChild(a);
			
			return button;
		},
		
		createRemoveBtn: function(){
			var btn = document.createElement("a");
			btn.className = "delete";
			var that = this;
			
			btn.onclick = function(){
				var parent = this.parentNode.parentNode;
				var index = Array.prototype.indexOf.call(parent.childNodes, this.parentNode);
				
				that.object.splice(index, 1);
				parent.removeChild(this.parentNode);
				
			};
			return btn;
		},
		
		
		
		addClear: function(){
			var clear = document.createElement("div");
			clear.className = "clear";
			this.body.appendChild(clear);
		},
		
		
		
		append: function(parent, oldHtml){
			
			if(this.html == void(0)){
				this.createHTML();
			}
			
			this.parentNode = parent || this.html.parentNode;
			if(oldHtml != void(0) &&  this.html.parentNode){
				//if(this.html.parentNode){
					parent.replaceChild(this.html, oldHtml);
					this.html.className = oldHtml.className;
				//}
			}
			else{
				parent.appendChild(this.html);
			}
			if(this.cb){this.cb();}
		},
		
		remove: function(){
			if(this.parentNode  != void(0) && this.html.parentNode){
				this.parentNode.removeChild(this.html);
			}
		},
		
		
		refresh: function(object, meta){
			var oldHtml = this.html;
			
			this.meta = this.setMeta(Tools.clone(this.origMeta));
			this.parseMeta();
			this.createHTML();
			
			if(this.parent == this && this.parentNode){
				this.append(this.parentNode,oldHtml);
			}
			else{
				if(oldHtml != void(0)){// && oldHtml.parentNode){
					this.append(oldHtml.parentNode, oldHtml);
					//this.html.className = "content";
				}
			}
			if(typeof this.parent.beautify == "function"){
				Otito.beautifyInputs(this, this.parent.beautify);
			}
		}
		
	};
	
	var recurseChildren = function(otito, cb){
		
		for(var i in otito.childs){
			var child = otito.childs[i];
			if(child.input && child.html){
				if(typeof cb === "function"){
					cb(i, child);
				}
			}
			recurseChildren(otito.childs[i], cb);
		}
		
	};
	Otito.beautifyInputs = function(otito, cb){
		otito.beautify = cb;
		recurseChildren(otito, cb);
	};
	
	
	scope.Otito = Otito;
	
})(this);


//var obj = {bool: 0};
//var x = new Otito(obj,  tests);
//x.append(document.body);
