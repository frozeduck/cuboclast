export const VIRTUAL_WIDTH = 1080;
export const VIRTUAL_HEIGHT = 1920;
export const CANNON_X = VIRTUAL_WIDTH / 2;
export const CANNON_Y = 120;
export const GRAVITY = 980;

export type GameState =
  | 'ARCHETYPE_SELECT'
  | 'CHAPTER_INTRO'
  | 'AIMING'
  | 'BALL_IN_PLAY'
  | 'FEVER'
  | 'RELIC_DRAFT'
  | 'SECTOR_MAP'
  | 'SECTOR_EVENT'
  | 'RUN_MERCHANT'
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
  | 'PROTO_CORE'
  | 'VOLT_OVERCHARGE'
  | 'PYRO_DETONATOR'
  | 'KINETIC_TITAN'
  | 'SWARM_MATRIX'
  | 'CRYSTAL_SINGULARITY'
  | 'CHRONO_PULSE'
  | 'QUANTUM_SINGULARITY';

export interface ArchetypeInfo {
  id: ArchetypeId;
  title: string;
  passiveName: string;
  description: string;
  family: RelicFamilyId;
  color: string;
  initialRelic: RelicId | null;
  unlockedByDefault: boolean;
  unlockChapter: number;
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
  | 'POLAR_VORTEX'
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
  | 'CHRONO_WARP';

export interface RelicInfo {
  id: RelicId;
  family: RelicFamilyId;
  title: string;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5;
  unlockCondition?: string;
  isSecret?: boolean;
}

export const RELICS_DATA: Record<RelicId, RelicInfo> = {
  // --- TIER 1: Starter & Chapter I Relics ---
  KINETIC_SURGE: {
    id: 'KINETIC_SURGE',
    family: 'KINETIC',
    title: 'Kinetic Surge',
    description: 'Ogni rimbalzo aumenta il danno della sfera di +1 per quel tiro.',
    tier: 1,
  },
  MAGNETIC_BASKET: {
    id: 'MAGNETIC_BASKET',
    family: 'KINETIC',
    title: 'Cestello Magnetico',
    description: 'Il cestello è più largo (+50px) e cattura le sfere con forte attrazione magnetica.',
    tier: 1,
  },
  SAFETY_NET: {
    id: 'SAFETY_NET',
    family: 'KINETIC',
    title: 'Rete di Sicurezza',
    description: 'Un campo di forza respinge la prima sfera caduta in ogni settore.',
    tier: 1,
  },
  CHAIN_LIGHTNING: {
    id: 'CHAIN_LIGHTNING',
    family: 'ELECTRIC',
    title: 'Fulmine a Catena',
    description: 'Ogni 2 rimbalzi scaglia un fulmine su 2 cubi per 3 danni.',
    tier: 1,
  },
  BOUNCING_BOMB: {
    id: 'BOUNCING_BOMB',
    family: 'EXPLOSIVE',
    title: 'Sfera Bomba',
    description: "All'8° rimbalzo la sfera genera una massiccia detonazione ad area (230px).",
    tier: 1,
  },
  MULTIBALL_REACTOR: {
    id: 'MULTIBALL_REACTOR',
    family: 'MULTIBALL',
    title: 'Reattore Multiball',
    description: 'Distruggere un cubo ha il 30% di probabilità di generare una mini-sfera.',
    tier: 1,
  },
  VOLT_DISCHARGE: {
    id: 'VOLT_DISCHARGE',
    family: 'ELECTRIC',
    title: 'Scarica di Tensione',
    description: 'Ogni 4 cubi colpiti rilascia un arco voltaico circolare da 4 danni.',
    tier: 1,
    unlockCondition: 'Raggiungi il Settore 3',
  },
  HEAVY_MASS: {
    id: 'HEAVY_MASS',
    family: 'KINETIC',
    title: 'Massa Inerziale',
    description: 'Infligge +4 danni extra contro i cubi corazzati e i boss.',
    tier: 1,
    unlockCondition: 'Raggiungi il Settore 3',
  },
  HYPER_VELOCITY: {
    id: 'HYPER_VELOCITY',
    family: 'KINETIC',
    title: 'Iper-Velocità',
    description: 'Le sfere viaggiano il 25% più veloci e infliggono +1 danno base.',
    tier: 1,
    unlockCondition: 'Raggiungi il Settore 3',
  },

  // --- TIER 2: Chapter II Unlocks (After Boss Sector 5) ---
  SHRAPNEL_BURST: {
    id: 'SHRAPNEL_BURST',
    family: 'EXPLOSIVE',
    title: 'Schegge Taglienti',
    description: 'I cubi distrutti proiettano 4 schegge geometriche perforanti ad alta velocità.',
    tier: 2,
    unlockCondition: 'Sblocca il Capitolo II (Sconfiggi The Monolith - Sett. 5)',
  },
  TESLA_COIL: {
    id: 'TESLA_COIL',
    family: 'ELECTRIC',
    title: 'Bobina Tesla',
    description: 'Il cestello emette scariche elettriche verso i cubi più vicini quando si sposta.',
    tier: 2,
    unlockCondition: 'Sblocca il Capitolo II (Sconfiggi The Monolith - Sett. 5)',
  },
  CRITICAL_OVERDRIVE: {
    id: 'CRITICAL_OVERDRIVE',
    family: 'KINETIC',
    title: 'Sovraccarico Critico',
    description: "30% di probabilità di colpo critico (danno x3 e potente onda d'urto).",
    tier: 2,
    unlockCondition: 'Sblocca il Capitolo II (Sconfiggi The Monolith - Sett. 5)',
  },
  QUANTUM_DUPLICATION: {
    id: 'QUANTUM_DUPLICATION',
    family: 'MULTIBALL',
    title: 'Duplicazione Quantica',
    description: 'Al 10° rimbalzo duplica la sfera in campo con piena energia cinetica.',
    tier: 2,
    unlockCondition: 'Sblocca il Capitolo II (Sconfiggi The Monolith - Sett. 5)',
  },
  POLAR_VORTEX: {
    id: 'POLAR_VORTEX',
    family: 'ELECTRIC',
    title: 'Vortice Polare',
    description: 'I fulmini congelano i cubi colpiti e raddoppiano le schegge quantiche rilasciate.',
    tier: 2,
    unlockCondition: 'Sconfiggi il Boss The Monolith (Settore 5)',
    isSecret: true,
  },

  // --- TIER 3: Chapter III Unlocks (After Boss Sector 10) ---
  CLUSTER_CHARGE: {
    id: 'CLUSTER_CHARGE',
    family: 'EXPLOSIVE',
    title: 'Carica a Grappolo',
    description: 'Le esplosioni rilasciano 3 micro-bombe a impatto secondario.',
    tier: 3,
    unlockCondition: 'Sblocca il Capitolo III (Sconfiggi Omega Tesseract - Sett. 10)',
  },
  SPLIT_STORM: {
    id: 'SPLIT_STORM',
    family: 'MULTIBALL',
    title: 'Tempesta di Scissione',
    description: 'I cubi Splitter generano 3 mini-sfere invece di 2 con velocità aumentata.',
    tier: 3,
    unlockCondition: 'Sblocca il Capitolo III (Sconfiggi Omega Tesseract - Sett. 10)',
  },
  MICRO_SWARM: {
    id: 'MICRO_SWARM',
    family: 'MULTIBALL',
    title: 'Micro-Sciame',
    description: 'La sfera è accompagnata da 2 micro-orbi orbitanti protettivi.',
    tier: 3,
    unlockCondition: 'Sblocca il Capitolo III (Sconfiggi Omega Tesseract - Sett. 10)',
  },
  EMP_BURST: {
    id: 'EMP_BURST',
    family: 'ELECTRIC',
    title: 'Impulso EMP',
    description: "All'inizio di ogni settore disattiva gli scudi nemici per 10 secondi.",
    tier: 3,
    unlockCondition: 'Sblocca il Capitolo III (Sconfiggi Omega Tesseract - Sett. 10)',
  },
  PIERCING_RAIL: {
    id: 'PIERCING_RAIL',
    family: 'KINETIC',
    title: 'Sfera Perforante',
    description: 'La sfera disintegra i cubi con 2 o meno HP senza rimbalzare.',
    tier: 3,
    unlockCondition: 'Sblocca il Capitolo III (Sconfiggi Omega Tesseract - Sett. 10)',
  },

  // --- TIER 4: Chapter IV Unlocks (After Boss Sector 15) ---
  SUPERNOVA: {
    id: 'SUPERNOVA',
    family: 'EXPLOSIVE',
    title: 'Supernova Ascendente',
    description: "Quando una sfera cade sul fondo, scatena un fascio d'energia verticale verso l'alto per 8 danni.",
    tier: 4,
    unlockCondition: 'Sblocca il Capitolo IV (Sconfiggi Void Leviathan - Sett. 15)',
  },
  GRAVITY_WELL: {
    id: 'GRAVITY_WELL',
    family: 'MULTIBALL',
    title: 'Pozzo Gravitazionale',
    description: 'Genera un micro-buco nero temporaneo che attira le mini-sfere verso i cubi core.',
    tier: 4,
    unlockCondition: 'Sconfiggi Void Leviathan (Sett. 15) o completa 3 Run',
    isSecret: true,
  },
  PLASMA_CONDUIT: {
    id: 'PLASMA_CONDUIT',
    family: 'ELECTRIC',
    title: 'Condotto di Plasma',
    description: 'I fulmini infliggono il +100% danno se colpiscono cubi già danneggiati.',
    tier: 4,
    unlockCondition: 'Distruggi 150 cubi totali',
    isSecret: true,
  },
  CHRONO_WARP: {
    id: 'CHRONO_WARP',
    family: 'KINETIC',
    title: 'Distorsione Crono',
    description: 'Quando una sfera scende sotto il cestello, rallenta il tempo permettendo al cestello di raggiungerla.',
    tier: 4,
    unlockCondition: 'Sconfiggi il Boss Void Leviathan (Settore 15)',
    isSecret: true,
  },

  // --- TIER 5: Chapter V Unlocks (After Boss Sector 20) ---
  SUPERNOVA_CATALYST: {
    id: 'SUPERNOVA_CATALYST',
    family: 'EXPLOSIVE',
    title: 'Catalizzatore Nova',
    description: 'Le detonazioni aumentano di raggio del +50% e lasciano una scia infuocata.',
    tier: 5,
    unlockCondition: 'Sconfiggi Chrono Weaver (Sett. 20) o distruggi 300 cubi',
    isSecret: true,
  },
};

export const ARCHETYPES_DATA: Record<ArchetypeId, ArchetypeInfo> = {
  PROTO_CORE: {
    id: 'PROTO_CORE',
    title: 'Proto-Core Mk.I',
    passiveName: 'Calibrazione Balistica',
    description: 'Nucleo standard da addestramento privo di reliquie iniziali. Rimbalzi stabili, mira ad alta precisione e +20% punti su ogni cubo Core distrutto.',
    family: 'KINETIC',
    color: '#00e5ff',
    initialRelic: null,
    unlockedByDefault: true,
    unlockChapter: 1,
    unlockCondition: 'Nucleo Base Iniziale',
  },
  VOLT_OVERCHARGE: {
    id: 'VOLT_OVERCHARGE',
    title: 'Volt Overcharge',
    passiveName: 'Sovraccarico Voltaico',
    description: 'Tutti i fulmini infliggono +50% danno e si propagano a +1 bersaglio extra. Inizia con la reliquia Fulmine a Catena.',
    family: 'ELECTRIC',
    color: '#00e5ff',
    initialRelic: 'CHAIN_LIGHTNING',
    unlockedByDefault: false,
    unlockChapter: 1,
    unlockCondition: 'Raggiungi il Settore 3 o 50 ◆',
    unlockCost: 50,
  },
  PYRO_DETONATOR: {
    id: 'PYRO_DETONATOR',
    title: 'Pyro Detonator',
    passiveName: 'Reazione Termonucleare',
    description: 'Raggio di tutte le esplosioni aumentato del +40%. I cubi esplosivi infliggono +3 danni extra ad area. Inizia con Sfera Bomba.',
    family: 'EXPLOSIVE',
    color: '#ff6b00',
    initialRelic: 'BOUNCING_BOMB',
    unlockedByDefault: false,
    unlockChapter: 2,
    unlockCondition: 'Sconfiggi The Monolith (Sett. 5) o 100 ◆',
    unlockCost: 100,
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
    unlockChapter: 2,
    unlockCondition: 'Sconfiggi The Monolith (Sett. 5) o 100 ◆',
    unlockCost: 100,
  },
  SWARM_MATRIX: {
    id: 'SWARM_MATRIX',
    title: 'Swarm Matrix',
    passiveName: 'Protocollo Sciame',
    description: 'Le mini-sfere rimbalzano 1 volta se cadono nel vuoto e hanno il +25% di probabilità di replicarsi sui cubi splitter.',
    family: 'MULTIBALL',
    color: '#a855f7',
    initialRelic: 'MULTIBALL_REACTOR',
    unlockedByDefault: false,
    unlockChapter: 3,
    unlockCondition: 'Sconfiggi Omega Tesseract (Sett. 10) o 150 ◆',
    unlockCost: 150,
  },
  CRYSTAL_SINGULARITY: {
    id: 'CRYSTAL_SINGULARITY',
    title: 'Crystal Singularity',
    passiveName: 'Criotempesta Quantica',
    description: 'Ogni impatto applica congelamento; i cubi congelati subiscono il doppio del danno (2x) e rilasciano schegge perforanti.',
    family: 'ELECTRIC',
    color: '#38bdf8',
    initialRelic: 'PIERCING_RAIL',
    unlockedByDefault: false,
    unlockChapter: 3,
    unlockCondition: 'Sconfiggi Omega Tesseract (Sett. 10) o 175 ◆',
    unlockCost: 175,
  },
  CHRONO_PULSE: {
    id: 'CHRONO_PULSE',
    title: 'Chrono Pulse',
    passiveName: 'Sovraccarico Temporale',
    description: 'Ad ogni combo superiore a 5, il tempo rallenta e rilascia un impulso temporale che infligge danni diretti ai cubi nel settore.',
    family: 'KINETIC',
    color: '#10b981',
    initialRelic: 'CHRONO_WARP',
    unlockedByDefault: false,
    unlockChapter: 4,
    unlockCondition: 'Sconfiggi Void Leviathan (Sett. 15) o 220 ◆',
    unlockCost: 220,
  },
  QUANTUM_SINGULARITY: {
    id: 'QUANTUM_SINGULARITY',
    title: 'Quantum Singularity',
    passiveName: 'Orizzonte degli Eventi',
    description: 'Spara sfere gravitazionali che piegano lo spazio. Ogni rimbalzo genera una micro-lente gravitazionale ad alto danno.',
    family: 'MULTIBALL',
    color: '#f43f5e',
    initialRelic: 'GRAVITY_WELL',
    unlockedByDefault: false,
    unlockChapter: 5,
    unlockCondition: 'Sconfiggi Chrono Weaver (Sett. 20) o 300 ◆',
    unlockCost: 300,
  },
};

// --- Combo Fusione Roguelike ---
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
    unlockCondition: 'Sconfiggi The Monolith (Sett. 5)',
    isUnlocked: false,
    color: '#f97316',
  },
  MAGNETIC_SURGE: {
    id: 'MAGNETIC_SURGE',
    title: 'Scarica Magnetica',
    familyA: 'KINETIC',
    familyB: 'ELECTRIC',
    description: 'Ogni sfera catturata nel cestello magnetico potenzia il tiro successivo con un raggio elettrificato al +100% di danno.',
    unlockCondition: 'Raggiungi il Settore 4 in una Run',
    isUnlocked: false,
    color: '#06b6d4',
  },
  SWARM_DETONATOR: {
    id: 'SWARM_DETONATOR',
    title: 'Sciame Detonante',
    familyA: 'MULTIBALL',
    familyB: 'EXPLOSIVE',
    description: 'Tutte le mini-sfere esplodono al loro ultimo rimbalzo o prima di cadere, infliggendo 6 danni ad area.',
    unlockCondition: 'Sconfiggi Omega Tesseract (Sett. 10)',
    isUnlocked: false,
    color: '#ec4899',
  },
  HYPER_SWARM: {
    id: 'HYPER_SWARM',
    title: 'Iper-Sciame Perforante',
    familyA: 'MULTIBALL',
    familyB: 'KINETIC',
    description: 'Le mini-sfere ereditano la velocità cinetica massima e perforano i cubi con 3 o meno HP.',
    unlockCondition: 'Sconfiggi Void Leviathan (Sett. 15)',
    isUnlocked: false,
    color: '#eab308',
  },
  CRYO_SHOCK: {
    id: 'CRYO_SHOCK',
    title: 'Superconduzione Criogenica',
    familyA: 'ELECTRIC',
    familyB: 'KINETIC',
    description: 'I fulmini e gli impatti cinetici contro cubi congelati innescano una reazione a catena criogenica che raddoppia i punti.',
    unlockCondition: 'Sconfiggi Chrono Weaver (Sett. 20)',
    isUnlocked: false,
    color: '#38bdf8',
  },
};

