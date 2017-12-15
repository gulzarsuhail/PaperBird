// set up variables
var gameLost = false;
var birdCollide = false;
var resetLock = false;
var buildings = [];

// create a scoreboard
var scoreboard = {
	score: 0,
	topScore: 0,	
	init: function(){
		this.background = new Path.Rectangle({
				point: [10, 10],
				size: [230, 90],
				fillColor: '#3ed6f1'
		});
		this.background.opacity = 0.9;
		// the static text
		this.topScoreText = new PointText({
			point: [35,45],
			justification: 'left',
			fontSize: 25,
			fillColor: 'white',
			content: "Top Score",
			fontFamily: 'Pangolin'
		});
		this.scoreText = new PointText({
			point: [35,80],
			justification: 'left',
			fontSize: 25,
			fillColor: 'white',
			content: "Score",
			fontFamily: 'Pangolin'
		});
		// the number score display
		this.scoreDisplay = topScoreText = new PointText({
			point: [200,45],
			justification: 'right',
			fontSize: 25,
			fillColor: 'white',
			content: 0,
			fontFamily: 'Pangolin'
		});
		this.topScoreDisplay = topScoreText = new PointText({
			point: [200,80],
			justification: 'right',
			fontSize: 25,
			fillColor: 'white',
			content: 0,
			fontFamily: 'Pangolin'
		});
	},
	resetScore: function(){
		this.score = 0;
	},
	refreshScore: function(){
		if (this.topScore < this.score){
			this.topScore = this.score;
		}
		this.scoreDisplay.content = this.score;
		this.topScoreDisplay.content = this.topScore;
	},
	addScore: function(x){
		this.score += x;
	}
}

var bird = {
	// jump sound
	jumpSound: new Howl({
		src: ['../sounds/jump.mp3']
	}),
	// lose sound
	loseSound: new Howl({
		src: ['../sounds/lose.mp3']
	}),
	// initiaze the new bird
	init: function( x, y, col){
		this.velocity = 10;
		this.bird = new Path.Circle({
			center: [x , y],
			radius: 20,
			fillColor: col
		});
	},
	animate: function(){
		// set velocity to 0 if bird reaches top of the screen
		if (this.bird.position.y <= 0 && this.velocity < 0)
			this.velocity = 0;
		else
			// don't let bird above the screen
			if (this.bird.position.y + this.velocity < 0){
				this.bird.position.y = 0;
				this.velocity = 0;
			} 
			// move the bird
			else
				this.bird.position.y += this.velocity;
		if (this.velocity<15)
			this.velocity+= 1.5;
	},
	// check if game is lost
	birdAtFloor: function(){
		if (this.bird.position.y >= view.viewSize.height){
			this.loseSound.play();			
			return true;
		} else {
			return false;
		}
	},
	// jump the bird
	jump: function(){
		this.velocity = -20;
		this.jumpSound.play();		
	},
	// plays the end game sound
	playLost: function(){
		this.loseSound.play();
	},
	zeroVelocity: function(){
		this.velocity = 0;
	},
	setYPosition: function(y){
		this.bird.position.y = y;
	}
}

