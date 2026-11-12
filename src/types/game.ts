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
  | 'CLASS_ABILITY'
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
    color: '#7c9cb4',
    glow: 'rgba(124, 156, 180, 0.25)',
  },
  EXPLOSIVE: {
    id: 'EXPLOSIVE',
    label: 'Esplosivo',
    color: '#c87d65',
    glow: 'rgba(200, 125, 101, 0.25)',
  },
  MULTIBALL: {
    id: 'MULTIBALL',
    label: 'Multiball',
    color: '#9b95b8',
    glow: 'rgba(155, 149, 184, 0.25)',
  },
  KINETIC: {
    id: 'KINETIC',
    label: 'Cinetico',
    color: '#d4b483',
    glow: 'rgba(212, 180, 131, 0.25)',
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
  classBlockName: string;
  classBlockEffect: string;
  family: RelicFamilyId;
  color: string;
  initialRelic: RelicId | null;
  unlockedByDefault: boolean;
  unlockChapter: number;
  unlockCondition: string;
  unlockCost?: number;
}

export type RelicRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface RelicRarityInfo {
  id: RelicRarity;
  label: string;
  color: string;
  weight: number;
  bossRequiredLabel: string;
}

export const RELIC_RARITIES: Record<RelicRarity, RelicRarityInfo> = {
  COMMON: {
    id: 'COMMON',
    label: 'Comune',
    color: '#71717a',
    weight: 60,
    bossRequiredLabel: 'Base (Disponibile da subito)',
  },
  UNCOMMON: {
    id: 'UNCOMMON',
    label: 'Non Comune',
    color: '#7fa68e',
    weight: 30,
    bossRequiredLabel: 'Sconfiggi Boss 1: The Monolith (Sett. 5)',
  },
  RARE: {
    id: 'RARE',
    label: 'Rara',
    color: '#7c9cb4',
    weight: 15,
    bossRequiredLabel: 'Sconfiggi Boss 2: Omega Tesseract (Sett. 10)',
  },
  EPIC: {
    id: 'EPIC',
    label: 'Epica',
    color: '#9b95b8',
    weight: 8,
    bossRequiredLabel: 'Sconfiggi Boss 3: Void Leviathan (Sett. 15)',
  },
  LEGENDARY: {
    id: 'LEGENDARY',
    label: 'Leggendaria',
    color: '#d4b483',
    weight: 4,
    bossRequiredLabel: 'Sconfiggi Boss 4: Chrono Weaver (Sett. 20)',
  },
};

export type RelicId =
  // COMMON (Low-power starter pool)
  | 'MICRO_CAPACITOR'
  | 'BLAST_CAP'
  | 'ECHO_PEBBLE'
  | 'KINETIC_SURGE'
  | 'MAGNETIC_BASKET'
  | 'SAFETY_NET'
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
  | 'CRITICAL_OVERDRIVE'
  | 'HEAVY_MASS'
  | 'PIERCING_RAIL'
  | 'HYPER_VELOCITY'
  | 'CHRONO_WARP';

export interface RelicInfo {
  id: RelicId;
  family: RelicFamilyId;
  rarity: RelicRarity;
  title: string;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5;
  unlockCondition?: string;
  isSecret?: boolean;
}

