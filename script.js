const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const idleFrames = [];
const walkFrames = [];

let currentFrame = 0;
let frameDelay = 100;
let lastFrameTime = 0;

let keys = {};
let facingRight = false;
let moving = false;

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

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 128,
  height: 128,
  speed: 3
};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function updatePlayerMovement() {
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
    currentFrame++;
    lastFrameTime = timestamp;
  }

  updatePlayerMovement();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const animFrames = moving ? walkFrames : idleFrames;
  const maxFrames = animFrames.length;
  const frameIndex = currentFrame % maxFrames;
  const img = animFrames[frameIndex];

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
