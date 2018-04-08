// check the game status
var gameStopped = false;

// create the bird object
var Bird = {

    // set the default velocity of the bird
    velocity: 0,

    // set the gravity
    gravity: 1.5,

    // crete bird shape
    bird: new Path.Circle({
        center: [view.viewSize.width * 0.30, view.viewSize.height / 2],
        radius: 20,
        fillColor: 'red'
    }),

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
        this.velocity = -20;
    },

    // animate the birf
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
    clearence: 100,

    // the pipe shapes
    upperRect: null,
    upperRectCap: null,
    lowerRect: null,
    lowerRectCap: null,

    // sets the position and size of the pipe
    respawn: function (positionX) {

        // generate a random to place the clearence space
        var rand = Math.floor((Math.random() * (view.viewSize.height - this.clearence - 60)) + 30);

        // scale the rectriangles
        this.upperRect.scale(1, rand / this.upperRect.bounds.height);
        this.lowerRect.scale(1, (view.viewSize.height - (rand + this.clearence)) / this.lowerRect.bounds.height);

        // set the positions	
        this.upperRect.position = new Point(positionX + this.pipeCapWidth / 2, this.upperRect.bounds.height / 2);
        this.lowerRect.position = new Point(positionX + this.pipeCapWidth / 2, (rand + this.clearence + view.viewSize.height) / 2);

        // change the building tops
        this.upperRectCap.position = new Point(positionX + this.pipeCapWidth / 2, this.upperRect.bounds.height - 12.5);
        this.lowerRectCap.position = new Point(positionX + this.pipeCapWidth / 2, rand + this.clearence);
    },

    initialize: function () {
        // set up pipe properties
        var mainRectProps = {
            point: [view.viewSize.width, 0],
            size: [this.pipeWidth, 25],
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
            point: [view.viewSize.width, 0],
            size: [this.pipeCapWidth + 20, 25],
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
        if (this.upperRect.intersects(obj) || this.upperRectCap.intersects(obj))
            return true;
        else if (this.lowerRect.intersects(obj) || this.lowerRectCap.intersects(obj))
            return true;
        return false;
    }
}

// controls the pipes and animates them
var Buildings = {

    // distance between each pipe
    pipeDistance: 500,

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
        for (var t = view.viewSize.width; t < (2.25 * view.viewSize.width); t += (this.pipeDistance)) {
            this.pipeList.push(Object.create(Pipe));
            // initialize the pipes
            this.pipeList[this.pipeList.length - 1].initialize();
            // spawn the pipes at position t
            this.pipeList[this.pipeList.length - 1].respawn(t);
        }

        // set up respawn position
        this.pipeRespawnX = this.pipeList.length * this.pipeDistance;

        // set the next pipe to first one
        this.nextPipe = 0;
        console.log(this.pipeList);
    },

    // animates the pipes
    animate: function () {
        // animate the pipes one by one
        for (var x = 0; x < this.pipeList.length; x++) {
            this.pipeList[x].animate(this.speed, this.pipeRespawnX);
        }
    }

}

// resets the game
function resetGame() {
    // reset the bird position
    Bird.resetPosition();

    // resume the game
    gameStopped = false;
}

// set up keyboard buttons
function onKeyDown(event) {
    // When a key is released, set the content of the text item:
    if (event.key === 'space') {
        // make the bird jump on space
        Bird.jump();
    } else if ((event.key === 'r') || (event.key === 'R')) {
        // rest the game on R key press
        resetGame();
    }
}

// check if game is lost
function checkGameLost() {
    if (Bird.birdAtFloor()) {
        gameStopped = true;
    }
}

// initializes the game
(function initializeGame() {
    // Buildings.initialize();
})();

// do this on each frame
function onFrame(event) {
    if (!gameStopped) {
        // animate the bird
        Bird.animate();

        Buildings.animate();
    }
    // checkGameLost();
}
