import { CONFIG } from './config.js';
import { PowerUp } from './powerup.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let mapData = null;
let tilesetImage = new Image();
tilesetImage.src = 'TX Tileset Grass.png';

const playerImage = new Image();
playerImage.src = 'Prototype_Character.png';
const playerImage2 = new Image();
playerImage2.src = 'Prototype_Character_Red.png';

let gameState = 'menu'; // 'menu' | 'game' | 'gameover'

class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = CONFIG.PLAYER.WIDTH * CONFIG.PLAYER.SCALE;
    this.height = CONFIG.PLAYER.HEIGHT * CONFIG.PLAYER.SCALE;
    this.speed = CONFIG.PLAYER.SPEED;
    this.spriteWidth = CONFIG.PLAYER.WIDTH;
    this.spriteHeight = CONFIG.PLAYER.HEIGHT;
    this.frameX = 0;
    this.frameY = 3;
    this.maxFrame = 3;
    this.idleFrameX = 0;
    this.idleFrameY = 0;
    this.idleMaxFrame = 1;
    this.frameTimer = 0;
    this.frameInterval = 300;
    this.moving = false;
    this.isIdle = true;
    this.direction = 'down';
    this.health = CONFIG.PLAYER.MAX_HEALTH;
    this.invuln = false;
    this.invulnTimer = 0;
    this.invulnDuration = 1000;
  }

  draw(screenX, screenY) {
    ctx.save();
    if (this.invuln) ctx.globalAlpha = 0.5;
    let drawFrameX = this.isIdle ? this.idleFrameX : this.frameX;
    let drawFrameY = this.isIdle ? this.idleFrameY : this.frameY;
    if (this.direction === 'left' && this.isIdle) {
      ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
      ctx.scale(-1, 1);
      ctx.translate(-this.width / 2, -this.height / 2);
      ctx.drawImage(
        playerImage,
        drawFrameX * this.spriteWidth,
        1 * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        0, 0, this.width, this.height
      );
    } else if (this.direction === 'left' && !this.isIdle) {
      ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
      ctx.scale(-1, 1);
      ctx.translate(-this.width / 2, -this.height / 2);
      ctx.drawImage(
        playerImage,
        drawFrameX * this.spriteWidth,
        4 * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        0, 0, this.width, this.height
      );
    } else {
      ctx.drawImage(
        playerImage,
        drawFrameX * this.spriteWidth,
        drawFrameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        screenX, screenY, this.width, this.height
      );
    }
    ctx.restore();
  }

  update(deltaTime, input, mapWidth, mapHeight) {
    if (this.invuln) {
      this.invulnTimer += deltaTime * 1000;
      if (this.invulnTimer >= this.invulnDuration) {
        this.invuln = false;
        this.invulnTimer = 0;
      }
    }
    this.moving = false;
    let newX = this.x, newY = this.y;
    if (input.left) { newX -= this.speed * deltaTime; this.direction = 'left'; this.moving = true; }
    if (input.right) { newX += this.speed * deltaTime; this.direction = 'right'; this.moving = true; }
    if (input.up) { newY -= this.speed * deltaTime; this.direction = 'up'; this.moving = true; }
    if (input.down) { newY += this.speed * deltaTime; this.direction = 'down'; this.moving = true; }
    newX = Math.max(0, Math.min(newX, mapWidth - this.width));
    newY = Math.max(0, Math.min(newY, mapHeight - this.height));
    this.x = newX; this.y = newY;

    if (this.moving) {
      this.isIdle = false;
      switch (this.direction) {
        case 'down': this.frameY = 3; break;
        case 'right': this.frameY = 4; break;
        case 'up': this.frameY = 5; break;
        case 'left': break;
      }
      this.frameTimer += deltaTime * 1000;
      if (this.frameTimer > this.frameInterval) {
        this.frameTimer = 0; this.frameX++;
        if (this.frameX > this.maxFrame) this.frameX = 0;
      }
    } else {
      if (!this.isIdle) {
        this.isIdle = true;
        this.idleFrameX = 0;
        switch (this.direction) {
          case 'down': this.idleFrameY = 0; break;
          case 'right': this.idleFrameY = 1; break;
          case 'up': this.idleFrameY = 2; break;
          case 'left': this.idleFrameY = 1; break;
          default: this.idleFrameY = 0;
        }
      }
      this.frameTimer += deltaTime * 1000;
      if (this.frameTimer > this.frameInterval) {
        this.frameTimer = 0; this.idleFrameX++;
        if (this.idleFrameX > this.idleMaxFrame) this.idleFrameX = 0;
      }
      this.frameX = 0;
    }
  }

  getBoundingBox() {
    const hitboxW = this.width * CONFIG.PLAYER.HITBOX;
    const hitboxH = this.height * CONFIG.PLAYER.HITBOX;
    return {
      x: this.x + (this.width - hitboxW) / 2,
      y: this.y + (this.height - hitboxH) / 2,
      width: hitboxW,
      height: hitboxH
    };
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.ENEMY.WIDTH * CONFIG.ENEMY.SCALE;
    this.height = CONFIG.ENEMY.HEIGHT * CONFIG.ENEMY.SCALE;
    this.speed = CONFIG.ENEMY.SPEED_MIN + Math.random() * (CONFIG.ENEMY.SPEED_MAX - CONFIG.ENEMY.SPEED_MIN);
    this.spriteWidth = CONFIG.ENEMY.WIDTH;
    this.spriteHeight = CONFIG.ENEMY.HEIGHT;
    this.frameX = 0;
    this.frameTimer = 0;
    this.frameInterval = 400;
    this.alive = true;
  }

  update(deltaTime, mapWidth, mapHeight, playerX, playerY) {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const vx = (dx / dist) * this.speed;
      const vy = (dy / dist) * this.speed;
      let newX = this.x + vx * deltaTime;
      let newY = this.y + vy * deltaTime;
      newX = Math.max(0, Math.min(newX, mapWidth - this.width));
      newY = Math.max(0, Math.min(newY, mapHeight - this.height));
      this.x = newX;
      this.y = newY;
    }
    this.frameTimer += deltaTime * 1000;
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      this.frameX = (this.frameX + 1) % 2;
    }
  }

  draw(offsetX, offsetY) {
    ctx.drawImage(
      playerImage2,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      Math.round(this.x - offsetX),
      Math.round(this.y - offsetY),
      this.width,
      this.height
    );
  }

  getBoundingBox() {
    const hitboxWidth = this.width * CONFIG.ENEMY.HITBOX;
    const hitboxHeight = this.height * CONFIG.ENEMY.HITBOX;
    return {
      x: this.x + (this.width - hitboxWidth) / 2,
      y: this.y + (this.height - hitboxHeight) / 2,
      width: hitboxWidth,
      height: hitboxHeight
    };
  }
}

