const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const groundY = canvasHeight - 100;

let keys = {};
let facingRight = true;
let moving = false;
let punching = false;
let jumping = false;

let frameIndex = 0;
let lastTime = 0;
const frameRate = 100;

let punchFrame = 0;
let jumpFrame = 0;
let velocityY = 0;
let gravity = 1;
let grounded = true;

const player = {
  x: canvasWidth / 2,
  y: groundY,
  width: 150,
  height: 150,
  speed: 5,
};

const idleFrames = [];
const walkFrames = [];
const punchFrames = [];
const jumpFrames = [];

function loadFrames(folder, count) {
  const frames = [];
  for (let i = 0; i < count; i++) {
    const img = new Image();
    img.src = `${folder}/tile${String(i).padStart(3, "0")}.png`;
    frames.push(img);
  }
  return frames;
}

// Load all animations
idleFrames.push(...loadFrames("idle", 60));
walkFrames.push(...loadFrames("walk", 76));
punchFrames.push(...loadFrames("punch", 100));
jumpFrames.push(...loadFrames("jump", 50));

// Input handling
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

canvas.addEventListener("mousedown", () => {
  if (!punching && grounded) {
    punching = true;
    punchFrame = 0;
  }
});

function updatePlayer() {
  moving = false;

  if (!punching && !jumping) {
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

  if (keys[" "] && grounded && !jumping && !punching) {
    jumping = true;
    grounded = false;
    velocityY = -20;
    jumpFrame = 0;
  }

  if (jumping) {
    velocityY += gravity;
    player.y += velocityY;

    if (player.y >= groundY) {
      player.y = groundY;
      velocityY = 0;
      jumping = false;
      grounded = true;
    }
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

function drawGround() {
  ctx.fillStyle = "#333";
  ctx.fillRect(0, groundY + player.height / 2, canvasWidth, 10);
}

function drawPlayer(currentTime) {
  if (currentTime - lastTime > frameRate) {
    frameIndex++;
    lastTime = currentTime;

    if (punching) {
      punchFrame++;
      if (punchFrame >= punchFrames.length) {
        punching = false;
        punchFrame = 0;
        frameIndex = 0;
      }
    }

    if (jumping) {
      jumpFrame++;
      if (jumpFrame >= jumpFrames.length) {
        jumpFrame = 0;
      }
    }
  }

  let currentFrame;
  if (punching) {
    currentFrame = punchFrames[punchFrame % punchFrames.length];
  } else if (jumping) {
    currentFrame = jumpFrames[jumpFrame % jumpFrames.length];
  } else if (moving) {
    currentFrame = walkFrames[frameIndex % walkFrames.length];
  } else {
    currentFrame = idleFrames[frameIndex % idleFrames.length];
  }

  if (currentFrame.complete) {
    drawFlippedImage(
      currentFrame,
      player.x - player.width / 2,
      player.y - player.height / 2,
      player.width,
      player.height,
      !facingRight
    );
  }
}

function gameLoop(currentTime) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  updatePlayer();
  drawGround();
  drawPlayer(currentTime);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
