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
  | 'VICTORY'
  | 'CODEX';

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
  | 'CRYSTAL_SINGULARITY'
  | 'QUANTUM_SINGULARITY'
  | 'CHRONO_PULSE';

export interface ArchetypeInfo {
  id: ArchetypeId;
  title: string;
  passiveName: string;
  description: string;
  family: RelicFamilyId;
  color: string;
  initialRelic: RelicId;
  unlockedByDefault: boolean;
  unlockCondition: string;
  unlockCost?: number;
}

export type RelicId =
  // ELECTRIC
  | 'CHAIN_LIGHTNING'
  | 'VOLT_DISCHARGE'
  | 'TESLA_COIL'
  | 'EMP_BURST'
  | 'PLASMA_CONDUIT'
  // EXPLOSIVE
  | 'BOUNCING_BOMB'
  | 'SHRAPNEL_BURST'
  | 'CLUSTER_CHARGE'
  | 'SUPERNOVA'
  | 'SUPERNOVA_CATALYST'
  // MULTIBALL
  | 'MULTIBALL_REACTOR'
  | 'QUANTUM_DUPLICATION'
  | 'SPLIT_STORM'
  | 'MICRO_SWARM'
  | 'GRAVITY_WELL'
  // KINETIC
  | 'KINETIC_SURGE'
  | 'CRITICAL_OVERDRIVE'
  | 'MAGNETIC_BASKET'
  | 'HEAVY_MASS'
  | 'SAFETY_NET'
  | 'PIERCING_RAIL'
  | 'HYPER_VELOCITY'
  | 'CHRONO_WARP'
  | 'POLAR_VORTEX';

