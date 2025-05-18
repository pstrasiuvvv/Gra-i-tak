export class PowerUp {
  constructor(centerX, centerY, type) {
    this.size = 16;
    this.x = centerX + this.size + 10;
    this.y = centerY + this.size + 10;
    this.type = type; // 'health' | 'speed'
    this.active = true;
  }

  draw(ctx, offsetX, offsetY) {
    if (!this.active) return;
    ctx.fillStyle = this.type === 'health' ? 'green' : 'blue';
    ctx.fillRect(
      Math.round(this.x - offsetX),
      Math.round(this.y - offsetY),
      this.size, this.size
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
