
export const CONFIG = {
  PLAYER: {
    WIDTH: 32,
    HEIGHT: 32,
    SCALE: 2,
    SPEED: 100,
    MAX_HEALTH: 2,
    HITBOX: 0.3
  },
  ENEMY: {
    WIDTH: 32,
    HEIGHT: 32,
    SCALE: 2,
    SPEED_MIN: 20,
    SPEED_MAX: 40,
    DAMAGE: 1,
    HITBOX: 0.3
  },
  BULLET: {
    SIZE: 6,
    SPEED: 400
  },
  WAVE: {
    ENEMIES_START: 5,
    ENEMIES_INCREMENT: 4,
    INTERVAL: 5000
  },
  POWERUP: {
    HEALTH_DROP_CHANCE: 0.01,
    SPEED_DROP_CHANCE: 0.1,
    SPEED_BOOST: 1.5,
    SPEED_DURATION: 5000
  },
  TILE_SIZE: 16,
  SCALE: 2
};
