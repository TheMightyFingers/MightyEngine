(function(Entity){
	"use strict";

	Entity.Progressbar = Entity.Geometry.extend({
		maxValue: null,
		value: null,

		load: function(){
			this.width = 1;
			this.height = this.texture.image.height;
		},

		ssetup: function(maxValue) {
			this.maxValue = maxValue;
		},

		setValue: function(value){
			this.value = value;

			this.width = (this.value / this.maxValue) * this.texture.image.width;
			this.isNeedRedraw = true;
		},

		draw: function(ctx){

			if(gParams.editor){
				this._super(ctx);
				return;
			}
			var drawX = Math.floor(this.drawX + this.brush.drawOffsetX + mighty.camera.x);
			var drawY = Math.floor(this.drawY + this.brush.drawOffsetY + mighty.camera.y);

			ctx.drawImage(
				this.texture.image,
				0,
				0,
				this.width,
				this.texture.image.height,
				drawX,
				drawY,
				this.width,
				this.texture.image.height);
		}
	});
})(Entity);