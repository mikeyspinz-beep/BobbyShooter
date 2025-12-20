
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GROUND_HEIGHT,
  COLORS, 
  GAME_CONFIG, 
  ASSETS,
  CHARACTERS,
  ARENAS
} from '../constants';
import { 
  GameState, 
  GameMode,
  Player, 
  Enemy, 
  Bullet, 
  Particle, 
  Powerup, 
  PowerupType, 
  FloatingText,
  Point
} from '../types';

// --- UTILS ---
const dist = (p1: Point, p2: Point) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
const checkCircleCollision = (c1: { pos: Point; radius: number }, c2: { pos: Point; radius: number }) => {
  return dist(c1.pos, c2.pos) < c1.radius + c2.radius;
};

// --- ASSET LOADER ---
const images: Record<string, HTMLImageElement> = {};
const loadImages = () => {
  Object.entries(ASSETS).forEach(([key, url]) => {
    if (url) {
      if (key.startsWith('MUSIC') || key.startsWith('SFX')) return; 
      if (images[key]) return; 
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      images[key] = img;
    }
  });
};

interface GameCanvasProps {
    onExit: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const clubMusicRef = useRef<HTMLAudioElement | null>(null);
  
  const gunshotPoolRef = useRef<HTMLAudioElement[]>([]);
  const mattGunshotPoolRef = useRef<HTMLAudioElement[]>([]);
  const gunshotIndexRef = useRef(0);
  const mattGunshotIndexRef = useRef(0);
  
  const powerupSfxRef = useRef<HTMLAudioElement | null>(null);
  const gameoverSfxRef = useRef<HTMLAudioElement | null>(null);
  const unlockSfxRef = useRef<HTMLAudioElement | null>(null);
  const selectSfxRef = useRef<HTMLAudioElement | null>(null);
  const whoopsieSfxRef = useRef<HTMLAudioElement | null>(null);
  
  const requestRef = useRef<number | undefined>(undefined); 
  
  const gameStateRef = useRef<GameState>(GameState.MENU);
  const gameModeRef = useRef<GameMode>('ARCADE');
  const selectedStageRef = useRef<keyof typeof ARENAS>('STREET');

  const playerTeamRef = useRef<string[]>([]);
  const enemyTeamRef = useRef<string[]>([]);
  const teamHpsRef = useRef<Record<string, number>>({}); 
  const playerActiveIdxRef = useRef(0);
  const enemyActiveIdxRef = useRef(0);

  const playerRef = useRef<Player & { recoil: number, muzzleFlash: number }>({
    id: 'player',
    pos: { x: 150, y: CANVAS_HEIGHT / 2 },
    radius: 55,
    rotation: 0,
    hp: GAME_CONFIG.PLAYER_MAX_HP,
    maxHp: GAME_CONFIG.PLAYER_MAX_HP,
    score: 0,
    velocity: { x: 0, y: 0 },
    fireCooldown: 0,
    powerupTime: 0,
    activePowerup: null,
    animFrame: 0,
    recoil: 0,
    muzzleFlash: 0,
    characterId: 'default',
    blazinMeter: 0,
    isBlazin: false,
    blazinTimer: 0
  });

