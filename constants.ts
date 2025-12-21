
// --- CONFIGURATION ---
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const GROUND_HEIGHT = 120; // Increased for parallax dunes

export const SAVE_VERSION = '1.1'; // Current data schema version

export const GAME_CONFIG = {
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 6,
  BULLET_SPEED: 18,
  BULLET_DAMAGE: 20,
  FIRE_RATE_DEFAULT: 12,
  FIRE_RATE_RAPID: 4,
  POWERUP_DROP_CHANCE: 0.15,
  POWERUP_DURATION: 500,
  WAVE_DELAY: 180
};

export const COLORS = {
  MUZZLE_FLASH: '#fbbf24',
  BULLET: '#fbbf24',
  ENEMY_BASIC: '#9ca3af',
  ENEMY_BOSS: '#ef4444'
};

// --- ASSET HOOKS ---
const RAW_ASSETS_BASE = "https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/main";
const PUBLIC_ASSETS_BASE = "https://raw.githubusercontent.com/mikeyspinz-beep/public-assets/main";

export const ASSETS = {
  // New Rebrand Assets
  LOGO: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/48209781687557a672c8355f4b3891b64e32cda4/Logo.png`,
  SITE_BG: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/bc3973321c1b0212f48c7e0bdddd040d78a16470/192010802.jpg`,
  SITE_BANNER: `${RAW_ASSETS_BASE}/BANNER_1920x1080.png`,
  SITE_POSTER: `${RAW_ASSETS_BASE}/NEW%20POSTER.jpg`,
  PROFILE_DK_REAL: `${RAW_ASSETS_BASE}/DKPROFILE.jpg`,
  THE_GOONS: `${PUBLIC_ASSETS_BASE}/THEGOONS.jpg`,

  // UI Assets
  LOADING_ICON: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/main/Loading%20Icon.png`,
  CELL_PHONE: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/main/Cell%20Phone.png`,

  // Whoopsie Pop-in
  AARON_WHOOPSIE: `https://raw.githubusercontent.com/mikeyspinz-beep/public-assets/c1fc71db3e7bd112fe846d228c1f95d511f60c08/AARON_WHOOPSIE_IMG.png`,
  SFX_WHOOPSIE: `https://raw.githubusercontent.com/mikeyspinz-beep/public-assets/c1fc71db3e7bd112fe846d228c1f95d511f60c08/TOASTY_AARON_SOUNDEFX.mp3`,

  // Fighter Profiles (High Res)
  PROFILE_2PAC: `${RAW_ASSETS_BASE}/2PAC.jpg`,
  PROFILE_50CENT: `${RAW_ASSETS_BASE}/50CENT.jpg`,
  PROFILE_BIGGIE: `${RAW_ASSETS_BASE}/BIGGIE.jpg`,
  PROFILE_DEEBO: `${RAW_ASSETS_BASE}/DEEBO.jpg`,
  PROFILE_DIDDY: `${RAW_ASSETS_BASE}/DIDDY.jpg`,
  PROFILE_DKAY: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/main/DKAY.jpg`, 
  PROFILE_HEINERMAN: `${RAW_ASSETS_BASE}/HEINERMAN.jpg`,
  PROFILE_JELLYROLL: `${RAW_ASSETS_BASE}/JELLYROLL.jpg`,
  PROFILE_KAYLA: `${RAW_ASSETS_BASE}/KAYLA.jpg`,
  PROFILE_LILWAYNE: `${RAW_ASSETS_BASE}/LILWAYNE.jpg`,
  PROFILE_MACMILLER: `${RAW_ASSETS_BASE}/MACMILLER.jpg`,
  PROFILE_POSTMALONE: `${RAW_ASSETS_BASE}/POST%20MALONE.jpg`,
  PROFILE_SLIMSHADY: `${RAW_ASSETS_BASE}/SLIMSHADY.jpg`,
  PROFILE_SNOOP: `${RAW_ASSETS_BASE}/SNOOPDOG.jpg`,
  PROFILE_WIZ: `${RAW_ASSETS_BASE}/WIZ.jpg`,
  PROFILE_MATT: `https://raw.githubusercontent.com/mikeyspinz-beep/public-assets/main/MATT.png.jpg`,

  // DLC 1 Profiles
  PROFILE_GOB: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/7baf07960f3689b451442bbe0a41af6c2cceca8f/GOB%20CHOPPA.jpg`,
  PROFILE_WIEBE: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/7baf07960f3689b451442bbe0a41af6c2cceca8f/WIEBEWONKA.jpg`,
  PROFILE_RBM: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/7baf07960f3689b451442bbe0a41af6c2cceca8f/RBMDILLINGER.jpg`,

  // DLC 2 Profiles
  PROFILE_CRIPMAC: `${PUBLIC_ASSETS_BASE}/CRIP%20MAC.jpg`,
  PROFILE_TEKASHI: `${PUBLIC_ASSETS_BASE}/TEKASHI69.jpg`,
  PROFILE_DRAKE: `${PUBLIC_ASSETS_BASE}/DRAKE.jpg`,

  // Legacy/In-Game Sprites
  START_SCREEN: `https://raw.githubusercontent.com/mikeyspinz-beep/BobbyGame/7441c09d0ab88c26e89070c6cb010366d8551250/STARTSCREEN_IMG.png`,
  PLAYER_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_DKAY_IMG.png`, 
  PLAYER_KAYLA_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_KAYLA_IMG.png`,
  
  // Goon Variants
  ENEMY_BASIC_IMG: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/refs/heads/main/ENEMY_GOON.zip.png`,
  ENEMY_FAST_IMG: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/main/ENEMY_BLOODGOON.png`,
  ENEMY_TANK_IMG: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/main/ENEMY_CRIPGOON.png`,
  
  // BOSS IMAGES (Sprites)
  ENEMY_BOSS_IMG: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/refs/heads/main/ENEMY_GOON.zip.png`, // Fallback
  ENEMY_2PAC_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_2PAC_IMG.png`,
  ENEMY_BIGGIE_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_BIGGIE_IMG.png`,
  ENEMY_POSTMALONE_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_POSTMALONE_IMG.png`,
  ENEMY_SLIMSHADY_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_SLIMSHADY_IMG.png`,
  ENEMY_LILWAYNE_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_LILWAYNE_IMG.png`,
  ENEMY_MATT_IMG: `https://raw.githubusercontent.com/mikeyspinz-beep/public-assets/7183fa21e58f41341ef356e5ef978241fd3e4734/ENEMY_MATT_IMG.png`,
  
  ENEMY_JELLYROLL_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_JELLY%20ROLL_IMG.png`,
  ENEMY_DIDDY_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_DIDDY_IMG.png`,
  ENEMY_SNOOP_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_SNOOP_IMG.png`,
  ENEMY_MAC_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_MAC_IMG.png`,
  ENEMY_WIZ_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_WIZ_IMG.png`,
  ENEMY_50CENT_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_50Cent_IMG.png`,
  ENEMY_DEEBO_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_DBO_IMG.png`,
  ENEMY_HEINERMAN_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_HEINERMAN_IMG.png`,

  // DLC 1 Sprites
  ENEMY_GOB_IMG: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/main/ENEMY_GOBCHOPPA.png`,
  ENEMY_WIEBE_IMG: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/main/ENEMY_WIEBEWONKA.png`,
  ENEMY_RBM_IMG: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/main/ENEMY_RBMDILLINGER.png`,

  // DLC 2 Sprites
  ENEMY_CRIPMAC_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_CRIPMAC.png`,
  ENEMY_TEKASHI_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_TEKASHI69.png`,
  ENEMY_DRAKE_IMG: `${PUBLIC_ASSETS_BASE}/ENEMY_DRAKE.png`,

  BULLET_IMG: `https://raw.githubusercontent.com/mikeyspinz-beep/BobbyGame/d76f608338f1c5da4567a0df5a36f12ce204ff06/BULLET.png`, 
  BULLET_MATT_IMG: `https://raw.githubusercontent.com/mikeyspinz-beep/public-assets/main/HOTDOG_BULLET_IMG.png`,
  POWERUP_HEAL: `https://raw.githubusercontent.com/mikeyspinz-beep/BobbyGame/908dcf9d8b40d60e7d729045a4494335e2f3959f/HEAL.png`, 
  POWERUP_RAPID_FIRE: `https://raw.githubusercontent.com/mikeyspinz-beep/BobbyGame/7fce83377f4abc2e40ea85c29c5ed86cdad3889d/RAPIDFIRE.png`,
  POWERUP_TRIPLE_SHOT: `${PUBLIC_ASSETS_BASE}/Triple%20Shot.png`,
  
  // LEVEL BACKGROUNDS
  BG_8MILE: `https://raw.githubusercontent.com/mikeyspinz-beep/public-assets/main/8MILE.jpg`,
  BG_CLUB: `https://raw.githubusercontent.com/mikeyspinz-beep/public-assets/main/Club662.jpg`,
  BG_VILLAGES: `https://raw.githubusercontent.com/mikeyspinz-beep/public-assets/f866a008336adb6a5712332a79bd9ff40342570c/THEVILLAGES.jpg`,

  MUSIC: `https://raw.githubusercontent.com/mikeyspinz-beep/DKAYVENDETTA/1ff3f65432b7c3d8c6122d51faa631d982155102/Def%20Jam%20Vendetta%20-%20WC%20-%20The%20Streets%20(Instrumental).mp3`,
  MUSIC_CLUB: `${PUBLIC_ASSETS_BASE}/Def%20Jam%20Vendetta%20-%20DMX%20-%20Party%20Up%20(Instrumental).mp3`,
  SFX_GUNSHOT: `${PUBLIC_ASSETS_BASE}/Gun%20Shot%206.mp3`,
  SFX_MATT_GUNSHOT: `https://raw.githubusercontent.com/mikeyspinz-beep/public-assets/1fa2edf74c43b9513424dc1e999e696536070cba/MA_Floraphinc_Ketchup_Bottle_Squirt_1.wav`,
  SFX_POWERUP: `${PUBLIC_ASSETS_BASE}/ChaChing.mp3`,
  SFX_GAMEOVER: `${PUBLIC_ASSETS_BASE}/GameOver.mp3`,
  SFX_UNLOCK: `${PUBLIC_ASSETS_BASE}/Ha%20Got%20Em.mp3`,
  SFX_SELECT: `${PUBLIC_ASSETS_BASE}/DataAlertDigi%20GFX019401.mp3`,
  SFX_ENTER: `${PUBLIC_ASSETS_BASE}/Male%20Saying%20Tough%20Guy%20Eh.wav`
};

