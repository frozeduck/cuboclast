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
  MetaUpgradeId,
  META_UPGRADES_DATA,
  META_UPGRADE_ORDER,
  getChapterForSector,
} from '../types/game';

const STORAGE_KEY = 'cuboclast_meta_progression_v4';

const INITIAL_UNLOCKED_ARCHETYPES: ArchetypeId[] = ['PROTO_CORE'];

const INITIAL_UNLOCKED_RELICS: RelicId[] = [
  'MICRO_CAPACITOR',
  'BLAST_CAP',
  'ECHO_PEBBLE',
  'KINETIC_SURGE',
  'MAGNETIC_BASKET',
  'SAFETY_NET',
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
  upgradeBaseDamage: 0,
  upgradeCritChance: 0,
  upgradeArmorPierce: 0,
  upgradeBasketWidth: 0,
  upgradeBasketMagnet: 0,
  upgradeEmergencyShield: 0,
  upgradeRerolls: 0,
  upgradeShardMultiplier: 0,
  upgradeMerchantDiscount: 0,
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
    savedBalls: 6,
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
   * Returns the list of allowed structural/world cube types for a given sector.
   * Evolves both by Chapter (I-V) and permanently as Bosses are defeated!
   * Note: CLASS_ABILITY cubes matching the active Archetype are always spawned by GameEngine.
   */
  public getAllowedCubeTypesForSector(sector: number): CubeType[] {
    if (sector <= 2) {
      return ['NORMAL'];
    }
    const chapter = getChapterForSector(sector);
    const allowed = new Set<CubeType>(chapter.allowedCubeTypes);

    if (this.data.bossesDefeated?.monolithSector5) {
      allowed.add('EXPLOSIVE');
    }
    if (this.data.bossesDefeated?.tesseractSector10) {
      allowed.add('SPLITTER');
      allowed.add('ARMOR');
    }
    if (this.data.bossesDefeated?.leviathanSector15) {
      allowed.add('SHIELD');
    }

    return Array.from(allowed);
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
        color: '#c46d75',
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
          color: '#7c9cb4',
        });
      }
    }
  }

  public checkAndTriggerUnlocks(): UnlockEventNotification[] {
    const newUnlocks: UnlockEventNotification[] = [];

    // --- BOSS 1 DEFEATED: The Monolith (Sector 5) -> Unlocks UNCOMMON Relics & Chapter II ---
    if (this.data.bossesDefeated.monolithSector5) {
      if (!this.data.unlockedArchetypes.includes('VOLT_OVERCHARGE')) {
        this.data.unlockedArchetypes.push('VOLT_OVERCHARGE');
      }
      if (!this.data.unlockedArchetypes.includes('PYRO_DETONATOR')) {
        this.data.unlockedArchetypes.push('PYRO_DETONATOR');
        newUnlocks.push({
          title: 'BOSS 1 SCONFITTO · RARITÀ NON COMUNE!',
          type: 'RELIC',
          name: 'Reliquie Non Comuni + Capitolo II',
          description:
            'The Monolith sconfitto! Sbloccate 6 Reliquie NON COMUNI, i Nuclei Volt & Pyro e i Cubi Esplosivi.',
          color: '#7fa68e',
        });
      }
      this.unlockRelicHelper('CHAIN_LIGHTNING', newUnlocks, true);
      this.unlockRelicHelper('BOUNCING_BOMB', newUnlocks, true);
      this.unlockRelicHelper('MULTIBALL_REACTOR', newUnlocks, true);
      this.unlockRelicHelper('VOLT_DISCHARGE', newUnlocks, true);
      this.unlockRelicHelper('HEAVY_MASS', newUnlocks, true);
      this.unlockRelicHelper('HYPER_VELOCITY', newUnlocks, true);

      if (!this.data.unlockedFusionCombos.includes('MAGNETIC_SURGE')) {
        this.data.unlockedFusionCombos.push('MAGNETIC_SURGE');
      }
      if (!this.data.unlockedFusionCombos.includes('PLASMA_OVERLOAD')) {
        this.data.unlockedFusionCombos.push('PLASMA_OVERLOAD');
      }
    }

    // --- BOSS 2 DEFEATED: Omega Tesseract (Sector 10) -> Unlocks RARE Relics & Chapter III ---
    if (this.data.bossesDefeated.tesseractSector10) {
      if (!this.data.unlockedArchetypes.includes('KINETIC_TITAN')) {
        this.data.unlockedArchetypes.push('KINETIC_TITAN');
      }
      if (!this.data.unlockedArchetypes.includes('SWARM_MATRIX')) {
        this.data.unlockedArchetypes.push('SWARM_MATRIX');
        newUnlocks.push({
          title: 'BOSS 2 SCONFITTO · RARITÀ RARA!',
          type: 'RELIC',
          name: 'Reliquie Rare + Capitolo III',
          description:
            'Omega Tesseract sconfitto! Sbloccate 5 Reliquie RARE, i Nuclei Kinetic & Swarm e i Cubi Splitter/Corazzati.',
          color: '#7c9cb4',
        });
      }
      this.unlockRelicHelper('SHRAPNEL_BURST', newUnlocks, true);
      this.unlockRelicHelper('TESLA_COIL', newUnlocks, true);
      this.unlockRelicHelper('CRITICAL_OVERDRIVE', newUnlocks, true);
      this.unlockRelicHelper('QUANTUM_DUPLICATION', newUnlocks, true);
      this.unlockRelicHelper('POLAR_VORTEX', newUnlocks, true);

      if (!this.data.unlockedFusionCombos.includes('SWARM_DETONATOR')) {
        this.data.unlockedFusionCombos.push('SWARM_DETONATOR');
      }
    }

    // --- BOSS 3 DEFEATED: Void Leviathan (Sector 15) -> Unlocks EPIC Relics & Chapter IV ---
    if (this.data.bossesDefeated.leviathanSector15) {
      if (!this.data.unlockedArchetypes.includes('CRYSTAL_SINGULARITY')) {
        this.data.unlockedArchetypes.push('CRYSTAL_SINGULARITY');
      }
      if (!this.data.unlockedArchetypes.includes('CHRONO_PULSE')) {
        this.data.unlockedArchetypes.push('CHRONO_PULSE');
        newUnlocks.push({
          title: 'BOSS 3 SCONFITTO · RARITÀ EPICA!',
          type: 'RELIC',
          name: 'Reliquie Epiche + Capitolo IV',
          description:
            'Void Leviathan sconfitto! Sbloccate 5 Reliquie EPICHE, i Nuclei Crystal & Chrono e i Cubi Scudo.',
          color: '#9b95b8',
        });
      }
      this.unlockRelicHelper('CLUSTER_CHARGE', newUnlocks, true);
      this.unlockRelicHelper('SPLIT_STORM', newUnlocks, true);
      this.unlockRelicHelper('MICRO_SWARM', newUnlocks, true);
      this.unlockRelicHelper('EMP_BURST', newUnlocks, true);
      this.unlockRelicHelper('PIERCING_RAIL', newUnlocks, true);

      if (!this.data.unlockedFusionCombos.includes('HYPER_SWARM')) {
        this.data.unlockedFusionCombos.push('HYPER_SWARM');
      }
    }

    // --- BOSS 4 DEFEATED: Chrono Weaver (Sector 20) -> Unlocks LEGENDARY Relics & Chapter V ---
    if (this.data.bossesDefeated.chronoWeaverSector20) {
      if (!this.data.unlockedArchetypes.includes('QUANTUM_SINGULARITY')) {
        this.data.unlockedArchetypes.push('QUANTUM_SINGULARITY');
        newUnlocks.push({
          title: 'BOSS 4 SCONFITTO · RARITÀ LEGGENDARIA!',
          type: 'RELIC',
          name: 'Reliquie Leggendarie + Capitolo V',
          description:
            'Chrono Weaver sconfitto! Sbloccate le 5 Reliquie LEGGENDARIE e il Nucleo Quantum Singularity.',
          color: '#d4b483',
        });
      }
      this.unlockRelicHelper('SUPERNOVA', newUnlocks, true);
      this.unlockRelicHelper('GRAVITY_WELL', newUnlocks, true);
      this.unlockRelicHelper('PLASMA_CONDUIT', newUnlocks, true);
      this.unlockRelicHelper('CHRONO_WARP', newUnlocks, true);
      this.unlockRelicHelper('SUPERNOVA_CATALYST', newUnlocks, true);

      if (!this.data.unlockedFusionCombos.includes('CRYO_SHOCK')) {
        this.data.unlockedFusionCombos.push('CRYO_SHOCK');
      }
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

  public getUpgradeLevel(id: MetaUpgradeId): number {
    switch (id) {
      case 'EXTRA_BALLS':
        return this.data.upgradeExtraBalls || 0;
      case 'BASE_DAMAGE':
        return this.data.upgradeBaseDamage || 0;
      case 'CRIT_CHANCE':
        return this.data.upgradeCritChance || 0;
      case 'ARMOR_PIERCE':
        return this.data.upgradeArmorPierce || 0;
      case 'BASKET_WIDTH':
        return this.data.upgradeBasketWidth || 0;
      case 'BASKET_MAGNET':
        return this.data.upgradeBasketMagnet || 0;
      case 'EMERGENCY_SHIELD':
        return this.data.upgradeEmergencyShield || 0;
      case 'REROLLS':
        return this.data.upgradeRerolls || 0;
      case 'SHARD_MULTIPLIER':
        return this.data.upgradeShardMultiplier || 0;
      case 'MERCHANT_DISCOUNT':
        return this.data.upgradeMerchantDiscount || 0;
    }
  }

  private setUpgradeLevel(id: MetaUpgradeId, level: number) {
    switch (id) {
      case 'EXTRA_BALLS':
        this.data.upgradeExtraBalls = level;
        break;
      case 'BASE_DAMAGE':
        this.data.upgradeBaseDamage = level;
        break;
      case 'CRIT_CHANCE':
        this.data.upgradeCritChance = level;
        break;
      case 'ARMOR_PIERCE':
        this.data.upgradeArmorPierce = level;
        break;
      case 'BASKET_WIDTH':
        this.data.upgradeBasketWidth = level;
        break;
      case 'BASKET_MAGNET':
        this.data.upgradeBasketMagnet = level;
        break;
      case 'EMERGENCY_SHIELD':
        this.data.upgradeEmergencyShield = level;
        break;
      case 'REROLLS':
        this.data.upgradeRerolls = level;
        break;
      case 'SHARD_MULTIPLIER':
        this.data.upgradeShardMultiplier = level;
        break;
      case 'MERCHANT_DISCOUNT':
        this.data.upgradeMerchantDiscount = level;
        break;
    }
  }

  public getUpgradeMaxLevel(id: MetaUpgradeId): number {
    return META_UPGRADES_DATA[id].maxLevel;
  }

  public getUpgradeCost(id: MetaUpgradeId): number {
    const info = META_UPGRADES_DATA[id];
    const lvl = this.getUpgradeLevel(id);
    if (lvl >= info.maxLevel) return info.costs[info.costs.length - 1];
    return info.costs[lvl];
  }

  public buyUpgrade(id: MetaUpgradeId): boolean {
    const info = META_UPGRADES_DATA[id];
    const lvl = this.getUpgradeLevel(id);
    if (lvl >= info.maxLevel) return false;
    const cost = info.costs[lvl];
    if (this.data.quantumShards < cost) return false;

    this.data.quantumShards -= cost;
    this.setUpgradeLevel(id, lvl + 1);
    this.save();
    return true;
  }

  public getTotalShardsInvestedInUpgrades(): number {
    let total = 0;
    for (const id of META_UPGRADE_ORDER) {
      const info = META_UPGRADES_DATA[id];
      const lvl = this.getUpgradeLevel(id);
      for (let i = 0; i < lvl && i < info.costs.length; i++) {
        total += info.costs[i];
      }
    }
    return total;
  }

  public refundAllUpgrades(): number {
    const refund = this.getTotalShardsInvestedInUpgrades();
    if (refund <= 0) return 0;
    for (const id of META_UPGRADE_ORDER) {
      this.setUpgradeLevel(id, 0);
    }
    this.data.quantumShards += refund;
    this.save();
    return refund;
  }

  public getCostExtraBalls(): number {
    return this.getUpgradeCost('EXTRA_BALLS');
  }

  public getCostBasketWidth(): number {
    return this.getUpgradeCost('BASKET_WIDTH');
  }

  public getCostRerolls(): number {
    return this.getUpgradeCost('REROLLS');
  }

  public buyExtraBalls(): boolean {
    return this.buyUpgrade('EXTRA_BALLS');
  }

  public buyBasketWidth(): boolean {
    return this.buyUpgrade('BASKET_WIDTH');
  }

  public buyReroll(): boolean {
    return this.buyUpgrade('REROLLS');
  }
}

export const progressionManager = new ProgressionManager();
