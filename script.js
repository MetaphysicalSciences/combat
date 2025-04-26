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
const frameRate = 100; // Normal frame rate
const punchRate = 30;  // Faster punch

let punchFrame = 0;
let jumpFrame = 0;
let velocityY = 0;
let gravity = 1;
let grounded = true;

const player = {
  x: canvasWidth / 2,
  y: groundY,
  width: 220,
  height: 220,
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

idleFrames.push(...loadFrames("idle", 60));
walkFrames.push(...loadFrames("walk", 76));
punchFrames.push(...loadFrames("punch", 100));
jumpFrames.push(...loadFrames("jump", 50));

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
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
    jumpFrame = 18; // Start jump at frame 18
  }

  if (jumping) {
    velocityY += gravity;
    player.y += velocityY;

    // Transition to landing at frame 31
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
  ctx.fillStyle = "#333";
  ctx.fillRect(0, groundY + player.height / 2, canvasWidth, 10);
}

function drawPlayer(currentTime) {
  const now = currentTime;

  let currentFrame;
  let flip = !facingRight;

  if (punching) {
    if (now - lastTime > punchRate) {
      punchFrame++;
      lastTime = now;
    }
    if (punchFrame >= punchFrames.length) {
      punchFrame = 0;
      punching = false;
    }
    currentFrame = punchFrames[punchFrame % punchFrames.length];

  } else if (jumping) {
    currentFrame = jumpFrames[jumpFrame % jumpFrames.length];

  } else if (moving) {
    if (now - lastTime > frameRate) {
      frameIndex++;
      lastTime = now;
    }
    currentFrame = walkFrames[frameIndex % walkFrames.length];

  } else {
    if (now - lastTime > frameRate) {
      frameIndex++;
      lastTime = now;
    }
    currentFrame = idleFrames[frameIndex % idleFrames.length];
  }

  if (currentFrame && currentFrame.complete) {
    drawFlippedImage(
      currentFrame,
      player.x - player.width / 2,
      player.y - player.height / 2,
      player.width,
      player.height,
      flip
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
