const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Make the canvas much bigger
canvas.width = 1920;
canvas.height = 1080;

const groundY = canvas.height - 100;

// Handle input
let keys = {};
let facingRight = true;
let moving = false;
let punching = false;
let jumping = false;

let frameIndex = 0;
let lastFrameTime = 0;

const frameRateIdle = 80;    // Idle slower
const frameRateWalk = 50;    // Walk faster
const frameRatePunch = 30;   // Punch super fast
const frameRateJump = 100;   // Jump slower

let punchFrame = 0;
let jumpFrame = 0;
let velocityY = 0;
let gravity = 1.2;
let grounded = true;

const player = {
  x: canvas.width / 2,
  y: groundY,
  width: 150,   // Proper size (will scale sprite but not squash)
  height: 180,
  speed: 6,
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

// Load all frames
idleFrames.push(...loadFrames("idle", 60));
walkFrames.push(...loadFrames("walk", 76));
punchFrames.push(...loadFrames("punch", 100));
jumpFrames.push(...loadFrames("jump", 50));

// Input handlers
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("mousedown", () => {
  if (!punching && grounded && !jumping) {
    punching = true;
    punchFrame = 0;
  }
});

function updatePlayer() {
  moving = false;

  if (!punching && !jumping) {
    if (keys["a"]) {
      player.x -= player.speed;
      moving = true;
      facingRight = false;
    }
    if (keys["d"]) {
      player.x += player.speed;
      moving = true;
      facingRight = true;
    }
  }

  if ((keys["w"] || keys[" "]) && grounded && !jumping && !punching) {
    jumping = true;
    grounded = false;
    velocityY = -20;
    jumpFrame = 18; // Start at jump 18
  }

  if (jumping) {
    velocityY += gravity;
    player.y += velocityY;

    if (jumpFrame < 31) {
      jumpFrame++;
    } else if (player.y >= groundY) {
      player.y = groundY;
      velocityY = 0;
      grounded = true;
      jumping = false;
      jumpFrame = 0;
    } else {
      jumpFrame++;
    }

    if (jumpFrame >= jumpFrames.length) {
      jumpFrame = 49;
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
  ctx.fillStyle = "#444";
  ctx.fillRect(0, groundY + player.height / 2, canvas.width, 10);
}

function drawPlayer(currentTime) {
  const now = currentTime;

  let currentFrame;
  let flip = !facingRight;

  if (punching) {
    if (now - lastFrameTime > frameRatePunch) {
      punchFrame++;
      lastFrameTime = now;
    }
    if (punchFrame >= punchFrames.length) {
      punchFrame = 0;
      punching = false;
    }
    currentFrame = punchFrames[punchFrame % punchFrames.length];

  } else if (jumping) {
    if (now - lastFrameTime > frameRateJump) {
      jumpFrame++;
      lastFrameTime = now;
    }
    currentFrame = jumpFrames[jumpFrame % jumpFrames.length];

  } else if (moving) {
    if (now - lastFrameTime > frameRateWalk) {
      frameIndex++;
      lastFrameTime = now;
    }
    currentFrame = walkFrames[frameIndex % walkFrames.length];

  } else {
    if (now - lastFrameTime > frameRateIdle) {
      frameIndex++;
      lastFrameTime = now;
    }
    currentFrame = idleFrames[frameIndex % idleFrames.length];
  }

  if (currentFrame && currentFrame.complete) {
    drawFlippedImage(
      currentFrame,
      player.x - player.width / 2,
      player.y - player.height,
      player.width,
      player.height,
      flip
    );
  }
}

function gameLoop(currentTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  drawGround();
  drawPlayer(currentTime);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