export const RELICS_DATA: Record<RelicId, RelicInfo> = {
  // --- TIER 1 (COMMON): Modest Low-Rarity Starter Power-Ups ---
  MICRO_CAPACITOR: {
    id: 'MICRO_CAPACITOR',
    family: 'ELECTRIC',
    rarity: 'COMMON',
    title: 'Condensatore Statico',
    description: 'Ogni 5 rimbalzi scarica una scintilla statica da 1 danno sul cubo più vicino.',
    tier: 1,
  },
  BLAST_CAP: {
    id: 'BLAST_CAP',
    family: 'EXPLOSIVE',
    rarity: 'COMMON',
    title: 'Innesco Leggero',
    description: "Al 10° rimbalzo rilascia una piccola onda d'urto locale (120px) da 2 danni.",
    tier: 1,
  },
  ECHO_PEBBLE: {
    id: 'ECHO_PEBBLE',
    family: 'MULTIBALL',
    rarity: 'COMMON',
    title: 'Scheggia Eco',
    description: 'Distruggere un cubo Core ha il 15% di probabilità di generare 1 micro-sfera leggera.',
    tier: 1,
  },
  KINETIC_SURGE: {
    id: 'KINETIC_SURGE',
    family: 'KINETIC',
    rarity: 'COMMON',
    title: 'Attrito Cinetico',
    description: 'Dopo 6 rimbalzi nello stesso tiro, la sfera ottiene +1 danno fino a fine tiro.',
    tier: 1,
  },
  MAGNETIC_BASKET: {
    id: 'MAGNETIC_BASKET',
    family: 'KINETIC',
    rarity: 'COMMON',
    title: 'Bordo Calamita',
    description: 'Allarga leggermente il cestello (+25px) e applica una leggera attrazione.',
    tier: 1,
  },
  SAFETY_NET: {
    id: 'SAFETY_NET',
    family: 'KINETIC',
    rarity: 'COMMON',
    title: 'Paratia di Emergenza',
    description: 'Una volta per settore, ha il 50% di probabilità di rimbalzare la prima sfera caduta.',
    tier: 1,
  },

  // --- TIER 2 (UNCOMMON): Unlocked by Defeating Boss 1 (The Monolith - Sector 5) ---
  CHAIN_LIGHTNING: {
    id: 'CHAIN_LIGHTNING',
    family: 'ELECTRIC',
    rarity: 'UNCOMMON',
    title: 'Fulmine a Catena',
    description: 'Ogni 4 rimbalzi scaglia un fulmine su 2 cubi per 2 danni.',
    tier: 2,
    unlockCondition: 'Sconfiggi Boss 1: The Monolith (Settore 5)',
  },
  BOUNCING_BOMB: {
    id: 'BOUNCING_BOMB',
    family: 'EXPLOSIVE',
    rarity: 'UNCOMMON',
    title: 'Sfera Bomba',
    description: 'Al 9° rimbalzo la sfera genera una detonazione ad area (180px) da 4 danni.',
    tier: 2,
    unlockCondition: 'Sconfiggi Boss 1: The Monolith (Settore 5)',
  },
  MULTIBALL_REACTOR: {
    id: 'MULTIBALL_REACTOR',
    family: 'MULTIBALL',
    rarity: 'UNCOMMON',
    title: 'Reattore Multiball',
    description: 'Distruggere un cubo ha il 18% di probabilità di generare 1 mini-sfera.',
    tier: 2,
    unlockCondition: 'Sconfiggi Boss 1: The Monolith (Settore 5)',
  },
  VOLT_DISCHARGE: {
    id: 'VOLT_DISCHARGE',
    family: 'ELECTRIC',
    rarity: 'UNCOMMON',
    title: 'Scarica di Tensione',
    description: 'Ogni 6 cubi colpiti rilascia un arco voltaico circolare da 3 danni.',
    tier: 2,
    unlockCondition: 'Sconfiggi Boss 1: The Monolith (Settore 5)',
  },
  HEAVY_MASS: {
    id: 'HEAVY_MASS',
    family: 'KINETIC',
    rarity: 'UNCOMMON',
    title: 'Massa Inerziale',
    description: 'Infligge +2 danni extra contro i cubi corazzati e i boss.',
    tier: 2,
    unlockCondition: 'Sconfiggi Boss 1: The Monolith (Settore 5)',
  },
  HYPER_VELOCITY: {
    id: 'HYPER_VELOCITY',
    family: 'KINETIC',
    rarity: 'UNCOMMON',
    title: 'Iper-Velocità',
    description: 'Le sfere viaggiano il 18% più veloci e ottengono +1 danno dopo 3 rimbalzi.',
    tier: 2,
    unlockCondition: 'Sconfiggi Boss 1: The Monolith (Settore 5)',
  },

  // --- TIER 3 (RARE): Unlocked by Defeating Boss 2 (Omega Tesseract - Sector 10) ---
  SHRAPNEL_BURST: {
    id: 'SHRAPNEL_BURST',
    family: 'EXPLOSIVE',
    rarity: 'RARE',
    title: 'Schegge Taglienti',
    description: 'I cubi distrutti proiettano 4 schegge perforanti da 2 danni nelle 4 direzioni.',
    tier: 3,
    unlockCondition: 'Sconfiggi Boss 2: Omega Tesseract (Settore 10)',
  },
  TESLA_COIL: {
    id: 'TESLA_COIL',
    family: 'ELECTRIC',
    rarity: 'RARE',
    title: 'Bobina Tesla',
    description: 'Catturare la sfera nel cestello scarica un fulmine da 4 danni sul cubo più vicino.',
    tier: 3,
    unlockCondition: 'Sconfiggi Boss 2: Omega Tesseract (Settore 10)',
  },
  CRITICAL_OVERDRIVE: {
    id: 'CRITICAL_OVERDRIVE',
    family: 'KINETIC',
    rarity: 'RARE',
    title: 'Sovraccarico Critico',
    description: '22% di probabilità di colpo critico (danno x2 su impatto).',
    tier: 3,
    unlockCondition: 'Sconfiggi Boss 2: Omega Tesseract (Settore 10)',
  },
  QUANTUM_DUPLICATION: {
    id: 'QUANTUM_DUPLICATION',
    family: 'MULTIBALL',
    rarity: 'RARE',
    title: 'Duplicazione Quantica',
    description: 'Al 12° rimbalzo di un tiro genera una mini-sfera supplementare in volo.',
    tier: 3,
    unlockCondition: 'Sconfiggi Boss 2: Omega Tesseract (Settore 10)',
  },
  POLAR_VORTEX: {
    id: 'POLAR_VORTEX',
    family: 'ELECTRIC',
    rarity: 'RARE',
    title: 'Vortice Polare',
    description: 'I fulmini hanno il 50% di probabilità di congelare i cubi colpiti (+50% danno subito).',
    tier: 3,
    unlockCondition: 'Sconfiggi Boss 2: Omega Tesseract (Settore 10)',
    isSecret: true,
  },

  // --- TIER 4 (EPIC): Unlocked by Defeating Boss 3 (Void Leviathan - Sector 15) ---
  CLUSTER_CHARGE: {
    id: 'CLUSTER_CHARGE',
    family: 'EXPLOSIVE',
    rarity: 'EPIC',
    title: 'Carica a Grappolo',
    description: 'Le esplosioni rilasciano 3 micro-bombe secondarie da 3 danni.',
    tier: 4,
    unlockCondition: 'Sconfiggi Boss 3: Void Leviathan (Settore 15)',
  },
  SPLIT_STORM: {
    id: 'SPLIT_STORM',
    family: 'MULTIBALL',
    rarity: 'EPIC',
    title: 'Tempesta di Scissione',
    description: 'I cubi Splitter generano 3 mini-sfere invece di 2.',
    tier: 4,
    unlockCondition: 'Sconfiggi Boss 3: Void Leviathan (Settore 15)',
  },
  MICRO_SWARM: {
    id: 'MICRO_SWARM',
    family: 'MULTIBALL',
    rarity: 'EPIC',
    title: 'Micro-Sciame',
    description: 'Ogni 8 rimbalzi rilascia una micro-sfera orbitante da supporto.',
    tier: 4,
    unlockCondition: 'Sconfiggi Boss 3: Void Leviathan (Settore 15)',
  },
  EMP_BURST: {
    id: 'EMP_BURST',
    family: 'ELECTRIC',
    rarity: 'EPIC',
    title: 'Impulso EMP',
    description: 'I colpi elettrici ignorano la riduzione danno dei cubi Scudo.',
    tier: 4,
    unlockCondition: 'Sconfiggi Boss 3: Void Leviathan (Settore 15)',
  },
  PIERCING_RAIL: {
    id: 'PIERCING_RAIL',
    family: 'KINETIC',
    rarity: 'EPIC',
    title: 'Sfera Perforante',
    description: 'La sfera attraversa senza rimbalzare i cubi non-Boss con 1 solo HP rimasto.',
    tier: 4,
    unlockCondition: 'Sconfiggi Boss 3: Void Leviathan (Settore 15)',
  },

  // --- TIER 5 (LEGENDARY): Unlocked by Defeating Boss 4 (Chrono Weaver - Sector 20) ---
  SUPERNOVA: {
    id: 'SUPERNOVA',
    family: 'EXPLOSIVE',
    rarity: 'LEGENDARY',
    title: 'Supernova Ascendente',
    description: "Quando la sfera principale cade sul fondo, lancia un raggio verticale da 5 danni.",
    tier: 5,
    unlockCondition: 'Sconfiggi Boss 4: Chrono Weaver (Settore 20)',
  },
  GRAVITY_WELL: {
    id: 'GRAVITY_WELL',
    family: 'MULTIBALL',
    rarity: 'LEGENDARY',
    title: 'Pozzo Gravitazionale',
    description: 'Attira leggermente le mini-sfere in volo verso il cubo Core più vicino.',
    tier: 5,
    unlockCondition: 'Sconfiggi Boss 4: Chrono Weaver (Settore 20)',
    isSecret: true,
  },
  PLASMA_CONDUIT: {
    id: 'PLASMA_CONDUIT',
    family: 'ELECTRIC',
    rarity: 'LEGENDARY',
    title: 'Condotto di Plasma',
    description: 'I fulmini infliggono +2 danni extra ai cubi già danneggiati.',
    tier: 5,
    unlockCondition: 'Sconfiggi Boss 4: Chrono Weaver (Settore 20)',
    isSecret: true,
  },
  CHRONO_WARP: {
    id: 'CHRONO_WARP',
    family: 'KINETIC',
    rarity: 'LEGENDARY',
    title: 'Distorsione Crono',
    description: 'Aumenta del +35% la velocità del cestello quando la sfera sta scendendo.',
    tier: 5,
    unlockCondition: 'Sconfiggi Boss 4: Chrono Weaver (Settore 20)',
    isSecret: true,
  },
  SUPERNOVA_CATALYST: {
    id: 'SUPERNOVA_CATALYST',
    family: 'EXPLOSIVE',
    rarity: 'LEGENDARY',
    title: 'Catalizzatore Nova',
    description: 'Le detonazioni esplosive aumentano di raggio del +35% e +2 danni.',
    tier: 5,
    unlockCondition: 'Sconfiggi Boss 4: Chrono Weaver (Settore 20)',
    isSecret: true,
  },
};