var Building = {
	// distance between each building
	buildDistance: 400,
	// width of each building
	buildWidth: 100,
	// velocity with with buildings move
	velocity: 10,
	// set up space betwwn buildings
	clearence: 200,
	scoreAdded: false,
	// initiaze new building
	init: function (x){
		var rand = Math.floor((Math.random() * (view.viewSize.height - this.clearence - 60)) + 30);
		this.upperRect = new Path.Rectangle({
			point: [x, 0],
			size: [this.buildWidth, rand],
			fillColor: {
				gradient: {
					stops: [["#42d151",0.1],['#38b745', 0.3], ['#1a471e', 1]],
				},
				origin: [x,0],
				destination: [x+this.buildWidth,0]
			}
		});
		this.upperRectTop = new Path.Rectangle({
			point: [x-10, rand-25],
			size: [this.buildWidth+20, 25],
			fillColor: {
				gradient: {
					stops: [["#42d151",0.1],['#38b745', 0.7], ['#1a471e', 1]],
				},
				origin: [x,0],
				destination: [x+this.buildWidth,0]
			}
		});
		this.lowerRect = new Path.Rectangle({
			point: [x, rand+this.clearence],
			size: [this.buildWidth, view.viewSize.height - (rand+this.clearence)],
			fillColor: {
				gradient: {
					stops: [["#42d151",0.1],['#38b745', 0.3], ['#1a471e', 1]],
				},
				origin: [x,0],
				destination: [x+this.buildWidth,0]
			}
		});
		this.lowerRectTop = new Path.Rectangle({
			point: [x-10, rand+this.clearence],
			size: [this.buildWidth+20, 25],
			fillColor: {
				gradient: {
					stops: [["#42d151",0.1],['#38b745', 0.5], ['#1a471e', 1]],
				},
				origin: [x,0],
				destination: [x+this.buildWidth,0]
			}
		});
	},
	// move the building
	animate: function(reX, thebird){
		if (!this.scoreAdded){
			if (thebird.bird.position.x > this.upperRect.position.x){
				scoreboard.addScore(1);
				this.scoreAdded = true;
			}
		}
		else if (this.upperRect.position.x + this.buildWidth <= 0){
			this.resetXPosition(reX);
		}
		this.upperRect.position.x -= this.velocity;
		this.lowerRect.position.x -= this.velocity;
		this.upperRectTop.position.x -= this.velocity;
		this.lowerRectTop.position.x -= this.velocity;
	},
	// check if bird collides with the buildings
	checkCollision: function(bird){
		var collision = false;
		if (this.upperRect.intersects(bird.bird) || this.upperRectTop.intersects(bird.bird)){
			collision = true;
		} else if (this.lowerRect.intersects(bird.bird) || this.lowerRectTop.intersects(bird.bird)){
			collision = true;
		}
		return collision;
	},
	resetXPosition: function(reX){
		// generate new random number for new clearence
		var rand = Math.floor((Math.random() * (view.viewSize.height - this.clearence - 60)) + 30);
		// change upper rectangle
		this.upperRect.scale(1,rand/this.upperRect.bounds.height);
		this.upperRect.position = new Point(reX-this.buildWidth/2, this.upperRect.bounds.height/2);
		// change lower rectangele	
		this.lowerRect.scale(1,(view.viewSize.height - (rand+this.clearence))/this.lowerRect.bounds.height);
		this.lowerRect.position = new Point(reX-this.buildWidth/2, (rand + this.clearence + view.viewSize.height)/2);
		// change upperRectTop
		this.upperRectTop.position = new Point(reX-this.buildWidth/2, this.upperRect.bounds.height - 12.5);
		// change lowerRectTop
		this.lowerRectTop.position = new Point(reX- this.buildWidth/2, rand+this.clearence);
		// set scoreAdded to false so that score can be added after respawn
		this.scoreAdded = false;
	}
}



function init(){
	// create buildings
	for (var t=view.viewSize.width; t<(2.25*view.viewSize.width); t+=(Building.buildDistance+Building.buildWidth)){
		buildings.push(Object.create(Building));
		buildings[buildings.length -1].init(t);
	}
	// set x from where the buildings will be respawned
	respawnX = (buildings.length * (Building.buildWidth + Building.buildDistance));
	
	// create and initialize bird instance
	bird.init(view.viewSize.width * 0.30, view.viewSize.height/2, "red");
	
	// init scoreboard
	scoreboard.init();
}

function reset(){
	resetLock = true;
	var xCood = view.viewSize.width;
	for (var x = 0; x< buildings.length; x++){
		buildings[x].resetXPosition(xCood);
		xCood += Building.buildDistance+Building.buildWidth;
	}
	bird.setYPosition(view.viewSize.height/2);
	scoreboard.resetScore();
	birdCollide = false;
	gameLost = false;
	resetLock = false;
}

init();

// keypress listner to jump the bird
function onKeyDown(event) {
	// When a key is released, set the content of the text item:
	if ((event.key == 'space') && (!birdCollide)){
		bird.jump();
	} else if ((event.key == 'r') || (event.key == 'R')){
		reset();
	}
}

// checks if bird colided
function checkLost(){
	if (bird.birdAtFloor()){
		gameLost = true;
		bird.playLost();
	} else {
		if (!birdCollide){
			for (var x=0; x<buildings.length; x++){
				if (buildings[x].checkCollision(bird) == true){
						birdCollide = true;
						bird.zeroVelocity();
				}
			}
		}
	}
}

// do this at each frame
function onFrame(event) {
	// check if game lost
	if(!gameLost && !resetLock){
		for (var t=0; t<buildings.length; t++){
			buildings[t].animate(respawnX,bird);			
		}
		// move the bird
		bird.animate();
		scoreboard.refreshScore();
		checkLost();
	}
}