class Bullet {
  constructor(x, y, direction) {
    this.speed = CONFIG.BULLET.SPEED;
    this.size = CONFIG.BULLET.SIZE;
    this.x = x;
    this.y = y;
    const diagSpeed = this.speed / Math.sqrt(2);
    switch (direction) {
      case 'up': this.vx = 0; this.vy = -this.speed; break;
      case 'down': this.vx = 0; this.vy = this.speed; break;
      case 'left': this.vx = -this.speed; this.vy = 0; break;
      case 'right': this.vx = this.speed; this.vy = 0; break;
      case 'up-right': this.vx = diagSpeed; this.vy = -diagSpeed; break;
      case 'up-left': this.vx = -diagSpeed; this.vy = -diagSpeed; break;
      case 'down-right': this.vx = diagSpeed; this.vy = diagSpeed; break;
      case 'down-left': this.vx = -diagSpeed; this.vy = diagSpeed; break;
      default: this.vx = 0; this.vy = 0;
    }
  }
  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
  }
  draw(offsetX, offsetY) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(
      Math.round(this.x - offsetX),
      Math.round(this.y - offsetY),
      this.size,
      this.size
    );
  }
  isOffScreen(mapWidth, mapHeight) {
    return (
      this.x < 0 ||
      this.y < 0 ||
      this.x > mapWidth ||
      this.y > mapHeight
    );
  }
  getBoundingBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.size,
      height: this.size
    };
  }
}

function rectanglesIntersect(r1, r2) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

let player;
let input = { left: false, right: false, up: false, down: false, shoot: false };
let enemies = [];
let bullets = [];
let enemiesPerWave = CONFIG.WAVE.ENEMIES_START;
let waveNumber = 0;
let canShoot = true;
let powerUps = [];
let speedTimer = 0;
let speedBoosted = false;

const shootCooldown = 300;
let shootTimer = 0;
let lastTime = 0;

function getShootDirection(input, lastDirection) {
  if (input.up && input.right) return 'up-right';
  if (input.up && input.left) return 'up-left';
  if (input.down && input.right) return 'down-right';
  if (input.down && input.left) return 'down-left';
  if (input.up) return 'up';
  if (input.down) return 'down';
  if (input.left) return 'left';
  if (input.right) return 'right';
  return lastDirection;
}

