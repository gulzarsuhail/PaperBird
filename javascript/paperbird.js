// check the game status, paused by
var gameStopped = true;
// check if game is paused
var gamePaused = true
// checks if bird has collided
var birdCollided = false;

// the background of the game
var Background = {

    // the cloud image list
    cloudImageList: [
        "/assets/clouds/1.png",
        "/assets/clouds/2.png",
        "/assets/clouds/3.png",
        "/assets/clouds/4.png",
    ],

    // place holders for objects
    sky: null,
    clouds: [],

    // initialized the background
    initialize: function () {

        // initialize the sky
        this.sky = new Path.Rectangle({
            topLeft: [0, 0],
            bottomRight: [view.viewSize.width, view.viewSize.height],
            // Fill the path with a gradient of three color stops
            // that runs between the two points we defined earlier:
            fillColor: {
                gradient: {
                    stops: ['#d9f3f7', '#71b3ba', '#446d72']
                },
                origin: [0, 0],
                destination: [0, view.viewSize.height]
            }
        });

        // initialize the clouds
        for (var x = view.viewSize.width; x < 2*view.viewSize.width; x += 500) {
            // add new clouds
            this.clouds.push(
                new paper.Raster({
                    source: this.cloudImageList[x%500],
                    position: [x, view.viewSize.height * 0.4],
                    opacity: 0.5
                })
            );
            // scale the clouds
            this.clouds[(x- view.viewSize.width)/500].scale(0.00075 * view.viewSize.height, 0.00075 * view.viewSize.height);
            // randomize the cloud position
            // this.shuffleCloudPosition((x- view.viewSize.width)/500);
        }
    },

    // shuffle clouds to random positions
    shuffleCloudPosition: function(cloudNumber){
        this.clouds[cloudNumber].position[ 200 , 200];
    },

    // animate the clouds
    animate: function(){
        for (var x=0;x<this.clouds.length;x++){
            this.clouds[x].position.x -= 10;
            // shuffle the cloud position if it is off the screen
            if (this.clouds[x].position < -100){
                this.shuffleCloudPosition(x);
            }
        }
    },



}

// the main message (extends over the canvas)
var Message = {

    // the placeholder for the text
    text: null,

    // saves the animation frame count
    animationFrame: 0,

    // checks the visibility of the text
    visibility: true,

    // initialized the message
    initialize: function () {

        // initialize the text
        this.text = new PointText({
            content: 'Press space key to start game',
            fillColor: 'white',
            fontFamily: 'Pangolin',
            fontWeight: 'bold',
            fontSize: 25,
            opacity: 1,
            position: new Point(view.viewSize.width / 2, view.viewSize.height * 0.8)
        });
    },

    // changes opacity on frames, for user attention
    animate: function () {
        // only animate if visible on screen
        if (this.visibility) {

            // only animate if this is 10th frame
            if (this.animationFrame % 10 === 0) {

                // increase opaciry in first 50 frames
                if (this.animationFrame < 50) {
                    this.text.opacity -= 0.1;
                } else if (this.animationFrame < 100) {
                    this.text.opacity += 0.1;
                }

            }

            // only let the frame count be beteen 0 and 100
            if (this.animationFrame >= 100) {
                this.animationFrame = 0;
            } else {
                // increament the frame count
                this.animationFrame++;
            }

        }
    },

    // changes the text and display on screen
    setTextAndShow: function (str) {
        if (!this.visibility) {
            // change the text
            this.text.content = str;
            // aling text to center
            this.text.position = new Point(view.viewSize.width / 2, view.viewSize.height * 0.8);
            // display on screen
            this.show();
        }
    },

    // shows the text on screen
    show: function () {
        this.text.opacity = 1;
        this.visibility = true;
    },

    // hides text from display
    hide: function () {
        this.text.opacity = 0;
        this.visibility = false;
    }

}

