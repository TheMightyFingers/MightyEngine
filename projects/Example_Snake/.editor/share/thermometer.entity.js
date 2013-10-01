(function(Entity){
	"use strict";

	Entity.Thermometer = Entity.Geometry.extend({
		timer: null,

		maxPoints: null,
		wear: null,

		points: 0,
		multiplier: 1,

		load: function(){
			this.width = this.texture.image.width;
			this.height = 0;
		},

		setProgress: function(percents){
			if (percents > 100)
				percents = 100;
			this.height = (percents/100) * this.texture.image.height;
			this.isNeedRedraw = true;
		},

		draw: function(ctx){
			if(gParams.editor){
				this._super(ctx);
				return;
			}

			if (this.height === 0)
				return;

			var drawX = Math.floor(this.drawX + this.brush.drawOffsetX + mighty.camera.x);
			var drawY = Math.floor(this.drawY + this.brush.drawOffsetY + mighty.camera.y);

			ctx.drawImage(
				this.texture.image,
				0,
				this.texture.image.height - this.height,
				this.width,
				this.height,
				drawX,
				drawY + (this.texture.image.height - this.height),
				this.width,
				this.height);
		},

		startTimer: function(bonusConf, wear) {
			var self = this;

			this.maxPoints = bonusConf[bonusConf.length - 1].time;
			this.wear = (typeof wear == "number" ? wear : 0);

			if (wear > 0) {
				this.timer = this.addTimer(
					function() {
						self.points -= self.wear;
						if (self.points < 0) {
							self.points = 0;
						}

						self.multiplier = 1;
						for (var i = 0, len = bonusConf.length;
							i < len && bonusConf[i].time < self.points;
							i++) {
							self.multiplier = bonusConf[i].multiplier;
						}

						self.setProgress(self.points / self.maxPoints * 100);
					},
					100,
					100000);
			}
		},

		changePointsBy: function(pointsDelta) {
			this.points += pointsDelta;
		},
	});
})(Entity);