function shootBullet() {
  const startX = player.x + player.width / 2 - CONFIG.BULLET.SIZE / 2;
  const startY = player.y + player.height / 2 - CONFIG.BULLET.SIZE / 2;
  const direction = getShootDirection(input, player.direction);
  bullets.push(new Bullet(startX, startY, direction));
}

function updateShootCooldown(deltaTime) {
  if (!canShoot) {
    shootTimer += deltaTime * 1000;
    if (shootTimer >= shootCooldown) {
      canShoot = true;
      shootTimer = 0;
    }
  }
}

function spawnWave() {
  waveNumber++;
  enemiesPerWave = CONFIG.WAVE.ENEMIES_START + (waveNumber - 1) * CONFIG.WAVE.ENEMIES_INCREMENT;
  for (let i = 0; i < enemiesPerWave; i++) {
    const x = Math.random() * (mapData.width * CONFIG.TILE_SIZE * CONFIG.SCALE - 64);
    const y = Math.random() * (mapData.height * CONFIG.TILE_SIZE * CONFIG.SCALE - 64);
    enemies.push(new Enemy(x, y));
  }
  document.getElementById('waveCounter').textContent = waveNumber;
  if (enemies.length === 0) {
    spawnWave();
  }

}

function drawMap(offsetX, offsetY) {
  if (!mapData) return;
  const mapWidth = mapData.width;
  const mapHeight = mapData.height;
  const tiles = mapData.layers[0].data;
  const tilesPerRowInTileset = tilesetImage.width / CONFIG.TILE_SIZE;
  for (let row = 0; row < mapHeight; row++) {
    for (let col = 0; col < mapWidth; col++) {
      const tileIndex = tiles[row * mapWidth + col] - 1;
      if (tileIndex < 0) continue;
      const sx = (tileIndex % tilesPerRowInTileset) * CONFIG.TILE_SIZE;
      const sy = Math.floor(tileIndex / tilesPerRowInTileset) * CONFIG.TILE_SIZE;
      const dx = Math.round(col * CONFIG.TILE_SIZE * CONFIG.SCALE - offsetX);
      const dy = Math.round(row * CONFIG.TILE_SIZE * CONFIG.SCALE - offsetY);
      ctx.drawImage(
        tilesetImage,
        sx, sy, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE,
        dx, dy, CONFIG.TILE_SIZE * CONFIG.SCALE, CONFIG.TILE_SIZE * CONFIG.SCALE
      );
    }
  }
}

function showGameOver() {
  document.getElementById('gameOverScreen').style.display = 'flex';
  document.getElementById('finalWave').textContent = waveNumber;
}

function hideGameOver() {
  document.getElementById('gameOverScreen').style.display = 'none';
}

function resetGame() {
  powerUps = [];
  speedBoosted = false;
  speedTimer = 0;
  player = new Player();
  bullets = [];
  enemies = [];
  enemiesPerWave = CONFIG.WAVE.ENEMIES_START;
  waveNumber = 0;
  
  canShoot = true;
  shootTimer = 0;
  if (mapData) {
    player.x = (mapData.width * CONFIG.TILE_SIZE * CONFIG.SCALE) / 2 - player.width / 2;
    player.y = (mapData.height * CONFIG.TILE_SIZE * CONFIG.SCALE) / 2 - player.height / 2;
  }
  document.getElementById('healthCounter').textContent = player.health;
  document.getElementById('waveCounter').textContent = waveNumber;
  if (enemies.length === 0) {
    spawnWave();
  }

  hideGameOver();
}