// displays and keeps score
var ScoreBoard = {

    // saves the current score
    score: 0,

    // saves the top score
    topScore: 0,

    // the placeholders for objectts
    scoreCardBackground: null,
    staticScoreText: null,
    staticTopScoreText: null,
    scoreDisplay: null,
    topScoreDisplay: null,

    // initializes the score board
    initialize: function () {

        // set text font color
        var fontColor = '#3ed6f1';

        // sent font
        var font = 'Pangolin';

        // font size
        var fontSize = 25;

        // the background box of the scorecard
        this.scoreCardBackground = new Path.Rectangle({
            point: [10, 10],
            size: [230, 90],
            fillColor: fontColor,
            opacity: 0.9
        });

        // set up static text 'Top Score'
        this.staticTopScoreText = new PointText({
            point: [35, 45],
            justification: 'left',
            fontSize: fontSize,
            fillColor: 'white',
            content: "Score",
            fontFamily: font
        });

        // set up static text 'Score'
        this.staticScoreText = new PointText({
            point: [35, 80],
            justification: 'left',
            fontSize: fontSize,
            fillColor: 'white',
            content: "Top Score",
            fontFamily: font
        });

        // displays the current score
        this.scoreDisplay = new PointText({
            point: [200, 45],
            justification: 'right',
            fontSize: fontSize,
            fillColor: 'white',
            content: 0,
            fontFamily: font
        });

        // displays the top score
        this.topScoreDisplay = new PointText({
            point: [200, 80],
            justification: 'right',
            fontSize: fontSize,
            fillColor: 'white',
            content: 0,
            fontFamily: font
        });

    },

    // resets the current score for new game
    resetCurrentScore: function () {
        this.score = 0;
    },

    // adds points to the scoreboard
    addPoint: function (points) {
        this.score += points;
        this.refreshScoreBoard();
    },

    // refreshes scoreboard with new score
    refreshScoreBoard: function () {

        // check if current score is the high score
        if (this.score > this.topScore) {
            this.topScore = this.score;
            // top score only needs refresh when new high score is reached
            this.topScoreDisplay.content = this.topScore;
        }

        // change the score on screen
        this.scoreDisplay.content = this.score;
    }

}

// create the bird object
var Bird = {

    // placeholder for the bird
    bird: null,

    // set the default velocity of the bird
    velocity: 0,

    // set the gravity
    gravity: view.viewSize.height * 0.0017,

    // set the jump height
    jumpHeight: view.viewSize.height * 0.0275,

    // used to check if appearence of the bird needs to be changed
    appearenceFrame: 0,

    // idle image list, each will be used one by one
    idleImages: [
        "/assets/bird/idle/2.png",
        "/assets/bird/idle/3.png",
        "/assets/bird/idle/4.png",
        "/assets/bird/idle/1.png",
    ],


    // lost image list, each will be used one by one
    lostImages: [
        "/assets/bird/hit/1.png",
        "/assets/bird/hit/2.png",
    ],

    // the current image of bird
    currentImage: 0,

    // initiazlizes the bird
    initialize: function () {
        // crete bird
        this.bird = new paper.Raster({
            source: this.idleImages[0],
            position: [view.viewSize.width * 0.30, view.viewSize.height / 2],
        });

        // scale the image according to screen size
        this.bird.scale(0.000065 * view.viewSize.height, 0.000065 * view.viewSize.height);

    },

    // resets the bird position
    reset: function () {
        this.bird.position.y = view.viewSize.height / 2;
        this.bird.image.src = this.idleImages[0];
        this.appearenceFrame = 0;

    },

    // checks if the bird is out of the frame
    checkIfOutOfFrame: function () {

        // if bird position is outside the top, reset position to top
        if (this.bird.position.y < 0) {
            this.bird.position.y = 0;
            // set velosity to zero on hitting the top
            this.velocity = 0;
        }

    },

    // make the bird jump
    jump: function () {
        // increase the velocity at each jump
        this.velocity = -this.jumpHeight;
    },

    // changes the appearence of bird, based on conditions
    changeAppearenceIdle: function () {
        if (this.appearenceFrame >= 8) {
            this.currentImage = ++this.currentImage % this.idleImages.length;
            // change to the next image
            this.bird.image.src = this.idleImages[this.currentImage];
            this.appearenceFrame = 0;
        }
        // use 
        this.appearenceFrame++;
    },


    // changes the appearence of bird, based on conditions
    changeAppearenceLost: function () {
        if (this.appearenceFrame >= 5) {
            this.currentImage = ++this.currentImage % this.lostImages.length;
            // change to the next image
            this.bird.image.src = this.lostImages[this.currentImage];
            this.appearenceFrame = 0;
        }
        // use 
        this.appearenceFrame++;
    },

    // animate the bird
    animate: function (lost) {

        // animate image
        if (lost) {
            this.changeAppearenceIdle();
        } else {
            this.changeAppearenceLost();
        }

        // check if bird is going out of frame
        this.checkIfOutOfFrame();

        // move the bird
        this.bird.position.y += this.velocity;

        // accelate bird due to gravity
        if (this.velocity < 15)
            this.velocity += this.gravity;

    },

    // checks if bird is on the floor
    birdAtFloor: function () {
        return (this.bird.position.y >= view.viewSize.height);
    }
}

