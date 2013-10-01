(function(Entity){
  "use strict";  
  Entity.Counter = Entity.Animator.extend
  ({
    dafaultSound: 'countdown_tick',
    row: [{value:Counter.Tick._3}, {value:Counter.Tick._2}, {value:Counter.Tick._1}, {value:Counter.Tick.COUNTER_GO, sound: false}],
    currentTick: 0,
    tickCount: 4,
    tickTime: 1000,
    tickValue: Counter.Tick._3,
    callback: function(){},
    onCallback: function(funct){
      this.callback = funct;
    },

    scaleSpeed: 0,
    alphaSpeed: 0,
    fadeDuration: 0,
    scaleTo: 0,
    alphaTo: 0,
    tDeltaSum: 0,
    nextFade: false,
    current: false,

    load: function(){
      if(gParams.editor){return;}
      this.addToUpdate();
    },

    startTick: function(){
      if(gParams.editor){return;}
    	var self = this;
    	this.tickCount = this.row.length;
      this.tick();
    },

    tick: function(){
    	this.current = this.row[this.currentTick];
    	this.tickValue = this.current.value;
    	this.currentTick++;

    	if(this.currentTick === this.tickCount){
        this.onAnimatorAfter = this.onTickEnd;
    	}
      this.animatorValue();
    	this.updateStage();
    },

    animatorValue: function(){
      var self = this;
      this.setAnimator(1,
              [ 
                {time:0, scaleX: 0, scaleY: 0, alpha:0},
                {time:15, scaleX: 1.2, scaleY: 1.2, alpha:1},
                {time:30, scaleX: 1, scaleY: 1, alpha:1},
                {time:70, scaleX: 1, scaleY: 1, alpha:1},
                {time:100, scaleX: 1, scaleY: 1, alpha:0},
              ],
              false
          );
      this.animatorStart();
    },

    onAnimatorBefore: function(){
      if(this.current.sound !== false){
          mighty.Macro.GetSoundByName((typeof this.current.sound !== 'undefined') ? this.current.sound : this.dafaultSound ).play();
      }
    },

    onAnimatorAfter: function(){
      this.tick();
    },

    onTickEnd: function(){
      this.callback();
    	this.remove();
    },


  });

})(Entity);

