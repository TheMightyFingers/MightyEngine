this.config = {
	port: 8080,
	host: null, // host or IP
	
	demoMode: false,
	openBrowser: true,
	
	useSymlinks: true,
	useBuildInWatcher: true,
	watcherPollingTime: 1000,
	//do not change
	webRoot: ["../client", null],
	
	ffmpegPath: "bin/ffmpeg.exe",
	googleClosurePath: "",
	
	mimes: {
		"html": "text/html",
		"js": "text/javascript",
		"avi": "video/avi",
		"css": "text/css",
		"zip": "application/zip",
		"mighty": "application/mighty"
	},
	
	
	defaultProjectTemplate: "default",
	newProjectTemplates: "projectTemplates",
	tmpPath: "tmp",
	
	watchingPaths: ["../../share", "../../engine", "storeCache"],
	projectPath: "../../projects",
	projectExtension: "mighty",
	
	//project paths - relative to project
	deployPath: "assets/deploy",
	releasePath: "release",
	assetsPath: "assets",
	
	editorPath: ".editor",
	enginePath: "engine",
	
	//this file is placed in {project}/this.editorPath
	projectConfigFile: "config.js",
	
	//shared plugins goes first as project plugins may depend on them
	pluginsPaths:[
		{
			path: "../../editor/server/storeCache/plugins",
			origin: "Store"
		},
		{
			path: "../../share/plugins",
			origin: "Share"
		},
		{
			path: "src/plugins",
			origin: "project"
		}
	],
	
	addonsPaths: [
		{
			path: "../../editor/server/storeCache/addons",
			origin: "Store"
		},
		{
			path: "../../share/addons",
			origin: "Share"
		},
		{
			path: "src/addons",
			origin: "project"
		}
	],
	
	deployHooksPaths: ["../../share/hooks", "src/hooks"],
	
	engineSrcPath: "../../engine",
	
	//engine path stuff - relative to engine
	enginePluginsPath: "plugins",
	
	//almost hardcoded stuff
	noEmptyValue:["Map"],
	
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
	}
	
};

this.config.webRoot[1] = this.config.projectPath;
