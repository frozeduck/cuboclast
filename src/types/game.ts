export const VIRTUAL_WIDTH = 1080;
export const VIRTUAL_HEIGHT = 1920;
export const CANNON_X = VIRTUAL_WIDTH / 2;
export const CANNON_Y = 120;
export const GRAVITY = 980;

export type GameState =
  | 'ARCHETYPE_SELECT'
  | 'AIMING'
  | 'BALL_IN_PLAY'
  | 'FEVER'
  | 'RELIC_DRAFT'
  | 'SHOP'
  | 'GAME_OVER'
  | 'VICTORY';

export type CubeType =
  | 'NORMAL'
  | 'ARMOR'
  | 'EXPLOSIVE'
  | 'SPLITTER'
  | 'KINETIC'
  | 'SHIELD'
  | 'BOSS';

export type RelicFamilyId = 'ELECTRIC' | 'EXPLOSIVE' | 'MULTIBALL' | 'KINETIC';

export interface RelicFamilyInfo {
  id: RelicFamilyId;
  label: string;
  color: string;
  glow: string;
}

export const RELIC_FAMILIES: Record<RelicFamilyId, RelicFamilyInfo> = {
  ELECTRIC: {
    id: 'ELECTRIC',
    label: 'Elettrico',
    color: '#00e5ff',
    glow: 'rgba(0, 229, 255, 0.4)',
  },
  EXPLOSIVE: {
    id: 'EXPLOSIVE',
    label: 'Esplosivo',
    color: '#ff6b00',
    glow: 'rgba(255, 107, 0, 0.4)',
  },
  MULTIBALL: {
    id: 'MULTIBALL',
    label: 'Multiball',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
  KINETIC: {
    id: 'KINETIC',
    label: 'Cinetico',
    color: '#ffe600',
    glow: 'rgba(255, 230, 0, 0.4)',
  },
};

export type ArchetypeId =
  | 'VOLT_OVERCHARGE'
  | 'PYRO_DETONATOR'
  | 'SWARM_MATRIX'
  | 'KINETIC_TITAN'
  | 'CRYSTAL_SINGULARITY';

export interface ArchetypeInfo {
  id: ArchetypeId;
  title: string;
  description: string;
  family: RelicFamilyId;
  color: string;
  initialRelic: RelicId;
  unlockedByDefault: boolean;
  unlockCost?: number;
}

export type RelicId =
  // ELECTRIC
  | 'CHAIN_LIGHTNING'
  | 'VOLT_DISCHARGE'
  | 'TESLA_COIL'
  | 'EMP_BURST'
  // EXPLOSIVE
  | 'BOUNCING_BOMB'
  | 'SHRAPNEL_BURST'
  | 'CLUSTER_CHARGE'
  | 'SUPERNOVA'
  // MULTIBALL
  | 'MULTIBALL_REACTOR'
  | 'QUANTUM_DUPLICATION'
  | 'SPLIT_STORM'
  | 'MICRO_SWARM'
  // KINETIC
  | 'KINETIC_SURGE'
  | 'CRITICAL_OVERDRIVE'
  | 'MAGNETIC_BASKET'
  | 'HEAVY_MASS'
  | 'SAFETY_NET'
  | 'PIERCING_RAIL'
  | 'HYPER_VELOCITY';

export interface RelicInfo {
  id: RelicId;
  family: RelicFamilyId;
  title: string;
  description: string;
}

export const RELICS_DATA: Record<RelicId, RelicInfo> = {
  // Electric
  CHAIN_LIGHTNING: {
    id: 'CHAIN_LIGHTNING',
    family: 'ELECTRIC',
    title: 'Fulmine a Catena',
    description: 'Ogni 2 rimbalzi scaglia un fulmine su 2 cubi per 3 danni.',
  },
  VOLT_DISCHARGE: {
    id: 'VOLT_DISCHARGE',
    family: 'ELECTRIC',
    title: 'Scarica di Tensione',
    description: 'Ogni 4 cubi colpiti rilascia un arco voltaico circolare.',
  },
  TESLA_COIL: {
    id: 'TESLA_COIL',
    family: 'ELECTRIC',
    title: 'Bobina Tesla',
    description: 'Il cestello emette scariche verso i cubi più vicini quando si muove.',
  },
  EMP_BURST: {
    id: 'EMP_BURST',
    family: 'ELECTRIC',
    title: 'Impulso EMP',
    description: "All'inizio del settore disattiva gli scudi nemici per 10 secondi.",
  },

  // Explosive
  BOUNCING_BOMB: {
    id: 'BOUNCING_BOMB',
    family: 'EXPLOSIVE',
    title: 'Sfera Bomba',
    description: "All'8° rimbalzo la sfera genera una massiccia detonazione ad area.",
  },
  SHRAPNEL_BURST: {
    id: 'SHRAPNEL_BURST',
    family: 'EXPLOSIVE',
    title: 'Schegge Taglienti',
    description: 'I cubi distrutti proiettano 4 schegge geometriche perforanti.',
  },
  CLUSTER_CHARGE: {
    id: 'CLUSTER_CHARGE',
    family: 'EXPLOSIVE',
    title: 'Carica a Grappolo',
    description: 'Le esplosioni rilasciano 3 micro-bombe ad impatto.',
  },
  SUPERNOVA: {
    id: 'SUPERNOVA',
    family: 'EXPLOSIVE',
    title: 'Supernova',
    description: "Quando una sfera cade sul fondo, scatena un fascio d'energia verso l'alto.",
  },

  // Multiball
  MULTIBALL_REACTOR: {
    id: 'MULTIBALL_REACTOR',
    family: 'MULTIBALL',
    title: 'Reattore Multiball',
    description: 'Distruggere un cubo ha il 30% di probabilità di generare una mini-sfera.',
  },
  QUANTUM_DUPLICATION: {
    id: 'QUANTUM_DUPLICATION',
    family: 'MULTIBALL',
    title: 'Duplicazione Quantica',
    description: 'Al 10° rimbalzo duplica la sfera in campo.',
  },
  SPLIT_STORM: {
    id: 'SPLIT_STORM',
    family: 'MULTIBALL',
    title: 'Tempesta di Scissione',
    description: 'I cubi Splitter generano 3 mini-sfere invece di 2.',
  },
  MICRO_SWARM: {
    id: 'MICRO_SWARM',
    family: 'MULTIBALL',
    title: 'Micro-Sciame',
    description: 'La sfera è accompagnata da 2 micro-orbi orbitanti protettivi.',
  },

  // Kinetic
  KINETIC_SURGE: {
    id: 'KINETIC_SURGE',
    family: 'KINETIC',
    title: 'Kinetic Surge',
    description: 'Ogni rimbalzo aumenta il danno della sfera di +1 per quel tiro.',
  },
  CRITICAL_OVERDRIVE: {
    id: 'CRITICAL_OVERDRIVE',
    family: 'KINETIC',
    title: 'Sovraccarico Critico',
    description: "30% di probabilità di colpo critico (danno x3 e onda d'urto).",
  },
  MAGNETIC_BASKET: {
    id: 'MAGNETIC_BASKET',
    family: 'KINETIC',
    title: 'Cestello Magnetico',
    description: 'Il cestello è più largo (+50px) e cattura le sfere con forte attrazione.',
  },
  HEAVY_MASS: {
    id: 'HEAVY_MASS',
    family: 'KINETIC',
    title: 'Massa Inerziale',
    description: 'Infligge +4 danni extra contro i cubi corazzati e i boss.',
  },
  SAFETY_NET: {
    id: 'SAFETY_NET',
    family: 'KINETIC',
    title: 'Rete di Sicurezza',
    description: 'Un campo di forza respinge la prima sfera caduta in ogni settore.',
  },
  PIERCING_RAIL: {
    id: 'PIERCING_RAIL',
    family: 'KINETIC',
    title: 'Sfera Perforante',
    description: 'La sfera disintegra i cubi con 2 o meno HP senza rimbalzare.',
  },
  HYPER_VELOCITY: {
    id: 'HYPER_VELOCITY',
    family: 'KINETIC',
    title: 'Iper-Velocità',
    description: 'Le sfere viaggiano il 25% più veloci e infliggono +1 danno base.',
  },
};

export const ARCHETYPES_DATA: Record<ArchetypeId, ArchetypeInfo> = {
  VOLT_OVERCHARGE: {
    id: 'VOLT_OVERCHARGE',
    title: 'Volt Overcharge',
    description: 'I fulmini infliggono +50% danno e si propagano a +1 bersaglio extra. Rilascia scariche elettrostatiche.',
    family: 'ELECTRIC',
    color: '#00e5ff',
    initialRelic: 'CHAIN_LIGHTNING',
    unlockedByDefault: true,
  },
  PYRO_DETONATOR: {
    id: 'PYRO_DETONATOR',
    title: 'Pyro Detonator',
    description: 'Raggio di tutte le esplosioni aumentato del +40%. I cubi esplosivi infliggono +3 danni extra.',
    family: 'EXPLOSIVE',
    color: '#ff6b00',
    initialRelic: 'BOUNCING_BOMB',
    unlockedByDefault: true,
  },
  SWARM_MATRIX: {
    id: 'SWARM_MATRIX',
    title: 'Swarm Matrix',
    description: 'Le mini-sfere rimbalzano 1 volta se cadono nel vuoto e hanno il +25% di probabilità di replicarsi.',
    family: 'MULTIBALL',
    color: '#a855f7',
    initialRelic: 'MULTIBALL_REACTOR',
    unlockedByDefault: true,
  },
  KINETIC_TITAN: {
    id: 'KINETIC_TITAN',
    title: 'Kinetic Titan',
    description: 'Inizia con cestello maggiorato (260px), forte imbuto magnetico e +1 danno base naturale.',
    family: 'KINETIC',
    color: '#ffe600',
    initialRelic: 'KINETIC_SURGE',
    unlockedByDefault: true,
  },
  CRYSTAL_SINGULARITY: {
    id: 'CRYSTAL_SINGULARITY',
    title: 'Crystal Singularity',
    description: 'Ogni impatto applica congelamento; i cubi congelati subiscono il doppio del danno e rilasciano schegge.',
    family: 'ELECTRIC',
    color: '#38bdf8',
    initialRelic: 'PIERCING_RAIL',
    unlockedByDefault: true, // or unlocked via shop progression
    unlockCost: 100,
  },
};

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isMini: boolean;
  isAlive: boolean;
  bounces: number;
  baseDamage: number;
  trail: [number, number][];
  hasSavedOnce: boolean;
}

export interface Cube {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  type: CubeType;
  isCore: boolean;
  wobble: number;
  hitFlash: number;
  isAlive: boolean;
  shieldPulse: number;
  isFrozen: boolean;
}

export interface BossSatellite {
  id: number;
  angle: number;
  distance: number;
  isAlive: boolean;
  hp: number;
  maxHp: number;
  width: number;
  height: number;
}

export interface Basket {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
}

export interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  color: string;
  rotation: number;
  rotSpeed: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
}

export interface SavedRunState {
  hasActiveRun: boolean;
  savedLevel: number;
  savedScore: number;
  savedBalls: number;
  savedArchetype: ArchetypeId | '';
  savedRelics: RelicId[];
  savedShardsRun: number;
  savedIsEndless: boolean;
}

export interface GameProgressionData {
  quantumShards: number;
  runsPlayed: number;
  victories: number;
  bestSector: number;
  highestScore: number;
  totalCubesDestroyed: number;
  upgradeExtraBalls: number;
  upgradeBasketWidth: number;
  upgradeRerolls: number;
  unlockedCryo: boolean;
  unlockedSingularity: boolean;
  savedRun: SavedRunState;
}