  const matchStateRef = useRef({
    playerWins: 0,
    enemyWins: 0,
    round: 1,
    isRoundActive: false,
    roundEndTimer: 0
  });
  
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerupsRef = useRef<Powerup[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  
  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const mousePressedRef = useRef<boolean>(false);

  const frameRef = useRef<number>(0);
  const waveRef = useRef<number>(1);
  const waveTimerRef = useRef<number>(0);
  const enemiesToSpawnRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const screenShakeRef = useRef<number>(0);
  const bgOffsetRef = useRef<number>(0); 
  const bossActiveRef = useRef<boolean>(false);
  const lastAaronScoreRef = useRef<number>(0); 

  const cloudsRef = useRef<{x: number, y: number, scale: number, speed: number}[]>([]); 
  const menuStarsRef = useRef<{x: number, y: number, speed: number, size: number}[]>([]);

  const [uiState, setUiState] = useState({
    gameState: GameState.MENU,
    gameMode: 'ARCADE' as GameMode,
    score: 0,
    hp: 100,
    maxHp: 100,
    wave: 1,
    powerup: null as PowerupType | null,
    bossHp: 0,
    bossMaxHp: 0,
    bossName: '',
    round: 1,
    pWins: 0,
    eWins: 0,
    blazinMeter: 0,
    isBlazin: false,
    playerTeam: [] as string[],
    playerActiveIdx: 0,
    opponentTeam: [] as string[],
    enemyActiveIdx: 0
  });
  
  const [isMuted, setIsMuted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [difficulty, setDifficulty] = useState<'EASY' | 'NORMAL' | 'HARD'>('NORMAL');
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState("BOSS DETECTED");
  const [dlc1Installed, setDlc1Installed] = useState(false);
  const [dlc2Installed, setDlc2Installed] = useState(false);
  const [dlc3Installed, setDlc3Installed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isWiping, setIsWiping] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [unlockedCharacters, setUnlockedCharacters] = useState<string[]>(() => {
    try {
        const saved = localStorage.getItem('unlockedChars');
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['default', 'kayla', 'matt'];
  });

  const [teamSize, setTeamSize] = useState(1);
  const [selectedPlayerTeam, setSelectedPlayerTeam] = useState<string[]>([]);
  const [selectedOpponentTeam, setSelectedOpponentTeam] = useState<string[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('default'); 
  const [selectedStage, setSelectedStage] = useState<keyof typeof ARENAS>('STREET');

  const [showCheatBox, setShowCheatBox] = useState(false);
  const [cheatTimer, setCheatTimer] = useState(10);
  const cheatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cheatInputRef = useRef<string[]>([]);
  const [exploded, setExploded] = useState(false);

  const UNLOCK_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
  const RESET_SEQUENCE = ['ArrowLeft', 'ArrowLeft', 'ArrowRight', 'ArrowRight', 'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'];

  const [whoopsieActive, setWhoopsieActive] = useState(false);

  const stopAllAudio = useCallback(() => {
    if (musicRef.current) { musicRef.current.pause(); musicRef.current.currentTime = 0; }
    if (clubMusicRef.current) { clubMusicRef.current.pause(); clubMusicRef.current.currentTime = 0; }
    if (powerupSfxRef.current) { powerupSfxRef.current.pause(); powerupSfxRef.current.currentTime = 0; }
    if (gameoverSfxRef.current) { gameoverSfxRef.current.pause(); gameoverSfxRef.current.currentTime = 0; }
    if (unlockSfxRef.current) { unlockSfxRef.current.pause(); unlockSfxRef.current.currentTime = 0; }
    if (selectSfxRef.current) { selectSfxRef.current.pause(); selectSfxRef.current.currentTime = 0; }
    if (whoopsieSfxRef.current) { whoopsieSfxRef.current.pause(); whoopsieSfxRef.current.currentTime = 0; }
  }, []);

  const handleExitToWeb = () => {
    stopAllAudio();
    onExit();
  };

  const handleBackToGameMenu = () => {
    stopAllAudio();
    gameStateRef.current = GameState.MENU;
    syncUI();
  };

  useEffect(() => {
      selectedStageRef.current = selectedStage;
  }, [selectedStage]);

  useEffect(() => {
    loadImages();
    const loadTimeout = setTimeout(() => setIsLoading(false), 2000);

    const dlc1 = localStorage.getItem('dlc1_installed') === 'true';
    const dlc2 = localStorage.getItem('dlc2_installed') === 'true';
    const dlc3 = localStorage.getItem('dlc3_installed') === 'true';
    setDlc1Installed(dlc1);
    setDlc2Installed(dlc2);
    setDlc3Installed(dlc3);

    for(let i=0; i<8; i++) {
      cloudsRef.current.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT * 0.4),
        scale: 0.5 + Math.random() * 0.5,
        speed: 0.1 + Math.random() * 0.2 
      });
    }

    for(let i=0; i<100; i++) {
      menuStarsRef.current.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        speed: 0.5 + Math.random() * 3,
        size: Math.random() * 2
      });
    }

    musicRef.current = new Audio(ASSETS.MUSIC); musicRef.current.loop = true; musicRef.current.volume = 0.5;
    clubMusicRef.current = new Audio(ASSETS.MUSIC_CLUB); clubMusicRef.current.loop = true; clubMusicRef.current.volume = 0.5;
    
    for(let i=0; i<6; i++) {
        const a1 = new Audio(ASSETS.SFX_GUNSHOT); a1.volume = 0.4; gunshotPoolRef.current.push(a1);
        const a2 = new Audio(ASSETS.SFX_MATT_GUNSHOT); a2.volume = 0.6; mattGunshotPoolRef.current.push(a2);
    }

    powerupSfxRef.current = new Audio(ASSETS.SFX_POWERUP); powerupSfxRef.current.volume = 0.6;
    gameoverSfxRef.current = new Audio(ASSETS.SFX_GAMEOVER); gameoverSfxRef.current.volume = 0.7;
    unlockSfxRef.current = new Audio(ASSETS.SFX_UNLOCK); unlockSfxRef.current.volume = 0.7;
    selectSfxRef.current = new Audio(ASSETS.SFX_SELECT); selectSfxRef.current.volume = 0.6;
    whoopsieSfxRef.current = new Audio(ASSETS.SFX_WHOOPSIE); whoopsieSfxRef.current.volume = 1.0;

    return () => {
        clearTimeout(loadTimeout);
        stopAllAudio();
    };
  }, [stopAllAudio]);

  useEffect(() => {
      [musicRef.current, clubMusicRef.current, powerupSfxRef.current, gameoverSfxRef.current, unlockSfxRef.current, selectSfxRef.current, whoopsieSfxRef.current].forEach(a => { if(a) a.muted = isMuted; });
      gunshotPoolRef.current.forEach(a => a.muted = isMuted);
      mattGunshotPoolRef.current.forEach(a => a.muted = isMuted);
  }, [isMuted]);

  useEffect(() => {
      const isInGame = uiState.gameState === GameState.PLAYING || uiState.gameState === GameState.PAUSED;
      const isClub = selectedStage === 'CLUB';
      
      if (uiState.gameState === GameState.MENU) {
          clubMusicRef.current?.pause();
          if (musicRef.current?.paused) musicRef.current.play().catch(()=>{});
          return;
      }

      if (isInGame && isClub) {
          musicRef.current?.pause();
          if (clubMusicRef.current?.paused) { clubMusicRef.current.currentTime = 0; clubMusicRef.current.play().catch(()=>{}); }
      } else if (isInGame) {
          clubMusicRef.current?.pause();
          if (musicRef.current?.paused && uiState.gameState !== GameState.GAME_OVER && uiState.gameState !== GameState.VICTORY) { musicRef.current.play().catch(()=>{}); }
      }
  }, [uiState.gameState, selectedStage]);

  const spawnParticle = (pos: Point, color: string, count: number, speed: number, size: number = 3) => {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const vel = rand(1, speed);
      particlesRef.current.push({ id: Math.random().toString(), pos: { ...pos }, radius: rand(1, size), rotation: rand(0, Math.PI * 2), velocity: { x: Math.cos(angle) * vel, y: Math.sin(angle) * vel }, lifeTime: rand(20, 50), maxLife: 50, color, size, animFrame: 0 });
    }
  };

  const spawnFloatingText = (pos: Point, text: string, color: string) => {
    floatingTextsRef.current.push({ id: Math.random().toString(), pos: { x: pos.x, y: pos.y - 30 }, text, color, lifeTime: 50, velocity: { x: 0, y: -0.8 } });
  };

  const triggerWhoopsie = () => {
    if (whoopsieActive) return;
    setWhoopsieActive(true);
    if (whoopsieSfxRef.current) { whoopsieSfxRef.current.currentTime = 0; whoopsieSfxRef.current.play().catch(()=>{}); }
    setTimeout(() => setWhoopsieActive(false), 1500);
  };

  const spawnPowerup = (pos: Point) => {
    if (Math.random() > GAME_CONFIG.POWERUP_DROP_CHANCE) return;
    const types = [PowerupType.HEAL, PowerupType.RAPID_FIRE, PowerupType.TRIPLE_SHOT];
    const type = types[Math.floor(Math.random() * types.length)];
    powerupsRef.current.push({ id: Math.random().toString(), pos: { ...pos }, radius: 25, rotation: 0, type, lifeTime: 600, animFrame: 0 });
  };

  const playGunshot = () => {
      const isMatt = playerRef.current.characterId === 'matt';
      const pool = isMatt ? mattGunshotPoolRef.current : gunshotPoolRef.current;
      const indexRef = isMatt ? mattGunshotIndexRef : gunshotIndexRef;
      const audio = pool[indexRef.current];
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); indexRef.current = (indexRef.current + 1) % pool.length; }
  };

  const unlockCharacter = (charId: string) => {
      if (!CHARACTERS[charId]) return false;
      if (!unlockedCharacters.includes(charId)) {
          const newUnlocked = [...unlockedCharacters, charId];
          setUnlockedCharacters(newUnlocked);
          localStorage.setItem('unlockedChars', JSON.stringify(newUnlocked));
          if (unlockSfxRef.current) { unlockSfxRef.current.currentTime = 0; unlockSfxRef.current.play().catch(()=>{}); }
          return true;
      }
      return false;
  };

  const unlockAllCharacters = useCallback(() => {
      const allChars = Object.keys(CHARACTERS);
      setUnlockedCharacters(allChars);
      localStorage.setItem('unlockedChars', JSON.stringify(allChars));
      spawnFloatingText({x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2}, "ALL CHARACTERS UNLOCKED!", "#00ff00");
      if (unlockSfxRef.current) { unlockSfxRef.current.currentTime = 0; unlockSfxRef.current.play().catch(()=>{}); }
  }, []);

  const getDifficultyMultiplier = () => difficulty === 'EASY' ? 0.7 : difficulty === 'HARD' ? 1.5 : 1.0;
  const getDamageMultiplier = () => difficulty === 'EASY' ? 0.5 : difficulty === 'HARD' ? 1.5 : 1.0;

  const spawnBoss = () => {
    bossActiveRef.current = true;
    const diffMult = getDifficultyMultiplier();
    const bossList = ['2pac', 'biggie', 'matt', 'postmalone', 'slimshady', 'lilwayne', 'jellyroll', 'diddy', 'snoop', 'mac', 'wiz', '50cent', 'deebo', 'heinerman'];
    const bossIndex = Math.max(0, Math.floor(waveRef.current / 3) - 1) % bossList.length;
    const bossType = bossList[bossIndex];
    const bossChar = CHARACTERS[bossType] || CHARACTERS['2pac'];
    setWarningText(`${bossChar.name} DETECTED`); setShowWarning(true);
    setTimeout(() => setShowWarning(false), 4000);
    setTimeout(() => {
      if (gameStateRef.current !== GameState.PLAYING) return;
      const hp = (250 + (waveRef.current * 60)) * diffMult;
      enemiesRef.current.push({ id: 'BOSS', pos: { x: CANVAS_WIDTH + 150, y: CANVAS_HEIGHT / 2 }, radius: 130, hp, maxHp: hp, speed: 2, type: 'boss', bossVariant: bossType, value: 5000, rotation: 0, animFrame: 0, hitFlashTimer: 0, attackCooldown: 120 });
      screenShakeRef.current = 25;
    }, 2500);
  };

  const syncUI = useCallback(() => {
    let boss = enemiesRef.current.find(e => e.type === 'boss');
    const rival = enemiesRef.current.find(e => e.type === 'rival');
    let bossName = ''; let bossHp = 0; let bossMaxHp = 1;
    if (gameModeRef.current === 'SHOOTOUT') { if (rival) { bossName = CHARACTERS[rival.bossVariant || '']?.name || 'RIVAL'; bossHp = rival.hp; bossMaxHp = rival.maxHp; } } 
    else { if (boss && boss.bossVariant) { bossName = CHARACTERS[boss.bossVariant]?.name || "BOSS"; bossHp = boss.hp; bossMaxHp = boss.maxHp; } }
    setUiState({ gameState: gameStateRef.current, gameMode: gameModeRef.current, score: playerRef.current.score, hp: playerRef.current.hp, maxHp: playerRef.current.maxHp, wave: waveRef.current, powerup: playerRef.current.activePowerup, bossHp, bossMaxHp, bossName, round: matchStateRef.current.round, pWins: matchStateRef.current.playerWins, eWins: matchStateRef.current.enemyWins, blazinMeter: playerRef.current.blazinMeter, isBlazin: playerRef.current.isBlazin, playerTeam: playerTeamRef.current, playerActiveIdx: playerActiveIdxRef.current, opponentTeam: enemyTeamRef.current, enemyActiveIdx: enemyActiveIdxRef.current });
  }, []);

  const resetGameToFactory = () => {
    setIsWiping(true); localStorage.clear(); sessionStorage.clear();
    setTimeout(() => { window.location.href = window.location.origin + window.location.pathname; }, 1500);
  };

  const activateCheatBox = useCallback(() => {
      setShowCheatBox(true); setCheatTimer(10); setExploded(false); cheatInputRef.current = [];
      if (cheatTimerRef.current) clearInterval(cheatTimerRef.current);
      cheatTimerRef.current = setInterval(() => {
          setCheatTimer(prev => {
              if (prev <= 1) {
                  if (cheatTimerRef.current) clearInterval(cheatTimerRef.current);
                  setExploded(true); screenShakeRef.current = 50; 
                  setTimeout(() => { setShowCheatBox(false); setExploded(false); syncUI(); }, 500);
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
  }, [syncUI]);

  const handleCheatInput = useCallback((key: string) => {
      if (!showCheatBox || exploded) return;
      cheatInputRef.current.push(key);
      if (cheatInputRef.current.length > 8) cheatInputRef.current.shift();
      const sequence = JSON.stringify(cheatInputRef.current);
      if (sequence === JSON.stringify(UNLOCK_SEQUENCE)) { if (cheatTimerRef.current) clearInterval(cheatTimerRef.current); unlockAllCharacters(); setShowCheatBox(false); } 
      else if (sequence === JSON.stringify(RESET_SEQUENCE)) { if (cheatTimerRef.current) clearInterval(cheatTimerRef.current); setShowCheatBox(false); setShowResetConfirm(true); }
  }, [showCheatBox, exploded, unlockAllCharacters]);

  const handleModeSelect = (mode: GameMode) => {
      gameModeRef.current = mode; setSelectedPlayerTeam([]); setSelectedOpponentTeam([]);
      gameStateRef.current = GameState.CHARACTER_SELECT; syncUI();
      if (musicRef.current?.paused) musicRef.current.play().catch(()=>{});
  };

  const togglePlayerSelect = (key: string) => {
    setSelectedPlayerTeam(prev => {
      if (prev.includes(key)) return prev.filter(k => k !== key);
      if (prev.length < (gameModeRef.current === 'SHOOTOUT' ? teamSize : 1)) return [...prev, key];
      return [key];
    });
    setSelectedCharacter(key);
  };

  const toggleOpponentSelect = (key: string) => {
    setSelectedOpponentTeam(prev => {
      if (prev.includes(key)) return prev.filter(k => k !== key);
      if (prev.length < teamSize) return [...prev, key];
      return [key];
    });
    setSelectedCharacter(key);
  };

  const confirmPlayerTeam = () => {
    if (gameModeRef.current === 'ARCADE') { playerTeamRef.current = selectedPlayerTeam.length ? selectedPlayerTeam : ['default']; gameStateRef.current = GameState.STAGE_SELECT; }
    else { playerTeamRef.current = selectedPlayerTeam; gameStateRef.current = GameState.OPPONENT_SELECT; }
    syncUI();
  };

  const confirmOpponentTeam = () => { enemyTeamRef.current = selectedOpponentTeam; gameStateRef.current = GameState.STAGE_SELECT; syncUI(); };

  const endGame = useCallback(() => {
    gameStateRef.current = GameState.GAME_OVER; syncUI(); stopAllAudio();
    if (gameoverSfxRef.current) { gameoverSfxRef.current.currentTime = 0; gameoverSfxRef.current.play().catch(()=>{}); }
  }, [syncUI, stopAllAudio]);

  const startGame = (resetMatch = true) => {
    const isShootout = gameModeRef.current === 'SHOOTOUT';
    const radius = isShootout ? 110 : 55;
    if (resetMatch) {
      playerActiveIdxRef.current = 0; enemyActiveIdxRef.current = 0; teamHpsRef.current = {};
      if (isShootout) { const hp = 500 * getDifficultyMultiplier(); playerTeamRef.current.forEach(char => teamHpsRef.current[`player_${char}`] = 500); enemyTeamRef.current.forEach(char => teamHpsRef.current[`enemy_${char}`] = hp); }
    }
    const activePlayerChar = playerTeamRef.current[playerActiveIdxRef.current] || 'default';
    const playerHp = isShootout ? (teamHpsRef.current[`player_${activePlayerChar}`] || 500) : GAME_CONFIG.PLAYER_MAX_HP;
    playerRef.current = { ...playerRef.current, pos: { x: 150, y: CANVAS_HEIGHT - GROUND_HEIGHT - 30 }, radius, hp: playerHp, maxHp: isShootout ? 500 : GAME_CONFIG.PLAYER_MAX_HP, score: resetMatch ? 0 : playerRef.current.score, activePowerup: null, powerupTime: 0, animFrame: 0, recoil: 0, muzzleFlash: 0, characterId: activePlayerChar, blazinMeter: 0, isBlazin: false, blazinTimer: 0 };
    enemiesRef.current = []; bulletsRef.current = []; particlesRef.current = []; powerupsRef.current = []; floatingTextsRef.current = []; screenShakeRef.current = 0; bossActiveRef.current = false; lastAaronScoreRef.current = 0; 
    if (resetMatch) { waveRef.current = 1; waveTimerRef.current = 0; enemiesToSpawnRef.current = 5; spawnTimerRef.current = 0; if (isShootout) matchStateRef.current = { playerWins: 0, enemyWins: 0, round: 1, isRoundActive: true, roundEndTimer: 0 }; }
    else matchStateRef.current.isRoundActive = true;
    if (isShootout) {
        const activeEnemyChar = enemyTeamRef.current[enemyActiveIdxRef.current] || '2pac';
        const enemyHp = teamHpsRef.current[`enemy_${activeEnemyChar}`] || (500 * getDifficultyMultiplier());
        enemiesRef.current.push({ id: 'RIVAL', pos: { x: CANVAS_WIDTH - 200, y: CANVAS_HEIGHT / 2 }, radius: 110, hp: enemyHp, maxHp: 500 * getDifficultyMultiplier(), speed: 5, type: 'rival', bossVariant: activeEnemyChar, value: 0, rotation: Math.PI, animFrame: 0, hitFlashTimer: 0, attackCooldown: 60 });
        spawnFloatingText({x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2}, `ROUND ${matchStateRef.current.round}`, "#facc15");
        setTimeout(() => spawnFloatingText({x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2}, "FIGHT!", "#f00"), 1000);
    }
    gameStateRef.current = GameState.PLAYING; syncUI();
  };

  const handleShootoutRoundEnd = (winner: 'PLAYER' | 'ENEMY') => {
      matchStateRef.current.isRoundActive = false;
      if (winner === 'PLAYER') { matchStateRef.current.playerWins++; spawnFloatingText({x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2}, "YOU WIN THE ROUND!", "#0f0"); }
      else { matchStateRef.current.enemyWins++; spawnFloatingText({x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2}, "ROUND LOST!", "#f00"); }
      if (matchStateRef.current.playerWins >= 2) setTimeout(() => { gameStateRef.current = GameState.VICTORY; syncUI(); }, 2000);
      else if (matchStateRef.current.enemyWins >= 2) setTimeout(() => endGame(), 2000);
      else { matchStateRef.current.round++; setTimeout(() => startGame(false), 2000); }
      syncUI();
  };

  const swapFighter = () => {
    if (gameModeRef.current !== 'SHOOTOUT' || !matchStateRef.current.isRoundActive || playerTeamRef.current.length < 2) return;
    const currentActiveChar = playerTeamRef.current[playerActiveIdxRef.current];
    teamHpsRef.current[`player_${currentActiveChar}`] = playerRef.current.hp;
    let nextIdx = (playerActiveIdxRef.current + 1) % playerTeamRef.current.length;
    playerActiveIdxRef.current = nextIdx;
    const newChar = playerTeamRef.current[nextIdx];
    playerRef.current.characterId = newChar; playerRef.current.hp = teamHpsRef.current[`player_${newChar}`] || 500;
    spawnFloatingText(playerRef.current.pos, "TAG IN!", "#fff"); spawnParticle(playerRef.current.pos, "#fff", 20, 10, 5);
    if (selectSfxRef.current) { selectSfxRef.current.currentTime = 0; selectSfxRef.current.play().catch(()=>{}); }
    syncUI();
  };

  const handleBlazinActivate = () => {
      const p = playerRef.current;
      if (p.blazinMeter >= 100 && !p.isBlazin) {
          p.isBlazin = true; p.blazinTimer = 600; p.blazinMeter = 0;
          spawnFloatingText(p.pos, "BLAZIN MODE!", "#f97316"); spawnParticle(p.pos, "#f97316", 50, 15, 10); screenShakeRef.current = 10;
          if (powerupSfxRef.current) { powerupSfxRef.current.currentTime = 0; powerupSfxRef.current.play().catch(()=>{}); }
      }
  };

  const update = () => {
    frameRef.current++; const diffMult = getDifficultyMultiplier(); const damageMult = getDamageMultiplier();
    bgOffsetRef.current = playerRef.current.pos.x * 0.5;
    cloudsRef.current.forEach(c => { c.x -= c.speed; if (c.x < -200) c.x = CANVAS_WIDTH + 200; });
    menuStarsRef.current.forEach(star => { star.x -= star.speed; if (star.x < 0) { star.x = CANVAS_WIDTH; star.y = Math.random() * CANVAS_HEIGHT; } });
    if (gameStateRef.current !== GameState.PLAYING) return;
    const player = playerRef.current;
    if (player.isBlazin) { player.blazinTimer--; if (player.blazinTimer <= 0) player.isBlazin = false; if (frameRef.current % 4 === 0) spawnParticle(player.pos, "#f97316", 2, 5, 4); }
    let dx = 0, dy = 0;
    if (keysRef.current['w'] || keysRef.current['arrowup']) dy -= 1; if (keysRef.current['s'] || keysRef.current['arrowdown']) dy += 1;
    if (keysRef.current['a'] || keysRef.current['arrowleft']) dx -= 1; if (keysRef.current['d'] || keysRef.current['arrowright']) dx += 1;
    if (keysRef.current['shift']) { if (keysRef.current['t'] || keysRef.current['keyt']) { swapFighter(); keysRef.current['t'] = false; keysRef.current['keyt'] = false; } else handleBlazinActivate(); }
    if (dx !== 0 || dy !== 0) { const len = Math.hypot(dx, dy); dx /= len; dy /= len; }
    player.pos.x = clamp(player.pos.x + dx * GAME_CONFIG.PLAYER_SPEED, player.radius, CANVAS_WIDTH - player.radius);
    const HORIZON_Y = CANVAS_HEIGHT * 0.45; const MAX_Y = CANVAS_HEIGHT - GROUND_HEIGHT - 30;
    player.pos.y = clamp(player.pos.y + dy * GAME_CONFIG.PLAYER_SPEED, HORIZON_Y, MAX_Y);
    player.rotation = Math.atan2(mouseRef.current.y - player.pos.y, mouseRef.current.x - player.pos.x);
    const isFiring = mousePressedRef.current || keysRef.current[' '] || keysRef.current['space'];
    if (player.fireCooldown > 0) player.fireCooldown--; if (player.muzzleFlash > 0) player.muzzleFlash--; if (player.recoil > 0) player.recoil *= 0.8;
    if (player.powerupTime > 0) { player.powerupTime--; if (player.powerupTime <= 0) player.activePowerup = null; }
    if (isFiring && player.fireCooldown <= 0) {
      const isRapid = player.activePowerup === PowerupType.RAPID_FIRE;
      const isTriple = player.activePowerup === PowerupType.TRIPLE_SHOT || player.isBlazin;
      const isMatt = player.characterId === 'matt'; playGunshot();
      const fire = (angleOffset: number) => {
         const angle = player.rotation + angleOffset; const muzzleDist = isMatt ? player.radius * 1.7 : player.radius * 1.3; 
         const spawnPos = { x: player.pos.x + Math.cos(angle) * muzzleDist, y: player.pos.y + Math.sin(angle) * muzzleDist + (isMatt ? 20 : 5) };
         bulletsRef.current.push({ id: Math.random().toString(), pos: spawnPos, radius: 10, velocity: { x: Math.cos(angle) * GAME_CONFIG.BULLET_SPEED, y: Math.sin(angle) * GAME_CONFIG.BULLET_SPEED }, damage: GAME_CONFIG.BULLET_DAMAGE, lifeTime: 80, isEnemy: false, rotation: angle, animFrame: 0, spriteKey: isMatt ? 'BULLET_MATT_IMG' : undefined });
         spawnParticle(spawnPos, player.isBlazin ? "#f97316" : COLORS.MUZZLE_FLASH, 5, 4, 3);
      };
      fire(0); if (isTriple) { fire(-0.15); fire(0.15); }
      player.fireCooldown = player.isBlazin ? 4 : (isRapid ? GAME_CONFIG.FIRE_RATE_RAPID : GAME_CONFIG.FIRE_RATE_DEFAULT);
      player.recoil = 8; player.muzzleFlash = 3; screenShakeRef.current = Math.min(screenShakeRef.current + 2, 20);
    }
    if (gameModeRef.current === 'ARCADE' && !bossActiveRef.current) {
        if (enemiesToSpawnRef.current > 0) {
          if (spawnTimerRef.current <= 0) {
            const waveMult = 1 + (waveRef.current * 0.15); const r = Math.random();
            let type: Enemy['type'] = 'basic'; let hp = 40 * waveMult * diffMult; let speed = 2.5; let rad = 55; 
            if (waveRef.current > 2 && r > 0.85) { type = 'tank'; hp = 150 * waveMult * diffMult; speed = 1.2; rad = 75; }
            else if (waveRef.current > 1 && r > 0.7) { type = 'fast'; hp = 25 * waveMult * diffMult; speed = 5.0; rad = 40; }
            enemiesRef.current.push({ id: Math.random().toString(), pos: { x: CANVAS_WIDTH + 80, y: rand(HORIZON_Y, MAX_Y) }, radius: rad, hp, maxHp: hp, speed, type, value: type === 'basic' ? 50 : (type === 'fast' ? 100 : 300), rotation: 0, animFrame: 0, hitFlashTimer: 0 });
            enemiesToSpawnRef.current--; spawnTimerRef.current = Math.max(20, 60 - waveRef.current * 2);
          } else spawnTimerRef.current--;
        } else if (enemiesRef.current.length === 0) {
          if (waveTimerRef.current === 0) { waveTimerRef.current = GAME_CONFIG.WAVE_DELAY; spawnFloatingText({x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2}, `WAVE ${waveRef.current + 1}`, '#FFF'); }
          else if (--waveTimerRef.current <= 0) { if (++waveRef.current % 3 === 0) spawnBoss(); else enemiesToSpawnRef.current = 6 + Math.floor(waveRef.current * 2); }
        }
    }
    bulletsRef.current.forEach(b => { b.pos.x += b.velocity.x; b.pos.y += b.velocity.y; b.lifeTime--; });
    bulletsRef.current = bulletsRef.current.filter(b => b.lifeTime > 0);
    enemiesRef.current.forEach(e => {
      let vx = 0, vy = 0;
      if (e.type === 'rival') { const dx = (CANVAS_WIDTH - 250) - e.pos.x, dy = player.pos.y - e.pos.y; vx = dx * 0.05 + Math.sin(frameRef.current * 0.05) * 2; vy = dy * 0.05; if (e.pos.y + vy < HORIZON_Y || e.pos.y + vy > MAX_Y) vy = 0; e.rotation = Math.PI; 
          if (e.attackCooldown && e.attackCooldown > 0) e.attackCooldown--;
          else if (Math.abs(player.pos.y - e.pos.y) < 200) { bulletsRef.current.push({ id: Math.random().toString(), pos: { x: e.pos.x - (e.radius + 10), y: e.pos.y }, radius: 12, velocity: { x: -15, y: (Math.random() - 0.5) * 2 }, damage: 25 * damageMult, lifeTime: 100, isEnemy: true, rotation: Math.PI, animFrame: 0 }); spawnParticle({ x: e.pos.x - e.radius, y: e.pos.y }, COLORS.MUZZLE_FLASH, 5, 4, 3); e.attackCooldown = 30 + Math.random() * 20; }
      } else if (e.type === 'boss') { if (e.pos.x > CANVAS_WIDTH - 200) vx = -2; else vy = ((CANVAS_HEIGHT/2) + Math.sin(frameRef.current * 0.02) * 150 - e.pos.y) * 0.02;
         if (e.attackCooldown && e.attackCooldown > 0) e.attackCooldown--;
         else { const angle = Math.atan2(player.pos.y - e.pos.y, player.pos.x - e.pos.x); for(let offset = -0.3; offset <= 0.3; offset+=0.3) bulletsRef.current.push({ id: Math.random().toString(), pos: { x: e.pos.x - 80, y: e.pos.y }, radius: 12, velocity: { x: Math.cos(angle + offset) * 8, y: Math.sin(angle + offset) * 8 }, damage: 10 * damageMult, lifeTime: 140, isEnemy: true, rotation: angle + offset, animFrame: 0 }); e.attackCooldown = 120; }
      } else if (e.type === 'tank') { vx = -e.speed; e.pos.y = CANVAS_HEIGHT - GROUND_HEIGHT - e.radius + 10; }
      else { const dx = player.pos.x - e.pos.x, dy = player.pos.y - e.pos.y; const angle = Math.atan2(e.type === 'fast' ? dy + player.velocity.y * 20 : dy, e.type === 'fast' ? dx + player.velocity.x * 20 : dx); vx = Math.cos(angle) * e.speed; vy = Math.sin(angle) * e.speed; enemiesRef.current.forEach(other => { if (e === other) return; const d = dist(e.pos, other.pos); if (d < e.radius + other.radius) { const pa = Math.atan2(e.pos.y - other.pos.y, e.pos.x - other.pos.x); vx += Math.cos(pa) * 0.5; vy += Math.sin(pa) * 0.5; } }); }
      e.pos.x += vx; e.pos.y += vy; if (e.hitFlashTimer > 0) e.hitFlashTimer--;
      if (checkCircleCollision(player, e)) { player.hp -= 0.5 * damageMult; screenShakeRef.current += 1; if (player.hp <= 0) { if (gameModeRef.current === 'ARCADE') endGame(); else if (matchStateRef.current.isRoundActive) handleShootoutRoundEnd('ENEMY'); } }
    });
    bulletsRef.current.forEach(b => {
      if (b.isEnemy) { if (checkCircleCollision({ pos: b.pos, radius: b.radius}, player)) { player.hp -= b.damage; screenShakeRef.current += 5; b.lifeTime = 0; if (player.hp <= 0) { if (gameModeRef.current === 'ARCADE') endGame(); else if (matchStateRef.current.isRoundActive) handleShootoutRoundEnd('ENEMY'); } } return; }
      enemiesRef.current.forEach(e => {
        if (dist(b.pos, e.pos) < b.radius + e.radius) {
           e.hp -= b.damage; e.hitFlashTimer = 4; b.lifeTime = 0; spawnParticle(b.pos, COLORS.BULLET, 4, 5);
           if (e.hp <= 0) {
             if (gameModeRef.current === 'SHOOTOUT') { if (enemyActiveIdxRef.current < enemyTeamRef.current.length - 1) { enemyActiveIdxRef.current++; const nextChar = enemyTeamRef.current[enemyActiveIdxRef.current]; e.bossVariant = nextChar; e.hp = teamHpsRef.current[`enemy_${nextChar}`] || (500 * getDifficultyMultiplier()); e.maxHp = 500 * getDifficultyMultiplier(); spawnFloatingText(e.pos, "NEXT CHALLENGER!", "#f00"); spawnParticle(e.pos, COLORS.ENEMY_BOSS, 30, 10, 8); } else { if (matchStateRef.current.isRoundActive) handleShootoutRoundEnd('PLAYER'); } } 
             else { player.score += e.value; if (Math.floor(player.score / 1000) > Math.floor(lastAaronScoreRef.current / 1000)) { triggerWhoopsie(); lastAaronScoreRef.current = player.score; } if (!player.isBlazin && player.blazinMeter < 100) { player.blazinMeter = Math.min(100, player.blazinMeter + (e.type === 'basic' ? 7 : 15)); if (player.blazinMeter >= 100) spawnFloatingText(player.pos, "BLAZIN READY!", "#f97316"); } screenShakeRef.current += e.type === 'boss' ? 30 : 5; spawnFloatingText(e.pos, `+${e.value}`, '#FFF'); if (e.type === 'boss') { bossActiveRef.current = false; spawnParticle(e.pos, COLORS.ENEMY_BOSS, 50, 10, 10); if (e.bossVariant && CHARACTERS[e.bossVariant]) { unlockCharacter(e.bossVariant); setTimeout(() => spawnFloatingText(player.pos, "NEW FIGHTER UNLOCKED!", "#00ff00"), 1000); } waveRef.current++; enemiesToSpawnRef.current = 6 + Math.floor(waveRef.current * 2); } else spawnParticle(e.pos, COLORS.ENEMY_BASIC, 12, 6, 8); spawnPowerup(e.pos); }
           }
        }
      });
    });
    enemiesRef.current = enemiesRef.current.filter(e => e.hp > 0);
    powerupsRef.current = powerupsRef.current.filter(p => { p.lifeTime--; if (p.lifeTime <= 0) return false; if (checkCircleCollision(player, p)) { spawnFloatingText(player.pos, p.type.replace('_', ' '), '#0f0'); if (powerupSfxRef.current) { powerupSfxRef.current.currentTime = 0; powerupSfxRef.current.play().catch(()=>{}); } if (p.type === PowerupType.HEAL) player.hp = Math.min(player.hp + 25, player.maxHp); else { player.activePowerup = p.type; player.powerupTime = GAME_CONFIG.POWERUP_DURATION; } return false; } return true; });
    particlesRef.current.forEach(pt => { pt.pos.x += pt.velocity.x; pt.pos.y += pt.velocity.y; pt.velocity.x *= 0.95; pt.velocity.y += 0.2; if (pt.pos.y > CANVAS_HEIGHT - GROUND_HEIGHT) { pt.pos.y = CANVAS_HEIGHT - GROUND_HEIGHT; pt.velocity.y *= -0.6; } pt.lifeTime--; pt.rotation += 0.1; });
    particlesRef.current = particlesRef.current.filter(p => p.lifeTime > 0);
    floatingTextsRef.current.forEach(t => { t.pos.x += t.velocity.x; t.pos.y += t.velocity.y; t.lifeTime--; });
    floatingTextsRef.current = floatingTextsRef.current.filter(t => t.lifeTime > 0);
    if (screenShakeRef.current > 0) screenShakeRef.current *= 0.9;
    if (frameRef.current % 5 === 0) syncUI();
  };

  const drawStreetBackground = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const img = images['BG_8MILE']; if (img?.complete && img.naturalWidth > 0) ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); else { ctx.fillStyle = '#1f2937'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    const grad = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 300, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 800); grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.7)'); ctx.fillStyle = grad; ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = 'rgba(200, 200, 200, 0.4)'; for(let i=0; i<60; i++) { const x = (Math.sin(i * 132.1) * CANVAS_WIDTH + frameRef.current * 1 + i * 50) % CANVAS_WIDTH, y = (i * 30 + frameRef.current * 2) % CANVAS_HEIGHT; ctx.beginPath(); ctx.arc((x + CANVAS_WIDTH) % CANVAS_WIDTH, y, Math.random() * 2 + 1, 0, Math.PI*2); ctx.fill(); }
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT; const floorGrad = ctx.createLinearGradient(0, groundY, 0, CANVAS_HEIGHT); floorGrad.addColorStop(0, 'rgba(20,20,20,0.8)'); floorGrad.addColorStop(1, 'rgba(10,10,10,1)'); ctx.fillStyle = floorGrad; ctx.fillRect(0, groundY, CANVAS_WIDTH, GROUND_HEIGHT);
  };

  const drawClubBackground = (ctx: CanvasRenderingContext2D) => {
    const t = frameRef.current, img = images['BG_CLUB'];
    if (img?.complete && img.naturalWidth > 0) { ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); ctx.fillStyle = '#240046'; ctx.globalAlpha = 0.3 * (0.9 + Math.sin(t * 0.15) * 0.1); ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT); ctx.globalAlpha = 1.0; }
    else { const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT); bgGrad.addColorStop(0, '#1a0033'); bgGrad.addColorStop(1, '#240046'); ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    ctx.save(); ctx.globalCompositeOperation = 'screen'; const laserColors = ['#d946ef', '#a855f7', '#0ea5e9']; 
    for (let i = 0; i < 6; i++) { const angle = Math.sin(t * 0.015 + i) * 0.9; ctx.save(); ctx.translate(CANVAS_WIDTH / 2, -50); ctx.rotate(angle); const lg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT * 1.8); lg.addColorStop(0, laserColors[i % laserColors.length]); lg.addColorStop(0.8, 'transparent'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.lineTo(40 * Math.sin(t * 0.05 + i), CANVAS_HEIGHT * 1.8); ctx.lineTo(-40 * Math.sin(t * 0.05 + i), CANVAS_HEIGHT * 1.8); ctx.fill(); ctx.restore(); }
    ctx.restore(); const groundY = CANVAS_HEIGHT - GROUND_HEIGHT; ctx.save(); ctx.beginPath(); ctx.rect(0, groundY, CANVAS_WIDTH, GROUND_HEIGHT); ctx.clip(); const tileW = 120, scroll = bgOffsetRef.current;
    for (let x = -CANVAS_WIDTH; x < CANVAS_WIDTH * 2; x += tileW) { const drawX = x - (scroll % tileW); ctx.strokeStyle = `rgba(168, 85, 247, 0.3)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(drawX, groundY); ctx.lineTo((drawX - CANVAS_WIDTH/2) * 4 + CANVAS_WIDTH/2, CANVAS_HEIGHT); ctx.stroke(); }
    ctx.restore();
  };

  const drawVillagesBackground = (ctx: CanvasRenderingContext2D) => {
    const img = images['BG_VILLAGES']; if (img?.complete && img.naturalWidth > 0) { ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); ctx.fillStyle = 'rgba(0, 0, 40, 0.2)'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    else { const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT); bgGrad.addColorStop(0, '#334155'); bgGrad.addColorStop(1, '#0f172a'); ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT; ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; ctx.lineWidth = 2; for(let i=0; i<12; i++) { const x = (i * 120 - (bgOffsetRef.current % 120)); ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo((x - CANVAS_WIDTH/2) * 6 + CANVAS_WIDTH/2, CANVAS_HEIGHT); ctx.stroke(); }
    const floorGrad = ctx.createLinearGradient(0, groundY, 0, CANVAS_HEIGHT); floorGrad.addColorStop(0, '#1e293b'); floorGrad.addColorStop(1, '#020617'); ctx.fillStyle = floorGrad; ctx.fillRect(0, groundY, CANVAS_WIDTH, GROUND_HEIGHT);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (selectedStageRef.current === 'CLUB') drawClubBackground(ctx); else if (selectedStageRef.current === 'VILLAGES') drawVillagesBackground(ctx); else drawStreetBackground(ctx);
    if (gameStateRef.current === GameState.MENU || gameStateRef.current === GameState.CHARACTER_SELECT || gameStateRef.current === GameState.OPPONENT_SELECT || gameStateRef.current === GameState.STAGE_SELECT) { ctx.fillStyle = 'rgba(0, 0, 20, 0.85)'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); ctx.fillStyle = '#ffffff'; menuStarsRef.current.forEach(star => { ctx.globalAlpha = 0.3 + Math.random() * 0.4; ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1.0; return; }
    ctx.save(); ctx.translate((Math.random() - 0.5) * screenShakeRef.current, (Math.random() - 0.5) * screenShakeRef.current);
    const drawSprite = (pos: Point, rad: number, imgKey: string | undefined, fbCol: string, rot: number = 0, sx: number = 1, isHit: boolean = false) => {
      ctx.save(); ctx.translate(pos.x, pos.y + rad * 1.4); ctx.scale(1, 0.4); ctx.beginPath(); ctx.arc(0, 0, rad * 0.9, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill(); ctx.restore(); 
      ctx.save(); ctx.translate(pos.x, pos.y); ctx.scale(sx, 1); const s = rad * 3.4; if (isHit) ctx.filter = 'brightness(500%) sepia(100%) hue-rotate(-50deg)';
      if (imgKey && images[imgKey]?.complete && images[imgKey].naturalWidth > 0) ctx.drawImage(images[imgKey], -s/2, -s/2, s, s); else { ctx.fillStyle = fbCol; ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    };
    powerupsRef.current.forEach(p => drawSprite({x: p.pos.x, y: p.pos.y + Math.sin(frameRef.current * 0.1) * 8}, p.radius, `POWERUP_${p.type}`, '#fff'));
    const p = playerRef.current; const visualPos = { x: p.pos.x - Math.cos(p.rotation) * p.recoil, y: p.pos.y - Math.sin(p.rotation) * p.recoil };
    if (p.isBlazin) { 
        const t = frameRef.current, pulse = 1 + Math.sin(t * 0.15) * 0.15, opacity = 0.5 + Math.sin(t * 0.1) * 0.2;
        ctx.save(); ctx.translate(visualPos.x, visualPos.y); ctx.beginPath(); ctx.arc(0, 0, p.radius * 2.2 * pulse, 0, Math.PI * 2); const g = ctx.createRadialGradient(0,0, p.radius * 0.5, 0,0, p.radius * 2.2 * pulse); g.addColorStop(0, `rgba(249, 115, 22, ${opacity})`); g.addColorStop(1, 'rgba(249, 115, 22, 0)'); ctx.fillStyle = g; ctx.fill(); ctx.restore(); 
    }
    const charConfig = CHARACTERS[p.characterId] || CHARACTERS['default']; drawSprite(visualPos, p.radius, charConfig.img, charConfig.color, 0, mouseRef.current.x > p.pos.x ? 1 : -1);
    ctx.save(); ctx.translate(visualPos.x, visualPos.y + 10); ctx.rotate(p.rotation);
    if (p.muzzleFlash > 0) { ctx.fillStyle = p.isBlazin ? "#f97316" : COLORS.MUZZLE_FLASH; ctx.beginPath(); const md = p.radius * 1.1, spikes = 8, out = 30 + Math.random() * 10; for(let i=0; i<spikes*2; i++){ const r = (i % 2 === 0) ? out : 15, a = (i / (spikes*2)) * Math.PI * 2; const x = md + Math.cos(a) * r, y = Math.sin(a) * r; if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.closePath(); ctx.fill(); } ctx.restore();
    enemiesRef.current.forEach(e => {
       let key = e.type === 'fast' ? 'ENEMY_FAST_IMG' : (e.type === 'tank' ? 'ENEMY_TANK_IMG' : 'ENEMY_BASIC_IMG');
       if ((e.type === 'boss' || e.type === 'rival') && e.bossVariant) key = CHARACTERS[e.bossVariant]?.img || 'ENEMY_BOSS_IMG';
       drawSprite(e.pos, e.radius, key, (e.type === 'boss' || e.type === 'rival') ? COLORS.ENEMY_BOSS : COLORS.ENEMY_BASIC, 0, e.pos.x < p.pos.x ? 1 : -1, e.hitFlashTimer > 0);
       if (e.type === 'tank' && e.hp > 0) { ctx.fillStyle = '#333'; ctx.fillRect(e.pos.x - 30, e.pos.y - e.radius - 20, 60, 8); ctx.fillStyle = '#ef4444'; ctx.fillRect(e.pos.x - 29, e.pos.y - e.radius - 19, 58 * Math.max(0, e.hp / (150 * (1 + waveRef.current * 0.15))), 6); }
    });
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.shadowBlur = 15; ctx.shadowColor = COLORS.BULLET;
    bulletsRef.current.forEach(b => {
      ctx.save(); ctx.translate(b.pos.x, b.pos.y); ctx.rotate(b.rotation); const bulletImgKey = b.spriteKey || 'BULLET_IMG';
      if (images[bulletImgKey]?.complete && images[bulletImgKey].naturalWidth > 0) { const bw = b.radius * 4, bh = b.radius * 4; ctx.drawImage(images[bulletImgKey], -bw/2, -bh/2, bw, bh); }
      else { ctx.fillStyle = b.isEnemy ? '#ff3333' : COLORS.BULLET; ctx.beginPath(); ctx.ellipse(0, 0, b.radius * 2, b.radius * 0.8, 0, 0, Math.PI*2); ctx.fill(); } ctx.restore();
    }); ctx.restore();
    particlesRef.current.forEach(pt => { ctx.save(); ctx.translate(pt.pos.x, pt.pos.y); ctx.rotate(pt.rotation); ctx.fillStyle = pt.color; ctx.globalAlpha = pt.lifeTime / pt.maxLife; ctx.fillRect(-pt.size, -pt.size, pt.size*2, pt.size*2); ctx.restore(); });
    ctx.globalAlpha = 1.0; ctx.font = "bold 30px 'Teko'"; ctx.textAlign = "center"; ctx.strokeStyle = "black"; ctx.lineWidth = 4;
    floatingTextsRef.current.forEach(t => { ctx.strokeText(t.text, t.pos.x, t.pos.y); ctx.fillStyle = t.color; ctx.fillText(t.text, t.pos.x, t.pos.y); });
    ctx.restore();
    if (gameStateRef.current === GameState.PLAYING) {
      ctx.save(); ctx.translate(mouseRef.current.x, mouseRef.current.y); ctx.strokeStyle = "#ff0000"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.moveTo(-25, 0); ctx.lineTo(25, 0); ctx.moveTo(0, -25); ctx.lineTo(0, 25); ctx.stroke(); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI*2); ctx.fill(); ctx.restore();
    }
  };

  const loop = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    if (gameStateRef.current !== GameState.PAUSED) update();
    draw(ctx); requestRef.current = requestAnimationFrame(loop);
  }, []); 

  useEffect(() => { requestRef.current = requestAnimationFrame(loop); return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); }; }, [loop]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.shiftKey && (e.key === 'c' || e.key === 'C')) { activateCheatBox(); return; }
          if (showCheatBox) handleCheatInput(e.key);
      };
      window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCheatBox, exploded, activateCheatBox, handleCheatInput]); 

  useEffect(() => {
    const handleKey = (e: KeyboardEvent, isDown: boolean) => {
      const keyName = e.key;
      keysRef.current[keyName] = isDown; keysRef.current[keyName.toLowerCase()] = isDown; keysRef.current[e.code] = isDown; keysRef.current[e.code.toLowerCase()] = isDown;
      if (isDown) { 
          if (keyName === 'Escape') { if (gameStateRef.current === GameState.PLAYING) { gameStateRef.current = GameState.PAUSED; syncUI(); } else if (gameStateRef.current === GameState.PAUSED) { gameStateRef.current = GameState.PLAYING; syncUI(); } } 
          if (keyName.toLowerCase() === 'r') if (gameStateRef.current === GameState.GAME_OVER || gameStateRef.current === GameState.VICTORY) startGame(); 
      }
    };
    const onMove = (e: MouseEvent) => { const c = canvasRef.current; if (!c) return; const r = c.getBoundingClientRect(); mouseRef.current = { x: (e.clientX - r.left) * (CANVAS_WIDTH / r.width), y: (e.clientY - r.top) * (CANVAS_HEIGHT / r.height) }; };
    window.addEventListener('keydown', (e) => handleKey(e, true)); window.addEventListener('keyup', (e) => handleKey(e, false)); window.addEventListener('mousemove', onMove); window.addEventListener('mousedown', () => mousePressedRef.current = true); window.addEventListener('mouseup', () => mousePressedRef.current = false);
    return () => { window.removeEventListener('keydown', (e) => handleKey(e, true)); window.removeEventListener('keyup', (e) => handleKey(e, false)); window.removeEventListener('mousemove', onMove); window.removeEventListener('mousedown', () => mousePressedRef.current = true); window.removeEventListener('mouseup', () => mousePressedRef.current = false); };
  }, [syncUI]);

  const selectedCharConfig = CHARACTERS[selectedCharacter] || CHARACTERS['default'];

  return (
    <div ref={containerRef} className="relative w-full aspect-video md:max-w-7xl md:rounded-xl overflow-hidden shadow-2xl ring-0 md:ring-4 ring-orange-500/50 bg-black select-none">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain cursor-none select-none" />
      {isLoading && ( <div className="absolute inset-0 bg-black z-[100] flex flex-col items-center justify-center"> <img src={ASSETS.LOADING_ICON} alt="Loading..." className="w-72 h-72 animate-[spin_3s_linear_infinite] mb-8" /> <div className="text-white font-['Teko'] text-4xl tracking-widest animate-pulse">LOADING ASSETS...</div> </div> )}
      {isWiping && ( <div className="absolute inset-0 bg-red-950 z-[300] flex flex-col items-center justify-center animate-pulse text-center p-8"> <div className="text-white font-['Teko'] text-6xl md:text-9xl tracking-[0.2em] font-black italic">FACTORY RESETTING...</div> <div className="mt-4 text-red-500 font-mono animate-bounce uppercase">Cleaning Reputation Data</div> </div> )}
      <div className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]"></div>
      <div className={`absolute bottom-0 right-0 z-[100] transition-all duration-500 transform pointer-events-none select-none ${whoopsieActive ? 'translate-x-0 translate-y-0 rotate-[-10deg]' : 'translate-x-full translate-y-full'}`}> <img src={ASSETS.AARON_WHOOPSIE} alt="AARON" className="w-48 md:w-80 h-auto animate-bounce drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] brightness-110" /> </div>

      {showResetConfirm && (
        <div className="absolute inset-0 z-[250] bg-black/95 flex items-center justify-center backdrop-blur-xl">
            <div className="max-w-xl w-full p-12 bg-neutral-900 border-4 border-red-600 shadow-[0_0_50px_red] text-center">
                <h2 className="text-6xl text-white font-black italic mb-4 font-['Teko'] tracking-widest uppercase">Wipe All Data?</h2>
                <p className="text-gray-400 text-2xl font-['Teko'] mb-12 tracking-wide uppercase">This will erase all characters, DLC progress, and reputation. You will start from absolute zero.</p>
                <div className="flex flex-col gap-4">
                    <button onClick={() => { setShowResetConfirm(false); resetGameToFactory(); }} className="py-4 bg-red-600 hover:bg-red-500 text-white font-black text-4xl font-['Teko'] uppercase transform skew-x-[-12deg] transition-all border-4 border-white shadow-lg">Yes, Nuke It All</button>
                    <button onClick={() => setShowResetConfirm(false)} className="py-4 bg-transparent border-2 border-gray-600 text-gray-400 hover:text-white hover:border-white font-black text-3xl font-['Teko'] uppercase transition-all">Abort Mission</button>
                </div>
            </div>
        </div>
      )}

      {showCheatBox && ( 
        <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/60 backdrop-blur-sm pointer-events-auto"> 
          <div className={`relative w-[300px] md:w-[450px] transition-all duration-500 ${exploded ? 'scale-[2] opacity-0 blur-xl' : 'scale-100 opacity-100'}`}>
            <img src={ASSETS.CELL_PHONE} alt="Phone" className="w-full h-auto drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]" />
            <div className="absolute top-[12%] left-[10%] right-[10%] bottom-[12%] overflow-hidden flex flex-col items-center justify-center">
               <div className="relative z-20 flex flex-col items-center text-center p-4 w-full">
                  <div className="text-red-500 font-mono font-black text-7xl md:text-9xl leading-none drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]"> 0:{cheatTimer.toString().padStart(2, '0')} </div>
               </div>
            </div>
          </div>
        </div> 
      )}

      {showWarning && ( <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50 overflow-hidden bg-black/60 text-center"> <div className="absolute inset-x-0 h-32 bg-[repeating-linear-gradient(45deg,#000,#000_20px,#eab308_20px,#eab308_40px)] opacity-80 animate-[pulse_0.2s_infinite]"></div> <div className="absolute inset-x-0 h-24 bg-black flex items-center justify-center border-y-4 border-red-600 shadow-[0_0_50px_red]"> <h2 className="text-[8vw] font-['Teko'] text-white tracking-[0.2em] font-black italic drop-shadow-[0_5px_0_rgba(255,0,0,1)] animate-bounce uppercase"> WARNING </h2> </div> <div className="relative z-10 mt-64 bg-red-900/90 text-white px-12 md:px-24 py-4 md:py-6 transform -skew-x-12 border-4 border-white shadow-[0_0_50px_rgba(255,0,0,0.8)]"> <p className="text-3xl md:text-7xl font-bold tracking-[0.1em] transform skew-x-12 whitespace-nowrap uppercase font-['Teko']"> {warningText} </p> </div> </div> )}
      {exploded && ( <div className="absolute inset-0 bg-white z-[200] animate-[ping_0.2s_ease-out]"></div> )}
      
      {uiState.gameState === GameState.PAUSED && (
        <div className="absolute inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center backdrop-blur-md pointer-events-auto">
             <div className="w-full max-w-2xl p-12 bg-zinc-950 border-y-8 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)] flex flex-col gap-6 transform rotate-1">
                <h2 className="text-8xl text-white font-black italic text-center mb-4 font-['Teko'] tracking-widest uppercase">Paused</h2>
                <button onClick={() => { gameStateRef.current = GameState.PLAYING; syncUI(); }} className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-5xl font-['Teko'] tracking-widest uppercase transition-all shadow-[0_5px_0_#ca8a04] active:translate-y-1 active:shadow-none">Resume Fight</button>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowOptions(true)} className="py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-2xl font-['Teko'] tracking-widest uppercase border-2 border-neutral-700 transition-all">Options</button>
                    <button onClick={handleBackToGameMenu} className="py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-2xl font-['Teko'] tracking-widest uppercase border-2 border-neutral-700 transition-all">Back to Game Menu</button>
                </div>
                <button onClick={handleExitToWeb} className="w-full mt-4 py-4 bg-red-900/20 border-4 border-red-600 text-red-500 hover:bg-red-600 hover:text-white font-black text-4xl font-['Teko'] tracking-widest uppercase transition-all transform -skew-x-6">Back to Homepage</button>
             </div>
        </div>
      )}

      {showOptions && ( <div className="absolute inset-0 z-[210] bg-black/95 flex flex-col items-center justify-center backdrop-blur-md pointer-events-auto"> <div className="w-full max-w-2xl p-8 border-y-8 border-yellow-500 bg-neutral-900/50 text-center"> <h2 className="text-6xl text-white font-black italic mb-8 font-['Teko'] tracking-widest uppercase">Options</h2> <div className="space-y-8"> <div className="flex flex-col gap-2"> <label className="text-yellow-500 text-2xl font-bold font-['Teko'] tracking-widest uppercase">Difficulty Level</label> <div className="flex gap-4"> {['EASY', 'NORMAL', 'HARD'].map((level) => ( <button key={level} onClick={() => setDifficulty(level as any)} className={`flex-1 py-3 text-2xl font-bold font-['Teko'] border-2 transition-all ${difficulty === level ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-transparent text-gray-400 border-gray-600 hover:border-white hover:text-white'}`} > {level} </button> ))} </div> </div> <div className="flex justify-between items-center border-b border-gray-700 pb-4"> <label className="text-yellow-500 text-2xl font-bold font-['Teko'] tracking-widest uppercase">Sound & Music</label> <button onClick={() => setIsMuted(!isMuted)} className={`px-8 py-2 text-2xl font-bold font-['Teko'] border-2 ${!isMuted ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600'}`} > {isMuted ? 'OFF' : 'ON'} </button> </div> </div> <button onClick={() => setShowOptions(false)} className="w-full mt-12 py-4 bg-white text-black font-black text-3xl font-['Teko'] hover:bg-gray-200 tracking-widest uppercase" > Back </button> </div> </div> )}
      {uiState.gameState === GameState.MENU && !isLoading && ( <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90"> <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/bc3973321c1b0212f48c7e0bdddd040d78a16470/192010802.jpg')] bg-cover bg-center"></div> <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-sm"></div> <div className="relative z-10 bg-black/80 p-8 md:p-12 border-y-8 border-yellow-500 w-full text-center mb-8 md:mb-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] transform -skew-y-2"> <h1 className="text-7xl md:text-[10rem] text-white font-['Teko'] italic font-black tracking-tighter drop-shadow-[10px_10px_0_#b45309] leading-none transform skew-y-2 uppercase"> Select <span className="text-yellow-500">Mode</span> </h1> </div> <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center"> <button onClick={() => handleModeSelect('ARCADE')} className="group relative bg-neutral-900 border-4 border-gray-600 p-8 md:p-10 w-80 md:w-96 hover:bg-yellow-600 hover:border-white transition-all transform hover:scale-110 hover:-rotate-2 shadow-[20px_20px_0_rgba(0,0,0,0.5)] overflow-hidden" > <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div> <h2 className="text-6xl md:text-7xl text-white font-black italic mb-2 font-['Teko'] drop-shadow-lg uppercase text-center">Arcade</h2> <p className="text-gray-400 text-xl md:text-2xl font-bold group-hover:text-black font-['Teko'] tracking-widest uppercase text-center">Survive The Waves</p> </button> <button onClick={() => handleModeSelect('SHOOTOUT')} className="group relative bg-neutral-900 border-4 border-gray-600 p-8 md:p-10 w-80 md:w-96 hover:bg-red-600 hover:border-white transition-all transform hover:scale-110 hover:rotate-2 shadow-[20px_20px_0_rgba(0,0,0,0.5)] overflow-hidden" > <div className="absolute inset-0 bg-gradient-to-bl from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div> <h2 className="text-6xl md:text-7xl text-white font-black italic mb-2 font-['Teko'] drop-shadow-lg uppercase text-center">Shootout</h2> <p className="text-gray-400 text-xl md:text-2xl font-bold group-hover:text-black font-['Teko'] tracking-widest uppercase text-center">Choose Your Battle</p> </button> </div> <div className="relative z-10 mt-12 flex gap-6"> <button onClick={() => setShowOptions(true)} className="text-gray-400 hover:text-white font-bold text-3xl font-['Teko'] tracking-widest flex items-center gap-2 px-6 py-2 border-2 border-transparent hover:border-white/50 rounded-full transition-all uppercase">⚙ Options</button> <button onClick={handleExitToWeb} className="text-gray-400 hover:text-red-500 font-bold text-3xl font-['Teko'] tracking-widest flex items-center gap-2 px-6 py-2 border-2 border-transparent hover:border-red-500/50 rounded-full transition-all uppercase">Exit To Web</button> </div> <p className="absolute bottom-10 text-gray-700 tracking-[0.6em] text-4xl font-bold uppercase">Music Money Game$</p> </div> )}
      {uiState.gameState === GameState.CHARACTER_SELECT && ( 
        <div className="absolute inset-0 z-[60] bg-zinc-900 flex flex-col md:flex-row overflow-hidden"> 
          <div className="w-full md:w-1/2 p-6 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] border-r-4 border-yellow-500 shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-10"> 
            <div className="flex justify-between items-center mb-4 shrink-0 border-b-2 border-white/10 pb-4"> <h2 className="text-6xl text-white font-black italic tracking-tighter font-['Teko'] uppercase">Your <span className="text-yellow-500">Team</span></h2> <button onClick={() => { gameStateRef.current = GameState.MENU; syncUI(); }} className="text-gray-400 hover:text-white font-bold text-2xl font-['Teko'] uppercase">BACK</button> </div> 
            {uiState.gameMode === 'SHOOTOUT' && ( <div className="flex gap-4 mb-6"> {[1, 2, 3].map(size => ( <button key={size} onClick={() => {setTeamSize(size); setSelectedPlayerTeam([]);}} className={`flex-1 py-2 font-bold text-2xl font-['Teko'] border-2 transition-all ${teamSize === size ? 'bg-yellow-500 text-black border-yellow-500' : 'text-gray-500 border-gray-700 hover:border-white'}`}> {size}v{size} </button> ))} </div> )}
            <div className="flex-1 overflow-y-auto pr-2"> <div className="grid grid-cols-3 sm:grid-cols-4 gap-3"> {Object.entries(CHARACTERS).map(([key, char]) => { const locked = (char.dlcPack === 1 && !dlc1Installed) || (char.dlcPack === 2 && !dlc2Installed) || (char.dlcPack === 3 && !dlc3Installed) || (!char.dlcPack && !unlockedCharacters.includes(key)); const selected = selectedPlayerTeam.includes(key); return ( <button key={key} onClick={() => { if (!locked) togglePlayerSelect(key); }} className={` relative aspect-square border-4 transition-all overflow-hidden group ${selected ? 'border-yellow-500 shadow-[0_0_20px_#eab308] scale-105 z-10 brightness-100' : 'border-neutral-700 hover:border-white/50 brightness-75 hover:brightness-100'} ${locked ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'} `} > <img src={ASSETS[char.profileImg as keyof typeof ASSETS]} alt={char.name} className="w-full h-full object-cover" /> {locked && ( <div className="absolute inset-0 flex items-center justify-center bg-black/80"> <span className="text-3xl">🔒</span> </div> )} {selected && ( <div className="absolute top-1 right-1 bg-yellow-500 text-black w-6 h-6 flex items-center justify-center font-bold rounded-full border border-black text-xs">{selectedPlayerTeam.indexOf(key) + 1}</div> )} </button> ); })} </div> </div> 
            <div className="mt-4 pt-4 border-t border-white/10"> <button disabled={selectedPlayerTeam.length === 0} onClick={confirmPlayerTeam} className={`w-full py-4 text-black font-black text-4xl uppercase tracking-widest font-['Teko'] transition-all ${selectedPlayerTeam.length > 0 ? 'bg-yellow-500 hover:bg-yellow-400 shadow-xl' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`} > Confirm {uiState.gameMode === 'SHOOTOUT' ? `Team (${selectedPlayerTeam.length}/${teamSize})` : 'Fighter'} </button> </div> 
          </div> 
          <div className="hidden md:flex w-1/2 relative flex-col bg-black overflow-hidden"> <div className="absolute inset-0"> <img src={ASSETS[selectedCharConfig.profileImg as keyof typeof ASSETS]} className="w-full h-full object-cover opacity-50 contrast-125" alt="Preview" /> <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div> </div> <div className="relative z-10 mt-auto p-12 flex flex-col items-start space-y-4"> <h1 className="text-9xl text-white font-black italic tracking-tighter leading-none drop-shadow-[5px_5px_0_#000] font-['Teko'] uppercase"> {selectedCharConfig.name} </h1> <div className="text-3xl text-black bg-yellow-500 font-bold tracking-[0.2em] px-6 py-2 transform -skew-x-12 font-['Teko'] border-2 border-white shadow-lg uppercase"> {selectedCharConfig.hometown} </div> <div className="w-full bg-black/60 border-l-8 border-red-600 p-6 backdrop-blur-md mt-8"> <div className="grid grid-cols-1 gap-y-2 text-gray-300 text-2xl font-['Teko'] uppercase"> <div className="mt-2"> <span className="text-red-500 text-lg block tracking-widest uppercase">Signature Weapon</span> <span className="text-white text-5xl font-bold tracking-tighter uppercase">{selectedCharConfig.weapon}</span> </div> </div> </div> </div> </div> 
        </div> 
      )}
      {uiState.gameState === GameState.OPPONENT_SELECT && ( 
        <div className="absolute inset-0 z-[60] bg-zinc-900 flex flex-col md:flex-row overflow-hidden"> 
          <div className="w-full md:w-1/2 p-6 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] border-r-4 border-red-600 shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-10"> 
            <div className="flex justify-between items-center mb-6 shrink-0 border-b-2 border-white/10 pb-4"> <h2 className="text-6xl text-white font-black italic tracking-tighter font-['Teko'] uppercase">Opponent <span className="text-red-600">Team</span></h2> <button onClick={() => { gameStateRef.current = GameState.CHARACTER_SELECT; syncUI(); }} className="text-gray-400 hover:text-white font-bold text-2xl font-['Teko'] uppercase">BACK</button> </div> 
            <div className="flex-1 overflow-y-auto pr-2"> <div className="grid grid-cols-3 sm:grid-cols-4 gap-3"> {Object.entries(CHARACTERS).map(([key, char]) => { const selected = selectedOpponentTeam.includes(key); return ( <button key={key} onClick={() => toggleOpponentSelect(key)} className={` relative aspect-square border-4 transition-all overflow-hidden group ${selected ? 'border-red-600 shadow-[0_0_20px_#dc2626] scale-105 z-10 brightness-100' : 'border-neutral-700 hover:border-white/50 brightness-75 hover:brightness-100'}`} > <img src={ASSETS[char.profileImg as keyof typeof ASSETS]} alt={char.name} className="w-full h-full object-cover" /> {selected && ( <div className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 flex items-center justify-center font-bold rounded-full border border-black text-xs">{selectedOpponentTeam.indexOf(key) + 1}</div> )} </button> ); })} </div> </div> 
            <div className="mt-4 pt-4 border-t border-white/10"> <button disabled={selectedOpponentTeam.length !== teamSize} onClick={confirmOpponentTeam} className={`w-full py-4 text-white font-black text-4xl uppercase tracking-widest font-['Teko'] transition-all ${selectedOpponentTeam.length === teamSize ? 'bg-red-600 hover:bg-red-500 shadow-xl scale-105' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`} > Ready Up ({selectedOpponentTeam.length}/{teamSize}) </button> </div> 
          </div> 
          <div className="hidden md:flex w-1/2 relative flex-col bg-black overflow-hidden"> <div className="absolute inset-0"> <img src={ASSETS[selectedCharConfig.profileImg as keyof typeof ASSETS]} className="w-full h-full object-cover opacity-50 contrast-125" alt="Preview" /> <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div> </div> <div className="relative z-10 mt-auto p-12 flex flex-col items-start space-y-4"> <h1 className="text-9xl text-white font-black italic tracking-tighter leading-none drop-shadow-[5px_5px_0_#000] font-['Teko'] uppercase"> {selectedCharConfig.name} </h1> <div className="text-3xl text-white bg-red-600 font-bold tracking-[0.2em] px-6 py-2 transform -skew-x-12 font-['Teko'] border-2 border-white shadow-lg uppercase"> {selectedCharConfig.hometown} </div> </div> </div> 
        </div> 
      )}
      {uiState.gameState === GameState.STAGE_SELECT && ( <div className="absolute inset-0 z-[60] bg-neutral-900 flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"> <h2 className="text-7xl md:text-[9xl] text-white font-black italic mb-12 font-['Teko'] drop-shadow-xl uppercase">Where we <span className="text-red-600">Brawlin?</span></h2> <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl"> {Object.values(ARENAS).map((arena) => { const isLocked = arena.dlcPack === 3 && !dlc3Installed; return ( <button key={arena.id} onClick={() => { if (!isLocked) setSelectedStage(arena.id as keyof typeof ARENAS); }} className={` group relative flex-1 h-96 border-8 transition-all duration-300 overflow-hidden transform hover:-translate-y-4 ${selectedStage === arena.id ? 'border-yellow-500 scale-105 z-10 shadow-[0_0_50px_rgba(234,179,8,0.5)]' : 'border-neutral-700 hover:border-white/50 opacity-60 hover:opacity-100'} ${isLocked ? 'grayscale opacity-50' : ''} `} > <div className="absolute inset-0" style={{ backgroundColor: arena.id === 'CLUB' ? '#300' : arena.id === 'VILLAGES' ? '#052e16' : '#111' }}> {arena.id === 'VILLAGES' && images['BG_VILLAGES']?.complete && ( <img src={ASSETS.BG_VILLAGES} className="w-full h-full object-cover opacity-40" alt="Villages" /> )} </div> <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center"> <h3 className="text-6xl text-white font-black italic font-['Teko'] mb-4 drop-shadow-md uppercase">{arena.name}</h3> <div className="bg-white text-black px-6 py-2 font-bold text-2xl tracking-widest font-['Teko'] mb-6 transform -skew-x-12 border-2 border-black uppercase"> {arena.sub} </div> <p className="text-gray-200 font-['Teko'] text-2xl tracking-wide bg-black/50 px-4 py-1 uppercase">{arena.desc}</p> {isLocked && ( <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 uppercase"> <span className="text-6xl mb-2">🔒</span> <span className="text-white font-black text-3xl font-['Teko']">DLC Required</span> </div> )} </div> </button> ); })} </div> <div className="flex gap-8 mt-16"> <button onClick={() => { gameStateRef.current = uiState.gameMode === 'SHOOTOUT' ? GameState.OPPONENT_SELECT : GameState.CHARACTER_SELECT; syncUI(); }} className="px-10 py-4 bg-transparent border-2 border-gray-600 text-gray-400 font-bold text-3xl font-['Teko'] uppercase hover:border-white hover:text-white transition-all" > BACK </button> <button onClick={() => startGame(true)} className="px-16 py-6 bg-red-600 text-white font-black text-6xl uppercase tracking-widest font-['Teko'] hover:bg-red-500 shadow-[0_0_50px_red] transform skew-x-[-12deg] hover:scale-110 transition-all border-4 border-white" > <span className="block transform skew-x-[12deg] font-['Teko'] uppercase">Start Match</span> </button> </div> </div> )}
      {uiState.gameState === GameState.PLAYING && ( <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between"> <div className="flex justify-between items-start"> <div className="flex flex-col items-start bg-black/50 p-2 border-l-4 border-yellow-500 skew-x-[-10deg]"> <div className="text-yellow-500 font-black text-4xl font-['Teko'] drop-shadow-md leading-none skew-x-[10deg] uppercase">{uiState.score.toLocaleString()}</div> <div className="text-white font-['Teko'] text-xl tracking-widest skew-x-[10deg] uppercase">Wave {uiState.wave}</div> </div> {uiState.bossHp > 0 && ( <div className="w-80"> <div className="flex items-center justify-end gap-2 mb-1"> {uiState.opponentTeam.map((char, i) => ( <div key={i} className={`w-6 h-6 border ${i < uiState.enemyActiveIdx ? 'bg-black opacity-30' : (i === uiState.enemyActiveIdx ? 'bg-red-600 border-white' : 'bg-red-900 border-red-700')}`} /> ))} <div className="text-right text-red-500 font-bold font-['Teko'] text-2xl drop-shadow-md uppercase">{uiState.bossName}</div> </div> <div className="w-full bg-gray-900 border-2 border-red-500 h-6 relative skew-x-[10deg]"> <div className="h-full bg-red-600 transition-all duration-200" style={{ width: `${Math.max(0, (uiState.bossHp / uiState.bossMaxHp) * 100)}%` }} ></div> </div> </div> )} </div> <div className="flex justify-between items-end w-full"> <div className="flex items-end gap-4 pointer-events-auto"> <div className="relative group"> <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-white bg-black overflow-hidden shadow-lg relative z-10"> <img src={ASSETS[CHARACTERS[uiState.playerTeam[uiState.playerActiveIdx]]?.profileImg as keyof typeof ASSETS] || ASSETS.PROFILE_DKAY} className="w-full h-full object-cover" alt="Player" /> </div> {uiState.isBlazin && <div className="absolute inset-0 border-4 border-orange-500 animate-pulse z-20"></div>} </div> <div className="flex flex-col gap-1 pb-1"> <div className="flex items-center gap-2"> <div className="text-white font-bold font-['Teko'] text-2xl md:text-4xl leading-none uppercase tracking-wide drop-shadow-md uppercase"> {CHARACTERS[uiState.playerTeam[uiState.playerActiveIdx]]?.name} </div> {uiState.playerTeam.length > 1 && ( <div className="flex gap-1 ml-2"> {uiState.playerTeam.map((_, i) => ( <div key={i} className={`w-4 h-4 rounded-full border ${i === uiState.playerActiveIdx ? 'bg-yellow-500 border-white' : 'bg-gray-800 border-gray-600'}`} /> ))} </div> )} </div> <div className="w-48 md:w-64 bg-gray-900 border-2 border-white h-6 relative skew-x-[-10deg]"> <div className={`h-full transition-all duration-200 ${uiState.hp < 30 ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`} style={{ width: `${Math.max(0, (uiState.hp / uiState.maxHp) * 100)}%` }} ></div> </div> <div className="w-48 md:w-64 h-4 bg-gray-900 border-2 border-orange-500/50 relative skew-x-[-10deg] mt-1"> <div className={`h-full transition-all duration-200 ${uiState.isBlazin ? 'bg-white animate-[pulse_0.1s_infinite]' : 'bg-orange-500'}`} style={{ width: `${Math.min(100, uiState.blazinMeter)}%` }} ></div> {!uiState.isBlazin && uiState.blazinMeter >= 100 && ( <div className="absolute top-[-2rem] left-0 right-0 text-orange-500 font-bold font-['Teko'] text-xl animate-bounce skew-x-[10deg] uppercase"> Press Shift! </div> )} {uiState.gameMode === 'SHOOTOUT' && uiState.playerTeam.length > 1 && ( <div className="absolute top-4 left-0 right-0 text-white font-bold font-['Teko'] text-sm tracking-widest opacity-50 skew-x-[10deg] uppercase">Shift+T To Swap</div> )} </div> </div> </div> </div> </div> )}
      {(uiState.gameState === GameState.GAME_OVER || uiState.gameState === GameState.VICTORY) && ( <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 pointer-events-auto"> <h1 className={`text-9xl font-black italic font-['Teko'] mb-4 ${uiState.gameState === GameState.VICTORY ? 'text-yellow-500' : 'text-red-600'} uppercase`}> {uiState.gameState === GameState.VICTORY ? 'Victory' : 'Wasted'} </h1> <div className="text-white text-3xl font-['Teko'] mb-8 uppercase">Score: {uiState.score}</div> <div className="flex gap-4"> <button onClick={handleBackToGameMenu} className="px-8 py-3 border-2 border-white text-white font-bold text-2xl hover:bg-white hover:text-black font-['Teko'] uppercase"> Main Menu </button> <button onClick={() => startGame(true)} className="px-8 py-3 bg-red-600 text-white font-bold text-2xl hover:bg-red-500 font-['Teko'] uppercase"> Retry </button> </div> </div> )}
    </div>
  );
};
