window.tt = [];

Component.DropShadow = function(data){
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

};

Component.DropShadow.prototype = {
	
	load: function(){
		window.tt.push(this);
	
		
		this.parent.setAngleRad(this.parent.angle);
		var that = this;
		
		
		var drawComponent = function(ctx){
			if(this.isHidden) return;
			ctx.save();
			ctx.shadowColor = '#333';
      		ctx.shadowBlur = 6;
      		ctx.shadowOffsetX = 0;
      		ctx.shadowOffsetY = 0;
			that.parent._draw.call(that.parent, ctx);
			ctx.restore();
		};
		

		this.parent.draw = drawComponent;
	},
	
	setupCanvas: function(){
	},

	update: function(){
	},

	draw: function(){}

};
