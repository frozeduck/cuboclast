import {
  GameProgressionData,
  ArchetypeId,
  RelicId,
  FusionComboId,
  UnlockEventNotification,
  ARCHETYPES_DATA,
  RELICS_DATA,
  FUSION_COMBOS,
  GameMode,
  StoryProgressData,
} from '../types/game';

const STORAGE_KEY = 'cuboclast_meta_progression_v2';

const defaultProgression: GameProgressionData = {
  quantumShards: 0,
  runsPlayed: 0,
  runsCompleted: 0,
  victories: 0,
  bestSector: 1,
  highestScore: 0,
  totalCubesDestroyed: 0,
  upgradeExtraBalls: 0,
  upgradeBasketWidth: 0,
  upgradeRerolls: 0,
  unlockedArchetypes: ['VOLT_OVERCHARGE', 'PYRO_DETONATOR', 'SWARM_MATRIX'],
  unlockedRelics: [
    'CHAIN_LIGHTNING',
    'VOLT_DISCHARGE',
    'TESLA_COIL',
    'EMP_BURST',
    'BOUNCING_BOMB',
    'SHRAPNEL_BURST',
    'CLUSTER_CHARGE',
    'SUPERNOVA',
    'MULTIBALL_REACTOR',
    'QUANTUM_DUPLICATION',
    'SPLIT_STORM',
    'MICRO_SWARM',
    'KINETIC_SURGE',
    'CRITICAL_OVERDRIVE',
    'MAGNETIC_BASKET',
    'HEAVY_MASS',
    'SAFETY_NET',
    'PIERCING_RAIL',
    'HYPER_VELOCITY',
  ],
  unlockedFusionCombos: [],
  bossesDefeated: {
    monolithSector5: false,
    tesseractSector10: false,
    leviathanSector15: false,
    chronoWeaverSector20: false,
    primordialArchitectSector25: false,
  },
  storyProgress: {
    currentChapter: 1,
    highestChapterUnlocked: 1,
    highestStorySector: 1,
    storyCompleted: false,
    bossesDefeated: {
      monolithSector5: false,
      tesseractSector10: false,
      leviathanSector15: false,
      chronoWeaverSector20: false,
      primordialArchitectSector25: false,
    },
  },
  savedRun: {
    hasActiveRun: false,
    savedLevel: 1,
    savedScore: 0,
    savedBalls: 8,
    savedArchetype: '',
    savedRelics: [],
    savedShardsRun: 0,
    savedIsEndless: false,
    gameMode: 'STORY',
  },
};

export class ProgressionManager {
  private data: GameProgressionData;
  public pendingUnlocks: UnlockEventNotification[] = [];

  constructor() {
    this.data = this.load();
    this.checkAndTriggerUnlocks();
  }

  public getData(): GameProgressionData {
    return this.data;
  }

