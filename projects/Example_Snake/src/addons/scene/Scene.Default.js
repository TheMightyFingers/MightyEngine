"use strict";

Scene.Default = Scene.Base.extend
({
	setup: function()
	{
		// Setup and load textures we want to use.
		mighty.LoadTexture([
			{ path: "assets/bg" },
			{ path: "assets/snake" },
			{ path: "assets/food" }
		]);
	},

	load: function()
	{
		// Create 10x10 tile map.
		this.gridWidth = 32;
		this.gridHeight = 32;
		this.gridSizeX = 20;
		this.gridSizeY = 20;
		Terrain.Cfg.grid.width = this.gridWidth;
		Terrain.Cfg.grid.height = this.gridHeight;
		this.createLevel({ sizeX: 10, sizeY: 10, texture: "bg" });
	},


	//
	ready: function()
	{
		this.direction = "none";
		this.snakeBody = [];

		// Create the score text counter.
		this.score = 0;
		this.scoreTxt = new Entity.Text({ x: 5, y: 5 });
		this.scoreTxt.text = "Score: " + this.score;
		Entity.plugin.addEntity(this.scoreTxt);

		this.createSnake();
		this.createFood();

		// Listen to key inputs.
		var self = this;
		mighty.OnKeyDown(function(data)
		{
			switch(data.keyCode)
			{
				case Input.Key.ARROW_LEFT:
				case Input.Key.A:
					self.direction = "left";
					break;

				case Input.Key.ARROW_RIGHT:
				case Input.Key.D:
					self.direction = "right";
					break;

				case Input.Key.ARROW_UP:
				case Input.Key.W:
					self.direction = "up";
					break;

				case Input.Key.ARROW_DOWN:
				case Input.Key.S:
					self.direction = "down";
					break;
			}
		});

		// Try move snake with 200ms interval.
		this.addTimer(function() {
			self.moveSnake();
		}, 200);
	},

	createSnake: function()
	{
		// Create snake in the center of the level.
		var x = Math.floor(this.gridSizeX / 2);
		var y = Math.floor(this.gridSizeY / 2);
		x *= this.gridWidth;
		y *= this.gridHeight;

		this.snake = new Entity.Geometry({ x: x, y: y, texture: "snake" });
		Entity.plugin.addEntity(this.snake);
	},

	createFood: function()
	{
		// Randomize food location.
		this.foodX = mighty.Random.getNumber(0, this.gridSizeX - 1);
		this.foodY = mighty.Random.getNumber(0, this.gridSizeY - 1);
		var x = this.foodX * this.gridWidth;
		var y = this.foodY * this.gridHeight;

		this.food = new Entity.Geometry({ x: x, y: y, texture: "food" });
		Entity.plugin.addEntity(this.food);
	},

	moveSnake: function()
	{
		var x = this.snake.x;
		var y = this.snake.y;

		switch(this.direction)
		{
			case "left":
				x -= this.gridWidth; break;
			case "right":
				x += this.gridWidth; break;
			case "up":
				y -= this.gridHeight; break;
			case "down":
				y += this.gridHeight; break;
		}

		// Move snake body parts.
		if(this.snakeBody.length)
		{
			for(var i = (this.snakeBody.length-1); i > 0; i--) {
				var prevBodyPart = this.snakeBody[i - 1];
				this.snakeBody[i].move(prevBodyPart.x, prevBodyPart.y);
			}

			this.snakeBody[0].move(this.snake.x, this.snake.y);
		}

		this.snake.move(x, y);

		if(this.isCollision()) {
			this.reloadLevel();
		}
	},

	isCollision: function()
	{
		// Check if snake is going out of level bounds.
		if(this.snake.gridX < 0 || this.snake.gridY < 0 ||
			this.snake.gridX >= this.gridSizeX || this.snake.gridY >= this.gridSizeY)
		{
			return true;
		}

		// Check if snake is on top of food - if so - eat it.
		if(this.snake.gridX === this.foodX && this.snake.gridY === this.foodY) {
			this.eatFood();
			return false;
		}

		// Check if snake is colliding with it's own body.
		for(var i = 0; i < this.snakeBody.length; i++)
		{
			if(this.snakeBody[i].gridX === this.snake.gridX && this.snakeBody[i].gridY === this.snake.gridY) {
				return true;
			}
		}

		return false;
	},

	eatFood: function()
	{
		// Add to score and create a new food.
		this.score++;
		this.scoreTxt.text = "Score: " + this.score;

		// Remove eaten food and generate a new one.
		this.food.remove();
		this.createFood();

		// Grow snake by adding a new entity to it's body.
		var snake = new Entity.Geometry({ x: this.snake.x, y: this.snake.y, texture: "snake" });
		Entity.plugin.addEntity(snake);
		this.snakeBody.push(snake);
	}
});