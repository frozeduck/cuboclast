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
  CubeType,
  SectorNodeType,
  getChapterForSector,
} from '../types/game';

const STORAGE_KEY = 'cuboclast_meta_progression_v3';

const INITIAL_UNLOCKED_ARCHETYPES: ArchetypeId[] = ['PROTO_CORE'];

const INITIAL_UNLOCKED_RELICS: RelicId[] = [
  'KINETIC_SURGE',
  'MAGNETIC_BASKET',
  'SAFETY_NET',
  'CHAIN_LIGHTNING',
  'BOUNCING_BOMB',
  'MULTIBALL_REACTOR',
];

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
  unlockedArchetypes: [...INITIAL_UNLOCKED_ARCHETYPES],
  unlockedRelics: [...INITIAL_UNLOCKED_RELICS],
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
    runBonusDamage: 0,
    runBonusBasketWidth: 0,
    currentNodeType: 'NORMAL',
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
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            ...defaultProgression,
            ...parsed,
            unlockedArchetypes: Array.from(
              new Set([...INITIAL_UNLOCKED_ARCHETYPES, ...(parsed.unlockedArchetypes || [])])
            ),
            unlockedRelics: Array.from(
              new Set([...INITIAL_UNLOCKED_RELICS, ...(parsed.unlockedRelics || [])])
            ),
            unlockedFusionCombos: Array.from(
              new Set([...(parsed.unlockedFusionCombos || [])])
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
      }
    } catch {
      // fallback
    }
    return this.createFreshProgression();
  }

  private createFreshProgression(): GameProgressionData {
    return {
      ...defaultProgression,
      unlockedArchetypes: [...INITIAL_UNLOCKED_ARCHETYPES],
      unlockedRelics: [...INITIAL_UNLOCKED_RELICS],
      unlockedFusionCombos: [],
      savedRun: { ...defaultProgression.savedRun },
      bossesDefeated: { ...defaultProgression.bossesDefeated },
      storyProgress: {
        ...defaultProgression.storyProgress,
        bossesDefeated: { ...defaultProgression.storyProgress.bossesDefeated },
      },
    };
  }

  public resetProgression() {
    this.data = this.createFreshProgression();
    this.pendingUnlocks = [];
    this.save();
  }

  public save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch {
      // ignore
    }
  }

  /**
   * Returns the list of allowed special cube types for a given sector,
   * gradually introducing new cube mechanics across Chapters I-V.
   */
  public getAllowedCubeTypesForSector(sector: number): CubeType[] {
    if (sector <= 2) {
      return ['NORMAL'];
    }
    const chapter = getChapterForSector(sector);
    return [...chapter.allowedCubeTypes];
  }

  public addQuantumShards(amount: number) {
    this.data.quantumShards += amount;
    this.save();
  }

  public spendQuantumShards(amount: number): boolean {
    if (this.data.quantumShards < amount) return false;
    this.data.quantumShards -= amount;
    this.save();
    return true;
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
    if (this.data.storyProgress && level > this.data.storyProgress.highestStorySector) {
      this.data.storyProgress.highestStorySector = level;
    }
    this.checkAndTriggerUnlocks();
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
      this.data.storyProgress.highestChapterUnlocked = Math.max(
        this.data.storyProgress.highestChapterUnlocked,
        2
      );
    } else if (level === 10) {
      this.data.bossesDefeated.tesseractSector10 = true;
      this.data.storyProgress.bossesDefeated.tesseractSector10 = true;
      this.data.storyProgress.highestChapterUnlocked = Math.max(
        this.data.storyProgress.highestChapterUnlocked,
        3
      );
    } else if (level === 15) {
      this.data.bossesDefeated.leviathanSector15 = true;
      this.data.storyProgress.bossesDefeated.leviathanSector15 = true;
      this.data.storyProgress.highestChapterUnlocked = Math.max(
        this.data.storyProgress.highestChapterUnlocked,
        4
      );
    } else if (level === 20) {
      this.data.bossesDefeated.chronoWeaverSector20 = true;
      this.data.storyProgress.bossesDefeated.chronoWeaverSector20 = true;
      this.data.storyProgress.highestChapterUnlocked = Math.max(
        this.data.storyProgress.highestChapterUnlocked,
        5
      );
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
        description:
          'Hai sconfitto l Architetto Primordiale! +500 Schegge Quantiche e sbloccato l Abisso Infinito!',
        color: '#e11d48',
      });
      this.save();
    }
  }

  private unlockRelicHelper(id: RelicId, newUnlocks: UnlockEventNotification[], silent = false) {
    if (!this.data.unlockedRelics.includes(id)) {
      this.data.unlockedRelics.push(id);
      if (!silent) {
        const info = RELICS_DATA[id];
        newUnlocks.push({
          title: 'NUOVA RELIQUIA SBLOCCATA!',
          type: 'RELIC',
          name: info.title,
          description: info.description,
          color: '#00e5ff',
        });
      }
    }
  }

  public checkAndTriggerUnlocks(): UnlockEventNotification[] {
    const newUnlocks: UnlockEventNotification[] = [];

    // --- MILESTONE 1: Reach Sector 3 ---
    if (this.data.bestSector >= 3) {
      if (!this.data.unlockedArchetypes.includes('VOLT_OVERCHARGE')) {
        this.data.unlockedArchetypes.push('VOLT_OVERCHARGE');
        newUnlocks.push({
          title: 'NUOVO NUCLEO SBLOCCATO!',
          type: 'ARCHETYPE',
          name: ARCHETYPES_DATA.VOLT_OVERCHARGE.title,
          description: 'Raggiunto il Settore 3! Sbloccato il Nucleo Elettrico con Fulmine a Catena e 3 nuove reliquie nel Codex.',
          color: ARCHETYPES_DATA.VOLT_OVERCHARGE.color,
        });
      }
      this.unlockRelicHelper('VOLT_DISCHARGE', newUnlocks, true);
      this.unlockRelicHelper('HEAVY_MASS', newUnlocks, true);
      this.unlockRelicHelper('HYPER_VELOCITY', newUnlocks, true);
    }

    // --- MILESTONE 1.5: Reach Sector 4 ---
    if (this.data.bestSector >= 4 && !this.data.unlockedFusionCombos.includes('MAGNETIC_SURGE')) {
      this.data.unlockedFusionCombos.push('MAGNETIC_SURGE');
      newUnlocks.push({
        title: 'PRIMA COMBO FUSIONE SBLOCCATA!',
        type: 'COMBO',
        name: FUSION_COMBOS.MAGNETIC_SURGE.title,
        description: FUSION_COMBOS.MAGNETIC_SURGE.description,
        color: FUSION_COMBOS.MAGNETIC_SURGE.color,
      });
    }

    // --- MILESTONE 2: Defeat Boss Sector 5 (Unlock Chapter II) ---
    if (this.data.bossesDefeated.monolithSector5) {
      if (!this.data.unlockedArchetypes.includes('PYRO_DETONATOR')) {
        this.data.unlockedArchetypes.push('PYRO_DETONATOR');
        newUnlocks.push({
          title: 'CAPITOLO II & NUCLEO PYRO SBLOCCATI!',
          type: 'ARCHETYPE',
          name: ARCHETYPES_DATA.PYRO_DETONATOR.title,
          description: 'The Monolith sconfitto! Sbloccati Pyro Detonator, Kinetic Titan, i Cubi Esplosivi e 5 Reliquie Tier 2.',
          color: ARCHETYPES_DATA.PYRO_DETONATOR.color,
        });
      }
      if (!this.data.unlockedArchetypes.includes('KINETIC_TITAN')) {
        this.data.unlockedArchetypes.push('KINETIC_TITAN');
      }
      this.unlockRelicHelper('SHRAPNEL_BURST', newUnlocks, true);
      this.unlockRelicHelper('TESLA_COIL', newUnlocks, true);
      this.unlockRelicHelper('CRITICAL_OVERDRIVE', newUnlocks, true);
      this.unlockRelicHelper('QUANTUM_DUPLICATION', newUnlocks, true);
      this.unlockRelicHelper('POLAR_VORTEX', newUnlocks, true);

      if (!this.data.unlockedFusionCombos.includes('PLASMA_OVERLOAD')) {
        this.data.unlockedFusionCombos.push('PLASMA_OVERLOAD');
      }
    }

    // --- MILESTONE 3: Defeat Boss Sector 10 (Unlock Chapter III) ---
    if (this.data.bossesDefeated.tesseractSector10) {
      if (!this.data.unlockedArchetypes.includes('SWARM_MATRIX')) {
        this.data.unlockedArchetypes.push('SWARM_MATRIX');
        newUnlocks.push({
          title: 'CAPITOLO III & NUCLEO SWARM SBLOCCATI!',
          type: 'ARCHETYPE',
          name: ARCHETYPES_DATA.SWARM_MATRIX.title,
          description: 'Omega Tesseract sconfitto! Sbloccati Swarm Matrix, Crystal Singularity, Cubi Splitter/Corazzati e Reliquie Tier 3.',
          color: ARCHETYPES_DATA.SWARM_MATRIX.color,
        });
      }
      if (!this.data.unlockedArchetypes.includes('CRYSTAL_SINGULARITY')) {
        this.data.unlockedArchetypes.push('CRYSTAL_SINGULARITY');
      }
      this.unlockRelicHelper('CLUSTER_CHARGE', newUnlocks, true);
      this.unlockRelicHelper('SPLIT_STORM', newUnlocks, true);
      this.unlockRelicHelper('MICRO_SWARM', newUnlocks, true);
      this.unlockRelicHelper('EMP_BURST', newUnlocks, true);
      this.unlockRelicHelper('PIERCING_RAIL', newUnlocks, true);

      if (!this.data.unlockedFusionCombos.includes('SWARM_DETONATOR')) {
        this.data.unlockedFusionCombos.push('SWARM_DETONATOR');
      }
    }

    // --- MILESTONE 4: Defeat Boss Sector 15 (Unlock Chapter IV) ---
    if (this.data.bossesDefeated.leviathanSector15) {
      if (!this.data.unlockedArchetypes.includes('CHRONO_PULSE')) {
        this.data.unlockedArchetypes.push('CHRONO_PULSE');
        newUnlocks.push({
          title: 'CAPITOLO IV & CHRONO PULSE SBLOCCATI!',
          type: 'ARCHETYPE',
          name: ARCHETYPES_DATA.CHRONO_PULSE.title,
          description: 'Void Leviathan sconfitto! Sbloccati Chrono Pulse, i Cubi Scudo e le Reliquie Tier 4.',
          color: ARCHETYPES_DATA.CHRONO_PULSE.color,
        });
      }
      this.unlockRelicHelper('SUPERNOVA', newUnlocks, true);
      this.unlockRelicHelper('GRAVITY_WELL', newUnlocks, true);
      this.unlockRelicHelper('CHRONO_WARP', newUnlocks, true);

      if (!this.data.unlockedFusionCombos.includes('HYPER_SWARM')) {
        this.data.unlockedFusionCombos.push('HYPER_SWARM');
      }
    }

    // --- MILESTONE 5: Defeat Boss Sector 20 (Unlock Chapter V) ---
    if (this.data.bossesDefeated.chronoWeaverSector20) {
      if (!this.data.unlockedArchetypes.includes('QUANTUM_SINGULARITY')) {
        this.data.unlockedArchetypes.push('QUANTUM_SINGULARITY');
        newUnlocks.push({
          title: 'CAPITOLO V & QUANTUM SINGULARITY SBLOCCATI!',
          type: 'ARCHETYPE',
          name: ARCHETYPES_DATA.QUANTUM_SINGULARITY.title,
          description: 'Chrono Weaver sconfitto! Sbloccato il Nucleo Gravitazionale Supremo e le Reliquie Tier 5.',
          color: ARCHETYPES_DATA.QUANTUM_SINGULARITY.color,
        });
      }
      this.unlockRelicHelper('SUPERNOVA_CATALYST', newUnlocks, true);

      if (!this.data.unlockedFusionCombos.includes('CRYO_SHOCK')) {
        this.data.unlockedFusionCombos.push('CRYO_SHOCK');
      }
    }

    // Cube destruction milestones
    if (this.data.totalCubesDestroyed >= 150) {
      this.unlockRelicHelper('PLASMA_CONDUIT', newUnlocks, false);
    }
    if (this.data.totalCubesDestroyed >= 300) {
      this.unlockRelicHelper('SUPERNOVA_CATALYST', newUnlocks, false);
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
      if (arch.initialRelic && !this.data.unlockedRelics.includes(arch.initialRelic)) {
        this.data.unlockedRelics.push(arch.initialRelic);
      }
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
    gameMode: GameMode = 'STORY',
    runBonusDamage: number = 0,
    runBonusBasketWidth: number = 0,
    currentNodeType: SectorNodeType = 'NORMAL'
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
      runBonusDamage,
      runBonusBasketWidth,
      currentNodeType,
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
      runBonusDamage: 0,
      runBonusBasketWidth: 0,
      currentNodeType: 'NORMAL',
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
