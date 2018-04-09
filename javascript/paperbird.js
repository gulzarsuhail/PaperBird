// check the game status, paused by
var gameStopped = true;
// check if game is paused
var gamePaused = true
// checks if bird has collided
var birdCollided = false;

// the background of the game
var Background = {

    sky: new Path.Rectangle({
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
    }),


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

        // bring the scoreboard to the front
        this.scoreCardBackground.bringToFront();
        this.staticScoreText.bringToFront();
        this.staticTopScoreText.bringToFront();
        this.scoreDisplay.bringToFront();
        this.topScoreDisplay.bringToFront();

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
        if (this.score > this.topScore) {
            this.topScore = this.score;
            // top score only needs refresh when new high score is reached
            this.topScoreDisplay.content = this.topScore;
        }
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

    // initiazlizes the bird
    initialize: function () {
        // crete bird shape
        // this.bird = new Path.Circle({
        //     center: [view.viewSize.width * 0.30, view.viewSize.height / 2],
        //     radius: view.viewSize.height * 0.025,
        //     fillColor: 'red'
        // });
        this.bird = new paper.Raster({
            source: '/assets/idle/1.png',
            position: [view.viewSize.width * 0.30, view.viewSize.height / 2],
        });

        console.log(view.viewSize.height * 0.025)

        // scale the image according to screen size
        this.bird.scale(0.000065 * view.viewSize.height, 0.000065 * view.viewSize.height);
        
    },

    // resets the bird position
    resetPosition: function () {
        this.bird.position.y = view.viewSize.height / 2;
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

    // animate the bird
    animate: function () {
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
    pipeWidth: 100,

    // width of each pipe caps
    pipeCapWidth: 110,

    // clearence space
    clearence: view.viewSize.height * 0.275,

    // height of the caps
    capHeight: 25,

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

        // change the building tops
        this.upperRectCap.position = new Point(calcX, this.upperRect.bounds.height - this.capHeight / 2);
        this.lowerRectCap.position = new Point(calcX, rand + this.clearence + this.capHeight / 2);
    },

    init: function () {
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
        this.upperRect.position.x -= speed;
        this.upperRectCap.position.x -= speed;
        this.lowerRect.position.x -= speed;
        this.lowerRectCap.position.x -= speed;
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
    init: function () {

        // delete all the pipes
        for (var t = this.pipeList.length - 1; t >= 0; t--) {
            delete (this.pipeList[t]);
        }

        // set the x positions of the pipes
        for (var t = view.viewSize.width; t < (2 * view.viewSize.width); t += (this.pipeDistance)) {
            this.pipeList.push(Object.create(Pipe));
            // initialize the pipes
            this.pipeList[this.pipeList.length - 1].init();
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
        this.pipeRespawnX = this.pipeList.length * this.pipeDistance;

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
    // reset the bird position
    Bird.resetPosition();

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
    if (!birdCollided){
        // check if bird collided
        birdCollided = Buildings.collision(Bird.bird);
    }

    // send bird to floor at collision
    if (birdCollided && !gameStopped) {
        Bird.animate();
    }
}

// set up keyboard buttons
function onKeyDown(event) {

    // When a key is released, set the content of the text item:
    if (event.key === 'space') {

        // if game is stopped, reset the game
        if (gameStopped) {
            resetGame();
        }

        // if game is paused, resume
        if (gamePaused){
            gamePaused = false;
        }
        
        // if bird has not colided, jump
        if (!birdCollided) {
            // make the bird jump on space
            Bird.jump();
        }

    } else if ((event.key === 'r') || (event.key === 'R')) {
        // rest the game on R key press
        resetGame();
    }
}

// initializes the game
(function initGame() {

    // initialize the pipes in Buildings
    Buildings.init();
    
    // initialize scoreboard after buildings, so scoreboard stays on top
    ScoreBoard.initialize();

    // initiazlie the bird
    Bird.initialize();

})();

// do this on each frame
function onFrame(event) {
    if (!birdCollided && !gameStopped && !gamePaused) {

        // animate the bird
        Bird.animate();

        // animate the buildings
        Buildings.animate();

        // check if the bird has crossed the pipes
        if (Buildings.checkIfCrossed(Bird.bird)) {
            // if crossed, add to score
            ScoreBoard.addPoint(1);
        }
    
    }

    // check if game 
    checkGameLost();
}