var Pipe = {

    // width of each pipe block
    pipeWidth: Math.floor(view.viewSize.height * 0.16),

    // width of each pipe caps
    pipeCapWidth: Math.floor(view.viewSize.height * 0.164),

    // clearence space
    clearence: Math.floor(view.viewSize.height * 0.275),

    // height of the caps
    capHeight: Math.floor(view.viewSize.height * 0.032 + 1),

    // the pipe shapes
    upperRect: null,
    upperRectCap: null,
    lowerRect: null,
    lowerRectCap: null,

    // sets the position and size of the pipe
    respawn: function (positionX) {

        // position of the pipe elements in terms of x
        var calcX = positionX + this.pipeCapWidth / 2;

        // generate a random to place the clearence space
        var rand = Math.floor((Math.random() * (view.viewSize.height - this.clearence - 60)) + 30);

        // scale the rectriangles
        this.upperRect.scale(1, rand / this.upperRect.bounds.height);
        this.lowerRect.scale(1, (view.viewSize.height - (rand + this.clearence)) / this.lowerRect.bounds.height);

        // set the positions	
        this.upperRect.position = new Point(calcX, this.upperRect.bounds.height / 2);
        this.lowerRect.position = new Point(calcX, (rand + this.clearence + view.viewSize.height) / 2);

        // change position of the building tops (caps)
        this.upperRectCap.position = new Point(calcX, this.upperRect.bounds.height - this.capHeight / 2);
        this.lowerRectCap.position = new Point(calcX, rand + this.clearence + this.capHeight / 2);
    },

    // initialises the pipe
    initialize: function () {

        // set up pipe properties
        var mainRectProps = {
            point: [view.viewSize.width, this.capHeight],
            size: [this.pipeWidth, 25],
            point: [0, 0],
            fillColor: {
                gradient: {
                    stops: [["#42d151", 0.1], ['#38b745', 0.3], ['#1a471e', 1]],
                },
                origin: [0, 0],
                destination: [100, 0]
            }
        };

        // set up cap pipe properties
        var capRectProps = {
            point: [view.viewSize.width, this.capHeight],
            size: [this.pipeCapWidth + 20, 25],
            point: [0, 0],
            fillColor: {
                gradient: {
                    stops: [["#42d151", 0.1], ['#38b745', 0.7], ['#1a471e', 1]],
                },
                origin: [0, 0],
                destination: [100, 0]
            }
        };

        // create upper pipe
        this.upperRect = new Path.Rectangle(mainRectProps);

        // create upper pipe cap
        this.upperRectCap = new Path.Rectangle(capRectProps);

        // create lower pipe
        this.lowerRect = new Path.Rectangle(mainRectProps);

        // create lower pipe cap
        this.lowerRectCap = new Path.Rectangle(capRectProps);
    },

    // animate the pipe
    animate: function (speed, respawnX) {

        // change position of all pipe elements
        this.upperRect.position.x -= speed;
        this.upperRectCap.position.x -= speed;
        this.lowerRect.position.x -= speed;
        this.lowerRectCap.position.x -= speed;

        // respawn pipe if going out of screen
        if (this.lowerRectCap.position.x + this.pipeCapWidth / 2 < 0) {
            this.respawn(respawnX);
        }

    },

    // check collision
    checkCollision: function (obj) {
        return (this.upperRect.intersects(obj) || this.upperRectCap.intersects(obj) || this.lowerRect.intersects(obj) || this.lowerRectCap.intersects(obj));
    },

    // check if object has crossed the pipe
    checkIfCrossed: function (obj) {
        return (this.lowerRectCap.position.x + this.pipeCapWidth < obj.position.x);
    },

    // returns the top width of the pipe
    getTopWidth: function () {
        return this.pipeWidth;
    }
}