  private load(): GameProgressionData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...defaultProgression,
          ...parsed,
          unlockedArchetypes: Array.from(
            new Set([...defaultProgression.unlockedArchetypes, ...(parsed.unlockedArchetypes || [])])
          ),
          unlockedRelics: Array.from(
            new Set([...defaultProgression.unlockedRelics, ...(parsed.unlockedRelics || [])])
          ),
          unlockedFusionCombos: Array.from(
            new Set([...defaultProgression.unlockedFusionCombos, ...(parsed.unlockedFusionCombos || [])])
          ),
          bossesDefeated: {
            ...defaultProgression.bossesDefeated,
            ...(parsed.bossesDefeated || {}),
          },
          storyProgress: {
            ...defaultProgression.storyProgress,
            ...(parsed.storyProgress || {}),
            bossesDefeated: {
              ...defaultProgression.storyProgress.bossesDefeated,
              ...((parsed.storyProgress && parsed.storyProgress.bossesDefeated) || {}),
            },
          },
          savedRun: {
            ...defaultProgression.savedRun,
            ...(parsed.savedRun || {}),
          },
        };
      }
    } catch {
      // fallback
    }
    return {
      ...defaultProgression,
      savedRun: { ...defaultProgression.savedRun },
      bossesDefeated: { ...defaultProgression.bossesDefeated },
      storyProgress: {
        ...defaultProgression.storyProgress,
        bossesDefeated: { ...defaultProgression.storyProgress.bossesDefeated },
      },
    };
  }

  public save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // ignore
    }
  }

  public addQuantumShards(amount: number) {
    this.data.quantumShards += amount;
    this.save();
  }

  public addCubesDestroyed(count: number = 1) {
    this.data.totalCubesDestroyed += count;
    this.checkAndTriggerUnlocks();
  }

  public recordScoreAndLevel(score: number, level: number) {
    if (score > this.data.highestScore) {
      this.data.highestScore = score;
    }
    if (level > this.data.bestSector) {
      this.data.bestSector = level;
    }
    this.save();
  }

  public recordRunStart() {
    this.data.runsPlayed++;
    this.save();
  }

  public recordRunEnd() {
    this.data.runsCompleted++;
    this.checkAndTriggerUnlocks();
    this.save();
  }

  public recordVictory() {
    this.data.victories++;
    this.data.bossesDefeated.tesseractSector10 = true;
    this.checkAndTriggerUnlocks();
    this.save();
  }

  public recordBossDefeated(level: number) {
    if (!this.data.storyProgress) {
      this.data.storyProgress = {
        currentChapter: 1,
        highestChapterUnlocked: 1,
        highestStorySector: 1,
        storyCompleted: false,
        bossesDefeated: {
          monolithSector5: false,
          tesseractSector10: false,
          leviathanSector15: false,
          chronoWeaverSector20: false,
          primordialArchitectSector25: false,
        },
      };
    }

    if (level === 5) {
      this.data.bossesDefeated.monolithSector5 = true;
      this.data.storyProgress.bossesDefeated.monolithSector5 = true;
      this.data.storyProgress.highestChapterUnlocked = Math.max(this.data.storyProgress.highestChapterUnlocked, 2);
    } else if (level === 10) {
      this.data.bossesDefeated.tesseractSector10 = true;
      this.data.storyProgress.bossesDefeated.tesseractSector10 = true;
      this.data.storyProgress.highestChapterUnlocked = Math.max(this.data.storyProgress.highestChapterUnlocked, 3);
    } else if (level === 15) {
      this.data.bossesDefeated.leviathanSector15 = true;
      this.data.storyProgress.bossesDefeated.leviathanSector15 = true;
      this.data.storyProgress.highestChapterUnlocked = Math.max(this.data.storyProgress.highestChapterUnlocked, 4);
    } else if (level === 20) {
      this.data.bossesDefeated.chronoWeaverSector20 = true;
      this.data.storyProgress.bossesDefeated.chronoWeaverSector20 = true;
      this.data.storyProgress.highestChapterUnlocked = Math.max(this.data.storyProgress.highestChapterUnlocked, 5);
    } else if (level >= 25) {
      this.data.bossesDefeated.primordialArchitectSector25 = true;
      this.data.storyProgress.bossesDefeated.primordialArchitectSector25 = true;
      this.recordStoryCompleted();
    }

    this.data.storyProgress.highestStorySector = Math.max(
      this.data.storyProgress.highestStorySector,
      level
    );

    this.checkAndTriggerUnlocks();
    this.save();
  }

  public recordStoryCompleted() {
    if (!this.data.storyProgress.storyCompleted) {
      this.data.storyProgress.storyCompleted = true;
      this.data.quantumShards += 500;
      this.pendingUnlocks.push({
        title: 'CAMPAGNA STORIA COMPLETATA!',
        type: 'ARCHETYPE',
        name: 'Vittoria Galattica Cosmica',
        description: 'Hai sconfitto l Architetto Primordiale! +500 Schegge Quantiche e sbloccato l Abisso Infinito!',
        color: '#e11d48',
      });
      this.save();
    }
  }

  public checkAndTriggerUnlocks(): UnlockEventNotification[] {
    const newUnlocks: UnlockEventNotification[] = [];

    // 1. Check Archetype unlocks based on runs & bosses
    if (this.data.runsPlayed >= 1 && !this.data.unlockedArchetypes.includes('KINETIC_TITAN')) {
      this.data.unlockedArchetypes.push('KINETIC_TITAN');
      newUnlocks.push({
        title: 'NUOVO ARCHETIPO SBLOCCATO!',
        type: 'ARCHETYPE',
        name: ARCHETYPES_DATA.KINETIC_TITAN.title,
        description: 'Colosso Cinetico con cestello maggiorato (260px) e +1 danno naturale!',
        color: ARCHETYPES_DATA.KINETIC_TITAN.color,
      });
    }

    if (this.data.bossesDefeated.monolithSector5 && !this.data.unlockedArchetypes.includes('CRYSTAL_SINGULARITY')) {
      this.data.unlockedArchetypes.push('CRYSTAL_SINGULARITY');
      newUnlocks.push({
        title: 'ARCHETIPO BOSS SBLOCCATO!',
        type: 'ARCHETYPE',
        name: ARCHETYPES_DATA.CRYSTAL_SINGULARITY.title,
        description: 'Sconfitto The Monolith! Sbloccata la Criotempesta Quantica con danno congelato 2x.',
        color: ARCHETYPES_DATA.CRYSTAL_SINGULARITY.color,
      });
    }

    if (this.data.bossesDefeated.tesseractSector10 && !this.data.unlockedArchetypes.includes('QUANTUM_SINGULARITY')) {
      this.data.unlockedArchetypes.push('QUANTUM_SINGULARITY');
      newUnlocks.push({
        title: 'ARCHETIPO SUPREMO SBLOCCATO!',
        type: 'ARCHETYPE',
        name: ARCHETYPES_DATA.QUANTUM_SINGULARITY.title,
        description: 'Sconfitto l Omega Tesseract! Sbloccate le sfere buco nero gravitazionali.',
        color: ARCHETYPES_DATA.QUANTUM_SINGULARITY.color,
      });
    }

    if (this.data.runsCompleted >= 3 && !this.data.unlockedArchetypes.includes('CHRONO_PULSE')) {
      this.data.unlockedArchetypes.push('CHRONO_PULSE');
      newUnlocks.push({
        title: 'ARCHETIPO ESPERTO SBLOCCATO!',
        type: 'ARCHETYPE',
        name: ARCHETYPES_DATA.CHRONO_PULSE.title,
        description: '3 Run completate! Sovraccarico temporale con rallentamento e shockwave su combo.',
        color: ARCHETYPES_DATA.CHRONO_PULSE.color,
      });
    }

    // 2. Check Secret Relics
    if (this.data.bossesDefeated.monolithSector5 && !this.data.unlockedRelics.includes('POLAR_VORTEX')) {
      this.data.unlockedRelics.push('POLAR_VORTEX');
      newUnlocks.push({
        title: 'RELIQUIA SEGRETA SBLOCCATA!',
        type: 'RELIC',
        name: RELICS_DATA.POLAR_VORTEX.title,
        description: RELICS_DATA.POLAR_VORTEX.description,
        color: '#00e5ff',
      });
    }

    if (this.data.bossesDefeated.tesseractSector10 && !this.data.unlockedRelics.includes('CHRONO_WARP')) {
      this.data.unlockedRelics.push('CHRONO_WARP');
      newUnlocks.push({
        title: 'RELIQUIA SUPREMA SBLOCCATA!',
        type: 'RELIC',
        name: RELICS_DATA.CHRONO_WARP.title,
        description: RELICS_DATA.CHRONO_WARP.description,
        color: '#ffe600',
      });
    }

    if (this.data.runsCompleted >= 2 && !this.data.unlockedRelics.includes('GRAVITY_WELL')) {
      this.data.unlockedRelics.push('GRAVITY_WELL');
      newUnlocks.push({
        title: 'RELIQUIA GRAVITAZIONALE SBLOCCATA!',
        type: 'RELIC',
        name: RELICS_DATA.GRAVITY_WELL.title,
        description: RELICS_DATA.GRAVITY_WELL.description,
        color: '#a855f7',
      });
    }

    if (this.data.totalCubesDestroyed >= 150 && !this.data.unlockedRelics.includes('PLASMA_CONDUIT')) {
      this.data.unlockedRelics.push('PLASMA_CONDUIT');
      newUnlocks.push({
        title: 'RELIQUIA CONDOTTO PLASMA SBLOCCATA!',
        type: 'RELIC',
        name: RELICS_DATA.PLASMA_CONDUIT.title,
        description: RELICS_DATA.PLASMA_CONDUIT.description,
        color: '#00e5ff',
      });
    }

    if (this.data.totalCubesDestroyed >= 300 && !this.data.unlockedRelics.includes('SUPERNOVA_CATALYST')) {
      this.data.unlockedRelics.push('SUPERNOVA_CATALYST');
      newUnlocks.push({
        title: 'RELIQUIA CATALIZZATORE SBLOCCATA!',
        type: 'RELIC',
        name: RELICS_DATA.SUPERNOVA_CATALYST.title,
        description: RELICS_DATA.SUPERNOVA_CATALYST.description,
        color: '#ff6b00',
      });
    }

    // 3. Check Dual-Element Fusion Combos
    if (this.data.bossesDefeated.monolithSector5 && !this.data.unlockedFusionCombos.includes('PLASMA_OVERLOAD')) {
      this.data.unlockedFusionCombos.push('PLASMA_OVERLOAD');
      newUnlocks.push({
        title: 'NUOVA COMBO FUSIONE SBLOCCATA!',
        type: 'COMBO',
        name: FUSION_COMBOS.PLASMA_OVERLOAD.title,
        description: FUSION_COMBOS.PLASMA_OVERLOAD.description,
        color: FUSION_COMBOS.PLASMA_OVERLOAD.color,
      });
    }

    if (this.data.runsPlayed >= 1 && !this.data.unlockedFusionCombos.includes('MAGNETIC_SURGE')) {
      this.data.unlockedFusionCombos.push('MAGNETIC_SURGE');
      newUnlocks.push({
        title: 'NUOVA COMBO FUSIONE SBLOCCATA!',
        type: 'COMBO',
        name: FUSION_COMBOS.MAGNETIC_SURGE.title,
        description: FUSION_COMBOS.MAGNETIC_SURGE.description,
        color: FUSION_COMBOS.MAGNETIC_SURGE.color,
      });
    }

    if (this.data.runsCompleted >= 2 && !this.data.unlockedFusionCombos.includes('SWARM_DETONATOR')) {
      this.data.unlockedFusionCombos.push('SWARM_DETONATOR');
      newUnlocks.push({
        title: 'NUOVA COMBO FUSIONE SBLOCCATA!',
        type: 'COMBO',
        name: FUSION_COMBOS.SWARM_DETONATOR.title,
        description: FUSION_COMBOS.SWARM_DETONATOR.description,
        color: FUSION_COMBOS.SWARM_DETONATOR.color,
      });
    }

    if (this.data.totalCubesDestroyed >= 200 && !this.data.unlockedFusionCombos.includes('HYPER_SWARM')) {
      this.data.unlockedFusionCombos.push('HYPER_SWARM');
      newUnlocks.push({
        title: 'NUOVA COMBO FUSIONE SBLOCCATA!',
        type: 'COMBO',
        name: FUSION_COMBOS.HYPER_SWARM.title,
        description: FUSION_COMBOS.HYPER_SWARM.description,
        color: FUSION_COMBOS.HYPER_SWARM.color,
      });
    }

    if (this.data.bossesDefeated.tesseractSector10 && !this.data.unlockedFusionCombos.includes('CRYO_SHOCK')) {
      this.data.unlockedFusionCombos.push('CRYO_SHOCK');
      newUnlocks.push({
        title: 'COMBO FUSIONE SUPREMA SBLOCCATA!',
        type: 'COMBO',
        name: FUSION_COMBOS.CRYO_SHOCK.title,
        description: FUSION_COMBOS.CRYO_SHOCK.description,
        color: FUSION_COMBOS.CRYO_SHOCK.color,
      });
    }

    if (newUnlocks.length > 0) {
      this.pendingUnlocks.push(...newUnlocks);
      this.save();
    }

    return newUnlocks;
  }

  public popNextUnlock(): UnlockEventNotification | null {
    return this.pendingUnlocks.shift() || null;
  }

  public isArchetypeUnlocked(id: ArchetypeId): boolean {
    return this.data.unlockedArchetypes.includes(id);
  }

  public unlockArchetypeWithShards(id: ArchetypeId): boolean {
    const arch = ARCHETYPES_DATA[id];
    if (!arch || !arch.unlockCost || this.isArchetypeUnlocked(id)) return false;
    if (this.data.quantumShards >= arch.unlockCost) {
      this.data.quantumShards -= arch.unlockCost;
      this.data.unlockedArchetypes.push(id);
      this.save();
      return true;
    }
    return false;
  }

  public isFusionComboUnlocked(id: FusionComboId): boolean {
    return this.data.unlockedFusionCombos.includes(id);
  }

  public saveActiveRun(
    level: number,
    score: number,
    balls: number,
    archetype: ArchetypeId,
    relics: RelicId[],
    shardsRun: number,
    isEndless: boolean,
    gameMode: GameMode = 'STORY'
  ) {
    this.data.savedRun = {
      hasActiveRun: true,
      savedLevel: level,
      savedScore: score,
      savedBalls: balls,
      savedArchetype: archetype,
      savedRelics: [...relics],
      savedShardsRun: shardsRun,
      savedIsEndless: isEndless,
      gameMode,
    };
    this.recordScoreAndLevel(score, level);
    this.save();
  }

  public clearActiveRun() {
    this.data.savedRun = {
      hasActiveRun: false,
      savedLevel: 1,
      savedScore: 0,
      savedBalls: 8,
      savedArchetype: '',
      savedRelics: [],
      savedShardsRun: 0,
      savedIsEndless: false,
      gameMode: 'STORY',
    };
    this.save();
  }

  public getCostExtraBalls(): number {
    return (this.data.upgradeExtraBalls + 1) * 75;
  }

  public getCostBasketWidth(): number {
    return (this.data.upgradeBasketWidth + 1) * 50;
  }

  public getCostRerolls(): number {
    return (this.data.upgradeRerolls + 1) * 100;
  }

  public buyExtraBalls(): boolean {
    const cost = this.getCostExtraBalls();
    if (this.data.upgradeExtraBalls < 3 && this.data.quantumShards >= cost) {
      this.data.quantumShards -= cost;
      this.data.upgradeExtraBalls++;
      this.save();
      return true;
    }
    return false;
  }

  public buyBasketWidth(): boolean {
    const cost = this.getCostBasketWidth();
    if (this.data.upgradeBasketWidth < 3 && this.data.quantumShards >= cost) {
      this.data.quantumShards -= cost;
      this.data.upgradeBasketWidth++;
      this.save();
      return true;
    }
    return false;
  }

  public buyReroll(): boolean {
    const cost = this.getCostRerolls();
    if (this.data.upgradeRerolls < 2 && this.data.quantumShards >= cost) {
      this.data.quantumShards -= cost;
      this.data.upgradeRerolls++;
      this.save();
      return true;
    }
    return false;
  }
}

export const progressionManager = new ProgressionManager();
