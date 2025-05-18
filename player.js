import { CONFIG } from './config.js';

export class Player {
  constructor(image) {
    this.spriteImage = image;
    this.width = CONFIG.PLAYER.WIDTH * CONFIG.PLAYER.SCALE;
    this.height = CONFIG.PLAYER.HEIGHT * CONFIG.PLAYER.SCALE;
    this.x = 0;
    this.y = 0;
    this.speed = CONFIG.PLAYER.SPEED;
    this.maxHealth = CONFIG.PLAYER.MAX_HEALTH;
    this.health = this.maxHealth;
    this.direction = 'down';
    this.moving = false;
    this.isIdle = true;
    this.frameX = 0;
    this.frameY = 3;
    this.maxFrame = 3;
    this.idleFrameX = 0;
    this.idleFrameY = 0;
    this.idleMaxFrame = 1;
    this.frameTimer = 0;
    this.frameInterval = 300;
  }

  draw(ctx, screenX, screenY) {
    ctx.save();
    let drawFrameX = this.isIdle ? this.idleFrameX : this.frameX;
    let drawFrameY = this.isIdle ? this.idleFrameY : this.frameY;

    if (this.direction === 'left' && this.isIdle) {
      ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
      ctx.scale(-1, 1);
      ctx.translate(-this.width / 2, -this.height / 2);
      ctx.drawImage(
        this.spriteImage,
        drawFrameX * CONFIG.PLAYER.WIDTH,
        1 * CONFIG.PLAYER.HEIGHT,
        CONFIG.PLAYER.WIDTH,
        CONFIG.PLAYER.HEIGHT,
        0, 0, this.width, this.height
      );
    } else if (this.direction === 'left' && !this.isIdle) {
      ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
      ctx.scale(-1, 1);
      ctx.translate(-this.width / 2, -this.height / 2);
      ctx.drawImage(
        this.spriteImage,
        drawFrameX * CONFIG.PLAYER.WIDTH,
        4 * CONFIG.PLAYER.HEIGHT,
        CONFIG.PLAYER.WIDTH,
        CONFIG.PLAYER.HEIGHT,
        0, 0, this.width, this.height
      );
    } else {
      ctx.drawImage(
        this.spriteImage,
        drawFrameX * CONFIG.PLAYER.WIDTH,
        drawFrameY * CONFIG.PLAYER.HEIGHT,
        CONFIG.PLAYER.WIDTH,
        CONFIG.PLAYER.HEIGHT,
        screenX, screenY, this.width, this.height
      );
    }
    ctx.restore();
  }

  update(deltaTime, input, mapWidth, mapHeight) {
    this.moving = false;
    let newX = this.x;
    let newY = this.y;
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