export type SectorNodeType = 'NORMAL' | 'ELITE' | 'EVENT' | 'MERCHANT' | 'BOSS';

export interface SectorMapNode {
  id: string;
  type: SectorNodeType;
  targetSector: number;
  title: string;
  subtitle: string;
  description: string;
  rewardText: string;
  riskText: string;
  color: string;
  patternName?: string;
}

export interface SectorAnomalyChoice {
  id: string;
  label: string;
  effectText: string;
  color: string;
}

export interface SectorAnomalyEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  choices: SectorAnomalyChoice[];
}

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
  unlockedCubesLabel: string;
  allowedCubeTypes: CubeType[];
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
    description: 'Addestramento balistico con cubi standard e primi rimbalzi cinetici.',
    lore: "L'avanguardia del Tesseract ha eretto una prima barriera geometrica ai margini dello spazio conosciuto. Calibra il Proto-Core e apri una breccia.",
    hazardNote: 'Settori 1-2: Solo Cubi Standard e Core · Dal Settore 3: Cubi Cinetici.',
    unlockedCubesLabel: 'Cubi Standard + Core + Cinetici (Sett. 3+)',
    allowedCubeTypes: ['NORMAL', 'KINETIC'],
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
    description: 'Detonazioni a catena e primi cubi esplosivi ad alto potenziale.',
    lore: 'Superato il Monolite, la Cintura al Plasma brulica di celle termiche instabili pronte a esplodere a contatto.',
    hazardNote: 'Nuovi Cubi: ESPLOSIVI (Detonazione ad area alla distruzione).',
    unlockedCubesLabel: '+ Cubi Esplosivi & Reliquie Tier 2',
    allowedCubeTypes: ['NORMAL', 'KINETIC', 'EXPLOSIVE'],
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
    description: 'Scissione multiball e formazioni protette da piastre corazzate.',
    lore: 'Nelle profondità della fucina del vuoto, i cubi Splitter dividono le sfere mentre i baluardi corazzati assorbono i colpi frontali.',
    hazardNote: 'Nuovi Cubi: SPLITTER (Genera 2 mini-sfere) e CORAZZATI (HP elevati).',
    unlockedCubesLabel: '+ Cubi Splitter, Corazzati & Reliquie Tier 3',
    allowedCubeTypes: ['NORMAL', 'KINETIC', 'EXPLOSIVE', 'SPLITTER', 'ARMOR'],
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
    description: 'Generatori di scudo energetico che dimezzano i danni ai cubi adiacenti.',
    lore: 'Il tessitore temporale protegge i nodi Core con emettitori di scudo verde smeraldo che vanno eliminati per primi.',
    hazardNote: 'Nuovi Cubi: SCUDO (Riduce del 50% il danno ai cubi vicini).',
    unlockedCubesLabel: '+ Cubi Scudo & Reliquie Tier 4',
    allowedCubeTypes: ['NORMAL', 'KINETIC', 'EXPLOSIVE', 'SPLITTER', 'ARMOR', 'SHIELD'],
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
    description: 'Il cuore della matrice universale. Tutte le famiglie di cubi attive!',
    lore: "L'Architetto Primordiale schiera la matrice difensiva completa prima dello scontro finale.",
    hazardNote: 'Matrice Completa: Doppia barriera corazzata, scudi e satelliti.',
    unlockedCubesLabel: '+ Reliquie Tier 5 & Matrice Completa',
    allowedCubeTypes: ['NORMAL', 'KINETIC', 'EXPLOSIVE', 'SPLITTER', 'ARMOR', 'SHIELD'],
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
  runBonusDamage?: number;
  runBonusBasketWidth?: number;
  currentNodeType?: SectorNodeType;
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
  unlockedArchetypes: ArchetypeId[];
  unlockedRelics: RelicId[];
  unlockedFusionCombos: FusionComboId[];
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
