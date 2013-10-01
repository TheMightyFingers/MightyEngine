(function(){
window.tt = [];

Component.TextOnEntity = function(data){
	this.clone = function(obj) {
	  // Handle the 3 simple types, and null or undefined
	  if (null == obj || typeof(obj) != "object"){return obj;}
	  var copy = null;
	  // Handle Date
	  if (obj instanceof Date) {
	   copy = new Date();
	   copy.setTime(obj.getTime());
	   return copy;
	  }

	  // Handle Array
	  if (obj instanceof Array) {
	   copy = [];
	   for (var i = 0,len = obj.length; i < len; i++) {
	   	copy[i] = this.clone(obj[i]);
	   }
	   return copy;
	  }

	  // Handle Object
	  copy = {};
	  for (var attr in obj) {
	   if (!obj.hasOwnProperty(attr)) {continue;}
	   copy[attr] = this.clone(obj[attr]);
	  }
	  return copy;
	 };

	this.data = this.clone(data) ;

	this.fontSize = 0;
	
	this.font = {
		italic: false,
		bold: false,
		size: 24,
		family: "Verdana"
	};
};

Component.TextOnEntity.prototype = {
	
	load: function(){
		window.tt.push(this);
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");

		this.setUpFont();
		this.setupCanvas();
		
		this.parent.setAngleRad(this.parent.angle);
		var that = this;
		
		
		var drawComponent = function(ctx){
			
			if(!this.isHidden){
				if(that.data.drawParent) that.parent._draw.call(that.parent, ctx);
				var x = 0;
				var y = 0;
				var canvasHeight = (that.data.inheritScale) ? that.canvas.height * this.scaleY : that.canvas.height;
				var canvasWidth = (that.data.inheritScale) ? that.canvas.width * this.scaleX : that.canvas.width;
				switch(that.data.align){
					case 'left':
						x = (that.parent.x || 0);
					break;

					case 'right':
						x = (that.parent.volume.maxX || 0) - canvasWidth;
					break;

					case 'center':
						x = (this.getCenterX() || 0) - canvasWidth/2;
					break;
				}

				switch(that.data.valign){
					case 'top':
						y = (that.parent.y || 0);
					break;

					case 'middle':
						y = (this.getCenterY() || 0) - canvasHeight/2;
					break;

					case 'bottom':
						y = (that.parent.volume.maxY || 0) - canvasHeight;
					break;
				}
				//ctx.save();
				/*
				//ctx.transform(this.scaleX, 0, 0, this.scaleY, 0 , 0)
				ctx.scale(this.scaleX, this.scaleY);
				ctx.translate(this.centerOffset, this.centerOffsetY);
				ctx.drawImage(that.canvas, x + mighty.camera.x, y + mighty.camera.y);
				ctx.restore();
				*/
				//ctx.scale(1.2, 1.2)
				ctx.globalAlpha = this.alpha;
				if(that.data.inheritScale){
					if (that.canvas.width > 0 && that.canvas.height > 0) {
				    	ctx.drawImage(that.canvas, x + mighty.camera.x, y + mighty.camera.y, that.canvas.width * this.scaleX, that.canvas.height * this.scaleY);
				    }
				}
			    else
			    {
			    	ctx.drawImage(that.canvas, x + mighty.camera.x, y + mighty.camera.y);	
			    }

				//ctx.scale(1/2, 1/2)
			    //ctx.drawImage(that.cimg, x + mighty.camera.x, y + mighty.camera.y);
			}
		};
		
		this.parent.draw = drawComponent;
	},
	
	
	setText: function(text){
		this.data.text = text;
		this.setupCanvas();
	},
	
	
	appendText: function(text){
		this.data.text += text;
		this.update();
	},
	
	draw: function(){},
	
	setUpFont: function(){

		switch(this.data.coloring){
			case "correct":
				this.data.color.color = "#d1de00";
				this.data.color.drawShadow = true;
				this.data.shadow.color = "#656b00";
				this.data.shadow.shadowOffsetX = this.data.presetShadowOffset;
				this.data.shadow.shadowOffsetY = this.data.presetShadowOffset;
				this.data.shadow.shadowBlur = 0;
			break;

			case "incorrect":
				this.data.color.color = "#ff2a00"
				this.data.color.drawShadow = true;
				this.data.shadow.color = "#571200";
				this.data.shadow.shadowOffsetX = this.data.presetShadowOffset;
				this.data.shadow.shadowOffsetY = this.data.presetShadowOffset;
				this.data.shadow.shadowBlur = 0;
			break;


			case "custom":
				// leave settings as is
			break;
		}
	},

	getFontString: function(){
		//if(this.data.inheritScale){
		//	return this.data.fontStyle+" " + (this.data.fontSize * this.parent.scaleY)+ "px '"+this.data.fontFamily+"'";
		//}
		//else{
			//return this.data.fontStyle+" " + this.data.fontSize + "px '"+this.data.fontFamily+"'";
		//}
		return this.data.fontSize + "px "+this.data.fontFamily;
	},

	setupCanvas: function(){
		if(this.data.text == void(0)){
			return;
		}
		

		this.setupCanvasFont();
		var w = this.ctx.measureText(this.data.text).width;
		//var h = Math.abs(this.ctx.ascent) + Math.abs(this.ctx.descent);
		var h = this.getLineHeight() + this.data.offsetTop;
		//console.log(h);
		//console.log(this.ctx);
		this.canvas.width = w;
		this.canvas.height = h; 
		this.setupCanvasFont();
		this.parent.isNeedDraw = true;
	},
	
	setupCanvasFont: function(){
		this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
		var x = this.data.offsetLeft;
		var y = this.data.offsetTop;
		this.ctx.textBaseline = 'top';
		this.ctx.textAlign = 'left';
		/* Netiek izmantots
			if(this.data.align == "left"){
				this.ctx.textBaseline = 'top';
			}
			else if(this.data.align == "center"){
				x += this.parent.texture.width*0.5;
				y += this.parent.texture.height*0.5;
				this.ctx.textBaseline = 'middle';
			}
			if(this.data.align == "right"){
				x += this.parent.texture.width;
			}

			this.ctx.textAlign = this.data.align;
		*/
		
		

		this.ctx.fillStyle = this.data.color.color;
		
		if(this.data.color.drawShadow){
			this.ctx.shadowColor = this.data.shadow.color;

			// Specify the shadow offset.
			this.ctx.shadowOffsetX = this.data.shadow.shadowOffsetX;
			this.ctx.shadowOffsetY = this.data.shadow.shadowOffsetY;
			this.ctx.shadowBlur = this.data.shadow.shadowBlur;
			
		}

		this.ctx.font = this.getFontString();
		this.ctx.fillText(this.data.text, x, y);

	},

	getLineHeight: function(){
		//return this.data.lineHeight;
		return (this.data.lineHeight || this.data.fontSize);
	},
	
	
};
})();
