var Brush = window.Brush = {
	"Type": {
		"BASIC": 0
	},
	"Obj": {
		"0": "Basic"
	},
	"Event": {
		"LOADED": 0
	},
	"Shape": {
		"BOX": 0,
		"SPHERE": 1,
		"TRIANGLE": 2
	},
	"Stage": {},
	"palette": [
		{
			"id": 4,
			"name": "null",
			"type": 0,
			"texture": "1",
			"head": {
				"offsetX": 0,
				"offsetY": 0,
				"gridSizeX": 1,
				"gridSizeY": 1
			},
			"footer": {
				"available": [],
				"stages": []
			},
			"body": {
				"type": 0,
				"layerIndex": 0,
				"fillType": 0,
				"isModifier": 0,
				"isUpdatePreview": 0
			},
			"group": "core"
		},
		{
			"id": 5,
			"name": "error",
			"type": 0,
			"texture": 3,
			"head": {
				"offsetX": 0,
				"offsetY": 0,
				"gridSizeX": 1,
				"gridSizeY": 1
			},
			"footer": {
				"stages": []
			},
			"group": "core"
		}
	],
	"Cfg": {
		"id": 14,
		"name": "Brush",
		"disabled": false,
		"useInEditor": true,
		"isTemplate": 0,
		"group": "Core"
	}
};
var Camera = window.Camera = {
	"Event": {
		"UNKNOWN": 0,
		"MOVED": 1
	},
	"Position": {
		"DEFAULT": 0,
		"CENTER": 1,
		"H_CENTER": 2,
		"V_CENTER": 3,
		"FOLLOW": 4
	},
	"Cfg": {
		"id": 15,
		"name": "Camera",
		"disabled": false,
		"useInEditor": true,
		"position": {
			"isDrag": true,
			"ignoreBorder": false,
			"type": 0,
			"offsetX": 0,
			"offsetY": 0
		},
		"zoom": {
			"active": true,
			"useAutoZoom": false,
			"min": 0.6,
			"max": 1.4,
			"defaultValue": 1,
			"step": 0.1
		},
		"group": "Core"
	}
};
var Component = window.Component = {
	"Type": {
		"BASIC": 0
	},
	"Obj": {
		"0": "Basic"
	},
	"Cfg": {
		"id": 16,
		"name": "Component",
		"disabled": false,
		"useInEditor": true,
		"group": "Core"
	}
};
var Editor = window.Editor = {
	"Event": {
		"UNKNOWN": 0,
		"SET_LAYER": 1,
		"SET_MODE": 2,
		"USE_PLUGIN": 3,
		"USE_ITEM": 4,
		"USE_ITEM_ID": 5,
		"GET_LAYER": 6,
		"GET_MODE": 7
	},
	"Mode": {
		"SELECT": 0,
		"ADD": 1,
		"REMOVE": 2,
		"MOVE": 3,
		"ROTATE": 4
	},
	"Cfg": {
		"id": 18,
		"name": "Editor",
		"disabled": false,
		"useInEditor": true,
		"useEditor": false,
		"disallowDuplicates": true,
		"useAvailable": false,
		"group": "Core"
	}
};
var Engine = window.Engine = {
	"Event": {
		"UNKNOWN": 0,
		"CAMERA": 1,
		"ZOOM": 2,
		"RESIZE": 3,
		"FOCUS": 4
	},
	"Rendering": {
		"DEFAULT": 0,
		"WEBGL": 1,
		"EXPERIMENTAL": 2,
		"NONE": 3
	},
	"Version": {
		"0_9_9": 0,
		"1_1_0": 1
	},
	"Layer": {
		"STATIC": 0,
		"DYNAMIC": 1
	},
	"DeviceEvent": {
		"LOADED": 0
	},
	"Cfg": {
		"id": 19,
		"name": "Engine",
		"disabled": false,
		"useInEditor": true,
		"version": 1,
		"tUpdateDelta": 33.3,
		"tSleep": 16.6,
		"isDebug": false,
		"clearColor": "#555555",
		"fillScreen": false,
		"rendering": 0,
		"defaultLevel": 8,
		"errorHandler": {
			"showError": true,
			"showWarning": true
		},
		"group": "Core"
	}
};
var Loader = window.Loader = {
	"Event": {
		"PERCENT_UPDATED": 0,
		"LOADED": 1
	}
};
var GameObject = window.GameObject = {
	"UNKNOWN": 0
};
var Priority = window.Priority = {
	"VERY_HIGH": 2000,
	"HIGH": 1000,
	"MEDIUM": 500,
	"LOW": 0
};
var Entity = window.Entity = {
	"Type": {
		"BASIC": 0,
		"TEXT": 1,
		"PARTICLE": 2,
		"GEOMETRY": 3
	},
	"Obj": {
		"0": "Basic",
		"1": "Text",
		"2": "Particle",
		"3": "Geometry"
	},
	"Event": {
		"NONE": 0,
		"ADD": 1,
		"REMOVE": 2,
		"ADDED": 3,
		"REMOVED": 4,
		"ADD_FROM_INFO": 5,
		"OVER": 6,
		"OVER_ENTER": 7,
		"OVER_EXIT": 8,
		"PRESSED": 9,
		"CLICKED": 10,
		"DRAGGED": 11,
		"RELEASE": 12,
		"GET_BY_TYPE": 13,
		"GET_BY_NAME": 14,
		"LOAD_GRID_BUFFER": 15,
		"LOAD_GRID_INSTANCE": 16
	},
	"VolumeType": {
		"NONE": 0,
		"AABB": 1,
		"SPHERE": 2
	},
	"DepthSorting": {
		"WEIGHTED": 0,
		"MANUAL": 1
	},
	"Layer": {
		"TERRAIN": 0,
		"ENTITY": 1
	},
	"CompositeType": {
		"SOURCE_OVER": "source-over",
		"SOURCE_IN": "source-in",
		"SOURCE_OUT": "source-out",
		"SOURCE_ATOP": "source-atop",
		"LIGHTER": "lighter",
		"XOR": "xor",
		"DESTINATION_OVER": "destination-over",
		"DESTINATION_IN": "destination-on",
		"DESTINATION_OUT": "destination-out",
		"DESTINATION_ATOP": "destionation-atop",
		"COPY": "copy"
	},
	"palette": [
		{
			"id": 6,
			"name": "null",
			"type": 3,
			"brush": 4,
			"body": {
				"isSaved": true,
				"type": 0,
				"depthIndex": 0,
				"isVisible": true,
				"isPaused": false,
				"isPickable": false,
				"gridSizeX": 1,
				"gridSizeY": 1,
				"useGrid": true,
				"isRandFrame": false
			},
			"footer": {
				"available": [],
				"component": []
			},
			"group": "core"
		},
		{
			"id": 7,
			"name": "error",
			"type": 3,
			"brush": 5,
			"body": {
				"isSaved": true,
				"type": 0,
				"depthIndex": 0,
				"isVisible": true,
				"isPaused": false,
				"isPickable": false,
				"gridSizeX": 1,
				"gridSizeY": 1,
				"useGrid": true,
				"isRandFrame": false
			},
			"footer": {
				"available": [],
				"component": []
			},
			"group": "core"
		}
	],
	"Cfg": {
		"id": 20,
		"name": "Entity",
		"disabled": false,
		"useInEditor": true,
		"depthSorting": 1,
		"input": {
			"ignoreDrag": true,
			"picking": {
				"pixelPerfect": false,
				"pickAbleFlag": true
			}
		},
		"debug": {
			"drawBounds": false,
			"drawGrid": false
		},
		"group": "Core"
	}
};
var Input = window.Input = {
	"Key": {
		"A": 65,
		"D": 68,
		"S": 83,
		"W": 87,
		"ENTER": 13,
		"SHIFT": 16,
		"ESC": 27,
		"NUM_0": 48,
		"NUM_1": 49,
		"NUM_2": 50,
		"NUM_3": 51,
		"NUM_4": 52,
		"NUM_5": 53,
		"NUM_6": 54,
		"NUM_7": 55,
		"NUM_8": 56,
		"NUM_9": 57,
		"PLUS": 187,
		"MINUS": 189,
		"ARROW_LEFT": 37,
		"ARROW_UP": 38,
		"ARROW_RIGHT": 39,
		"ARROW_DOWN": 40,
		"BUTTON_LEFT": 0,
		"BUTTON_MIDDLE": 1,
		"BUTTON_RIGHT": 2
	},
	"Event": {
		"UNKNOWN": 0,
		"MOVED": 1,
		"INPUT_DOWN": 2,
		"INPUT_UP": 3,
		"KEY_DOWN": 4,
		"KEY_UP": 5,
		"CLICKED": 6,
		"DB_CLICKED": 7,
		"PINCH_IN": 8,
		"PINCH_OUT": 9,
		"IS_KEY": 10,
		"GET_KEYS": 11
	},
	"Cfg": {
		"id": 21,
		"name": "Input",
		"disabled": false,
		"useInEditor": true,
		"stickyKeys": true,
		"preventDefault": true,
		"isDebug": false,
		"group": "Core"
	}
};
var Material = window.Material = {
	"Type": {
		"BASIC": 0,
		"HUE": 1,
		"GRAYSCALE": 2,
		"COLOR": 3
	},
	"Obj": {
		"0": "Basic",
		"1": "Hue",
		"2": "Grayscale",
		"3": "Color"
	},
	"Cfg": {
		"id": 23,
		"name": "Material",
		"disabled": false,
		"useInEditor": true,
		"group": "Core"
	}
};
var Patch = window.Patch = {
	"Type": {
		"TOP_DOWN": 0,
		"ISOMETRIC": 1
	},
	"Obj": {
		"0": "TopDown",
		"1": "Isometric"
	},
	"Event": {
		"VISIBLE_PATCHES": 0,
		"USE_GRID": 1
	},
	"Cfg": {
		"id": 24,
		"name": "Patch",
		"disabled": false,
		"useInEditor": true,
		"optimalSizeX": 512,
		"optimalSizeY": 512,
		"isDebug": false,
		"group": "Core"
	}
};
var Grid = window.Grid = {
	"Event": {
		"IS_CELL_FULL": 0,
		"GET_CELL": 1,
		"GET_RANDOM_CELL": 2
	}
};
var Resource = window.Resource = {
	"Type": {
		"TEXTURE": 0,
		"ANIM_TEXTURE": 1,
		"SOUND": 2,
		"UNKNOWN": 3
	},
	"Flip": {
		"NONE": 0,
		"HORIZONTAL": 1,
		"VERTICAL": 2,
		"HORIZONTAL_VERTICAL": 3
	},
	"Event": {
		"UNKNOWN": 0,
		"LOADED": 1,
		"REPLACE": 2
	},
	"TextureType": {
		"NONE": 0,
		"CANVAS": 1,
		"WEBGL": 2
	},
	"Obj": {
		"0": "Texture",
		"1": "AnimTexture",
		"2": "Sound",
		"3": "Basic"
	},
	"ModuleType": {
		"TEXTURE": "Texture",
		"ANIM_TEXTURE": "Texture",
		"SOUND": "Sound"
	},
	"Templates": {},
	"palette": [
		{
			"id": 1,
			"name": "null",
			"type": 0,
			"width": 64,
			"height": 64,
			"date": 1383145795000,
			"preload": true,
			"group": "core",
			"ext": "png"
		},
		{
			"id": 2,
			"name": "null_iso",
			"type": 0,
			"width": 90,
			"height": 45,
			"date": 1383145795000,
			"preload": true,
			"group": "core",
			"ext": "png"
		},
		{
			"id": 3,
			"name": "error",
			"type": 0,
			"width": 64,
			"height": 64,
			"date": 1383145795000,
			"preload": true,
			"group": "core",
			"ext": "png"
		},
		{
			"type": 1,
			"id": 11,
			"name": "digger_stand",
			"date": 1383145795000,
			"width": 360,
			"height": 90,
			"fps": 9,
			"numFrames": 4,
			"numRows": 1,
			"preload": true,
			"group": "assets",
			"ext": "png"
		},
		{
			"type": 1,
			"id": 12,
			"name": "digger_move",
			"date": 1383145795000,
			"width": 270,
			"height": 90,
			"fps": 9,
			"numFrames": 3,
			"numRows": 1,
			"preload": true,
			"group": "assets",
			"ext": "png"
		},
		{
			"type": 0,
			"id": 13,
			"name": "block_dirt",
			"date": 1383145795000,
			"width": 64,
			"height": 64,
			"preload": true,
			"group": "assets",
			"ext": "png"
		}
	],
	"Cfg": {
		"id": 26,
		"name": "Resource",
		"disabled": false,
		"useInEditor": true,
		"path": "assets/deploy",
		"useTimestamp": true,
		"preloadAudio": true,
		"sound": {
			"volume": 1
		},
		"group": "Core"
	}
};
var MaskType = window.MaskType = {
	"DEFAULT": 0,
	"CENTER": 1,
	"CONTINUOUS": 2
};
var Sound = window.Sound = {
	"Event": {
		"PLAY": 0,
		"DISABLE": 1,
		"ENABLE": 2,
		"STOP_ALL": 3,
		"SET_VOLUME": 4
	}
};
var Scene = window.Scene = {
	"Event": {
		"LOADED": 0,
		"CREATE_LEVEL": 1,
		"LOAD_LEVEL": 2,
		"LOAD_LEVEL_ID": 3,
		"SAVE_LEVEL": 4,
		"RELOAD_LEVEL": 5,
		"STATE": 6,
		"GET_LEVEL": 7,
		"SET_PAUSE": 8,
		"PRE_SAVE": 9,
		"POST_SAVE": 10
	},
	"Cfg": {
		"id": 27,
		"name": "Scene",
		"disabled": false,
		"useInEditor": true,
		"group": "Core"
	}
};
var Terrain = window.Terrain = {
	"Type": {
		"TOP_DOWN": 0,
		"ISOMETRIC": 1
	},
	"Event": {
		"RESIZE": 0
	},
	"StatusType": {
		"UNKNOWN": 0,
		"NO_CHANGES": 1,
		"NO_LAYER": 2,
		"ADDED": 3,
		"CHANGED": 4
	},
	"LayerType": {
		"DEFAULT": 0,
		"TEMPORARY": 1,
		"WITH_TEMPORARY": 2
	},
	"FillType": {
		"DEFAULT": 0,
		"FLOOD": 1
	},
	"Status": {
		"NO_CHANGES": 0,
		"NO_LAYER": 1,
		"ADDED": 2,
		"CHANGED": 3
	},
	"Cfg": {
		"id": 29,
		"name": "Terrain",
		"disabled": false,
		"useInEditor": true,
		"visible": false,
		"showDebug": false,
		"type": 0,
		"tileWidth": 64,
		"tileHeight": 64,
		"tileDepth": 1,
		"offlineMode": false,
		"grid": {
			"use": false,
			"width": 64,
			"height": 64,
			"isDepthSorting": false,
			"showDebug": false
		},
		"group": "Core"
	}
};
var UI = window.UI = {
	"Event": {
		"LOADED": 0
	},
	"Cfg": {
		"id": 30,
		"name": "UI",
		"disabled": false,
		"useInEditor": true,
		"group": "Core"
	}
};
var i18n = window.i18n = {
	"Lang": {
		"EN": 0,
		"LV": 1
	},
	"Event": {
		"SET_LANG": 0,
		"GET_LANG": 1,
		"PROCESS_HTML": 2,
		"PROCESS_TEXT": 3,
		"LANG_CHANGED": 4
	},
	"Cfg": {
		"id": 31,
		"name": "i18n",
		"disabled": false,
		"useInEditor": true,
		"defaultLang": 0,
		"replaceStart": "{",
		"replaceEnd": "}",
		"group": "Core"
	}
};
var Server = window.Server = {
	"Event": {
		"LOAD_LEVEL": 0,
		"SAVE_LEVEL": 1,
		"LEVEL_DATA_RECEIVED": 2,
		"LEVEL_DATA_FAILED": 3
	},
	"Cfg": {
		"id": 34,
		"name": "Server",
		"disabled": false,
		"useInEditor": true,
		"port": 8081,
		"offlineMode": false,
		"path": "server",
		"useSocket": true,
		"group": "Demo_particle"
	}
};
var Plugin = window.Plugin = {
	"palette": [
		"Server",
		"Server"
	],
	"Cfg": {
		"id": 25,
		"name": "Plugin",
		"disabled": false,
		"useInEditor": true,
		"group": "Core"
	}
};
var Deploy = window.Deploy = {
	"palette": [
		{
			"id": 32,
			"name": "Server",
			"disabled": false,
			"useInEditor": true,
			"port": 8081,
			"offlineMode": false,
			"path": "server",
			"useSocket": true,
			"group": "Demo_Particle"
		},
		{
			"id": 33,
			"name": "scene",
			"disabled": false,
			"group": "Demo_Particle"
		},
		{
			"id": 34,
			"name": "Server",
			"disabled": false,
			"useInEditor": true,
			"port": 8081,
			"offlineMode": false,
			"path": "server",
			"useSocket": true,
			"group": "Demo_particle"
		},
		{
			"id": 35,
			"name": "scene",
			"disabled": false,
			"group": "Demo_particle"
		}
	]
};
var Map = window.Map = {
	"palette": [
		{
			"name": "Empty",
			"gridX": "32",
			"gridY": "32",
			"bgEntity": "6",
			"id": 8,
			"group": "ungrouped"
		}
	],
	"Cfg": {
		"id": 22,
		"name": "Map",
		"disabled": false,
		"useInEditor": true,
		"group": "Core"
	}
};
var Cursor = window.Cursor = {
	"Cfg": {
		"id": 17,
		"name": "Cursor",
		"disabled": false,
		"useInEditor": true,
		"stepSizeX": 64,
		"stepSizeY": 64,
		"angleStep": 0.01,
		"group": "Core"
	}
};
var Template = window.Template = {
	"Cfg": {
		"id": 28,
		"name": "Template",
		"disabled": false,
		"useInEditor": true,
		"group": "Core"
	}
};
