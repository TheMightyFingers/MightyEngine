(function(Entity){
 "use strict";
Entity.Animator = Entity.Geometry.extend
({
    animatorRunning: false,
    animatorLength: 0,
    animatorTransformations: [],
    animatorCurrentIndex: 0,
    animatorPrev: false,

    init: function(){
        this._cloneObj = (function(){ 
          return function (obj) { Clone.prototype=obj; return new Clone() };
          function Clone(){}
        }());
    },

    load: function(){
        if(gParams.editor){return;}
        
    /*    this.setAnimator(1.5,
            [ 
              {time:0, scaleX: 0, scaleY: 0, alpha:0},
              {time:15, scaleX: 1.2, scaleY: 1.2, alpha:1},
              {time:30, scaleX: 1, scaleY: 1, alpha:1},
              {time:70, scaleX: 1, scaleY: 1, alpha:1},
              {time:100, scaleX: 1, scaleY: 1, alpha:0, before: function(){}, after: function(){}},
            ],
            false
        );
        this.animatorStart();
        this.addToUpdate();
    */
    },

    animatorStart: function(){
        this.setStart();
        this.onAnimatorBefore();
        this.setNext();
        this.animatorResume();
    },

    animatorResume: function(){
        this.animatorRunning = true;
        this.doAnimator = this._animate;
    },

    animatorStop: function(){
        this.animatorPause();
        this.animatorLength = 0;
        this.currentAnimator = false;
    },

    animatorPause: function(){
        this.animatorRunning = false;
        this.doAnimator = function(){};
    },


    setAnimator: function(totalDuration, transformations, setFirst){
        this.animatorLength = transformations.length;
        this.animatorTransformations = [];


        for(var i = 0; i < this.animatorLength; i++) {
            this.animatorTransformations.push(this._cloneObj(transformations[i]))
        }

        var pScaleX = this.scaleX;
        var pScaleY = this.scaleY;
        var pPosX = 0;
        var pPosY = 0;
        var pAlpha = this.alpha;
        var pTime = 0;
        var tmpTime = 0;

        for(var i = 0; i < this.animatorLength; i++){
            if(typeof this.animatorTransformations[i].posY === 'undefined') this.animatorTransformations[i].posY = 0;
            if(typeof this.animatorTransformations[i].posX === 'undefined') this.animatorTransformations[i].posX = 0;


            this.animatorTransformations[i].id = i;
            tmpTime = this.animatorTransformations[i].time;
            this.animatorTransformations[i].time -= pTime;
            this.animatorTransformations[i].duration = totalDuration * (this.animatorTransformations[i].time/100);
            this.animatorTransformations[i].durationCurrent = 0;

            this.animatorTransformations[i].scaleX = ~~(this.animatorTransformations[i].scaleX * 100)/100;
            this.animatorTransformations[i].scaleY = ~~(this.animatorTransformations[i].scaleY * 100)/100;
            this.animatorTransformations[i].posX = ~~(this.animatorTransformations[i].posX * 100)/100;
            this.animatorTransformations[i].posY = ~~(this.animatorTransformations[i].posY * 100)/100;

            this.animatorTransformations[i]._scaleX = this.animatorTransformations[i].scaleX - pScaleX;
            this.animatorTransformations[i]._scaleY = this.animatorTransformations[i].scaleY - pScaleY;
            this.animatorTransformations[i]._posX = this.animatorTransformations[i].posX - pPosX;
            this.animatorTransformations[i]._posY = this.animatorTransformations[i].posY - pPosY;

            if(i === 0){
                this.animatorTransformations[i]._baseposX = this.x;
                this.animatorTransformations[i]._baseposY = this.y;
            }
            else{
                this.animatorTransformations[i]._baseposX = this.animatorTransformations[i - 1]._baseposX + this.animatorTransformations[i - 1]._posX;
                this.animatorTransformations[i]._baseposY = this.animatorTransformations[i - 1]._baseposY + this.animatorTransformations[i - 1]._posY;
            }

            this.animatorTransformations[i]._alpha = this.animatorTransformations[i].alpha - pAlpha;

            pScaleX = this.animatorTransformations[i].scaleX;
            pScaleY = this.animatorTransformations[i].scaleY;
            pAlpha = this.animatorTransformations[i].alpha;
            pTime = tmpTime;
        }
        
        this.animatorCurrentIndex = 0;
        this.currentAnimator = this.animatorTransformations[this.animatorCurrentIndex];
        if(setFirst){
            this.setStart();
        }
    },

    setStart: function(){
        this.animatorPrev.scaleX = this.scaleX;
        this.animatorPrev.scaleY = this.scaleY;
        this.animatorPrev.alpha = this.alpha;
        this.setAlpha(this.currentAnimator.alpha);
        this.setScale(this.currentAnimator.scaleX, this.currentAnimator.scaleY);
       // console.log('current', this.currentAnimator);
        this.isNeedDraw = true;
       // console.log('start', this.scaleX, this.scaleY, this.alpha);
    },

    setNext: function(){


        if(typeof this.currentAnimator.after === 'function'){
            this.setAlpha(this.currentAnimator.alpha);
            this.setScale(this.currentAnimator.scaleX, this.currentAnimator.scaleY);
            this.currentAnimator.after();
        }

        this.animatorCurrentIndex++;
        //console.log(this.animatorCurrentIndex);
        if(this.animatorCurrentIndex === this.animatorLength){
            this.animatorStop();
            // corrects animation result

            this.onAnimatorAfter();
        }
        else{
            this.animatorPrev = this.currentAnimator;
            this.currentAnimator = this.animatorTransformations[this.animatorCurrentIndex];
            if(typeof this.currentAnimator.before === 'function'){
                this.currentAnimator.before();
            }
            this.doAnimator = this._animate;
        }
    },

    _animate: function(tDelta){
        this.currentAnimator.durationCurrent += tDelta;
        var percentage = this.currentAnimator.durationCurrent / this.currentAnimator.duration
        
        var sX = ~~((this.animatorPrev.scaleX + percentage * this.currentAnimator._scaleX) * 100)/100;
        var sY = ~~((this.animatorPrev.scaleY + percentage * this.currentAnimator._scaleY) * 100)/100;
        var a  = ~~((this.animatorPrev.alpha + percentage * this.currentAnimator._alpha) * 100)/100;
        var posX = this.currentAnimator._baseposX + ~~(( percentage * this.currentAnimator._posX) * 100)/100;
        var posY = this.currentAnimator._baseposY + ~~((percentage * this.currentAnimator._posY) * 100)/100;

        if(percentage >= 1){
            sX = this.currentAnimator.scaleX;
            sY = this.currentAnimator.scaleY;
            a = this.currentAnimator.alpha;
            posX = this.currentAnimator._baseposX + this.currentAnimator._posX;
            posY = this.currentAnimator._baseposY + this.currentAnimator._posY
        }

        if(a < 0) a = 0;
        if(sX < 0) sX = 0;
        if(sY < 0) sY = 0;
        

        if((sX !== this.scaleX)||(sY !== this.scaleY)) this.setScale(sX, sY);
        if(a !== this.alpha) this.setAlpha(a);
        if((posX !== this.x)||(posY !== this.y)) this.move(posX, posY);

        // console.log(~~(percentage*100)+'%', sX, sY, a, 'tsx => '+this.scaleX, 'tsy => '+this.scaleY, this.currentAnimator, this.scaleX, this.scaleY);

        if(percentage >= 1){
            this.doAnimator = function(){}; // this will fix timeing isue
            this.setNext();
        }
    },

    doAnimator: function(){},

    update: function(tDelta){
        if(this.animatorRunning) this.doAnimator(tDelta);
    },

    // Overrideable
    onAnimatorBefore: function(){},
    onAnimatorAfter: function(){},
    
});
})(Entity);