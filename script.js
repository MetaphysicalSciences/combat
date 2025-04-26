const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const idleFrames = [];
const walkFrames = [];
const punchFrames = [];
const jumpFrames = [];

let currentFrame = 0;
let frameDelay = 100;
let lastFrameTime = 0;

let keys = {};
let facingRight = false;
let moving = false;
let punching = false;
let jumping = false;
let punchFrame = 0;
let jumpFrame = 0;
let velocityY = 0;
let grounded = false;

// Load idle frames
for (let i = 0; i < 60; i++) {
  const img = new Image();
  const index = String(i).padStart(3, '0');
  img.src = `idle/tile${index}.png`;
  idleFrames.push(img);
}

// Load walk frames
for (let i = 0; i < 76; i++) {
  const img = new Image();
  const index = String(i).padStart(3, '0');
  img.src = `walk/tile${index}.png`;
  walkFrames.push(img);
}

// Load punch frames
for (let i = 0; i < 100; i++) {
  const img = new Image();
  const index = String(i).padStart(3, '0');
  img.src = `punch/tile${index}.png`;
  punchFrames.push(img);
}

// Load jump frames
for (let i = 0; i < 50; i++) {
  const img = new Image();
  const index = String(i).padStart(3, '0');
  img.src = `jump/tile${index}.png`;
  jumpFrames.push(img);
}

const player = {
  x: canvas.width / 2,
  y: canvas.height - 150,
  width: 128,
  height: 128,
  speed: 3,
  jumpHeight: 15,
  gravity: 0.8,
  jumpSpeed: -15,
};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

canvas.addEventListener("mousedown", () => {
  if (!punching && !jumping) {
    punching = true;
    punchFrame = 0;
  }
});

function updatePlayerMovement() {
  if (punching || jumping) return; // disable movement during punch or jump

  moving = false;
  if (keys["ArrowLeft"]) {
    player.x -= player.speed;
    moving = true;
    facingRight = false;
  }
  if (keys["ArrowRight"]) {
    player.x += player.speed;
    moving = true;
    facingRight = true;
  }

  if (keys[" "]) { // spacebar to jump
    if (grounded) {
      jumping = true;
      grounded = false;
      velocityY = player.jumpSpeed;
    }
  }
}

function updateJump() {
  if (!jumping) return;

  player.y += velocityY;
  velocityY += player.gravity;

  if (player.y >= canvas.height - 150) {
    player.y = canvas.height - 150;
    jumping = false;
    grounded = true;
    velocityY = 0;
  }
}

function drawFlippedImage(img, x, y, width, height, flip) {
  ctx.save();
  if (flip) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, width, height);
  } else {
    ctx.drawImage(img, x, y, width, height);
  }
  ctx.restore();
}

function gameLoop(timestamp) {
  if (timestamp - lastFrameTime > frameDelay) {
    lastFrameTime = timestamp;

    if (punching) {
      punchFrame++;
      if (punchFrame >= punchFrames.length) {
        punching = false;
        punchFrame = 0;
        currentFrame = 0;
      }
    } else if (jumping) {
      jumpFrame++;
      if (jumpFrame >= jumpFrames.length) {
        jumpFrame = 0;
      }
    } else {
      currentFrame++;
    }
  }

  updatePlayerMovement();
  updateJump();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let img;
  if (punching) {
    img = punchFrames[punchFrame % punchFrames.length];
  } else if (jumping) {
    img = jumpFrames[jumpFrame % jumpFrames.length];
  } else if (moving) {
    img = walkFrames[currentFrame % walkFrames.length];
  } else {
    img = idleFrames[currentFrame % idleFrames.length];
  }

  if (img.complete) {
    drawFlippedImage(
      img,
      player.x - player.width / 2,
      player.y - player.height / 2,
      player.width,
      player.height,
      facingRight
    );
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
