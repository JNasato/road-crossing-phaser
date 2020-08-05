// create a new scene
let gameScene = new Phaser.Scene('Game');

const difficulty = prompt('Easy, Medium, or Hard?')

// initiate scene parameters
gameScene.init = function() {
	if (difficulty.toUpperCase() === 'EASY') {
		this.playerSpeed = 6;
		this.enemyMinSpeed = 0;
		this.enemyMaxSpeed = 4;
	} else if (difficulty.toUpperCase() === "MEDIUM") {
		this.playerSpeed = 5;
		this.enemyMinSpeed = 1;
		this.enemyMaxSpeed = 5;
	} else if (difficulty.toUpperCase() === "HARD") {
		this.playerSpeed = 4;
		this.enemyMinSpeed = 2;
		this.enemyMaxSpeed = 6;
	}
	
	this.enemyMinY = 80;
	this.enemyMaxY = 280;

	this.isTerminating = false;
};

// load assets
gameScene.preload = function() {
	//load images
	this.load.image('background', 'assets/background.png')
	this.load.image('player', 'assets/player.png')
	this.load.image('enemy', 'assets/dragon.png')
	this.load.image('goal', 'assets/treasure.png')
};

// called once after preload finishes
gameScene.create = function() {
	// create bg sprite
	let bg = this.add.sprite(0, 0, 'background');

	// change the origin to top-left corner
	bg.setOrigin(0,0)

	// create the player
	this.player = this.add.sprite(40, this.sys.game.config.height / 2, 'player');
	// scale sprite
	this.player.setScale(0.6);

	// create enemies group
	this.enemies = this.add.group({
		key: 'enemy',
		repeat: 4,
		setXY: {
			x: 100,
			y: 100,
			stepX: 100,
			stepY: 20
		}
	});

	// setting scale to all group elements
	Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4, -0.4)

	Phaser.Actions.Call(this.enemies.getChildren(), function(enemy) {
		// flip sprite on x-axis
		enemy.flipX = true;

		// set enemy speed
		let dir = Math.random() < 0.5 ? 1 : -1;
		let speed = this.enemyMinSpeed + Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed);
		enemy.speed = dir * speed;
	}, this);

	// add goal
	this.goal = this.add.sprite(this.sys.game.config.width - 70, this.sys.game.config.height / 2, 'goal');
	this.goal.setScale(0.6);
};

// called up to 60 times per second
gameScene.update = function() {
	if (this.isTerminating) return;

	// check for active input
	if (this.input.activePointer.isDown) {
		this.player.x += this.playerSpeed;
	}

	// check for treasure overlap 
	let playerRect = this.player.getBounds();
	let treasureRect = this.goal.getBounds();

	if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {
		// end game
		return this.gameOver('win');
	}

	let enemies = this.enemies.getChildren();

	for (let i = 0; i < enemies.length; i++) {
		// enemy movement
		enemies[i].y += enemies[i].speed;

		// check enemy is within bounds of gameScene
		if ((enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY)
		|| (enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY)) {
			enemies[i].speed *= -1;
		} 

		if (enemies[i].x < this.player.x) {
			enemies[i].flipX = false;
		}

		// check for enemy overlap 
		let enemyRect = enemies[i].getBounds();

		if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
			// end game
			return this.gameOver('lose');
		}
	}
};

gameScene.gameOver = function(ending) {
	this.isTerminating = true;

	if (ending === 'lose') {
		//shake camera and listen for completion
		this.cameras.main.shake(400);
		this.add.text(260, 15, 'You died.', { fontSize: '28px', color: 'red', backgroundColor: 'black' });
		this.cameras.main.on('camerashakecomplete', function() {
			this.cameras.main.fade(400);
		}, this);
	}
	
	if (ending === 'win') {
		//shake camera and listen for completion
		this.add.text(160, 15, 'You got the TREASURE!', { fontSize: '28px', color: 'gold', backgroundColor: 'black' });
		this.cameras.main.flash(800);
		this.cameras.main.on('cameraflashcomplete', function() {
			this.cameras.main.fade(800);
		}, this);
	}
	
	this.cameras.main.on('camerafadeoutcomplete', function() {
		// restart scene
		this.scene.restart();
	}, this);	
};

// set configuration of game
let config = {
	type: Phaser.AUTO, // Phaser will use WebGL if available, otherwise Canvas
	width: 640,
	height: 360,
	scene: gameScene
};

// create new game and pass configuration
let game = new Phaser.Game(config)