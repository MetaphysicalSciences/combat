const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Enlarge canvas once
canvas.width  = 1920;
canvas.height = 1080;

const groundY = canvas.height - 100;

// Input state
let keys = {};
let facingRight = true;
let moving    = false;
let punching  = false;
let jumping   = false;

// Animation timing
let lastTime       = 0;
let frameIndex     = 0;
const rateIdle     = 100;
const rateWalk     = 50;
const ratePunch    = 30;
const rateJump     = 200;  // slower jump

// Jump physics
let velocityY = 0;
const gravity = 1.2;
let grounded  = true;

// Sprite containers
const idleFrames  = [];
const walkFrames  = [];
const punchFrames = [];
const jumpFrames  = [];

// Base sprite dimensions (set after first image loads)
let baseW = 0, baseH = 0;

// Load frames helper
function loadFrames(folder, count, container) {
  for (let i = 0; i < count; i++) {
    const img = new Image();
    img.src = `${folder}/tile${String(i).padStart(3,"0")}.png`;
    img.onload = () => {
      if (!baseW) {
        baseW = img.width;
        baseH = img.height;
      }
    };
    container.push(img);
  }
}

// Load all
loadFrames("idle", 60,  idleFrames);
loadFrames("walk", 76,  walkFrames);
loadFrames("punch",100, punchFrames);
loadFrames("jump", 50,  jumpFrames);

// Player state
const player = {
  x: canvas.width/2,
  y: groundY,
  speed: 6,
  scale: 1.0,           // uniform scale
  jumpStartFrame: 18,
  jumpLandFrame:  31
};

// Input listeners
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup",   e => keys[e.key.toLowerCase()] = false);
canvas.addEventListener("mousedown", () => {
  if (!punching && grounded && !jumping) {
    punching = true;
    frameIndex = 0;
  }
});

// Movement & physics
function updatePlayer() {
  moving = false;
  if (!punching && !jumping) {
    if (keys["a"]) { player.x -= player.speed; moving = true; facingRight = false; }
    if (keys["d"]) { player.x += player.speed; moving = true; facingRight = true; }
  }

  if ((keys["w"] || keys[" "]) && grounded && !punching && !jumping) {
    jumping = true;
    grounded  = false;
    velocityY = -18;
    frameIndex = player.jumpStartFrame;
  }

  if (jumping) {
    velocityY += gravity;
    player.y += velocityY;
    // advance jump animation
    if (frameIndex < player.jumpLandFrame) {
      frameIndex++;
    } else if (player.y >= groundY) {
      player.y      = groundY;
      velocityY     = 0;
      grounded      = true;
      jumping       = false;
      frameIndex    = 0;
    } else {
      frameIndex++;
    }
    if (frameIndex >= jumpFrames.length) frameIndex = jumpFrames.length - 1;
  }
}

// Draw helpers
function drawGround() {
  ctx.fillStyle = "#444";
  ctx.fillRect(0, groundY + 1, canvas.width, 8);
}

function drawFlipped(img, x, y, w, h, flip) {
  ctx.save();
  if (flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1,1);
    ctx.drawImage(img,0,0,w,h);
  } else {
    ctx.drawImage(img,x,y,w,h);
  }
  ctx.restore();
}

// Main render
function drawPlayer(now) {
  let img;
  let rate;
  if (punching) {
    rate = ratePunch;
    img  = punchFrames[frameIndex % punchFrames.length];
    if (now - lastTime > rate) { frameIndex++; lastTime = now; }
    if (frameIndex >= punchFrames.length) { punching = false; frameIndex = 0; }
  }
  else if (jumping) {
    rate = rateJump;
    img  = jumpFrames[frameIndex];
    if (now - lastTime > rate) { frameIndex++; lastTime = now; }
  }
  else if (moving) {
    rate = rateWalk;
    img  = walkFrames[frameIndex % walkFrames.length];
    if (now - lastTime > rate) { frameIndex++; lastTime = now; }
  }
  else {
    rate = rateIdle;
    img  = idleFrames[frameIndex % idleFrames.length];
    if (now - lastTime > rate) { frameIndex++; lastTime = now; }
  }

  if (!img || !img.complete || !baseW) return;

  // Calculate scaled size
  const drawW = baseW * player.scale;
  const drawH = baseH * player.scale;

  // Y offset to put feet on ground
  const yOffset = drawH;

  drawFlipped(
    img,
    player.x - drawW/2,
    player.y - yOffset,
    drawW,
    drawH,
    !facingRight
  );
}

// Game loop
function loop(now) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  updatePlayer();
  drawGround();
  drawPlayer(now);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
