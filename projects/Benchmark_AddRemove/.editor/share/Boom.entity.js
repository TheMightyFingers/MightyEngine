Entity.Boom = Entity.Geometry.extend({
	onAnimEnd: function(){
		var that = this;
		this.isVisible = false;
		window.setTimeout(function(){
			if(!that.isNeedRemove){
				that.remove();
			}
		}, 0);
	}
});
