
export type Point = { x: number; y: number };
export type Vector = { x: number; y: number };

export enum GameState {
  MENU,
  CHARACTER_SELECT,
  OPPONENT_SELECT, // pick the enemy team
  STAGE_SELECT,
  PLAYING,
  PAUSED,
  GAME_OVER,
  VICTORY
}

export type GameMode = 'ARCADE' | 'SHOOTOUT';

export enum PowerupType {
  HEAL = 'HEAL',
  RAPID_FIRE = 'RAPID_FIRE',
  TRIPLE_SHOT = 'TRIPLE_SHOT'
}

export interface Entity {
  id: string;
  pos: Point;
  radius: number;
  rotation: number;
  // Animation state
  animFrame: number;
}

export interface Player extends Entity {
  hp: number;
  maxHp: number;
  score: number;
  velocity: Vector;
  fireCooldown: number;
  powerupTime: number;
  activePowerup: PowerupType | null;
  characterId: string; // Added to track selected character
  
  // BLAZIN MECHANIC
  blazinMeter: number; // 0 to 100
  isBlazin: boolean;
  blazinTimer: number;
}

export interface Enemy extends Entity {
  hp: number;
  maxHp: number; // Added maxHp for boss bar
  speed: number;
  type: 'basic' | 'fast' | 'tank' | 'boss' | 'rival';
  bossVariant?: string; // Generalized to string to accept any character key
  value: number;
  hitFlashTimer: number; // For visual feedback
  attackCooldown?: number; // For boss/rival
}

export interface Bullet extends Entity {
  velocity: Vector;
  damage: number;
  lifeTime: number;
  isEnemy: boolean;
  spriteKey?: string; // Supports unique bullet visuals per character
}

export interface Particle extends Entity {
  velocity: Vector;
  lifeTime: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Powerup extends Entity {
  type: PowerupType;
  lifeTime: number;
}

export interface FloatingText {
  id: string;
  pos: Point;
  text: string;
  color: string;
  lifeTime: number;
  velocity: Vector;
}

export interface WaveConfig {
  enemyCount: number;
  spawnRate: number; // ms between spawns
  speedMult: number;
  hpMult: number;
}