export interface RelicInfo {
  id: RelicId;
  family: RelicFamilyId;
  title: string;
  description: string;
  unlockCondition?: string;
  isSecret?: boolean;
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
    description: 'Ogni 4 cubi colpiti rilascia un arco voltaico circolare da 4 danni.',
  },
  TESLA_COIL: {
    id: 'TESLA_COIL',
    family: 'ELECTRIC',
    title: 'Bobina Tesla',
    description: 'Il cestello emette scariche elettriche verso i cubi più vicini quando si sposta.',
  },
  EMP_BURST: {
    id: 'EMP_BURST',
    family: 'ELECTRIC',
    title: 'Impulso EMP',
    description: "All'inizio di ogni settore disattiva gli scudi nemici per 10 secondi.",
  },
  PLASMA_CONDUIT: {
    id: 'PLASMA_CONDUIT',
    family: 'ELECTRIC',
    title: 'Condotto di Plasma',
    description: 'I fulmini infliggono il +100% danno se colpiscono cubi già danneggiati.',
    unlockCondition: 'Distruggi 150 cubi totali',
    isSecret: true,
  },

  // Explosive
  BOUNCING_BOMB: {
    id: 'BOUNCING_BOMB',
    family: 'EXPLOSIVE',
    title: 'Sfera Bomba',
    description: "All'8° rimbalzo la sfera genera una massiccia detonazione ad area (230px).",
  },
  SHRAPNEL_BURST: {
    id: 'SHRAPNEL_BURST',
    family: 'EXPLOSIVE',
    title: 'Schegge Taglienti',
    description: 'I cubi distrutti proiettano 4 schegge geometriche perforanti ad alta velocità.',
  },
  CLUSTER_CHARGE: {
    id: 'CLUSTER_CHARGE',
    family: 'EXPLOSIVE',
    title: 'Carica a Grappolo',
    description: 'Le esplosioni rilasciano 3 micro-bombe a impatto secondario.',
  },
  SUPERNOVA: {
    id: 'SUPERNOVA',
    family: 'EXPLOSIVE',
    title: 'Supernova Ascendente',
    description: "Quando una sfera cade sul fondo, scatena un fascio d'energia verticale verso l'alto per 8 danni.",
  },
  SUPERNOVA_CATALYST: {
    id: 'SUPERNOVA_CATALYST',
    family: 'EXPLOSIVE',
    title: 'Catalizzatore Nova',
    description: 'Le detonazioni aumentano di raggio del +50% e lasciano una scia infuocata.',
    unlockCondition: 'Distruggi 300 cubi totali',
    isSecret: true,
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
    description: 'Al 10° rimbalzo duplica la sfera in campo con piena energia cinetica.',
  },
  SPLIT_STORM: {
    id: 'SPLIT_STORM',
    family: 'MULTIBALL',
    title: 'Tempesta di Scissione',
    description: 'I cubi Splitter generano 3 mini-sfere invece di 2 con velocità aumentata.',
  },
  MICRO_SWARM: {
    id: 'MICRO_SWARM',
    family: 'MULTIBALL',
    title: 'Micro-Sciame',
    description: 'La sfera è accompagnata da 2 micro-orbi orbitanti protettivi.',
  },
  GRAVITY_WELL: {
    id: 'GRAVITY_WELL',
    family: 'MULTIBALL',
    title: 'Pozzo Gravitazionale',
    description: 'Genera un micro-buco nero temporaneo che attira le mini-sfere verso i cubi core.',
    unlockCondition: 'Completa 2 Run o sconfiggi il Boss Settore 5',
    isSecret: true,
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
    description: "30% di probabilità di colpo critico (danno x3 e potente onda d'urto).",
  },
  MAGNETIC_BASKET: {
    id: 'MAGNETIC_BASKET',
    family: 'KINETIC',
    title: 'Cestello Magnetico',
    description: 'Il cestello è più largo (+50px) e cattura le sfere con forte attrazione magnetica.',
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
  CHRONO_WARP: {
    id: 'CHRONO_WARP',
    family: 'KINETIC',
    title: 'Distorsione Crono',
    description: 'Quando una sfera scende sotto il cestello, rallenta il tempo permettendo al cestello di raggiungerla.',
    unlockCondition: 'Sconfiggi il Boss Omega Tesseract (Settore 10)',
    isSecret: true,
  },
  POLAR_VORTEX: {
    id: 'POLAR_VORTEX',
    family: 'ELECTRIC',
    title: 'Vortice Polare',
    description: 'I fulmini congelano i cubi colpiti e raddoppiano le schegge quantiche rilasciate.',
    unlockCondition: 'Sconfiggi il Boss The Monolith (Settore 5)',
    isSecret: true,
  },
};

