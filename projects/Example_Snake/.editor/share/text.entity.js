// (function(Entity){
// 	"use strict";
// 
// 	Entity.Text = Entity.Geometry.extend({
// 		text: "",
// 
// 		load: function(){
// 		},
// 
// 		setText: function(text) {
// 			this.text = text;
// 
// 			if (this.component.TextOnEntity) {
// 				this.component.TextOnEntity.setText(text);
// 			}
// 			else {
// 				console.warn('Entity "Text" cannot work without component "TextOnEntity"');
// 			}
// 		}
// 	});
// })(Entity);