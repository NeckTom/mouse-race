
document.addEventListener("DOMContentLoaded", function() {
    var gameboard = document.getElementById("gameBoard");
    var ctx = gameboard.getContext("2d");
    var frameNum = 0;
    var score = 0;
    var components = [];
    var mouseX = 0;
    var mouseY = 0;
    var started = 0;
    var interval = null;

    // Shape 0 = circle random
    // Shape 1 = square escape
    // Shape 2 = rectangle chase
    const shapes =  {
        circle : 0,
        square : 1,
        rectangle : 2
    };
    console.log(shapes.rectangle);
class gamePiece {

    // Setting all the random elements
    constructor(shape, movefunc, drawfunc, color) { 
        if(shape === shapes.circle) {
            this.ballRadius = Math.floor(Math.random() * 20) + 10;
            this.randomCoords(this.ballRadius);
        }
        else if(shape === shapes.square) {
            this.height = Math.floor(Math.random() * 20) + 20;
            this.width = this.height;
            this.randomCoords(this.height);
        }
        else if(shape === shapes.rectangle) {
            this.height = Math.floor(Math.random() * 20) + 20;
            this.width = Math.floor(Math.random() * 20) + 20;
            this.randomCoords(this.height, this.width);
        }
        this.shape = shape;
        this.movefunc = movefunc;
        this.drawfunc = drawfunc;
        if( color !== undefined) {
            this.color=color
        } else {
            this.color = "";
        }
        // We choose 2 and -2 to be the starting delta parameters arbitrarily
        this.dx = 2
        this.dy = -2
        this.speed = Math.random() * 2;
    }

    // function for random valid coords
    randomCoords(radius, height) {
        var x,y;
        // If this is called from foundEscape we know it's a square and that's the only time we create new random coordinates outside of constructor
        if( radius == undefined) {
            radius = this.height;
        }
        // If it's a rectangle we treat it differently, if its a square/circle we use a square bounding box to check
        if(height !== undefined) {
            do {
                x = Math.floor(Math.random() * 800);
                y = Math.floor(Math.random() * 800);
            }
            while((x > gameboard.width-radius || x < radius) || (y > gameboard.height-height || y < height))
        } else {
            do {
                x = Math.floor(Math.random() * 800);
                y = Math.floor(Math.random() * 800);
            }
            while((x > gameboard.width-radius || x < radius) || (y > gameboard.height-radius || y < radius))
        }
        this.x = x;
        this.y = y;
     }


    move(params) {
        this.movefunc();
    };

    printParams() {
        console.log("x is" + this.x)
    }

    draw() {
        this.drawfunc(this.color);
    }

};

// Events
gameboard.addEventListener("mousemove", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    relativeX = mouseX - gameboard.offsetLeft;
    relativeY = mouseY - gameboard.offsetTop;
})
// add event listener on the canvas to onmouseout gameLoss
gameboard.addEventListener("mouseout", function(event) {
    if(started == 1) {
        alert("No moving outside the game board!");
        gameLoss();
    }

})

gameboard.addEventListener("mousedown", function(event) {
    if(started == 0) {
        mouseX = event.clientX;
        mouseY = event.clientY;
        relativeX = mouseX - gameboard.offsetLeft;
        relativeY = mouseY - gameboard.offsetTop;
        if(ctx.isPointInPath(relativeX,relativeY)) {
            initializeGame();
        }
    }


})

// Types of draw functions
function drawBall() {
    color = this.color;
    if(this.color === "") {
        color = "#0095DD";
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function drawRect() {
    color = this.color;
    if(color === "") {
        color = "#0095DD"
    }
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

// Types of movement
function randMove() {
    // to enable randMove as rectangles modify this to check if ballRadius  = 0 if so ballRadius = this.width;
    ballRadius = this.ballRadius;
    if(this.x + this.dx > gameboard.width-ballRadius || this.x + this.dx < ballRadius) {
        this.dx = -this.dx;
    }
    if(this.y + this.dy > gameboard.height-ballRadius || this.y + this.dy < ballRadius) {
        this.dy = -this.dy;
    }
    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;
}

function chaseMove() {

    this.dx = relativeX - this.x;
    this.dy = relativeY - this.y;
    distance = Math.sqrt(this.dx*this.dx + this.dy*this.dy);

    this.x += (this.dx / distance) * this.speed;
    this.y += (this.dy / distance) * this.speed;
    
}

function escapeMove() {

    this.dx = this.x - relativeX;
    this.dy = this.y - relativeY;
    distance = Math.sqrt(this.dx*this.dx + this.dy*this.dy);
    newDx = (this.dx / distance) * 0.5;
    newDy = (this.dy / distance) * 0.5;
    
    if(this.x + newDx > gameboard.width-this.height || this.x + newDx < this.height) {
        newDx = 0;
    }
    if(this.y + newDy > gameboard.height-this.height || this.y + newDy < this.height) {
        newDy = 0;
    }
    

    this.x += newDx * this.speed;
    this.y += newDy * this.speed;
}


function initializeGame() {
    // Generate the elements in an array
    // start interval
    started = 1;

    testBall = new gamePiece(shapes.circle, randMove, drawBall, "0095DE");
    testBall2 = new gamePiece(shapes.square, escapeMove, drawRect);
    testBall3 = new gamePiece(shapes.rectangle, chaseMove, drawRect);
    testBall4 = new gamePiece(shapes.circle, randMove, drawBall);
    testBall5 = new gamePiece(shapes.rectangle, chaseMove, drawRect);

    testBall.printParams();

    components.push(testBall);
    components.push(testBall2);
    components.push(testBall3);
    components.push(testBall4);
    components.push(testBall5);

    interval = setInterval(gameRun, 10);

}

function drawStartButton() {
    ctx.beginPath();
    ctx.rect(325, 350, 150, 75);
    ctx.fillStyle = "#b3b8ba";
    ctx.fill();
    ctx.closePath();

    ctx.font = "22px Arial";
    ctx.fillStyle = "#0a090a";
    ctx.fillText("Start", 370, 400);

}
drawStartButton();


function foundEscape(item) {
    // We increase the score and give the escape new random coords
    score += 5;
    item.randomCoords();

}

function gameLoss(params) {
    // reset all canvas elements and let the player know he lost
    clearInterval(interval);
    ctx.clearRect(0, 0, gameboard.width, gameboard.height);
    drawBiggerScore();
    components = [];
    started = 0;
    alert("You lost the game");
};

function gameRun(params) {
    // Start counting seconds
    // loop -> clear -> move -> draw
    ctx.clearRect(0, 0, gameboard.width, gameboard.height);
    frameNum += 1;
    if (frameNum == 1 || everyInterval(100)) {
        score++;
    }

    for (var i = 0; i < components.length; i++) {
        components[i].move();
        components[i].draw();
        if(ctx.isPointInPath(relativeX,relativeY)) {
            if (components[i].shape == shapes.square) {
                foundEscape(components[i]);
            }
            else {
                gameLoss();
                // We call clearinterval right away in gameLoss which closes gameRun
                return;
            }
        }
    }
    // We draw here in case we get +5 points
    drawScore();
}

function everyInterval(n) {
    if ((frameNum / n) % 1 == 0) {return true;}
    return false;
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+score, 8, 20);
}

function drawBiggerScore() {
    ctx.font = "32px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+score, 320, 350);
}

});
