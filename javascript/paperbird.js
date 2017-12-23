
// displays and keeps score
var ScoreBoard = {

    // saves the current score
    score: 0,

    // saves the top score
    topScore: 0,

    // the background box of the scorecard
    scoreCardBackground: new Path.Rectangle({
        point: [10, 10],
        size: [230, 90],
        fillColor: '#3ed6f1',
        opacity: 0.9
    }),

    // set up static text 'Top Score'
    staticTopScoreText: new PointText({
        point: [35, 45],
        justification: 'left',
        fontSize: 25,
        fillColor: 'white',
        content: "Top Score",
        fontFamily: 'Pangolin'
    }),

    // set up static text 'Score'
    staticScoreText: new PointText({
        point: [35, 80],
        justification: 'left',
        fontSize: 25,
        fillColor: 'white',
        content: "Score",
        fontFamily: 'Pangolin'
    }),

    // displays the current score
    scoreDisplay: new PointText({
        point: [200, 45],
        justification: 'right',
        fontSize: 25,
        fillColor: 'white',
        content: 0,
        fontFamily: 'Pangolin'
    }),

    // displays the top score
    topScoreDisplay: new PointText({
        point: [200, 80],
        justification: 'right',
        fontSize: 25,
        fillColor: 'white',
        content: 0,
        fontFamily: 'Pangolin'
    }),

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

var Bird = {

    // set bird gravity velocity
    velocity: 10,

    // set up new bird
    bird: new Path.Circle({
        radius: 20,
        fillColor: 'red'
    }),

    // resets the bird position
    resetPosition: function () {
        // reset bird position to center
        this.bird.center = [view.viewSize.width * 0.30, view.viewSize.height / 2];
    },

    // check if bird is touch floor
    birdAtFloor: function () {
        return (this.bird.position.y >= view.viewSize.height);
    },

    // jumps the bird i.e increases its velocity
    jump: function () {
        this.velocity = -20;
    },

    // animates the bird frame by frame
    animate: function () {
        // prevent bird escaping from top of the screen
        if (this.bird.position.y <= 0) {
            // set position to 0 px
            this.refreshScoreBoard.position.y = 0;
            // set velocity to 0 to prevent flaky animation
            this.velocity = 0;
        }
        // moves the bird up or down
        this.velocity.position.y += this.velocity;
        // dosen't let velocity exceed a value
        if (this.velocity < 15)
            this.velocity -= 1.5;
    }
}

// set up pipes (for collision)
var Pipe = {
    
    // width of each pipe
    pipeWidth: 100,
    
    // space in each pair of sub-pipes
    clearence: 100,
    
    // create upper pipe
    upperRect: new Path.Rectangle({
        size: [this.pipeWidth, rand],
        fillColor: {
            gradient: {
                stops: [["#42d151", 0.1], ['#38b745', 0.3], ['#1a471e', 1]],
            },
            origin: [x, 0],
            destination: [x + this.pipeWidth, 0]
        }
    }),

    // create upper pipe cap
    upperRectCap = new Path.Rectangle({
        size: [this.pipeWidth + 20, 25],
        fillColor: {
            gradient: {
                stops: [["#42d151", 0.1], ['#38b745', 0.7], ['#1a471e', 1]],
            },
            origin: [x, 0],
            destination: [x + this.pipeWidth, 0]
        }
    }),

    // create lower pipe
    lowerRect = new Path.Rectangle({
        size: [this.pipeWidth, view.viewSize.height - (rand + this.clearence)],
        fillColor: {
            gradient: {
                stops: [["#42d151", 0.1], ['#38b745', 0.3], ['#1a471e', 1]],
            },
            origin: [x, 0],
            destination: [x + this.pipeWidth, 0]
        }
    }),

    // create lower pipe cap
    lowerRectCap = new Path.Rectangle({
        size: [this.pipeWidth + 20, 25],
        fillColor: {
            gradient: {
                stops: [["#42d151", 0.1], ['#38b745', 0.5], ['#1a471e', 1]],
            },
            origin: [x, 0],
            destination: [x + this.pipeWidth, 0]
        }
    }),

    // initialize new pipes
    resetXPosition: function (positionX) {
        var rand = Math.floor((Math.random() * (view.viewSize.height - this.clearence - 60)) + 30);
        // scale the rectriangles
        this.upperRect.scale(1, rand / this.upperRect.bounds.height);
        this.lowerRect.scale(1, (view.viewSize.height - (rand + this.clearence)) / this.lowerRect.bounds.height);
        // set the positions	
        this.upperRect.position = new Point(positionX - this.pipeWidth / 2, this.upperRect.bounds.height / 2);
        this.lowerRect.position = new Point(positionX - this.pipedWidth / 2, (rand + this.clearence + view.viewSize.height) / 2);
        // change the building tops
        this.upperRectCap.position = new Point(positionX - this.pipeWidth / 2, this.upperRect.bounds.height - 12.5);
        this.lowerRectCap.position = new Point(positionX - this.pipeWidth / 2, rand + this.clearence);
    },

    // move pipes left by number of pixels
    moveToLeftByPX: function (left){
        this.upperRect.position.x -= left;
        this.upperRectCap.position.x -= left;
        this.lowerRect.position.x -= left;
        this.lowerRectCap.position.x -= left;
        // return any x coordinate to check if pipe went out of screen
        return (this.lowerRect.position.x +this.pipeWidth);
    },

}

// object of the moving buildings
var Buildings = {
    // distance between each pipe
    pipeDistance: 500,
    // velocity with each pipe moves
    velocity: 10,
    // stores the pipe list
    pipeList: [],
    // initializes the pipes
    recreatePipeList: function () {
        for (var t=this.pipeList.length-1; t >= 0; t--){
            this.pipeList.splice(t);
        }
        for (var t = view.viewSize.width; t < (2.25 * view.viewSize.width); t += (this.pipeDistance)) {
            this.pipeList.push(Object.create(Pipe));
            // initiaze new pipe with x position at t
            this.pipeList[this.pipeList.length - 1].resetXPosition(t);
        }
        // set up respawn position
        this.pipeRespawnX = (buildings.length * (Building.buildWidth + Building.buildDistance));
    },
    // resets the game
    reset: function () {

    },
    respawnPipe: function (){

    },
    animate: function (){
        for (var t=0; t < this.pipeList.length; t++){
			if (!this.pipeList[t].moveToLeftByPX(velocity))		
                this.pipeList[t]
        }   
    }

}