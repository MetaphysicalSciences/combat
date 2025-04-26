const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const idleFrames = [];
let currentFrame = 0;
let frameDelay = 100; // milliseconds
let lastFrameTime = 0;

// Load 60 idle frames
for (let i = 0; i < 60; i++) {
  const img = new Image();
  const index = String(i).padStart(3, '0');
  img.src = `tile${index}.png`;
  idleFrames.push(img);
}

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 128,
  height: 128
};

function gameLoop(timestamp) {
  if (timestamp - lastFrameTime > frameDelay) {
    currentFrame = (currentFrame + 1) % idleFrames.length;
    lastFrameTime = timestamp;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const img = idleFrames[currentFrame];
  if (img.complete) {
    ctx.drawImage(img, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
