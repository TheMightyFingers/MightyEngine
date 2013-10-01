(function(window){
	"use strict";

	window.BaseControl = Plugin.extend
	({
		fastMode: false,
		gameName: "unknown",
		config: null,
		currentLevel: 1,

		terrainWidth: 0,
		terrainHeight: 0,

		scoreBoardUI: null,
		modalUI: null,

		channelIN: null,
		channelOUT: null,

		install: function() {
			this._super();
			if(gParams.editor){return;}

			SubscribeChannel(this,"EntityInteract", function(event,entity) {
				if (event == Entity.Event.DRAGGED && typeof entity.onDragged == "function") {
					entity.onDragged();
				}

				if (event == Entity.Event.CLICKED && typeof entity.onClicked == "function") {
					entity.onClicked();
				}
			});
		},

		init: function() {
			var self = this;

			this._super();
			if(gParams.editor){return;}

			var options = { sound:2, vibration:2 };

			if (typeof GameAPI !== "undefined") {
				options = GameAPI.getOptions(this.gameName);
				this.config = GameAPI.getGameConfig(this.gameName);
				this.currentLevel = GameAPI.getCurrentLevel(this.gameName) || this.currentLevel;
			}

			console.log('OPTIONS', options);
			console.log('OPTIONS Stringify', JSON.stringify(options));
			console.log('options.sound', options.sound);

			if(options.sound){
				//SendSignal("Sound", Sound.Event.ENABLE);
				SendSignal("Sound", Sound.Event.SET_VOLUME, 1);
			}
			else {
				//SendSignal("Sound", Sound.Event.DISABLE);
				SendSignal("Sound", Sound.Event.SET_VOLUME, 0);
			}
		},

		load: function()
		{
			var self = this;

			this._super();
			if(gParams.editor){return;}

			if (!this.scoreBoardUI) {
				this.scoreBoardUI = mighty.UI.ScoreBoard.js;
			}
			if (!this.modalUI) {
				this.modalUI = mighty.UI.Modal.js;
			}

			if (typeof GameAPI !== "undefined") {
				if (this.scoreBoardUI) {
					this.scoreBoardUI.onClose(function() {
						self.cleanUp();
						GameAPI.closeGame(self.gameName, null);
					});
				}
			}
			
			this.terrainWidth = (Terrain.Cfg.numTilesX * Terrain.Cfg.tileWidth);
			this.terrainHeight = (Terrain.Cfg.numTilesY * Terrain.Cfg.tileHeight);
		},

		startCountdown: function(x, y) {
			if (this.fastMode) {
				this.startGame();
			}
			else {
				var self = this;

				var countdown = mighty.Macro.CreateEntity('counter', 0, 0);
				if((x)&&(y)){
					countdown.move(x - (countdown.volume.sizeX / 2), y - (countdown.volume.sizeY / 2));
				}
				countdown.onCallback(function(){
					self.startGame();
				});
				countdown.startTick();
			}
		},


		startEndCountdown: function(x, y, callback) {
			var self = this;
			var countdown = mighty.Macro.CreateEntity('counter', 0, 0);
			if((x)&&(y)){
				countdown.move(x - (countdown.volume.sizeX / 2), y - (countdown.volume.sizeY / 2));
			}
			countdown.row = [
				{value:Counter.Tick._5},
				{value:Counter.Tick._4},
				{value:Counter.Tick._3},
				{value:Counter.Tick._2},
				{value:Counter.Tick._1},
				{value:Counter.Tick.COUNTER_END, sound: false}
			];
				
			countdown.onCallback(function(){
				if (typeof callback == "undefined") {
					self.endGame();
				}
				else {
					callback();
				}
			});
			countdown.startTick();
		},

		finish: function() {
			var sound = this.safeGetSound('finish');
			if (sound) {
				sound.play();
			}

			var self = this;

			self.cleanUp();

			this.addTimer(function(){
				if (typeof GameAPI != "undefined") {
					GameAPI.closeGame(self.gameName, self.result);
				}
				else {
					console.warn('END GAME', self.result);
				}
			},10,1);
		},

		cleanUp: function() {
			//Channels["Scene.IN"].signal(Scene.Event.SET_PAUSE, true);
			mighty.engine.setVisible(false);
			var ctx = mighty.context;
			ctx.fillStyle="#000000";
			ctx.fillRect(
				-9999,
				-9999,
				9999,
				9999);

			//ALTERNATĪVS VARIANTS
			// mighty.engine.setBackgroundColor("#000");
			// mighty.camera.move(-10000,0);
		},

		//http://stackoverflow.com/a/2450976/683763
		shuffle: function (array) {
			var currentIndex = array.length,
				temporaryValue,
				randomIndex;

			// While there remain elements to shuffle...
			while (0 !== currentIndex) {

				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}

			return array;
		},

		//http://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
		getRandomSubarray: function(arr, size) {
			var shuffled = arr.slice(0), i = arr.length, temp, index;
			while (i--) {
				index = Math.floor(i * Math.random());
				temp = shuffled[index];
				shuffled[index] = shuffled[i];
				shuffled[i] = temp;
			}
			return shuffled.slice(0, size);
		},

		executeWithInterval: function(f, delta, n, callback) {
			if (!n || n < 1)
				return;

			f();

			var i = 1;
			return this.addTimer(
				function() {
					f();
					i++;

					if (i == n) {
						if (typeof callback == "function") {
							callback();
						}
					}
				},
				delta,
				n-1);
		},

		turboLooper: function(textures, config) {
			//1) Set Config defaults
			var settings = {
				dx: 1,
				dy: 1,
				dt: 1,
				zIndex: 0
			};
			for (var setting in settings) {
				settings[setting] = config[setting];
			}

			//2) Calculate block size
			var blockSizeX = 0,
				blockSizeY = 0;
			for (var i = 0; i < textures.length; i++) {
				var row = textures[i];
				for (var j = 0; j < row.length; j++) {
					var info = Palettes.Entity.getByName(row[j], 0, 0);
					if (i === 0) {
						blockSizeX += info.brush.width;
					}
					if (j === 0) {
						blockSizeY += info.brush.height;
					}
				}
			}

			//2) Create objects
			var minX = mighty.camera.viewFrustum.minX - blockSizeX,
				minY = mighty.camera.viewFrustum.minY - blockSizeY;
			var positionX = minX,
				positionY = minY,
				objects = [],
				obj = {
					volume: {
						maxY: minY,
						sizeY: 0
					}
				};

			while (positionY < mighty.camera.viewFrustum.maxY) {
				positionX = minX;
				positionY += obj.volume.sizeY;

				while (positionX < mighty.camera.viewFrustum.maxX) {
					for (var i = 0; i < textures.length; i++) {
						var row = textures[i];
						for (var j = 0; j < row.length; j++) {
							obj = mighty.Macro.CreateEntity(
								row[j],
								positionX,
								positionY);
							obj.setDepth(settings.zIndex);

							positionX += obj.volume.sizeX;

							objects.push(obj);
						}
					}
				}
			}

			var len = objects.length,
				totalWidth = obj.volume.maxX - objects[0].volume.minX,
				totalHeight = obj.volume.maxY - objects[0].volume.minY;

			//3) Start looping
			var timer = this.addTimer(
				function(){
					for(var i = 0; i < len; i++) {
						obj = objects[i];
						var newX, newY;

						if(obj.volume.maxX < mighty.camera.viewFrustum.minX){
							newX = obj.x + config.dx + totalWidth;
						}
						else if(obj.volume.minX > mighty.camera.viewFrustum.maxX){
							newX = obj.x + config.dx - totalWidth;
						}
						else {
							newX = obj.x + config.dx;
						}

						if(obj.volume.maxY < mighty.camera.viewFrustum.minY){
							newY = obj.y + config.dy + totalHeight;
						}
						else if(obj.volume.minY > mighty.camera.viewFrustum.maxY){
							newY = obj.y + config.dy - totalHeight;
						}
						else {
							newY = obj.y + config.dy;
						}
						obj.move(newX, newY);
					}
				},
				config.dt);

			//4) Return stop handle
			return {
				remove: function(){
					timer.remove();

					for(var i = 0; i < len; i++) {
						objects[i].remove();
					}
				}
			};
		},

		startLooper: function(parts, deltaPx, deltaT, isHorizontal) {
			var count = parts.length;
			var totalLength = 0;
			for (var i = 0; i < parts.length; i++) {
				totalLength += parts[i].volume.sizeX;
			}

			var part;

			this.addTimer(
				function(){
					for(var i = 0; i < count; i++) {
						part = parts[i];
						if(part.volume.maxX < mighty.camera.viewFrustum.minX){
							part.move(part.x - deltaPx + totalLength, part.y);
						}
						else {
							part.move(part.x - deltaPx, part.y);
						}
					}
				},
				deltaT);
		},

		generateYesNoSequence: function(length, yesProbability, maxYesChain, firstFalseCount){
			var yesCount = 0;
			var results = [];

			for (var i = 0; i < length; i++) {
				var isYes =
					(Math.random() < yesProbability) &&					//Ar zināmu varbūtību
					(maxYesChain == null || yesCount < maxYesChain) &&	//Un ne vairāk kā N peec kārtas
					i >= firstFalseCount;								//un pirmie N ir FALSE

				if (isYes) {
					yesCount++;
				}
				else {
					yesCount = 0;
				}

				results.push(isYes);
			}

			return results;
		},

		gainPoints: function(points, x, y) {
			if (points === 0) {
				return;
			}
			var entityName = points < 0 ? 'points_incorrect' : 'points_correct';
			var soundName = points < 0 ? 'choice_incorrect' : 'choice_correct';

			if (x && y) {
				var ent = mighty.Macro.CreateEntity(entityName, x, y);
				ent.setDepth(99999);
				ent.set((points > 0 ? "+" : "") + points);
				ent.move(x - ent.volume.sizeX / 2, y - ent.volume.sizeY / 2);
			}

			var sound = this.safeGetSound(soundName);
			if (sound) {
				sound.play();
			}

			this.updateScore(points);

			if (points > 0) {
				if (typeof this.result.picks_correct != "undefined") {
					this.result.picks_correct++;
				}
				if (typeof this.result.correctPicks != "undefined") {
					this.result.correctPicks++;
				}
			}
			else {
				if (typeof this.result.picks_incorrect != "undefined") {
					this.result.picks_incorrect++;
				}
				if (typeof this.result.incorrectPicks != "undefined") {
					this.result.incorrectPicks++;
				}
			}
		},

		updateScore: function(points){
			this.result.score = Math.max(this.result.score + points, 0);
			this.scoreBoardUI.setScore(this.result.score);
		},

		stretchEntity: function(ent, minX, minY, maxX, maxY) {
			var scaleX = (maxX - minX) / ent.volume.sizeX;
			var scaleY = (maxY - minY) / ent.volume.sizeY;

			//scaleY = 1;
			//scaleX = 1;

			var moveX,
				moveY;
			if (ent.volume.sizeX >= 123) {
				moveX = minX + 62 + ((maxX - minX) - (ent.volume.sizeX)) / 2;
			}
			else {
				moveX = (maxX + minX) / 2;
			}
			if (ent.volume.sizeX >= 123) {
				moveY = minY - 26 + ((maxY - minY) + (ent.volume.sizeY)) / 2;
			}
			else {
				moveY = (maxY + minY) / 2;
			}
			ent.move(
				moveX,
				moveY
				);

			ent.setScale(scaleX, scaleY);
		},

		safeGetSound: function(soundName) {
			var sounds = Resource.plugin.module.Sound.resources;

			for (var i = 0, len = sounds.length; i < len; i++) {
				if (sounds[i].name == soundName) {
					return sounds[i];
				}
			}

			return null;
		}
	});
})(window);