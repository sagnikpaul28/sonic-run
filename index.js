const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

//Event Listeners
addEventListener('resize', () => {
    init();
});
addEventListener('keydown', (e) => {
    if (e.keyCode === 38) {
        Sonic.jump();
    }
    if (e.keyCode === 40) {
        Sonic.crouch();
    }
});
addEventListener('keyup', (e) => {
    Sonic.afterCrouch();
});

//Check if game is over
let gameOver = false;

//Update score
let score  = 0;

//Set background color
const backgroundGradient = c.createLinearGradient(0, 0, 0, canvas.height);
backgroundGradient.addColorStop(0, '#171e26');
backgroundGradient.addColorStop(1, '#3f586b');

//Set image
let sonicImage;


//Setup Objects
function Obj(actualPosition, currentPosition, objectSize, sourceSpritePosition, sourceSpriteDimensions, gravity, jumpForce) {
    this.actualPosition = actualPosition;
    this.currentPosition = currentPosition;
    this.objectSize = objectSize;
    this.sourceSpritePosition = sourceSpritePosition;
    this.sourceSpriteDimensions = sourceSpriteDimensions;
    this.gravity = gravity;
    this.jumpForce = jumpForce;

    this.dy = -this.jumpForce;
    this.hasJumped = false;
    this.wasDownKeyPressed = false;
}
Obj.prototype.jump = function() {
    if (!this.wasDownKeyPressed && !gameOver) {
        this.hasJumped = true;
        this.currentPosition.y += this.dy;
        this.dy += this.gravity;
        if (this.currentPosition.y >= this.actualPosition.y) {
            this.hasJumped = false;
            this.dy = -this.jumpForce;
        }
    }
};
Obj.prototype.crouch = function() {
    if (!this.hasJumped && !gameOver) {
        if (!this.wasDownKeyPressed) {
            this.currentPosition.y += 60;
            this.objectSize.y = 65;
        }
        this.wasDownKeyPressed = true;
    }
    this.update();
};
Obj.prototype.afterCrouch = function() {
    if (this.wasDownKeyPressed && !gameOver) {
        this.wasDownKeyPressed = false;
        this.objectSize.y = 140;
        this.currentPosition.y -= 60;
    }
    this.update();
};
Obj.prototype.update = function() {
    c.drawImage(sonicImage, this.sourceSpritePosition.x, this.sourceSpritePosition.y, this.sourceSpriteDimensions.x, this.sourceSpriteDimensions.y, this.currentPosition.x, this.currentPosition.y, this.objectSize.x, this.objectSize.y);

    if (!gameOver) {
        if (this.sourceSpritePosition.x >= 16000) {
            this.sourceSpritePosition.x = 0;
        }else {
            this.sourceSpritePosition.x += this.sourceSpriteDimensions.x;
        }

        if (this.hasJumped) {
            this.jump();
        }
    }
};

function Cloud(position, size, speed) {
    this.position = position;
    this.size = size;
    this.speed = speed;
    this.image = new Image();
    this.image.src = './cloud.svg';
}
Cloud.prototype.move = function() {
    if (!gameOver) {
        this.position.x = this.position.x - this.speed.x;
        this.position.y = this.position.y - this.speed.y;

        c.drawImage(this.image, this.position.x, this.position.y, this.size.x, this.size.y);
    }
};

function Vector(position, objectSize, speed, sourceSpritePosition, sourceSpriteDimensions) {
    this.position = position;
    this.speed = speed;
    this.sourceSpritePosition = sourceSpritePosition;
    this.sourceSpriteDimensions = sourceSpriteDimensions;
    this.objectSize = objectSize;
    this.image = new Image();
    this.image.src = './vector_crocodile.png';
}
Vector.prototype.move = function() {
    if (!gameOver) {
        this.position.x = this.position.x - this.speed.x;
        this.position.y = this.position.y - this.speed.y;

        if (this.sourceSpritePosition.x >= 2712) {
            this.sourceSpritePosition.x = 0;
        }else {
            this.sourceSpritePosition.x += this.sourceSpriteDimensions.x;
        }

        this.collide();
    }
    c.drawImage(this.image, this.sourceSpritePosition.x, this.sourceSpritePosition.y, this.sourceSpriteDimensions.x, this.sourceSpriteDimensions.y, this.position.x, this.position.y, this.objectSize.x, this.objectSize.y);
};
Vector.prototype.collide = function() {
    if (Sonic.currentPosition.x + Sonic.objectSize.x - 20 > this.position.x &&
        Sonic.currentPosition.x - 10 < this.position.x &&
        Sonic.currentPosition.y + Sonic.objectSize.y - 20 > this.position.y &&
        Sonic.currentPosition.y < this.position.y ) {
        gameOver = true;
    }
};

