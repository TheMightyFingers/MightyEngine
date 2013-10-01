(function(Entity){
	"use strict";

	Entity.Button = Entity.Geometry.extend
	({
		callback: null,

		setClickCallback: function(callback) {
			this.callback = callback;
		},

		onClick: function(){
			if (typeof this.callback == "function") {
				this.callback();
			}
		}
	});
})(Entity);