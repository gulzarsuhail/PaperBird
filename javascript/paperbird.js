
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
        fillColor: 'red',
        center: [view.viewSize.width * 0.30, view.viewSize.height / 2]
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
        if (this.bird.position.y < 0) {
            // set position to 0 px
            this.bird.position.y = 0;
            // set velocity to 0 to prevent flaky animation
            this.velocity = 0;
        }
        // moves the bird up or down
        this.bird.position.y += this.velocity;
        // dosen't let velocity exceed a value
        if (this.velocity < 15)
            this.velocity += 1.5;
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
        point: [0,0],
        size: [this.pipeWidth, 25],
        strokeColor: 'black'

        // fillColor: {
        //     gradient: {
        //         stops: [["#42d151", 0.1], ['#38b745', 0.3], ['#1a471e', 1]],
        //     },
        //     origin: [0, 0],
        //     destination: [100, 0]
        // }
    }),

    // create upper pipe cap
    upperRectCap: new Path.Rectangle({
        point: [0,0],
        size: [this.pipeWidth + 20, 25],
        strokeColor: 'black'

        // fillColor: {
        //     gradient: {
        //         stops: [["#42d151", 0.1], ['#38b745', 0.7], ['#1a471e', 1]],
        //     },
        //     origin: [0, 0],
        //     destination: [100, 0]
        // }
    }),

    // create lower pipe
    lowerRect: new Path.Rectangle({
        point: [0,0],
        size: [this.pipeWidth, 25],
        strokeColor: 'black'

        // fillColor: {
        //     gradient: {
        //         stops: [["#42d151", 0.1], ['#38b745', 0.3], ['#1a471e', 1]],
        //     },
        //     origin: [0, 0],
        //     destination: [100, 0]
        // }
    }),

    // create lower pipe cap
    lowerRectCap: new Path.Rectangle({
        point: [0,0],
        size: [this.pipeWidth + 20, 25],
        strokeColor: 'black'

        // fillColor: {
        //     gradient: {
        //         stops: [["#42d151", 0.1], ['#38b745', 0.5], ['#1a471e', 1]],
        //     },
        //     origin: [0, 0],
        //     destination: [100, 0]
        // }
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
        return (this.lowerRect.position.x + this.pipeWidth);
    },

    // check if point on left or right of pipes (for score)
    checkPointPosition: function (pointX){
        // return true if bird on right else return false
        return (pointX > this.upperRect.position.x);
    },

    // checks if the Point object collides with the pipes
    checkCollision: function (obj){
        if (this.upperRect.intersects(obj) || this.upperRectCap.intersects(obj))
			return true;
		else if (this.lowerRect.intersects(obj) || this.lowerRectCap.intersects(obj))
			return true;
		return false;
    }


}

// object of the moving buildings
var Buildings = {

    // distance between each pipe
    pipeDistance: 500,
    
    // velocity with each pipe moves
    velocity: 10,
    
    // stores the pipe list
    pipeList: [],

    // stores the pipe next to the bird
    nextPipe: 0,
    
    // initializes the pipes
    recreatePipeList: function () {
        // remove all pipes
        for (var t=this.pipeList.length-1; t >= 0; t--){
            this.pipeList.splice(t);
        }
        for (var t = view.viewSize.width; t < (2.25 * view.viewSize.width); t += (this.pipeDistance)) {
            this.pipeList.push(Object.create(Pipe));
            // initiaze new pipe with x position at t
            this.pipeList[this.pipeList.length - 1].resetXPosition(t);
        }
        // set up respawn position
        this.pipeRespawnX = this.pipeList.length * this.pipeDistance;
        // set the next pipe to first one
        this.nextPipe = 0;
    },
    
    // resets the game
    reset: function () {
        // stores the position of the pipes
        var posX = view.viewSize.width;
        // resets the position of the pipes
        for (var t = 0; t < this.pipeList.length ; t++) {
            this.pipeList[t].resetXPosition(posX);
            posX += this.pipeDistance;
        }
        // set next pipe to the first one
        this.nextPipe = 0;
    },
    
    // move the pipe
    animate: function (){
        console.log(this.pipeList.length)
        for (var t=0; t < this.pipeList.length; t++)
        // move the pipes while checking if the pipe went out of the screen
        if (!this.pipeList[t].moveToLeftByPX(this.velocity))		
        // reset the position of the pipes
                this.pipeList[t].resetXPosition(this.pipeRespawnX);
    },

    // add score: checks if bird has passed the next pipe
    checkScore: function (birdPosX){
        // check if bird crossed the pipes
        if (this.pipeList[this.nextPipe%this.pipeList.length].checkPointPosition(birdPosX)){
            // srt lookup for the next pipe
            nextPipe++;
            return true;
        } else {
            return false;
        }

    },

    // checks collision with the pipes
    checkCollision: function(bird){
        return (this.pipeList[this.nextPipe%this.pipeList.length].checkCollision(bird));
    }

}

// iniialized the game
function init(){

    // reset bird position
    Bird.resetPosition();

    // create pipe list according to screen size
    Buildings.recreatePipeList();

}

// set up keyboard buttons
function onKeyDown(event) {
	// When a key is released, set the content of the text item:
	if ((event.key == 'space') && (!Buildings.checkCollision(Bird.bird))){
		Bird.jump();
	} else if ((event.key == 'r') || (event.key == 'R')){
		reset();
	}
}

// call init, and initialize everyhting
init();

// do this on each frame
function onFrame(event){
    Bird.animate();
    Buildings.animate();
}