function gameLoop(timestamp = 0) {
  if (gameState !== 'game') return;

  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  updateShootCooldown(deltaTime);
  updatePowerUps(deltaTime);
  updateSpeedBoost(deltaTime);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cameraX = player.x - canvas.width / 2 + player.width / 2;
  const cameraY = player.y - canvas.height / 2 + player.height / 2;

  drawMap(cameraX, cameraY);

  // ENEMIES + DAMAGE
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update(deltaTime, mapData.width * CONFIG.TILE_SIZE * CONFIG.SCALE, mapData.height * CONFIG.TILE_SIZE * CONFIG.SCALE, player.x, player.y);
    enemies[i].draw(cameraX, cameraY);

    // DAMAGE!
    if (!player.invuln && rectanglesIntersect(enemies[i].getBoundingBox(), player.getBoundingBox())) {
      player.health -= CONFIG.ENEMY.DAMAGE;
      player.invuln = true;
      if (player.health <= 0) {
        document.getElementById('healthCounter').textContent = 0;
        showGameOver();
        gameState = 'gameover';
        return;
      }
    }
  }

  // BULLETS
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update(deltaTime);
    const bulletBox = bullets[i].getBoundingBox();
    let hitEnemyIndex = -1;
    for (let j = 0; j < enemies.length; j++) {
      if (rectanglesIntersect(bulletBox, enemies[j].getBoundingBox())) {
        hitEnemyIndex = j;
        break;
      }
    }
    if (hitEnemyIndex !== -1) {
      dropPowerUp(enemies[hitEnemyIndex].x, enemies[hitEnemyIndex].y);
      enemies.splice(hitEnemyIndex, 1);
      bullets.splice(i, 1);
      continue;
    }
    if (bullets[i].isOffScreen(mapData.width * CONFIG.TILE_SIZE * CONFIG.SCALE, mapData.height * CONFIG.TILE_SIZE * CONFIG.SCALE)) {
      bullets.splice(i, 1);
    } else {
      bullets[i].draw(cameraX, cameraY);
    }
  }

  drawPowerUps(cameraX, cameraY);
  player.draw(canvas.width / 2 - player.width / 2, canvas.height / 2 - player.height / 2);
  player.update(deltaTime, input, mapData.width * CONFIG.TILE_SIZE * CONFIG.SCALE, mapData.height * CONFIG.TILE_SIZE * CONFIG.SCALE);

  if (input.shoot && canShoot) {
    shootBullet();
    canShoot = false;
  }

  

  document.getElementById('healthCounter').textContent = player.health;
  document.getElementById('waveCounter').textContent = waveNumber;
  if (enemies.length === 0) {
    spawnWave();
  }


  requestAnimationFrame(gameLoop);
}

// --- ŁADOWANIE MAPY I START GRY ---
fetch('map.json')
  .then(response => response.json())
  .then(data => {
    mapData = data;
    resetGame();
  });

tilesetImage.onload = () => {};
playerImage.onload = () => {};

// --- MENU I RESTART ---
document.getElementById('startGameBtn').addEventListener('click', () => {
  document.getElementById('gameMenu').style.display = 'none';
  resetGame();
  gameState = 'game';
  lastTime = performance.now();
  spawnWave();
  requestAnimationFrame(gameLoop);
});
document.getElementById('restartBtn').addEventListener('click', () => {
  hideGameOver();
  resetGame();
  gameState = 'game';
  lastTime = performance.now();
  spawnWave();
  requestAnimationFrame(gameLoop);
});

// --- STEROWANIE ---
window.addEventListener('keydown', e => {
  if (gameState !== 'game') return;
  switch (e.key.toLowerCase()) {
    case 'a': input.left = true; break;
    case 'd': input.right = true; break;
    case 'w': input.up = true; break;
    case 's': input.down = true; break;
    case ' ': input.shoot = true; break;
  }
});
window.addEventListener('keyup', e => {
  if (gameState !== 'game') return;
  switch (e.key.toLowerCase()) {
    case 'a': input.left = false; break;
    case 'd': input.right = false; break;
    case 'w': input.up = false; break;
    case 's': input.down = false; break;
    case ' ': input.shoot = false; break;
  }
});


function dropPowerUp(x, y) {
  if (Math.random() < CONFIG.POWERUP.HEALTH_DROP_CHANCE) {
    powerUps.push(new PowerUp(x, y, 'health'));
  } else if (Math.random() < CONFIG.POWERUP.SPEED_DROP_CHANCE) {
    powerUps.push(new PowerUp(x, y, 'speed'));
  }
}


function updatePowerUps(deltaTime) {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const pu = powerUps[i];
    if (!pu.active) continue;
    if (rectanglesIntersect(pu.getBoundingBox(), player.getBoundingBox())) {
      pu.active = false;
      if (pu.type === 'health') {
        player.health = Math.min(player.health + 1, CONFIG.PLAYER.MAX_HEALTH);
      } else if (pu.type === 'speed') {
        if (!speedBoosted) {
          player.speed *= CONFIG.POWERUP.SPEED_BOOST;
          speedBoosted = true;
          speedTimer = CONFIG.POWERUP.SPEED_DURATION;
        }
      }
    }
  }
}


function drawPowerUps(offsetX, offsetY) {
  for (const pu of powerUps) {
    if (pu.active) pu.draw(ctx, offsetX, offsetY);
  }
}


function updateSpeedBoost(deltaTime) {
  if (speedBoosted) {
    speedTimer -= deltaTime * 1000;
    if (speedTimer <= 0) {
      player.speed = CONFIG.PLAYER.SPEED;
      speedBoosted = false;
    }
  }
}
