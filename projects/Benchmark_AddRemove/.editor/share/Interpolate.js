
/*
public methods:
	move
	setAlpha
	rotate
	zoom
	
	stop
*/
window.Interpolate = function(entity){
	this.entity = entity;
	this.tickMove = this.tickAlpha = this.tickAngle = this.tickZoom = this.emptyFn;
};

window.Interpolate.prototype = {
	emptyFn: function(){},
	
	stop: function(){
		this.tickMove = this.tickAlpha = this.tickAngle = this.tickZoom = this.onMoveTick = this.emptyFn;
		this.onCompleteMove = this.onCompleteAlpha = this.onCompleteAngle = this.onCompleteZoom = null;
	},
	
	targetMoveTime: 0,
	moveTimeRemaining: 0,
	stepX: 0,
	stepY: 0,
	
	targetX: 0,
	targetY: 0,

	onCompleteMove: null,
	tickMove: null,
	onMoveTick: null,
	tickMoveCalc: function(delta){
		var x = this.entity.x;
		var y = this.entity.y + this.stepY*delta;
		
		if(this.stepX !== null){
			x += this.stepX*delta;
		}
		
		this.onMoveTick(delta);
		if(this.moveTimeRemaining > delta){
			this.entity.move(x, y);
			this.moveTimeRemaining -= delta;
			return;
		}
		
		if(this.moveTimeRemaining !== 0){
			if(this.stepX !== null){
				x = this.targetX;
			}
			
			this.entity.move(
				x,
				this.targetY
			);
			this.moveTimeRemaining = 0;
		}
		
		this.tickMove = this.emptyFn;
		if(this.onCompleteMove){
			var m = this.onCompleteMove;
			this.onCompleteMove = null;
			window.setTimeout(m, 0);
		}
	},
	
	stepAlpha: 0,
	targetAlpha: 0,
	alphaTimeRemaining: 0,
	
	tickAlpha: null,
	tickAlphaCalc: function(delta){
		if(this.alphaTimeRemaining > delta){
			var alpha = this.entity.alpha + this.stepAlpha*delta;
			this.entity.setAlpha(this.entity.alpha + this.stepAlpha*delta);
			this.alphaTimeRemaining -= delta;
			return;
		}
		if(this.alphaTimeRemaining !== 0){
			this.entity.setAlpha(this.targetAlpha);
			this.alphaTimeRemaining = 0;
		}
		this.tickAlpha = mighty.EmptyFunc;
		if(this.onCompleteAlpha){
			var m = this.onCompleteAlpha;
			this.onCompleteAlpha = null;
			window.setTimeout(m, 0);
		}
		
	},
	
	stepAngle: 0,
	targetAngle: 0,
	angleTimeRemaining: 0,
	tickAngle: null,
	tickAngleCalc: function(delta){
		if(this.angleTimeRemaining > delta){
			var angle = this.entity.angle + this.stepAngle*delta;
			this.entity.setAngleRad(this.entity.angle + this.stepAngle*delta);
			this.angleTimeRemaining -= delta;
			return;
		}
		if(this.angleTimeRemaining !== 0){
			this.entity.setAngleRad(this.targetAngle);
			this.angleTimeRemaining = 0;
		}
		this.tickAngle = mighty.EmptyFunc;
		if(this.onCompleteAngle){
			var m = this.onCompleteAngle;
			this.onCompleteAngle = null;
			window.setTimeout(m, 0);
		}
		
	},
	
	stepZoom: 0,
	targetZoom: 0,
	zoomTimeRemaining: 0,
	
	tickZoom: null,
	tickZoomCalc: function(delta){
		if(this.zoomTimeRemaining > delta){
			var zoom = this.entity.scaleX + this.stepZoom*delta;
			this.entity.setScale(zoom, zoom);
			this.zoomTimeRemaining -= delta;
			return;
		}
		if(this.angleTimeRemaining !== 0){
			this.entity.setScale(this.targetZoom, this.targetZoom);
			this.zoomTimeRemaining = 0;
		}
		this.tickZoom = mighty.EmptyFunc;
		
		if(this.onCompleteZoom){
			var m = this.onCompleteZoom;
			this.onCompleteZoom = null;
			window.setTimeout(m, 0);
		}
		
	},
	
	followObj: null,
	followCollide: mighty.EmptyFunc,
	followChange: mighty.EmptyFunc,
	followSpeed: 1,
	follow: function(obj, speed, onChange, onCollide){
		this.tickMove = mighty.EmptyFunc;
		this.followObj = obj;
		this.followSpeed = speed;
		if(onCollide){
			this.followCollide = onCollide;
		}
		if(onChange){
			this.followChange = onChange;
		}
		this.tickFollow = this.tickFollowCalc;
	},
	stopFollow: function(){
		this.tickFollow = mighty.EmptyFunc;
		this.onCollide = mighty.EmptyFunc;
	},
	
	tickFollow: mighty.EmptyFunc,
	
	collideDistance: 5,
	
	tickFollowCalc: function(delta){
		var dx = Math.round(this.followObj.x - this.entity.x);
		var dy = Math.round(this.followObj.y - this.entity.y);
		this.entity.move(this.entity.x + dx*delta*0.001*this.followSpeed, this.entity.y + dy*delta*0.001*this.followSpeed);
		if(Math.abs(dx) < this.collideDistance && Math.abs(dy) < this.collideDistance){
			this.entity.onCollide();
		}
		this.followChange(delta);
	},
	
	easing: function(i){
		return i;
	}, 
	
	tick: function(delta){
		this.tickMove(delta);
		this.tickAlpha(delta);
		this.tickAngle(delta);
		this.tickZoom(delta);
		this.tickFollow(delta);
	},
	
	
	
	move: function(x, y, time, onComplete, onTick, easing){
		if(x === null){
			this.stepX = null;
		}
		else{
			this.stepX = (x - this.entity.x) / time;
		}
		this.stepY = (y - this.entity.y) / time;
		
		this.targetX = x;
		this.targetY = y;
		
		this.onCompleteMove = onComplete;
		this.moveTimeRemaining = time;
		
		this.tickMove = this.tickMoveCalc;
		this.moveEasing = easing || this.easing;
		this.onMoveTick = onTick || this.emptyFn;
	},
	
	setAlpha: function(alpha, time, onComplete, easing){
		this.stepAlpha = (alpha - this.entity.alpha) / time;
		this.onCompleteMove = onComplete;
		this.alphaTimeRemaining = time;
		
		this.targetAlpha = alpha;
		
		this.tickAlpha = this.tickAlphaCalc;
		this.alphaEasing = easing || this.easing;
	},
	
	rotate: function(angle, time, onComplete, easing){
		this.stepAngle = (angle - this.entity.angle) / time;
		this.onCompleteAngle = onComplete;
		this.angleTimeRemaining = time;
		
		this.targetAngle = angle;
		
		this.tickAngle = this.tickAngleCalc;
		this.angleEasing = easing || this.easing;
	},
	
	zoom: function(zoom, time, onComplete, easing){
		this.stepZoom = (zoom - this.entity.scaleX) / time;
		this.targetZoom = zoom;
		this.zoomTimeRemaining = time;
		
		this.tickZoom = this.tickZoomCalc;
		this.onCompleteZoom = onComplete;
		this.zoomEasing = easing || this.easing;
	}
};