export const ARCHETYPES_DATA: Record<ArchetypeId, ArchetypeInfo> = {
  PROTO_CORE: {
    id: 'PROTO_CORE',
    title: 'Proto-Core Mk.I',
    passiveName: 'Calibrazione Balistica',
    description: 'Nucleo standard da addestramento privo di reliquie iniziali. Rimbalzi stabili, mira ad alta precisione e +20% punti su ogni cubo Core distrutto.',
    classBlockName: 'Prisma Armonico',
    classBlockEffect: 'Colpo: onda armonica 1 danno ai cubi vicini · Rottura: +1 Mini-Sfera e +2 ◆',
    family: 'KINETIC',
    color: '#e4e4e7',
    initialRelic: null,
    unlockedByDefault: true,
    unlockChapter: 1,
    unlockCondition: 'Nucleo Base Iniziale',
  },
  VOLT_OVERCHARGE: {
    id: 'VOLT_OVERCHARGE',
    title: 'Volt Overcharge',
    passiveName: 'Sovraccarico Voltaico',
    description: 'I fulmini infliggono +1 danno extra. Inizia con Condensatore Statico.',
    classBlockName: 'Bobina Volt',
    classBlockEffect: 'Colpo: scarica fulmini su 2 cubi · Rottura: Tempesta Volt su 4 bersagli + tiro elettrificato',
    family: 'ELECTRIC',
    color: '#7c9cb4',
    initialRelic: 'MICRO_CAPACITOR',
    unlockedByDefault: false,
    unlockChapter: 2,
    unlockCondition: 'Sconfiggi The Monolith (Sett. 5) o 80 ◆',
    unlockCost: 80,
  },
  PYRO_DETONATOR: {
    id: 'PYRO_DETONATOR',
    title: 'Pyro Detonator',
    passiveName: 'Reazione Termonucleare',
    description: 'Raggio esplosioni +25%. Inizia con Innesco Leggero.',
    classBlockName: 'Innesco Solare',
    classBlockEffect: 'Colpo: vampa termica 2 danni · Rottura: Detonazione Solare da 6 danni ad area',
    family: 'EXPLOSIVE',
    color: '#c87d65',
    initialRelic: 'BLAST_CAP',
    unlockedByDefault: false,
    unlockChapter: 2,
    unlockCondition: 'Sconfiggi The Monolith (Sett. 5) o 120 ◆',
    unlockCost: 120,
  },
  KINETIC_TITAN: {
    id: 'KINETIC_TITAN',
    title: 'Kinetic Titan',
    passiveName: 'Colosso Cinetico',
    description: 'Cestello allargato (+25px) e +1 danno contro i Boss. Inizia con Attrito Cinetico.',
    classBlockName: 'Incudine Titanica',
    classBlockEffect: 'Colpo: +25% velocità e +1 danno sfera · Rottura: Sisma 3 danni a tutti i Corazzati/Boss',
    family: 'KINETIC',
    color: '#d4b483',
    initialRelic: 'KINETIC_SURGE',
    unlockedByDefault: false,
    unlockChapter: 3,
    unlockCondition: 'Sconfiggi Omega Tesseract (Sett. 10) o 160 ◆',
    unlockCost: 160,
  },
  SWARM_MATRIX: {
    id: 'SWARM_MATRIX',
    title: 'Swarm Matrix',
    passiveName: 'Protocollo Sciame',
    description: 'Le mini-sfere rimbalzano 1 volta se cadono nel vuoto. Inizia con Scheggia Eco.',
    classBlockName: 'Matrice Sciame',
    classBlockEffect: 'Colpo: genera subito +1 Mini-Sfera viola · Rottura: Eruzione Sciame da +3 Mini-Sfere',
    family: 'MULTIBALL',
    color: '#9b95b8',
    initialRelic: 'ECHO_PEBBLE',
    unlockedByDefault: false,
    unlockChapter: 3,
    unlockCondition: 'Sconfiggi Omega Tesseract (Sett. 10) o 180 ◆',
    unlockCost: 180,
  },
  CRYSTAL_SINGULARITY: {
    id: 'CRYSTAL_SINGULARITY',
    title: 'Crystal Singularity',
    passiveName: 'Criotempesta Quantica',
    description: 'Il 25% degli impatti congela il cubo (+50% danno subito). Inizia con Scarica di Tensione.',
    classBlockName: 'Crio-Cristallo',
    classBlockEffect: 'Colpo: congela 2 cubi vicini · Rottura: Zero Assoluto (congela l area e infligge 3 danni)',
    family: 'ELECTRIC',
    color: '#8ab4c9',
    initialRelic: 'VOLT_DISCHARGE',
    unlockedByDefault: false,
    unlockChapter: 4,
    unlockCondition: 'Sconfiggi Void Leviathan (Sett. 15) o 240 ◆',
    unlockCost: 240,
  },
  CHRONO_PULSE: {
    id: 'CHRONO_PULSE',
    title: 'Chrono Pulse',
    passiveName: 'Sovraccarico Temporale',
    description: 'Ad ogni combo >= 6 infligge +2 danni bonus sul colpo. Inizia con Massa Inerziale.',
    classBlockName: 'Crono-Risonatore',
    classBlockEffect: 'Colpo: +3 Combo istantanea · Rottura: Raggio a Croce da 3 danni su tutta la riga e colonna',
    family: 'KINETIC',
    color: '#7fa68e',
    initialRelic: 'HEAVY_MASS',
    unlockedByDefault: false,
    unlockChapter: 4,
    unlockCondition: 'Sconfiggi Void Leviathan (Sett. 15) o 280 ◆',
    unlockCost: 280,
  },
  QUANTUM_SINGULARITY: {
    id: 'QUANTUM_SINGULARITY',
    title: 'Quantum Singularity',
    passiveName: 'Orizzonte degli Eventi',
    description: 'Piega le traiettorie verso i Core vicini. Inizia con Reattore Multiball.',
    classBlockName: 'Nucleo Singolarità',
    classBlockEffect: 'Colpo: 2 danni al Core più vicino · Rottura: Collasso Quantico (2 danni a tutti i Core + 2 Mini-Sfere)',
    family: 'MULTIBALL',
    color: '#c46d75',
    initialRelic: 'MULTIBALL_REACTOR',
    unlockedByDefault: false,
    unlockChapter: 5,
    unlockCondition: 'Sconfiggi Chrono Weaver (Sett. 20) o 350 ◆',
    unlockCost: 350,
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
    color: '#c87d65',
  },
  MAGNETIC_SURGE: {
    id: 'MAGNETIC_SURGE',
    title: 'Scarica Magnetica',
    familyA: 'KINETIC',
    familyB: 'ELECTRIC',
    description: 'Ogni sfera catturata nel cestello magnetico potenzia il tiro successivo con un raggio elettrificato al +100% di danno.',
    unlockCondition: 'Raggiungi il Settore 4 in una Run',
    isUnlocked: false,
    color: '#7c9cb4',
  },
  SWARM_DETONATOR: {
    id: 'SWARM_DETONATOR',
    title: 'Sciame Detonante',
    familyA: 'MULTIBALL',
    familyB: 'EXPLOSIVE',
    description: 'Tutte le mini-sfere esplodono al loro ultimo rimbalzo o prima di cadere, infliggendo 6 danni ad area.',
    unlockCondition: 'Sconfiggi Omega Tesseract (Sett. 10)',
    isUnlocked: false,
    color: '#c46d75',
  },
  HYPER_SWARM: {
    id: 'HYPER_SWARM',
    title: 'Iper-Sciame Perforante',
    familyA: 'MULTIBALL',
    familyB: 'KINETIC',
    description: 'Le mini-sfere ereditano la velocità cinetica massima e perforano i cubi con 3 o meno HP.',
    unlockCondition: 'Sconfiggi Void Leviathan (Sett. 15)',
    isUnlocked: false,
    color: '#d4b483',
  },
  CRYO_SHOCK: {
    id: 'CRYO_SHOCK',
    title: 'Superconduzione Criogenica',
    familyA: 'ELECTRIC',
    familyB: 'KINETIC',
    description: 'I fulmini e gli impatti cinetici contro cubi congelati innescano una reazione a catena criogenica che raddoppia i punti.',
    unlockCondition: 'Sconfiggi Chrono Weaver (Sett. 20)',
    isUnlocked: false,
    color: '#8ab4c9',
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

export type VisualEffectType = 'LIGHTNING' | 'RING' | 'BEAM' | 'ORIGIN' | 'TARGET';

export interface VisualEffect {
  id: number;
  type: VisualEffectType;
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
  w?: number;
  h?: number;
  radius?: number;
  color: string;
  life: number;
  maxLife: number;
}

export const PLAYTEST_ARCHETYPES: ArchetypeId[] = [
  'PROTO_CORE',
  'PYRO_DETONATOR',
  'VOLT_OVERCHARGE',
  'SWARM_MATRIX',
  'KINETIC_TITAN',
];

export type FeverCapsuleType = 'BALL' | 'OVERCHARGE' | 'SHARDS';

export interface FeverCapsule {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  type: FeverCapsuleType;
  label: string;
  color: string;
  isAlive: boolean;
}

export interface FeverSummary {
  ballsCaught: number;
  overchargeCaught: number;
  shardsCaught: number;
  leftoverBallsConverted: number;
  totalOverchargeStacks: number;
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
    title: 'Periferia Monolitica',
    subtitle: 'Capitolo I · Settori 1-5',
    sectorsRange: [1, 5],
    bossSector: 5,
    bossName: 'The Monolith',
    bossTitle: 'Guardiano Tetragonale del Settore 5',
    bossColor: '#94a3b8',
    bossHp: 120,
    satelliteCount: 6,
    description: 'Addestramento balistico con cubi standard e primi rimbalzi cinetici.',
    lore: "L'avanguardia del Tesseract ha eretto una prima barriera geometrica ai margini dello spazio conosciuto. Calibra il Proto-Core e apri una breccia.",
    hazardNote: 'Settori 1-2: Solo Cubi Standard e Core · Dal Settore 3: Cubi Cinetici.',
    unlockedCubesLabel: 'Cubi Standard + Core + Reliquie Comuni',
    allowedCubeTypes: ['NORMAL', 'KINETIC'],
  },
  2: {
    id: 2,
    title: 'Cintura Termica',
    subtitle: 'Capitolo II · Settori 6-10',
    sectorsRange: [6, 10],
    bossSector: 10,
    bossName: 'Omega Tesseract',
    bossTitle: 'Nucleo Entropico del Settore 10',
    bossColor: '#c87d65',
    bossHp: 240,
    satelliteCount: 8,
    description: 'Detonazioni a catena e primi cubi esplosivi ad alto potenziale.',
    lore: 'Superato il Monolite, la Cintura Termica brulica di celle instabili pronte a detonare a contatto.',
    hazardNote: 'Nuovi Cubi: ESPLOSIVI (Detonazione ad area alla distruzione).',
    unlockedCubesLabel: '+ Cubi Esplosivi & Reliquie NON COMUNI',
    allowedCubeTypes: ['NORMAL', 'KINETIC', 'EXPLOSIVE'],
  },
  3: {
    id: 3,
    title: 'Forgia del Vuoto',
    subtitle: 'Capitolo III · Settori 11-15',
    sectorsRange: [11, 15],
    bossSector: 15,
    bossName: 'Void Leviathan',
    bossTitle: 'Serpente Meccanico del Settore 15',
    bossColor: '#d4b483',
    bossHp: 380,
    satelliteCount: 10,
    description: 'Scissione multiball e formazioni protette da piastre corazzate.',
    lore: 'Nelle profondità della fucina del vuoto, i cubi Splitter dividono le sfere mentre i baluardi corazzati assorbono i colpi frontali.',
    hazardNote: 'Nuovi Cubi: SPLITTER (Genera 2 mini-sfere) e CORAZZATI (HP elevati).',
    unlockedCubesLabel: '+ Cubi Splitter, Corazzati & Reliquie RARE',
    allowedCubeTypes: ['NORMAL', 'KINETIC', 'EXPLOSIVE', 'SPLITTER', 'ARMOR'],
  },
  4: {
    id: 4,
    title: 'Singolarità Silente',
    subtitle: 'Capitolo IV · Settori 16-20',
    sectorsRange: [16, 20],
    bossSector: 20,
    bossName: 'Chrono Weaver',
    bossTitle: 'Manipolatore Temporale del Settore 20',
    bossColor: '#7fa68e',
    bossHp: 550,
    satelliteCount: 10,
    description: 'Generatori di scudo energetico che dimezzano i danni ai cubi adiacenti.',
    lore: 'Il tessitore temporale protegge i nodi Core con emettitori di scudo che vanno eliminati per primi.',
    hazardNote: 'Nuovi Cubi: SCUDO (Riduce del 50% il danno ai cubi vicini).',
    unlockedCubesLabel: '+ Cubi Scudo & Reliquie EPICHE',
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
    bossColor: '#c46d75',
    bossHp: 750,
    satelliteCount: 12,
    description: 'Il cuore della matrice universale. Tutte le famiglie di cubi attive!',
    lore: "L'Architetto Primordiale schiera la matrice difensiva completa prima dello scontro finale.",
    hazardNote: 'Matrice Completa: Doppia barriera corazzata, scudi e satelliti.',
    unlockedCubesLabel: '+ Reliquie LEGGENDARIE & Matrice Completa',
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

export type MetaUpgradeCategory = 'OFFENSE' | 'DEFENSE' | 'ECONOMY';

export type MetaUpgradeId =
  | 'EXTRA_BALLS'
  | 'BASE_DAMAGE'
  | 'CRIT_CHANCE'
  | 'ARMOR_PIERCE'
  | 'BASKET_WIDTH'
  | 'BASKET_MAGNET'
  | 'EMERGENCY_SHIELD'
  | 'REROLLS'
  | 'SHARD_MULTIPLIER'
  | 'MERCHANT_DISCOUNT';

export interface MetaUpgradeInfo {
  id: MetaUpgradeId;
  category: MetaUpgradeCategory;
  categoryLabel: string;
  title: string;
  subtitle: string;
  description: string;
  maxLevel: number;
  costs: number[];
  color: string;
  formatEffect: (level: number) => string;
}

export const META_UPGRADES_DATA: Record<MetaUpgradeId, MetaUpgradeInfo> = {
  // --- OFFENSE / BALISTICA ---
  EXTRA_BALLS: {
    id: 'EXTRA_BALLS',
    category: 'OFFENSE',
    categoryLabel: 'Balistica',
    title: 'Riserva Munizioni',
    subtitle: 'Sfere Iniziali & Cap Massimo',
    description: 'Aumenta il numero di sfere con cui inizi ogni spedizione e la capienza massima della riserva.',
    maxLevel: 4,
    costs: [60, 120, 200, 300],
    color: '#e4e4e7',
    formatEffect: (lvl) => `+${lvl} Sfere Iniziali (Totale: ${6 + lvl})`,
  },
  BASE_DAMAGE: {
    id: 'BASE_DAMAGE',
    category: 'OFFENSE',
    categoryLabel: 'Balistica',
    title: 'Calibrazione Canna',
    subtitle: 'Danno Base del Cannone',
    description: 'Incrementa permanentemente il danno base inflitto da ogni sfera e mini-sfera lanciata.',
    maxLevel: 3,
    costs: [90, 180, 300],
    color: '#c87d65',
    formatEffect: (lvl) => `+${(lvl * 0.5).toFixed(1)} Danno Base (Totale: ${(1 + lvl * 0.5).toFixed(1)})`,
  },
  CRIT_CHANCE: {
    id: 'CRIT_CHANCE',
    category: 'OFFENSE',
    categoryLabel: 'Balistica',
    title: 'Ottica di Precisione',
    subtitle: 'Colpo Critico Balistico (Danno x2)',
    description: 'Conferisce una probabilità passiva di infliggere Danno Critico x2 su qualsiasi rimbalzo.',
    maxLevel: 4,
    costs: [55, 110, 175, 250],
    color: '#c46d75',
    formatEffect: (lvl) => `+${lvl * 5}% Probabilità Critico x2`,
  },
  ARMOR_PIERCE: {
    id: 'ARMOR_PIERCE',
    category: 'OFFENSE',
    categoryLabel: 'Balistica',
    title: 'Nucleo al Tungsteno',
    subtitle: 'Perforazione Corazza & Boss',
    description: 'Infligge danni extra contro Cubi Corazzati, Cubi Scudo, Satelliti e Guardiani Boss.',
    maxLevel: 3,
    costs: [70, 140, 230],
    color: '#d4b483',
    formatEffect: (lvl) => `+${lvl} Danno vs Corazze & Boss`,
  },

  // --- DEFENSE / DIFESA & RECUPERO ---
  BASKET_WIDTH: {
    id: 'BASKET_WIDTH',
    category: 'DEFENSE',
    categoryLabel: 'Difesa',
    title: 'Estensione Bobine',
    subtitle: 'Ampiezza Cestello Magnetico',
    description: 'Allarga permanentemente il cestello di recupero sul fondo per catturare più facilmente le sfere.',
    maxLevel: 4,
    costs: [45, 90, 145, 210],
    color: '#7fa68e',
    formatEffect: (lvl) => `+${lvl * 18}px Larghezza Cestello`,
  },
  BASKET_MAGNET: {
    id: 'BASKET_MAGNET',
    category: 'DEFENSE',
    categoryLabel: 'Difesa',
    title: 'Attrazione Gravitazionale',
    subtitle: 'Forza Magnetica del Cestello',
    description: 'Potenzia il campo magnetico del cestello che curva le sfere in caduta verso il centro di cattura.',
    maxLevel: 3,
    costs: [60, 120, 195],
    color: '#7c9cb4',
    formatEffect: (lvl) => `+${lvl * 35}% Forza & Raggio Attrazione`,
  },
  EMERGENCY_SHIELD: {
    id: 'EMERGENCY_SHIELD',
    category: 'DEFENSE',
    categoryLabel: 'Difesa',
    title: 'Paratia Deflettrice',
    subtitle: 'Salvataggio Sfere sul Fondo',
    description: 'Una volta per settore, attiva un campo repulsore sul fondo che può far rimbalzare in alto una sfera persa.',
    maxLevel: 3,
    costs: [65, 130, 210],
    color: '#9b95b8',
    formatEffect: (lvl) => `${lvl * 25}% Probabilità Salvataggio (1/Settore)`,
  },

  // --- ECONOMY / TATTICA & ECONOMIA ---
  REROLLS: {
    id: 'REROLLS',
    category: 'ECONOMY',
    categoryLabel: 'Tattica',
    title: 'Calcolatore Quantico',
    subtitle: 'Dadi Reroll nei Draft Reliquia',
    description: 'Fornisce dadi Reroll aggiuntivi a inizio run per rigenerare le scelte di Reliquie nei settori.',
    maxLevel: 3,
    costs: [75, 150, 240],
    color: '#9b95b8',
    formatEffect: (lvl) => `+${lvl} Reroll Iniziali (Totale: ${1 + lvl})`,
  },
  SHARD_MULTIPLIER: {
    id: 'SHARD_MULTIPLIER',
    category: 'ECONOMY',
    categoryLabel: 'Economia',
    title: 'Estrattore Cristallino',
    subtitle: 'Moltiplicatore Schegge Quantiche ◆',
    description: 'Aumenta la quantità di Schegge Quantiche ◆ estratte da Cubi Core, Settori completati e Boss.',
    maxLevel: 4,
    costs: [50, 100, 165, 240],
    color: '#7c9cb4',
    formatEffect: (lvl) => `+${lvl * 20}% Guadagno Schegge ◆`,
  },
  MERCHANT_DISCOUNT: {
    id: 'MERCHANT_DISCOUNT',
    category: 'ECONOMY',
    categoryLabel: 'Economia',
    title: 'Credenziali Gilda',
    subtitle: 'Sconto Mercante Orbitale In-Run',
    description: 'Riduce i prezzi in Schegge ◆ di Sfere, Danno, Cestello e Reliquie presso il Mercante Orbitale.',
    maxLevel: 3,
    costs: [55, 115, 190],
    color: '#d4b483',
    formatEffect: (lvl) => `-${lvl * 12}% Prezzi Mercante Orbitale`,
  },
};

export const META_UPGRADE_ORDER: MetaUpgradeId[] = [
  'EXTRA_BALLS',
  'BASE_DAMAGE',
  'CRIT_CHANCE',
  'ARMOR_PIERCE',
  'BASKET_WIDTH',
  'BASKET_MAGNET',
  'EMERGENCY_SHIELD',
  'REROLLS',
  'SHARD_MULTIPLIER',
  'MERCHANT_DISCOUNT',
];

export interface GameProgressionData {
  quantumShards: number;
  runsPlayed: number;
  runsCompleted: number;
  victories: number;
  bestSector: number;
  highestScore: number;
  totalCubesDestroyed: number;
  upgradeExtraBalls: number;
  upgradeBaseDamage: number;
  upgradeCritChance: number;
  upgradeArmorPierce: number;
  upgradeBasketWidth: number;
  upgradeBasketMagnet: number;
  upgradeEmergencyShield: number;
  upgradeRerolls: number;
  upgradeShardMultiplier: number;
  upgradeMerchantDiscount: number;
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
