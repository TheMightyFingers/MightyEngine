(function(Entity){
  "use strict";
  Entity.Points = Entity.Animator.extend
  ({
    load: function(){
      if(gParams.editor){return;}
      this.component.TextOnEntity.setUpFont()
      var self = this;
      this.setAnimator(1,
              [ 
                {time:0, scaleX: 0, scaleY: 0, alpha:0},
                {time:15, scaleX: 1.2, scaleY: 1.2, alpha:1},
                {time:30, scaleX: 1, scaleY: 1, alpha:1},
                {time:70, scaleX: 1, scaleY: 1, alpha:1},
                {time:100, scaleX: 1, scaleY: 1, alpha:0.01, after:function(){self.setVisible(false);}},
              ],
              false
          );
      this.addToUpdate();
      this.animatorStart();
      //this.isDrawBounds = true;
    },

    set: function(points){
      if(this.component.TextOnEntity) this.component.TextOnEntity.setText(points);
    },

    onAnimatorAfter: function(){
      this.remove();
    },

    setAlpha: function(a){
    	this.alpha = a;
    	this.isNeedDraw = true;
    },

  });

})(Entity);
