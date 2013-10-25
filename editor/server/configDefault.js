this.config = {
	
	// host or IP
	// null - server will listen on all interfaces
	host: null,
	port: 8080,
	
	// set false if you are running from dedicated server
	openBrowser: true,
	
	// sets symlink to engine
	// set false if you want always use latest engine version
	useSymlinks: true,
	
	// editor client files
	// and projects path will be filed in later
	// do not change
	webRoot: ["../client", null],
	
	// 
	googleClosurePath: "",
	
	// known mimes
	mimes: {
		"html": "text/html",
		"js": "text/javascript",
		"avi": "video/avi",
		"css": "text/css",
		"zip": "application/zip",
		"mighty": "application/mighty"
	},
	
	// temporary files will be stored here and cleaned up on startup
	tmpPath: "tmp",
	
	// path where all projects located
	projectsPath: "../../projects",
	
	// default project config
	project: {
		//this file is placed in {project}/this.editorPath
		configFile: "config.js",
		// paths relative to project root
		paths: {
			assets: "assets",
			deploy: "assets/deploy",
			release: "release",
			editor: ".editor",
			engine: "engine",
			
			plugins: [{
				path: "src/plugins",
				origin: "project"
			}],
			
			addons: [{
				path: "src/addons",
				origin: "project"
			}]
		}
	},
	
	
	// project templates path TODO
	newProjectTemplates: "projectTemplates",
	defaultProjectTemplate: "default",
	
		
	useBuildInWatcher: true,
	watcherPollingTime: 1000,
	// watching paths for code changes
	// relative to this file
	watchingPaths: ["../../share", "../../engine", "storeCache"],
	
	
	
	// shared plugins
	pluginsPaths:[
		{
			path: "../../editor/server/storeCache/plugins",
			origin: "Store"
		},
		{
			path: "../../share/plugins",
			origin: "Share"
		}
	],
	// shared addons
	addonsPaths: [
		{
			path: "../../editor/server/storeCache/addons",
			origin: "Store"
		},
		{
			path: "../../share/addons",
			origin: "Share"
		}
	],
	// where to find hook scripts
	deployHooksPaths: ["../../share/hooks", "src/hooks"],
	
	// engine path stuff - relative to engine
	engine: {
		srcPath: "../../engine",
		pluginsPath: "plugins"
	},
	
	autoFixConfigChanges: true,
	// almost hardcoded stuff - do not change!!!
	// plugins with zero item List
	emptyList:["Map"],
	
	pluginType: "Plugin",
	addonType: "Addon",
	
	includes: {
		//path relative to deploy path
		core: [
			"/library.js"
		],
		//relative to project
		debug: [
			"/engine/release.js",
			"/engine/library/base64.js",
			"/engine/utilities/info/Device.js",
			"/engine/library/class.js",
			"/engine/utilities/Channel.js",
			"/engine/utilities/Error.js",
			"/engine/utilities/Flag.js",
			"/engine/utilities/template/TemplateCSS.js",
			"/engine/utilities/template/Templates.js",
			"/engine/Loader.js",
			"/engine/Engine.js",
			"/src/main.js"
		],
		release: [
			"/engine/MightyEngine.js",
			"/src/main.js"
		]
	},
	
	// fallback audio converter on windows
	ffmpegPath: "bin/ffmpeg.exe",
	
	// run in demo mode - disable some features
	demoMode: false
};

this.config.webRoot[1] = this.config.projectsPath;