// ARENAS
export const ARENAS: Record<string, {
  id: string,
  name: string,
  sub: string,
  desc: string,
  color: string,
  dlcPack?: number
}> = {
  STREET: { 
    id: 'STREET',
    name: '8 MILE', 
    sub: 'DETROIT, MI', 
    desc: 'GRITTY ALLEYWAY. NO RULES.',
    color: '#000'
  },
  CLUB: { 
    id: 'CLUB',
    name: 'CLUB 662', 
    sub: 'LAS VEGAS, NV', 
    desc: 'VIP SECTION. WATCH YOUR BACK.',
    color: '#300'
  },
  VILLAGES: {
    id: 'VILLAGES',
    name: 'THE VILLAGES',
    sub: 'WINDSOR, ONT',
    desc: 'OLD STOMPING GROUNDS. WHERE THE HUSTLE STARTED.',
    color: '#1e3a8a',
    dlcPack: 3
  }
};

// Playable Character Config
export const CHARACTERS: Record<string, { 
  name: string, 
  img: string,
  profileImg: string,
  color: string,
  hometown: string,
  weapon: string,
  dlcPack?: number 
}> = {
  default: { 
    name: 'DKAY', 
    img: 'PLAYER_IMG', 
    profileImg: 'PROFILE_DKAY',
    color: '#0284c7',
    hometown: 'DETROIT, MI',
    weapon: 'RIFLE'
  },
  kayla: { 
    name: 'KAYLA', 
    img: 'PLAYER_KAYLA_IMG', 
    profileImg: 'PROFILE_KAYLA',
    color: '#ec4899',
    hometown: 'LOS ANGELES, CA',
    weapon: 'TOMMY GUN'
  },
  matt: {
    name: 'MATT',
    img: 'ENEMY_MATT_IMG',
    profileImg: 'PROFILE_MATT',
    color: '#ef4444',
    hometown: 'NEW YORK, NY',
    weapon: 'HOTDOG SHOOTER'
  },
  '2pac': { 
    name: '2PAC', 
    img: 'ENEMY_2PAC_IMG', 
    profileImg: 'PROFILE_2PAC',
    color: '#fbbf24',
    hometown: 'OAKLAND, CA',
    weapon: 'HAND GUN'
  },
  biggie: { 
    name: 'BIGGIE', 
    img: 'ENEMY_BIGGIE_IMG', 
    profileImg: 'PROFILE_BIGGIE',
    color: '#ef4444',
    hometown: 'BROOKLYN, NY',
    weapon: 'PISTOL'
  },
  postmalone: { 
    name: 'POST MALONE', 
    img: 'ENEMY_POSTMALONE_IMG', 
    profileImg: 'PROFILE_POSTMALONE',
    color: '#ffffff',
    hometown: 'DALLAS, TX',
    weapon: 'MACHINE GUN'
  },
  slimshady: { 
    name: 'SLIM SHADY', 
    img: 'ENEMY_SLIMSHADY_IMG', 
    profileImg: 'PROFILE_SLIMSHADY',
    color: '#cccccc',
    hometown: 'DETROIT, MI',
    weapon: 'MACHINE GUN'
  },
  lilwayne: { 
    name: 'LIL WAYNE', 
    img: 'ENEMY_LILWAYNE_IMG', 
    profileImg: 'PROFILE_LILWAYNE',
    color: '#a855f7',
    hometown: 'NEW ORLEANS, LA',
    weapon: 'MACHINE GUN'
  },
  jellyroll: {
    name: 'JELLY ROLL', 
    img: 'ENEMY_JELLYROLL_IMG', 
    profileImg: 'PROFILE_JELLYROLL',
    color: '#f59e0b',
    hometown: 'NASHVILLE, TN',
    weapon: 'BOW AND ARROW'
  },
  diddy: {
    name: 'DIDDY', 
    img: 'ENEMY_DIDDY_IMG', 
    profileImg: 'PROFILE_DIDDY',
    color: '#1e293b',
    hometown: 'HARLEM, NY',
    weapon: 'BABY OIL SHOOTER'
  },
  snoop: {
    name: 'SNOOP DOGG', 
    img: 'ENEMY_SNOOP_IMG', 
    profileImg: 'PROFILE_SNOOP',
    color: '#16a34a',
    hometown: 'LONG BEACH, CA',
    weapon: 'GOLDEN REVOLVER'
  },
  mac: {
    name: 'MAC MILLER', 
    img: 'ENEMY_MAC_IMG', 
    profileImg: 'PROFILE_MACMILLER',
    color: '#38bdf8',
    hometown: 'PITTSBURGH, PA',
    weapon: 'SUPER SOAKER'
  },
  wiz: {
    name: 'WIZ KHALIFA', 
    img: 'ENEMY_WIZ_IMG', 
    profileImg: 'PROFILE_WIZ',
    color: '#facc15',
    hometown: 'PITTSBURGH, PA',
    weapon: 'THE WEED GAT'
  },
  '50cent': {
    name: '50 CENT', 
    img: 'ENEMY_50CENT_IMG', 
    profileImg: 'PROFILE_50CENT',
    color: '#64748b',
    hometown: 'QUEENS, NY',
    weapon: 'THE DIDDY KILLER'
  },
  deebo: {
    name: 'DEEBO', 
    img: 'ENEMY_DEEBO_IMG', 
    profileImg: 'PROFILE_DEEBO',
    color: '#3f3f46',
    hometown: 'COMPTON, CA',
    weapon: 'REVOLVER'
  },
  heinerman: {
    name: 'HEINERMAN', 
    img: 'ENEMY_HEINERMAN_IMG', 
    profileImg: 'PROFILE_HEINERMAN',
    color: '#14b8a6',
    hometown: 'UNKNOWN',
    weapon: 'PAPER ROUTE SHOOTER'
  },
  // --- DLC PACK 1 ---
  gob: {
    name: 'GOB CHOPPA',
    img: 'ENEMY_GOB_IMG',
    profileImg: 'PROFILE_GOB',
    color: '#166534',
    hometown: 'THE HILLS',
    weapon: 'WEED BAZOOKA',
    dlcPack: 1
  },
  wiebe: {
    name: 'WIEBE WONKA',
    img: 'ENEMY_WIEBE_IMG',
    profileImg: 'PROFILE_WIEBE',
    color: '#9333ea',
    hometown: 'CANDY LAND',
    weapon: 'RUSTY GAT',
    dlcPack: 1
  },
  rbm: {
    name: 'RBM DILLINGER',
    img: 'ENEMY_RBM_IMG',
    profileImg: 'PROFILE_RBM',
    color: '#b91c1c',
    hometown: 'BANK VAULT',
    weapon: 'RED MACHINE GUN',
    dlcPack: 1
  },
  // --- DLC PACK 2 ---
  cripmac: {
    name: 'CRIP MAC',
    img: 'ENEMY_CRIPMAC_IMG',
    profileImg: 'PROFILE_CRIPMAC',
    color: '#2563eb', 
    hometown: '55TH STREET',
    weapon: 'CRIPZOOKA',
    dlcPack: 2
  },
  tekashi: {
    name: 'TEKASHI 69',
    img: 'ENEMY_TEKASHI_IMG',
    profileImg: 'PROFILE_TEKASHI',
    color: '#e11d48',
    hometown: 'BROOKLYN, NY',
    weapon: 'MACHINE GUN',
    dlcPack: 2
  },
  drake: {
    name: 'DRAKE',
    img: 'ENEMY_DRAKE_IMG',
    profileImg: 'PROFILE_DRAKE',
    color: '#ca8a04',
    hometown: 'TORONTO, CA',
    weapon: 'MONEY AND GUNS',
    dlcPack: 2
  }
};