export const ARCHETYPES_DATA: Record<ArchetypeId, ArchetypeInfo> = {
  VOLT_OVERCHARGE: {
    id: 'VOLT_OVERCHARGE',
    title: 'Volt Overcharge',
    passiveName: 'Sovraccarico Voltaico',
    description: 'Tutti i fulmini infliggono +50% danno e si propagano a +1 bersaglio extra. Rilascia scariche elettrostatiche ad arco su ogni terzo rimbalzo.',
    family: 'ELECTRIC',
    color: '#00e5ff',
    initialRelic: 'CHAIN_LIGHTNING',
    unlockedByDefault: true,
    unlockCondition: 'Sbloccato di Default',
  },
  PYRO_DETONATOR: {
    id: 'PYRO_DETONATOR',
    title: 'Pyro Detonator',
    passiveName: 'Reazione Termonucleare',
    description: 'Raggio di tutte le esplosioni aumentato del +40%. I cubi esplosivi infliggono +3 danni extra ad area e generano onde durto a catena.',
    family: 'EXPLOSIVE',
    color: '#ff6b00',
    initialRelic: 'BOUNCING_BOMB',
    unlockedByDefault: true,
    unlockCondition: 'Sbloccato di Default',
  },
  SWARM_MATRIX: {
    id: 'SWARM_MATRIX',
    title: 'Swarm Matrix',
    passiveName: 'Protocollo Sciame',
    description: 'Le mini-sfere rimbalzano 1 volta se cadono nel vuoto e hanno il +25% di probabilita di replicarsi a contatto con i cubi splitter.',
    family: 'MULTIBALL',
    color: '#a855f7',
    initialRelic: 'MULTIBALL_REACTOR',
    unlockedByDefault: true,
    unlockCondition: 'Sbloccato di Default',
  },
  KINETIC_TITAN: {
    id: 'KINETIC_TITAN',
    title: 'Kinetic Titan',
    passiveName: 'Colosso Cinetico',
    description: 'Inizia con cestello maggiorato (260px), forte imbuto magnetico ad alta portata e +1 danno base naturale su ogni impatto.',
    family: 'KINETIC',
    color: '#ffe600',
    initialRelic: 'KINETIC_SURGE',
    unlockedByDefault: false,
    unlockCondition: 'Completa 1 Run o 75 ◆',
    unlockCost: 75,
  },
  CRYSTAL_SINGULARITY: {
    id: 'CRYSTAL_SINGULARITY',
    title: 'Crystal Singularity',
    passiveName: 'Criotempesta Quantica',
    description: 'Ogni impatto applica congelamento; i cubi congelati subiscono il doppio del danno (2x) e rilasciano schegge perforanti quando distrutti.',
    family: 'ELECTRIC',
    color: '#38bdf8',
    initialRelic: 'PIERCING_RAIL',
    unlockedByDefault: false,
    unlockCondition: 'Sconfiggi il Boss The Monolith (Settore 5) o 150 ◆',
    unlockCost: 150,
  },
  QUANTUM_SINGULARITY: {
    id: 'QUANTUM_SINGULARITY',
    title: 'Quantum Singularity',
    passiveName: 'Orizzonte degli Eventi',
    description: 'Spara sfere gravitazionali che piegano lo spazio. Ogni rimbalzo genera una micro-lente gravitazionale che attira i frammenti e danneggia i cubi adiacenti.',
    family: 'MULTIBALL',
    color: '#f43f5e',
    initialRelic: 'GRAVITY_WELL',
    unlockedByDefault: false,
    unlockCondition: 'Sconfiggi il Boss Omega Tesseract (Settore 10) o 250 ◆',
    unlockCost: 250,
  },
  CHRONO_PULSE: {
    id: 'CHRONO_PULSE',
    title: 'Chrono Pulse',
    passiveName: 'Sovraccarico Temporale',
    description: 'Ad ogni combo superiore a 5, il tempo rallenta e rilascia un impulso temporale che infligge danni diretti a tutti i cubi core presenti nel settore.',
    family: 'KINETIC',
    color: '#10b981',
    initialRelic: 'CHRONO_WARP',
    unlockedByDefault: false,
    unlockCondition: 'Completa 3 Run o 200 ◆',
    unlockCost: 200,
  },
};

// --- Nuove Combo Fusione Roguelike ---
export type FusionComboId =
  | 'PLASMA_OVERLOAD'
  | 'MAGNETIC_SURGE'
  | 'SWARM_DETONATOR'
  | 'HYPER_SWARM'
  | 'CRYO_SHOCK';

export interface FusionComboInfo {
  id: FusionComboId;
  title: string;
  familyA: RelicFamilyId;
  familyB: RelicFamilyId;
  description: string;
  unlockCondition: string;
  isUnlocked: boolean;
  color: string;
}