let Sonic;
let Clouds = [];
let Vectors = [];

let init = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    //Actual position - Initial position of the object on the screen
    let actualPosition = {
        x: 20,
        y: canvas.height * 3 / 4 - 120
    };
    //Current position - Current position of the object on the screen
    let currentPosition = {
        x: 20,
        y: canvas.height * 3 / 4 - 120
    };
    //Size of the object
    let objectSize = {
        x: 140,
        y: 140
    };
    //Starting position of the object from the image sprite
    let sourceSpritePosition = {
        x: 0,
        y: 0
    };
    //Object size
    let sourceSpriteDimensions = {
        x: 500,
        y: 375
    };
    let gravity = 1;
    let jumpForce = 20;

    sonicImage = new Image();
    sonicImage.src = './sonic.png';
    Sonic = new Obj(actualPosition, currentPosition, objectSize, sourceSpritePosition, sourceSpriteDimensions, gravity, jumpForce);

    //Generate Clouds
    Clouds = [];
    let cloudInterval = setInterval(() => {
        let size = 50 + Math.random() * 120;
        let sizeObject = {
            x: size,
            y: size
        };
        let positionObject = {
            x: canvas.width,
            y: 20 + Math.random() * (canvas.height * 3 / 4 - 250)
        };
        let speed = {
            x: .5 + Math.random() * .5,
            y: 0
        };
        if (!gameOver) {
            Clouds.push(new Cloud(positionObject, sizeObject, speed));
        }else {
            clearInterval(cloudInterval);
        }
    }, 5000);

    //Generate Vector the Crocodile
    let generateVectorCrocodile = function() {
        let position = {
            x: canvas.width,
            y: canvas.height * 3 / 4 - 90
        };
        let objectSizeObstacle = {
            x: 100,
            y: 100
        };
        let sourceSpritePositionObstacle = {
            x: 0,
            y: 0
        };
        let sourceSpriteDimensionsObstacle = {
            y: 500,
            x: 452
        };
        let speedObstacle = {
            x: 7,
            y: 0
        };
        if (!gameOver) {
            Vectors.push(new Vector(position, objectSizeObstacle, speedObstacle, sourceSpritePositionObstacle, sourceSpriteDimensionsObstacle));
            let timeInterval = 1000 + Math.random() * 2500;
            setTimeout( () => {
                generateVectorCrocodile()
            }, timeInterval)
        }
    };
    Vectors = [];
    generateVectorCrocodile();
};

let animate = () => {
    requestAnimationFrame(animate);

    //Background color
    c.fillStyle = backgroundGradient;
    c.fillRect(0, 0, canvas.width, canvas.height);

    //Horizontal line
    c.beginPath();
    c.moveTo(0, canvas.height * 3 / 4);
    c.lineTo(canvas.width, canvas.height * 3 / 4);
    c.strokeStyle = 'white';
    c.stroke();
    c.closePath();

    //Draw Clouds
    for (let i = 0; i < Clouds.length; i++) {
        if (Clouds[i].position.x < -Clouds[i].size.x) {
            Clouds.splice(i, 1);
        }else {
            Clouds[i].move();
        }
    }

    //Draw Vector the Crocodile
    for (let i = 0; i < Vectors.length; i++) {
        if (Vectors[i].x < -Vectors[i].objectSize ) {
            Vectors.splice(i, 1);
        }else {
            Vectors[i].move();
        }
    }

    //Draw Sonic Image
    Sonic.update();

    if (!gameOver) {
        score++;
    }

    console.log(score);
    c.fillStyle = "white";
    c.font = "40px Arial";
    c.fillText(score, 20, 50);
};

init();
animate();
