"use strict";
(function(undefined){
Filler.Manager = Plugin.extend
({
	fillByName: function(names, fillData){
		if(typeof names === 'string') names = [names];
		var entity;
		for(var i = 0, ln = names.length; i < ln; i++){
			entity = Ask("Entity.IN", Entity.Event.GET_BY_NAME, names[i]);
			if(entity) this.fill(entity, fillData);	
		}
	},

	fill: function(entity, fillData){
        entity.setScale(1,1);
		fillData = this.defaults(fillData);
		fillData = this.setPositions(entity, fillData);
		entity = this.setOffset(entity, fillData);
		var width = entity.volume.sizeX;
		var height = entity.volume.sizeY;

		var scaleX = (fillData.noScaleX) ? 1 :  (fillData.to.x - fillData.from.x) / width ;
		var scaleY = (fillData.noScaleY) ? 1 : (fillData.to.y - fillData.from.y) / height ;
		entity.setScale(scaleX, scaleY);
		entity.move(fillData.from.x,fillData.from.y);
    },

    setPositions: function(entity, fillData){
    	var midX = (Terrain.Cfg.numTilesX * Terrain.Cfg.tileWidth) /2;
        //var midX = mighty.camera.viewFrustum.maxX / 2;
    	var midY = (Terrain.Cfg.numTilesY * Terrain.Cfg.tileHeight) / 2
    	switch(fillData.from.typeX){
    		case Filler.From.X.LEFT:
    			fillData.from.x = mighty.camera.viewFrustum.minX;
    		break;

    		case Filler.From.X.MID:
    			fillData.from.x = midX;
    		break;

    		case Filler.From.X.CURRENT:
    			fillData.from.x = entity.volume.minX;
    		break;
    	}


    	switch(fillData.from.typeY){
    		case Filler.From.Y.TOP:
    			fillData.from.y = mighty.camera.viewFrustum.minY;
    		break;

    		case Filler.From.Y.MID:
    			fillData.from.y = midY;
    		break;

    		case Filler.From.Y.CURRENT:
    			fillData.from.y = entity.volume.minY;
    		break;
    	}


    	switch(fillData.to.typeX){
    		case Filler.To.X.MID:
    			fillData.to.x = midX;
    		break;

    		case Filler.To.X.RIGHT:
    			fillData.to.x = mighty.camera.viewFrustum.maxX + 50;
    		break;

    		case Filler.To.X.CURRENT:
    			fillData.to.x = entity.volume.maxX;
    		break;

    	}

    	switch(fillData.to.typeY){
    		case Filler.To.Y.MID:
    			fillData.to.y = midY;
    		break;

    		case Filler.To.Y.BOTTOM:
    			fillData.to.y = mighty.camera.viewFrustum.maxY + 50;
    		break;

    		case Filler.To.Y.CURRENT:
    			fillData.to.y = entity.volume.maxY;
    		break;
    	}

    	return fillData;
    },

    setOffset: function(entity, fillData){
    	if(fillData.offset.typeX === Filler.Offset.ZERO) entity.centerOffsetX = 0;
        if(fillData.offset.typeY === Filler.Offset.ZERO) entity.centerOffsetY = 0;
       	entity.centerOffsetX = 0;
        entity.centerOffsetY = 0;
        return entity;
    },


    defaults: function(fillData){
    	//if NEED - develop it. NEVER PASS THIS PARAM!!!
    	//if(fillData.offset.typeX === undefined) fillData.offset.typeX = Filler.Offset.ZERO; 
    	//if(fillData.offset.typeY === undefined) fillData.offset.typeY = Filler.Offset.ZERO;
    	fillData.offset = {};
    	fillData.offset.typeX = Filler.Offset.ZERO; 
    	fillData.offset.typeY = Filler.Offset.ZERO;
    	if(fillData.noScaleX === undefined) fillData.noScaleX = false;
    	if(fillData.noScaleY === undefined) fillData.noScaleY = false;

    	if((fillData.from === undefined)||(fillData.from.typeX === undefined)) fillData.from.typeX = Filler.From.X.LEFT;
    	if((fillData.from === undefined)||(fillData.from.typeY === undefined)) fillData.from.typeY = Filler.From.Y.TOP;
     	if((fillData.to === undefined)||(fillData.to.typeX === undefined)) fillData.to.typeX = Filler.To.X.RIGHT;
    	if((fillData.to === undefined)||(fillData.to.typeY === undefined)) fillData.to.typeY = Filler.To.Y.BOTTOM;
    	return fillData;
    },

    /* Tile - fills space by repeating item */
    tile: function(resourceName, fillData){
        if(fillData.texture === undefined) fillData.texture = resourceName;
        if(fillData.x === undefined) fillData.x = 0;
        if(fillData.y === undefined) fillData.y = 0;

        var texture = mighty.Macro.GetTextureByName(fillData.texture);
        var textureWidth = texture.width;
        var textureHeight = texture.height;

        var offsetX = textureWidth * (fillData.x * 0.01);
        var offsetY = textureHeight * (fillData.y * 0.01);

        var width = mighty.camera.width + offsetX;
        var height = mighty.camera.height + offsetY;


        var mapOffsetX = (Terrain.Cfg.numTilesX * Terrain.Cfg.tileWidth) - offsetX;
        var left = -offsetX;
        while(left > mighty.camera.viewFrustum.minX){ left -= textureWidth;}
     
        var top = -offsetY;
        while(top > mighty.camera.viewFrustum.minY){ top -= textureHeight;}

         // var left = -(Math.ceil((mighty.camera.viewFrustum.minX - offsetX) / textureWidth) * textureWidth + offsetX);
      // var top = -(Math.ceil((mighty.camera.viewFrustum.minY - offsetY) / textureHeight) * textureHeight + offsetY);

        var cols = Math.ceil(width / textureWidth);
        var rows = Math.ceil(height / textureHeight);
        for(var r = 0; r < rows; r++){
            for(var c = 0; c < cols; c++){
                mighty.Macro.CreateEntity(resourceName, left +  c * textureWidth, top + r * textureHeight);
            }
        }
    },
});

})();