// controls the pipes and animates them
var Buildings = {

    // distance between each pipe
    pipeDistance: view.viewSize.height * 0.75,

    // speed with each pipes move
    speed: 10,

    // stores the pipe list
    pipeList: [],

    // stores the pipe next to the bird
    nextPipe: 0,

    // the x position where the pipes will respawn
    pipeRespawnX: null,

    // initializes the pipes
    initialize: function () {

        // delete all the pipes
        for (var t = this.pipeList.length - 1; t >= 0; t--) {
            delete (this.pipeList[t]);
        }

        // set the x positions of the pipes
        for (var t = view.viewSize.width; t < (2 * view.viewSize.width); t += (this.pipeDistance)) {
            this.pipeList.push(Object.create(Pipe));
            // initialize the pipes
            this.pipeList[this.pipeList.length - 1].initialize();
        }

        // set the x positions of the pipes
        this.resetPipePositions();
    },

    // resets the pipe positions
    resetPipePositions: function () {

        // spawn the pipes at positions
        for (var t = 0; t < this.pipeList.length; t++) {
            // spawn the pipes at position t
            this.pipeList[t].respawn(view.viewSize.width + ((t + 1) * this.pipeDistance));
        }

        // set up respawn position
        this.pipeRespawnX = (this.pipeList.length * this.pipeDistance) - (this.pipeList[0].getTopWidth());

        // set the next pipe to first one
        this.nextPipe = 0;

    },

    // animates the pipes
    animate: function () {
        // animate the pipes one by one
        for (var x = 0; x < this.pipeList.length; x++) {
            this.pipeList[x].animate(this.speed, this.pipeRespawnX);
        }
    },

    // check if the closest pipe has crossed the bird
    checkIfCrossed: function (bird) {
        if (this.pipeList[this.nextPipe].checkIfCrossed(bird)) {
            // if the bird has crossed, check the next bird for collision
            this.nextPipe = ++this.nextPipe % this.pipeList.length;
            return true;
        }
        return false;
    },

    // checks collision with the buildings
    collision: function (bird) {
        return (this.pipeList[this.nextPipe].checkCollision(bird));
    }

}

// resets the game
function resetGame() {

    // hide the message
    Message.hide();

    // reset the bird position
    Bird.reset();

    // reset the pipe positions
    Buildings.resetPipePositions();

    // reset score board
    ScoreBoard.resetCurrentScore();

    // set the collison flag to false
    birdCollided = false;

    // pause the game, until space bar is pressed
    gamePaused = true;

    // resume the game
    gameStopped = false;
}

// check if game is lost
function checkGameLost() {

    // check if bird is at the floor
    gameStopped = Bird.birdAtFloor();

    // only check for collison, if bird has not collided previously    
    if (!birdCollided) {
        // check if bird collided
        birdCollided = Buildings.collision(Bird.bird);
    }

    // send bird to floor at collision
    if (birdCollided && !gameStopped) {
        // animate bird to drop down
        Bird.animate(false);
    }

    // if game stopped, display message
    if (gameStopped) {
        Message.setTextAndShow('Oh, the bird is hurt :(  Press Space or R to restart');
    }

}


function startJumping() {
    // if game is stopped, reset the game
    if (gameStopped) {
        resetGame();
    }

    // if game is paused, resume
    if (gamePaused) {
        gamePaused = false;
    }

    // if bird has not colided, jump
    if (!birdCollided) {
        // make the bird jump on space
        Bird.jump();
    }
}

// set up keyboard buttons
function onKeyDown(event) {

    // When a key is released, set the content of the text item:
    if (event.key === 'space') {
        startJumping();

    } else if ((event.key === 'r') || (event.key === 'R')) {
        // rest the game on R key press
        resetGame();
    }
}

function onMouseDown(event) {
    startJumping();
}

// initializes the game
(function initGame() {

    // initialize objects in terms of appearence

    // iniatialize the background
    Background.initialize();

    // initialize the pipes in Buildings
    Buildings.initialize();

    // initialize scoreboard
    ScoreBoard.initialize();

    // initiazlie the bird
    Bird.initialize();

    // initialze the message
    Message.initialize();

})();

// do this on each frame
function onFrame(event) {

    // only animate if playing circumstances are met
    if (!birdCollided && !gameStopped && !gamePaused) {

        // animate the bird
        Bird.animate(true);

        // animate the buildings
        Buildings.animate();

        // check if the bird has crossed the pipes
        if (Buildings.checkIfCrossed(Bird.bird)) {
            // if crossed, add to score
            ScoreBoard.addPoint(1);
        }

        // animate clouds
        Background.animate();

    }

    // animate the message
    Message.animate();

    // check if game lost
    if (!gameStopped) {
        checkGameLost();
    }
}
