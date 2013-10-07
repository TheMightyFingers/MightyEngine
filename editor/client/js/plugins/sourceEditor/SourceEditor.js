"use strict";
//TODO: read frm config these;

Mighty.requireFile("js/plugins/sourceEditor/"+cfg.sourceEditorBackend+".js", null, 1);

Mighty.namespace("plugins.sourceEditor");
Mighty(
	Mighty.plugins.SourceEditor = Mighty.plugins.sourceEditor.SourceEditor = function(){
		this.sessions = {};
		var that = this;
		
		this.activeFile = "";
		this.activeElement = null;
		
		this.core = 1;
		this.noNewAsset = 1;
		this.data = null;
		
		this.forceReload = false;
		
		this.editorElement = document.createElement("div");
		this.editorElement.style.cssText = "position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;";
		
		this.editor = new Mighty.plugins.SourceEditor[cfg.sourceEditorBackend](this);
		
		this.saveCBs = [];
		
		
		this.loadIndex = true;
	},
	{
		addSaveCb: function(cb){
			this.saveCBs.push(cb);
		},
		onSave: function(val){
			if(this.activeElement.origText && this.activeElement.isChanged == true){
				this.activeElement.innerHTML = this.activeElement.origText;
				this.activeElement.isChanged = false;
				this.items.map[this.activeFile] = val;
				this.saveFile(this.activeFile);
				for(var i = 0; i<this.saveCBs.length; i++){
					this.saveCBs.pop()(this.activeElement.origText);
				}
			}
		},
		clearCBs: function(){
			this.saveCBs.length = 0;
		}
		
		,register: function(){
			this.menuItem = this.content.plugins.SideMenu.registerMenu({
				SourceEditor: {
					// override default 
					title: "SourceEditor",
					action: "SourceEditor"
					//link: "resources/textures"
				}
			},0);
			
			var that = this;
			this.content.load.a_sourceChanged = function(){
				that.getItems(function(){
					if(that.content.action == that.name){
						that.start();
					}
				});
			};
		}
		,start: function(cb){
			this.content.ui.$newAssetButton.hide();
			this.content.ui.$iconContainer.empty();
			this.content.ui.$iconContainer[0].appendChild(this.editorElement);
			this.content.ui.hideGroups();
			
			var list = this.genFileList();
			var $set = this.content.ui.$settings;
			$set.empty();
			this.otito.append($set[0]);
			
			
			this.editor.focus();
			this.editor.refresh();
			if(!this.butt){
				var that = this;
				this.butt = $(Templates.button({text:_("btn_settings"), id: "sourceEditorSettingsBtn"}));
				$("#helperButtons").append(this.butt);
				this.butt.on("click",function(){
					that.showSettings();
				});
				
				this.hotkeysMenu = $(Templates.button({text:_("btn_hotkeys"), id: "sourceEditorHotkeysBtn"}));
				$("#helperButtons").append(this.hotkeysMenu);
				this.hotkeysMenu.on("click",function(){
					that.showHotkeys();
				});
				
			}
			else{
				$("#helperButtons").append(this.butt);
				$("#helperButtons").append(this.hotkeysMenu);
			}
			
			if(this.loadIndex){
				var files = Object.keys(this.items.map);
				
				this.selectFile(files[files.length-1]);
				this.loadIndex = false;
			}
		},
		
		settingHolder: null,
		
		showSettings: function(){
			if(this.settingHolder){
				return;
			}
			var input =  new Otito(null, Tools.clone(this.editor.cfg));
			
			var that = this;
			this.settingHolder =  $("<div></div>");
			this.settingHolder.dialog({
				title: _("sourceEditor_settings_title"),
				close: function(){
					$( this ).dialog( "destroy" );
					that.settingHolder = null;
				},
				buttons: [
					{
						text: _("btn_apply"),
						click: function(){
							Storage.set("sourceEditor", input.object);
							that.editor.updateOptions(input.object);
							that.editor.cfg = input.object;
						}
					}
					,{
						text: _("btn_close"),
						click: function(){
							$(this).dialog("close");
						}
					}
					,{
						text: _("btn_reset"),
						click: function(){
							$(this).dialog("close");
							that.editor.cfg = Tools.clone(that.editor.defaultCfg);
							that.editor.updateOptions(that.editor.cfg);
							that.showSettings();
						}
					}
				],
				width: 655,
				height: 500,
				resizable: false
			});
			
			
			input.append(this.settingHolder[0]);
			this.content.ui.improveOtito(input);
			
		},
	   
		hotKeysHolder: null,
		showHotkeys: function(){
			if(this.hotKeysHolder){
				return;
			}
			var hotkeys = {
				save: {
					_type: "text",
					readonly: "readonly",
					value: "ctrl - s"
				},
				copyLine: {
					_type: "text",
					readonly: "readonly",
					value: "ctrl - alt - down"
				},
				deleteLine:  {
					_type: "text",
					readonly: "readonly",
					value: "ctrl - d"
				},
				moveLineUp:  {
					_type: "text",
					readonly: "readonly",
					value: "alt - up"
				},
				moveLineDown:  {
					_type: "text",
					readonly: "readonly",
					value: "alt - down"
				},
				toggleComment:  {
					_type: "text",
					readonly: "readonly",
					value: "ctrl - /"
				},
				autocomplete:  {
					_type: "text",
					readonly: "readonly",
					value: "ctrl - space"
				},
			};
			
			var input =  new Otito(null, hotkeys);
			var that = this;
			this.hotKeysHolder = $("<div></div>");
			this.hotKeysHolder.dialog({
				title: _("sourceEditor_hotkeys_title"),
				close: function(){
					$( this ).dialog( "destroy" );
					that.hotKeysHolder = null;
				},
				width: 366,
				height: 266,
				resizable: false
			});
			
			
			input.append(this.hotKeysHolder[0]);
			this.content.ui.improveOtito(input);
			
		}
		
		,clickItem: function(item){

		}
		,getItems: function(cb){

			var that = this;
			this.content.load.action("getSourceTree",null, function(data){
				
				var t = "";
				var tmpItems = {
					map: {},
					all: {},
					elements: {}
				};
				
				
				for(var i in data.map){
					t = i.split("\\").join("/");
					tmpItems.map[t] = data.map[i];
				}
				for(var i in data.all){
					t = i.split("\\").join("/");
					tmpItems.all[t] = data.all[i];
				}
				
				if(!that.items || that.forceReload){
					that.forceReload = false;
					that.items = tmpItems;
					that.otito = new Otito(null, that.genFileList());
					cb();
					return;
				}
				
				for(var i in tmpItems.map){
					if(that.items.map[i] !== tmpItems.map[i]){
						
						that.items = tmpItems;
						that.otito = new Otito(null, that.genFileList());
						cb();
						return;
					}
				}
				cb();
			});
		}
		,click: function(item){
			
		}
		,deactivate: function(){
			this.otito.remove();
			this.content.ui.$iconContainer[0].removeChild(this.editorElement);
			this.butt.detach();
			this.hotkeysMenu.detach();
			
			if(this.settingHolder){
				this.settingHolder.dialog( "close" );
			}
			if(this.hotKeysHolder){
				this.hotKeysHolder.dialog( "close" );
			}
			
		}
		,activate: function(cb){
			console.log("activet");
		}
		,saveFile: function(fileName, isFolder, content, cb){
			var notify = this.content.ui.showNotify(_("Saving..."),fileName.split("/").pop(), 9999);
			var start = Date.now();
			
			this.content.load.action("saveFile",{fileName: fileName, data: this.items.map[fileName] || content, isFolder: isFolder}, function(data){
				notify.title(_("Saved!"));
				
				var delay = 2000 - (Date.now() - start);
				notify.hide(delay);
				if(cb){
					cb();
				}
			});
		}
		
		,showNewFileDialog: function(folder){
			var input =  new Otito(null, {
					name: {
						_type: "text"
						,onchange: function(a,b){
							this.otito.childs.isFolder.input.setValue(this.value.split(".").length == 1);
						}
					}
					,isFolder: false
				}
			);
			
			var that = this;
			var $tpl = $("<div></div>");
			$tpl.dialog({
				title: _("Create_new_file"),
				close: function(){
					$( this ).dialog( "destroy" );
				},
				buttons: [
					{
						text: _("btn_save"),
						click: function(){
							that.saveFile(folder+"/"+input.object.name, input.object.isFolder);
							that.forceReload = true;
							$(this).dialog("close");
						}
					}
					,{
						text: _("btn_cancel"),
						click: function(){
							$(this).dialog("close");
						}
					}
				],
				width: 520,
				height: 240,
				resizable: false
			});
			
			
			input.append($tpl[0]);
			this.content.ui.improveOtito(input);
			input.childs.name.input.focus();
			
		}
		,genFileList: function(){
			var obj = {
				__className: "active"
			};
			
			var that = this;
			var tmp = null;
			var oo = null;
			var orderBuffer = [];
			for(var i in this.items.map){
				tmp = i.split("/");
				orderBuffer.push(tmp);
			}
			for(var i in this.items.all){
				tmp = i.split("/");
				orderBuffer.push(tmp);
			}
			
			//TODO: fix this
			orderBuffer.sort(function(a,b){
				var ret = (b.length - a.length);
				if(ret == 0){
					ret = b.join() < a.join();
				}
				return  ret;
			});
			
			
			for(var k=0; k<orderBuffer.length; k++){
				tmp = orderBuffer[k];
				oo = obj;
				
				for(var f=4; f<tmp.length; f++){
					if( oo[tmp[f]] == void(0) ){
						var ll = this.getLinkLoc(tmp);
						
						if(f == tmp.length-1 && this.items.map[ll] != void(0)){
							
							
							oo[tmp[f]] = {
								_type: "link",
								value: tmp[f],
								oncreate: (function(ll){
									return function(element){
										that.items.elements[ll] = element;
									}
								})(ll),
								onclick: function(){
									that.selectFile(this.dataFile);
								},
								_headless: true,
								dataFile: ll
							};
						}
						else{
							if(f == tmp.length-1 && !this.items.all[ll].isDir){
								continue;
							}
							var folder = [];
							for(var d = 0; d<f+1; d++){
								folder.push(tmp[d]);
							}
								
							oo[tmp[f]] = {
								"+": {
									_type: "link"
									,_headless: true
									,className: "buttonSmall"
									,dataFolder: folder.join("/")
									,onclick: function(){
										that.showNewFileDialog(this.dataFolder);
									}
								}
								//__className: "active" // - add className to folder
							};
						}
					}
					oo = oo[tmp[f]];
				}
			}
			return obj;
		}
		,selectFile: function(fileName){
			console.log(fileName);
			
			if(this.activeElement){
				this.activeElement.style.fontWeight = null;
			}
			this.activeElement = this.items.elements[fileName];
			this.activeElement.style.fontWeight = "bold";
			
			this.activeFile = fileName;
			
			this.editor.loadSource(fileName);
			
			this.clearCBs();
			
		}
		,getLinkLoc: function(tmp){
			return tmp.join("/");
		}
		
		,onSourceChanged: function(fileName, val){
			if(this.items.map[this.activeFile] != val){
				if(!this.activeElement.isChanged){
					this.activeElement.origText = this.activeElement.innerHTML;
					this.activeElement.innerHTML += "*";
					this.activeElement.isChanged = true;
				}
			}
			else{
				if(this.activeElement.origText && this.activeElement.isChanged == true){
					this.activeElement.innerHTML = this.activeElement.origText;
					this.activeElement.isChanged = false;
				}
			}
		}
		
	}
	
)
.extend("plugins._plugin._Plugin");