export const FUSION_COMBOS: Record<FusionComboId, FusionComboInfo> = {
  PLASMA_OVERLOAD: {
    id: 'PLASMA_OVERLOAD',
    title: 'Sovraccarico Plasma',
    familyA: 'ELECTRIC',
    familyB: 'EXPLOSIVE',
    description: 'Le detonazioni esplosive scatenano archi di fulmini concatenati verso 3 cubi distanti, infliggendo danni critici.',
    unlockCondition: 'Sconfiggi il Boss Settore 5 con una build mista o 100 ◆',
    isUnlocked: false,
    color: '#f97316',
  },
  MAGNETIC_SURGE: {
    id: 'MAGNETIC_SURGE',
    title: 'Scarica Magnetica',
    familyA: 'KINETIC',
    familyB: 'ELECTRIC',
    description: 'Ogni sfera catturata nel cestello magnetico potenzia il tiro successivo con un raggio elettrificato al +100% di danno.',
    unlockCondition: 'Completa 1 Run con 3+ catture nel cestello',
    isUnlocked: false,
    color: '#06b6d4',
  },
  SWARM_DETONATOR: {
    id: 'SWARM_DETONATOR',
    title: 'Sciame Detonante',
    familyA: 'MULTIBALL',
    familyB: 'EXPLOSIVE',
    description: 'Tutte le mini-sfere esplodono al loro ultimo rimbalzo o prima di cadere, infliggendo 6 danni ad area.',
    unlockCondition: 'Sblocca 4 reliquie di famiglia Multiball ed Esplosiva',
    isUnlocked: false,
    color: '#ec4899',
  },
  HYPER_SWARM: {
    id: 'HYPER_SWARM',
    title: 'Iper-Sciame Perforante',
    familyA: 'MULTIBALL',
    familyB: 'KINETIC',
    description: 'Le mini-sfere ereditano la velocita cinetica massima e perforano i cubi con 3 o meno HP.',
    unlockCondition: 'Raggiungi una combo x8 in qualsiasi settore',
    isUnlocked: false,
    color: '#eab308',
  },
  CRYO_SHOCK: {
    id: 'CRYO_SHOCK',
    title: 'Superconduzione Criogenica',
    familyA: 'ELECTRIC',
    familyB: 'KINETIC',
    description: 'I fulmini e gli impatti cinetici contro cubi congelati innescano una reazione a catena criogenica che raddoppia i punti.',
    unlockCondition: 'Sconfiggi il Boss Omega Tesseract (Settore 10)',
    isUnlocked: false,
    color: '#38bdf8',
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
  isElectrified?: boolean;
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

export type GameMode = 'STORY' | 'ARCADE' | 'ENDLESS';

export interface StoryChapter {
  id: number;
  title: string;
  subtitle: string;
  sectorsRange: [number, number];
  bossSector: number;
  bossName: string;
  bossTitle: string;
  bossColor: string;
  bossHp: number;
  satelliteCount: number;
  description: string;
  lore: string;
  hazardNote: string;
}

export const STORY_CHAPTERS: Record<number, StoryChapter> = {
  1: {
    id: 1,
    title: 'Periferia Cyber-Neon',
    subtitle: 'Capitolo I · Settori 1-5',
    sectorsRange: [1, 5],
    bossSector: 5,
    bossName: 'The Monolith',
    bossTitle: 'Guardiano Tetragonale del Settore 5',
    bossColor: '#00e5ff',
    bossHp: 80,
    satelliteCount: 6,
    description: 'Introduzione ai rimbalzi balistici e alla geometria quantica di base.',
    lore: "L'avanguardia del Tesseract ha eretto una prima barriera cibernetica ai margini dello spazio conosciuto.",
    hazardNote: 'Cubi standard e cinetici a rimbalzo elastico.',
  },
  2: {
    id: 2,
    title: 'Cintura al Plasma',
    subtitle: 'Capitolo II · Settori 6-10',
    sectorsRange: [6, 10],
    bossSector: 10,
    bossName: 'Omega Tesseract',
    bossTitle: 'Nucleo Entropico del Settore 10',
    bossColor: '#ff007f',
    bossHp: 160,
    satelliteCount: 8,
    description: 'Campi magnetici instabili e primi sciami di mine orbitali.',
    lore: 'Il secondo guardiano canalizza tempeste di plasma repulsive che deviano ogni sfera.',
    hazardNote: 'Impulsi EMP repulsivi e cubi esplosivi instabili.',
  },
  3: {
    id: 3,
    title: 'Forgia del Vuoto Cinetico',
    subtitle: 'Capitolo III · Settori 11-15',
    sectorsRange: [11, 15],
    bossSector: 15,
    bossName: 'Void Leviathan',
    bossTitle: 'Serpente Meccanico del Settore 15',
    bossColor: '#f59e0b',
    bossHp: 260,
    satelliteCount: 10,
    description: 'Gravità amplificata e cubi pesantemente corazzati.',
    lore: 'Nelle profondità della fucina del vuoto, un costrutto serpentino protegge i frammenti ancestrali.',
    hazardNote: 'Satelliti a rotazione rapida e scudi multistrato.',
  },
  4: {
    id: 4,
    title: 'Singolarità Oscura',
    subtitle: 'Capitolo IV · Settori 16-20',
    sectorsRange: [16, 20],
    bossSector: 20,
    bossName: 'Chrono Weaver',
    bossTitle: 'Manipolatore Temporale del Settore 20',
    bossColor: '#10b981',
    bossHp: 380,
    satelliteCount: 10,
    description: 'Anomalie temporali criogeniche e barriere a raggio allungato.',
    lore: 'Il tempo si deforma attorno alla singolarità; le sfere rallentano se non colpiscono in fretta.',
    hazardNote: 'Cubi congelati resistenti e barriere temporali a lungo raggio.',
  },
  5: {
    id: 5,
    title: 'Orizzonte Primordiale',
    subtitle: 'Capitolo V · Settori 21-25 (Finale)',
    sectorsRange: [21, 25],
    bossSector: 25,
    bossName: 'Primordial Architect',
    bossTitle: 'La Mente del Tesseract (Boss Finale)',
    bossColor: '#e11d48',
    bossHp: 520,
    satelliteCount: 12,
    description: 'Il cuore della matrice universale. Sconfiggilo per purificare la galassia!',
    lore: "L'Architetto Primordiale scende in campo con 4 fasi cataclismatiche per difendere l'origine del cosmo.",
    hazardNote: "Doppio anello orbitale, onde d'urto continue e discesa enrage.",
  },
};

export function getChapterForSector(sector: number): StoryChapter {
  if (sector <= 5) return STORY_CHAPTERS[1];
  if (sector <= 10) return STORY_CHAPTERS[2];
  if (sector <= 15) return STORY_CHAPTERS[3];
  if (sector <= 20) return STORY_CHAPTERS[4];
  return STORY_CHAPTERS[5];
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
  gameMode?: GameMode;
}

export interface UnlockEventNotification {
  title: string;
  type: 'ARCHETYPE' | 'RELIC' | 'COMBO' | 'BOSS';
  name: string;
  description: string;
  color: string;
}

export interface StoryProgressData {
  currentChapter: number;
  highestChapterUnlocked: number;
  highestStorySector: number;
  storyCompleted: boolean;
  bossesDefeated: {
    monolithSector5: boolean;
    tesseractSector10: boolean;
    leviathanSector15: boolean;
    chronoWeaverSector20: boolean;
    primordialArchitectSector25: boolean;
  };
}

export interface GameProgressionData {
  quantumShards: number;
  runsPlayed: number;
  runsCompleted: number;
  victories: number;
  bestSector: number;
  highestScore: number;
  totalCubesDestroyed: number;
  upgradeExtraBalls: number;
  upgradeBasketWidth: number;
  upgradeRerolls: number;
  // Archetypes unlocked
  unlockedArchetypes: ArchetypeId[];
  // Relics unlocked
  unlockedRelics: RelicId[];
  // Fusion Combos unlocked
  unlockedFusionCombos: FusionComboId[];
  // Boss kill tracking
  bossesDefeated: {
    monolithSector5: boolean;
    tesseractSector10: boolean;
    leviathanSector15: boolean;
    chronoWeaverSector20?: boolean;
    primordialArchitectSector25?: boolean;
  };
  storyProgress: StoryProgressData;
  savedRun: SavedRunState;
}
