Mighty.requireFile("js/plugins/sourceEditor/ace/ace.js");

Mighty(
	Mighty.plugins.SourceEditor.Ace = function(sourceEditor){
		
		this.editor = ace.edit(sourceEditor.editorElement);
		this.sourceEditor = sourceEditor;
		this.sessions = {};
		
		
		this.editor.commands.addCommand({
			name: 'saveFile',
			bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
			exec: function(editor) {
				that.sourceEditor.onSave(that.editor.getValue());
			},
			readOnly: true // false if this command should not apply in readOnly mode
		});
		
		this.setTheme("twilight");
		
	}
	,{
		setTheme: function(theme){
			this.editor.setTheme("ace/theme/"+theme);
		}
		,focus: function(){
			this.editor.focus();
		}
		,loadSource: function(fileName){
			if(this.sessions[fileName]){
				this.editor.setSession(this.sessions[fileName]);
			}
			
			var ses = this.sessions[fileName] = new ace.EditSession(this.sourceEditor.items.map[fileName]);
			var ext = fileName.split(".").pop();
			var mode = this.getModeFromExt(ext);
			if(!mode){
				console.warn("unknown extension", ext);
				return;
			}
			
			var that = this;
			ses.setMode("ace/mode/"+mode);
			ses.on('change', function(e) {
				var val = that.editor.getValue();
				that.sourceEditor.sourceChanged(fileName, val);
			});
			ses.setUndoManager(new ace.UndoManager());
			this.editor.setSession(this.sessions[fileName]);
		}
		,knownModes: {
			js: "javascript"
		}
		,getModeFromExt: function(ext){
			return this.knownModes[ext];
		}
		
	}
);
