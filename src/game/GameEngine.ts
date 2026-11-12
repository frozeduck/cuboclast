import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  CANNON_X,
  CANNON_Y,
  GRAVITY,
  GameState,
  CubeType,
  RelicFamilyId,
  RelicId,
  RELIC_RARITIES,
  ArchetypeId,
  FusionComboId,
  FUSION_COMBOS,
  UnlockEventNotification,
  ARCHETYPES_DATA,
  RELICS_DATA,
  Ball,
  Cube,
  BossSatellite,
  Basket,
  Shard,
  FloatingText,
  GameMode,
  SectorNodeType,
  SectorMapNode,
  SectorAnomalyEvent,
  FeverCapsule,
  FeverCapsuleType,
  FeverSummary,
  getChapterForSector,
} from '../types/game';
import { ProgressionManager, progressionManager } from './progression';
import { soundEngine } from '../audio/soundEngine';

const ANOMALY_EVENTS_POOL: SectorAnomalyEvent[] = [
  {
    id: 'QUANTUM_FORGE',
    title: 'Fucina Quantica Abbandonata',
    subtitle: 'Anomalia Settoriale · Relitto Orbitale',
    description:
      'Un antico reattore fluttua nel vuoto. Puoi sovraccaricare il cannone sacrificando una sfera, estrarre schegge pure o ricaricare il serbatoio.',
    color: '#9b95b8',
    choices: [
      {
        id: 'FORGE_OVERCLOCK',
        label: 'Sovraccarica Cannone (-1 Sfera)',
        effectText: '+1 Danno Base permanente per tutta la Run',
        color: '#c87d65',
      },
      {
        id: 'FORGE_EXTRACT',
        label: 'Estrai Cristalli Quantici',
        effectText: 'Ottieni immediatamente +40 ◆ Schegge Quantiche',
        color: '#7c9cb4',
      },
      {
        id: 'FORGE_REPAIR',
        label: 'Sintetizza Munizioni',
        effectText: 'Recupera +2 Sfere per i prossimi settori',
        color: '#7fa68e',
      },
    ],
  },
  {
    id: 'MAGNETIC_NEBULA',
    title: 'Nebulosa Magnetica Instabile',
    subtitle: 'Anomalia Settoriale · Campo Polare',
    description:
      'Una tempesta magnetica avvolge la nave. Puoi canalizzare il flusso per espandere il cestello magnetico o condensare una reliquia.',
    color: '#7c9cb4',
    choices: [
      {
        id: 'NEBULA_BASKET',
        label: 'Espandi Bobine del Cestello',
        effectText: '+30px Larghezza Cestello per tutta la Run',
        color: '#7c9cb4',
      },
      {
        id: 'NEBULA_RELIC',
        label: 'Condensa Reliquia (-2 Sfere)',
        effectText: 'Sacrifica 2 Sfere per ottenere 1 Reliquia casuale sbloccata',
        color: '#9b95b8',
      },
      {
        id: 'NEBULA_ELECTRIFY',
        label: 'Carica Condensatori',
        effectText: '+1 Sfera e il prossimo tiro parte Elettrificato (+2 Danno)',
        color: '#d4b483',
      },
    ],
  },
  {
    id: 'VOID_SHRINE',
    title: 'Altare del Tesseract',
    subtitle: 'Anomalia Settoriale · Monolite Antico',
    description:
      'Un frammento geometrico emette impulsi regolari. Offrire Schegge Quantiche o energia balistica attiva antichi protocolli.',
    color: '#d4b483',
    choices: [
      {
        id: 'SHRINE_BLESSING',
        label: 'Assorbi Energia Pura',
        effectText: '+2 Sfere immediate e +5.000 Punti',
        color: '#7fa68e',
      },
      {
        id: 'SHRINE_GAMBLE',
        label: 'Patto Ad Alto Rischio',
        effectText: '+1 Danno Base Run e +30 ◆ Schegge Quantiche',
        color: '#c46d75',
      },
      {
        id: 'SHRINE_REROLL',
        label: 'Calibra Sensori del Codex',
        effectText: '+2 Dadi Reroll per le prossime scelte Reliquia e +1 Sfera',
        color: '#7c9cb4',
      },
    ],
  },
];

export interface GameEngineListener {
  onBounceHit?: (combo: number) => void;
  onCubeShattered?: () => void;
  onBallCaught?: () => void;
  onExplosion?: () => void;
  onChainLightning?: () => void;
  onRelicChosen?: () => void;
  onFreeBall?: () => void;
  onFever?: () => void;
  onMercyRefund?: () => void;
  onBossPhaseChange?: (phase: number) => void;
  onShardCollect?: () => void;
  onResonanceUnlocked?: (family: RelicFamilyId, tier: number) => void;
  onFusionUnlocked?: (comboId: FusionComboId) => void;
  onNewUnlock?: (unlock: UnlockEventNotification) => void;
  onReroll?: () => void;
  onStateChange?: (newState: GameState) => void;
}

export class GameEngine {
  public state: GameState = 'ARCHETYPE_SELECT';
  public currentArchetype: ArchetypeId | null = null;
  public progression: ProgressionManager;
  public gameMode: GameMode = 'STORY';

  public currentLevel: number = 1;
  public isEndless: boolean = false;
  public score: number = 0;
  public highScore: number = 0;
  public quantumShardsRun: number = 0;
  public ballsRemaining: number = 6;
  public totalCubesDestroyed: number = 0;
  public currentCombo: number = 0;
  public aimAngle: number = Math.PI / 2;
  public speedBoost: boolean = false;

  public currentShotScore: number = 0;
  public currentShotCubesHit: number = 0;
  public ballsCaughtInCurrentShot: number = 0;
  private nextFreeBallThreshold: number = 22000;
  private mercyUsedThisSector: boolean = false;
  public rerollsAvailable: number = 1;

  public isNextBallElectrified: boolean = false;

  // In-Run Roguelike Progression Modifiers & Branching Nodes
  public runBonusDamage: number = 0;
  public runBonusBasketWidth: number = 0;
  public currentNodeType: SectorNodeType = 'NORMAL';
  public currentPatternName: string = 'Cittadella Simmetrica';
  public nextMapNodes: SectorMapNode[] = [];
  public pendingNextSector: number = 2;
  public currentAnomalyEvent: SectorAnomalyEvent | null = null;
  public lastAnomalyOutcomeText: string | null = null;
  public merchantRelicOffer: RelicId | null = null;
  public merchantBoughtIds: string[] = [];

  public activeBoss: Cube | null = null;
  public bossPhase: number = 1;
  public bossPulseTimer: number = 0;
  public bossDescentY: number = 0;
  public bossSatellites: BossSatellite[] = [];

  public feverTimer: number = 0;
  public feverExplosionTimer: number = 0;
  public feverCapsules: FeverCapsule[] = [];
  public nextSectorOverchargeStacks: number = 0;
  public feverOverchargeCaught: number = 0;
  public lastFeverSummary: FeverSummary | null = null;

  public balls: Ball[] = [];
  public cubes: Cube[] = [];
  public basket: Basket;
  public shards: Shard[] = [];
  public floatingTexts: FloatingText[] = [];
  public activeRelics: RelicId[] = [];
  public draftChoices: RelicId[] = [];
  public isStarterDraft: boolean = false;

  private safetyNetAvailable: boolean = true;
  public screenShake: number = 0;
  private nextTextId: number = 1;
  private nextCubeId: number = 1;
  private nextSatId: number = 1;
  private nextCapsuleId: number = 1;

  public listener: GameEngineListener = {};

  constructor(progression: ProgressionManager = progressionManager) {
    this.progression = progression;
    this.basket = {
      x: VIRTUAL_WIDTH / 2 - 82,
      y: 1780,
      width: 165,
      height: 34,
      vx: 290,
    };
    this.highScore = progression.getData().highestScore;
    this.initGame('STORY');
  }

  public initGame(mode?: GameMode) {
    if (mode) this.gameMode = mode;
    this.currentLevel = 1;
    this.isEndless = false;
    this.score = 0;
    this.quantumShardsRun = 0;
    this.activeRelics = [];
    this.totalCubesDestroyed = 0;
    this.isNextBallElectrified = false;
    this.nextSectorOverchargeStacks = 0;
    this.feverOverchargeCaught = 0;
    this.lastFeverSummary = null;
    this.feverCapsules = [];
    this.runBonusDamage = 0;
    this.runBonusBasketWidth = 0;
    this.currentNodeType = 'NORMAL';
    this.nextMapNodes = [];
    this.currentAnomalyEvent = null;
    this.lastAnomalyOutcomeText = null;
    this.rerollsAvailable = 1 + this.progression.getData().upgradeRerolls;
    this.setState('ARCHETYPE_SELECT');
  }

  public setState(newState: GameState) {
    this.state = newState;
    if (this.listener.onStateChange) {
      this.listener.onStateChange(newState);
    }
  }

  public selectArchetype(
    archetype: ArchetypeId,
    mode?: GameMode,
    startChapter: number = 1,
    skipChapterIntro: boolean = false
  ) {
    if (!this.progression.isArchetypeUnlocked(archetype)) {
      return;
    }

    if (mode) this.gameMode = mode;
    this.currentArchetype = archetype;
    this.score = 0;
    this.quantumShardsRun = 0;
    this.activeRelics = [];
    this.isEndless = false;
    this.runBonusDamage = 0;
    this.runBonusBasketWidth = 0;
    this.nextSectorOverchargeStacks = 0;
    this.feverOverchargeCaught = 0;
    this.lastFeverSummary = null;
    this.feverCapsules = [];
    this.currentNodeType = 'NORMAL';
    this.ballsRemaining = 6 + this.progression.getData().upgradeExtraBalls;
    this.rerollsAvailable = 1 + this.progression.getData().upgradeRerolls;
    this.progression.recordRunStart();

    const archInfo = ARCHETYPES_DATA[archetype];
    if (archInfo && archInfo.initialRelic) {
      this.activeRelics.push(archInfo.initialRelic);
    }

    const clampedChapter = Math.max(
      1,
      Math.min(startChapter, this.progression.getData().storyProgress?.highestChapterUnlocked || 1)
    );
    const startSector = this.gameMode === 'STORY' ? (clampedChapter - 1) * 5 + 1 : 1;

    soundEngine.playRelicSelect();
    soundEngine.triggerHaptic(30);
    this.isStarterDraft = false;
    this.initLevel(startSector, 'NORMAL', !skipChapterIntro && this.gameMode === 'STORY');
    if (!skipChapterIntro && this.state === 'AIMING') {
      this.prepareRelicDraft(true);
    }
  }

  public confirmChapterIntro() {
    if (this.state === 'CHAPTER_INTRO') {
      soundEngine.playLaunch();
      soundEngine.triggerHaptic(25);
      this.prepareRelicDraft(true);
    }
  }

  public abandonRun() {
    this.progression.clearActiveRun();
    this.initGame();
  }

  public resumeSavedRun(): boolean {
    const data = this.progression.getData();
    if (!data.savedRun.hasActiveRun) return false;

    try {
      this.currentLevel = data.savedRun.savedLevel;
      const restoredScore = data.savedRun.savedScore;
      const restoredBalls = data.savedRun.savedBalls;
      const restoredShards = data.savedRun.savedShardsRun;
      const restoredEndless = data.savedRun.savedIsEndless;
      this.gameMode = data.savedRun.gameMode || 'STORY';
      this.runBonusDamage = data.savedRun.runBonusDamage || 0;
      this.runBonusBasketWidth = data.savedRun.runBonusBasketWidth || 0;
      this.currentNodeType = data.savedRun.currentNodeType || 'NORMAL';

      if (data.savedRun.savedArchetype) {
        this.currentArchetype = data.savedRun.savedArchetype;
      } else {
        this.currentArchetype = 'PROTO_CORE';
      }

      this.activeRelics = [...data.savedRun.savedRelics];
      this.isEndless = restoredEndless;

      this.initLevel(this.currentLevel, this.currentNodeType, false);

      this.score = restoredScore;
      this.ballsRemaining = restoredBalls;
      this.quantumShardsRun = restoredShards;

      this.progression.saveActiveRun(
        this.currentLevel,
        this.score,
        this.ballsRemaining,
        this.currentArchetype,
        this.activeRelics,
        this.quantumShardsRun,
        this.isEndless,
        this.gameMode,
        this.runBonusDamage,
        this.runBonusBasketWidth,
        this.currentNodeType
      );

      this.setState('AIMING');
      soundEngine.playLaunch();
      soundEngine.triggerHaptic(35);
      return true;
    } catch {
      this.initGame();
      return false;
    }
  }

  public initLevel(
    level: number,
    nodeType: SectorNodeType = 'NORMAL',
    showChapterIntro: boolean = false
  ) {
    this.currentLevel = level;
    this.currentNodeType = level % 5 === 0 ? 'BOSS' : nodeType;
    this.progression.recordScoreAndLevel(this.score, this.currentLevel);

    const newUnlocks = this.progression.checkAndTriggerUnlocks();
    if (newUnlocks.length > 0 && this.listener.onNewUnlock) {
      this.listener.onNewUnlock(newUnlocks[0]);
    }

    if (this.currentArchetype) {
      this.progression.saveActiveRun(
        this.currentLevel,
        this.score,
        this.ballsRemaining,
        this.currentArchetype,
        this.activeRelics,
        this.quantumShardsRun,
        this.isEndless,
        this.gameMode,
        this.runBonusDamage,
        this.runBonusBasketWidth,
        this.currentNodeType
      );
    }

    this.cubes = [];
    this.balls = [];
    this.shards = [];
    this.floatingTexts = [];
    this.feverCapsules = [];
    this.bossSatellites = [];
    this.activeBoss = null;
    this.bossPhase = 1;
    this.bossDescentY = 0;
    this.bossPulseTimer = 0;
    this.currentCombo = 0;
    this.mercyUsedThisSector = false;
    const shieldLvl = this.progression.getData().upgradeEmergencyShield || 0;
    this.safetyNetAvailable =
      this.activeRelics.includes('SAFETY_NET') || shieldLvl > 0;

    // Option C: Guaranteed minimum of 4 balls at the start of every sector
    if (this.ballsRemaining < 4) {
      this.ballsRemaining = 4;
    }

    let basketWidth =
      165 + (this.progression.getData().upgradeBasketWidth || 0) * 18 + this.runBonusBasketWidth;
    if (this.currentArchetype === 'KINETIC_TITAN') basketWidth += 25;
    if (this.activeRelics.includes('MAGNETIC_BASKET')) basketWidth += 25;
    this.basket.width = basketWidth;
    this.basket.x = (VIRTUAL_WIDTH - basketWidth) / 2;
    const baseSpeed = Math.min(440, 290 + level * 6);
    this.basket.vx = (this.basket.vx < 0 ? -1 : 1) * baseSpeed;

    this.generateLevelGrid(level);

    const isChapterStart = (level - 1) % 5 === 0 && level <= 25;
    if (showChapterIntro && isChapterStart && this.gameMode === 'STORY') {
      this.setState('CHAPTER_INTRO');
    } else {
      this.setState('AIMING');
    }
  }

  public getActiveResonances(): Record<RelicFamilyId, number> {
    const counts: Record<RelicFamilyId, number> = {
      ELECTRIC: 0,
      EXPLOSIVE: 0,
      MULTIBALL: 0,
      KINETIC: 0,
    };

    for (const r of this.activeRelics) {
      const info = RELICS_DATA[r];
      if (info) {
        counts[info.family]++;
      }
    }

    return counts;
  }

  public getResonanceTier(family: RelicFamilyId): number {
    const count = this.getActiveResonances()[family];
    if (count >= 3) return 2; // Mastery
    if (count >= 2) return 1; // Synergy
    return 0;
  }

  public getActiveFusionCombos(): FusionComboId[] {
    const active: FusionComboId[] = [];
    const counts = this.getActiveResonances();

    if (
      counts.ELECTRIC >= 2 &&
      counts.EXPLOSIVE >= 2 &&
      this.progression.isFusionComboUnlocked('PLASMA_OVERLOAD')
    ) {
      active.push('PLASMA_OVERLOAD');
    }
    if (
      counts.KINETIC >= 2 &&
      counts.ELECTRIC >= 2 &&
      this.progression.isFusionComboUnlocked('MAGNETIC_SURGE')
    ) {
      active.push('MAGNETIC_SURGE');
    }
    if (
      counts.MULTIBALL >= 2 &&
      counts.EXPLOSIVE >= 2 &&
      this.progression.isFusionComboUnlocked('SWARM_DETONATOR')
    ) {
      active.push('SWARM_DETONATOR');
    }
    if (
      counts.MULTIBALL >= 2 &&
      counts.KINETIC >= 2 &&
      this.progression.isFusionComboUnlocked('HYPER_SWARM')
    ) {
      active.push('HYPER_SWARM');
    }
    if (
      counts.ELECTRIC >= 2 &&
      counts.KINETIC >= 2 &&
      this.progression.isFusionComboUnlocked('CRYO_SHOCK')
    ) {
      active.push('CRYO_SHOCK');
    }

    return active;
  }

  public getRemainingCoreCubes(): number {
    return this.cubes.filter((c) => c.isAlive && c.isCore).length;
  }

  public getTotalCoreCubes(): number {
    return this.cubes.filter((c) => c.isCore).length;
  }

  private generateLevelGrid(level: number) {
    const startY = 320;
    const rows = Math.min(4 + Math.floor(level / 2), 7);
    const cols = 9;
    const cubeWidth = 84;
    const cubeHeight = 56;
    const paddingX = 26;
    const paddingY = 24;
    const totalGridW = cols * cubeWidth + (cols - 1) * paddingX;
    const startX = (VIRTUAL_WIDTH - totalGridW) / 2;

    // Boss fight on sectors 5, 10, 15, 20, 25...
    if (level % 5 === 0) {
      this.currentPatternName = `Guardiano Settore ${level}`;
      this.generateBossLevel(level, startX, startY, cols, cubeWidth, cubeHeight, paddingX);
      return;
    }

    const isElite = this.currentNodeType === 'ELITE';
    const hpMultiplier = isElite ? 1.45 : 1.0;

    let baseHp = level <= 4 ? 1 + level : 2 + Math.floor(level * 1.1);
    if (level > 10) {
      baseHp += Math.floor((level - 10) * 1.25);
    }
    baseHp = Math.max(2, Math.round(baseHp * hpMultiplier));

    const patternNames = [
      'Cittadella Simmetrica',
      'Vortice a Diamante',
      'Bastione Spezzato',
      'Esagono Orbitale',
      'Corridoio Quantico',
      'Bunker Piramidale',
    ];
    const patternIndex = level === 1 ? 0 : (level + (isElite ? 2 : 0)) % patternNames.length;
    this.currentPatternName = patternNames[patternIndex];

    const allowedSpecialTypes = this.progression
      .getAllowedCubeTypesForSector(level)
      .filter((t) => t !== 'NORMAL' && t !== 'BOSS');

    const coreBudget = Math.min(6 + Math.floor(level * 0.8) + (isElite ? 3 : 0), 16);
    let coresAssigned = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let placeCube = false;
        const distFromCenterCol = Math.abs(c - 4);

        switch (patternIndex) {
          case 0:
            placeCube =
              (r === 0 && c >= 2 && c <= 6) ||
              (r === 1 && (c === 1 || c === 3 || c === 5 || c === 7)) ||
              (r === 2 && c >= 2 && c <= 6) ||
              (r >= 3 && distFromCenterCol <= 2);
            break;
          case 1:
            placeCube = distFromCenterCol + Math.abs(r - Math.floor(rows / 2)) <= 4;
            break;
          case 2:
            placeCube = (r + c) % 2 === 0 && c >= 1 && c <= 7;
            break;
          case 3:
            placeCube =
              c >= 1 &&
              c <= 7 &&
              !(r === Math.floor(rows / 2) && (c === 3 || c === 5)) &&
              !(r === 0 && (c === 1 || c === 7));
            break;
          case 4:
            placeCube = c !== 4 && c >= 1 && c <= 7;
            break;
          case 5:
          default:
            placeCube = distFromCenterCol <= r + 1 && c >= 1 && c <= 7;
            break;
        }

        if (!placeCube) continue;

        const cx = startX + c * (cubeWidth + paddingX);
        const cy = startY + r * (cubeHeight + paddingY);

        let type: CubeType = 'NORMAL';
        let cubeHp = Math.max(
          2,
          Math.round((baseHp + (r === 0 ? 1 : 0)) * (isElite ? 1.2 : 1.0))
        );

        if (allowedSpecialTypes.length > 0) {
          const specialChance = isElite ? 0.38 : 0.25;
          if (Math.random() < specialChance) {
            const picked =
              allowedSpecialTypes[Math.floor(Math.random() * allowedSpecialTypes.length)];
            type = picked;
            if (picked === 'KINETIC' || picked === 'SPLITTER') {
              cubeHp = Math.max(2, Math.floor(baseHp * 0.75));
            } else if (picked === 'ARMOR') {
              cubeHp = baseHp + 4 + Math.floor(level * 0.4);
            } else if (picked === 'SHIELD') {
              cubeHp = baseHp + 2;
            } else if (picked === 'EXPLOSIVE') {
              cubeHp = Math.max(2, baseHp - 1);
            }
          }
        }

        let isCore = false;
        if (coresAssigned < coreBudget && (type === 'NORMAL' || Math.random() < 0.5)) {
          isCore = true;
          cubeHp += 1;
          coresAssigned++;
        }

        this.cubes.push({
          id: this.nextCubeId++,
          x: cx,
          y: cy,
          width: cubeWidth,
          height: cubeHeight,
          hp: cubeHp,
          maxHp: cubeHp,
          type,
          isCore,
          wobble: 0,
          hitFlash: 0,
          isAlive: true,
          shieldPulse: 0,
          isFrozen: false,
        });
      }
    }

    const minCores = Math.min(6, this.cubes.length);
    if (coresAssigned < minCores) {
      for (const c of this.cubes) {
        if (!c.isCore) {
          c.isCore = true;
          c.hp += 1;
          c.maxHp += 1;
          coresAssigned++;
          if (coresAssigned >= minCores) break;
        }
      }
    }

    // Spawn 3-5 CLASS_ABILITY cubes (◇) matching the player's selected Archetype, spread across columns
    const nonCoreCandidates = this.cubes
      .filter((c) => !c.isCore)
      .sort((a, b) => a.x - b.x || a.y - b.y);
    const targetClassBlocks = isElite ? 5 : level <= 2 ? 3 : 4;
    if (nonCoreCandidates.length > 0) {
      const count = Math.min(targetClassBlocks, nonCoreCandidates.length);
      for (let i = 0; i < count; i++) {
        const idx = Math.min(
          nonCoreCandidates.length - 1,
          Math.floor(((i + 0.5) * nonCoreCandidates.length) / count)
        );
        const chosen = nonCoreCandidates[idx];
        chosen.type = 'CLASS_ABILITY';
        chosen.hp = Math.max(2, baseHp);
        chosen.maxHp = chosen.hp;
      }
    }
  }

  private generateBossLevel(
    level: number,
    startX: number,
    startY: number,
    cols: number,
    cubeWidth: number,
    cubeHeight: number,
    paddingX: number
  ) {
    const bossW = 260;
    const bossH = 180;
    const bossX = (VIRTUAL_WIDTH - bossW) / 2;
    const bossY = startY + 130;

    const chapter = getChapterForSector(level);
    let bossHp = chapter ? chapter.bossHp : 120;
    let satelliteCount = chapter ? chapter.satelliteCount : 6;
    if (level > 25) {
      bossHp = 750 + (level - 25) * 55;
      satelliteCount = 12;
    }

    this.activeBoss = {
      id: this.nextCubeId++,
      x: bossX,
      y: bossY,
      width: bossW,
      height: bossH,
      hp: bossHp,
      maxHp: bossHp,
      type: 'BOSS',
      isCore: true,
      wobble: 0,
      hitFlash: 0,
      isAlive: true,
      shieldPulse: 0,
      isFrozen: false,
    };
    this.cubes.push(this.activeBoss);

    const satHp = level <= 5 ? 10 : level <= 10 ? 16 : level <= 15 ? 24 : level <= 20 ? 32 : 42;

    if (satelliteCount === 12) {
      for (let i = 0; i < 6; i++) {
        const ang = ((2 * Math.PI) / 6) * i;
        this.bossSatellites.push({
          id: this.nextSatId++,
          angle: ang,
          distance: 210,
          isAlive: true,
          hp: satHp,
          maxHp: satHp,
          width: 46,
          height: 46,
        });
      }
      for (let i = 0; i < 6; i++) {
        const ang = ((2 * Math.PI) / 6) * i + Math.PI / 6;
        this.bossSatellites.push({
          id: this.nextSatId++,
          angle: ang,
          distance: 300,
          isAlive: true,
          hp: satHp,
          maxHp: satHp,
          width: 50,
          height: 50,
        });
      }
    } else {
      for (let i = 0; i < satelliteCount; i++) {
        const ang = ((2 * Math.PI) / satelliteCount) * i;
        this.bossSatellites.push({
          id: this.nextSatId++,
          angle: ang,
          distance: 250,
          isAlive: true,
          hp: satHp,
          maxHp: satHp,
          width: 50,
          height: 50,
        });
      }
    }

    const guardHp = Math.max(4, Math.floor(level * 1.4));
    for (let c = 1; c < cols - 1; c += 2) {
      const cx = startX + c * (cubeWidth + paddingX);
      const cy = startY;
      this.cubes.push({
        id: this.nextCubeId++,
        x: cx,
        y: cy,
        width: cubeWidth,
        height: cubeHeight,
        hp: guardHp,
        maxHp: guardHp,
        type: 'KINETIC',
        isCore: false,
        wobble: 0,
        hitFlash: 0,
        isAlive: true,
        shieldPulse: 0,
        isFrozen: false,
      });
    }

    for (let c = 2; c <= 6; c += 2) {
      const cx = startX + c * (cubeWidth + paddingX);
      const cy = bossY + bossH + 170;
      const isOuterClassBlock = c === 2 || c === 6;
      this.cubes.push({
        id: this.nextCubeId++,
        x: cx,
        y: cy,
        width: cubeWidth,
        height: cubeHeight,
        hp: guardHp + 3,
        maxHp: guardHp + 3,
        type: isOuterClassBlock ? 'CLASS_ABILITY' : level >= 15 ? 'ARMOR' : 'NORMAL',
        isCore: false,
        wobble: 0,
        hitFlash: 0,
        isAlive: true,
        shieldPulse: 0,
        isFrozen: false,
      });
    }

    soundEngine.playBossAlert();
    soundEngine.triggerHaptic(70);
    if (this.listener.onBossPhaseChange) this.listener.onBossPhaseChange(1);
  }

  public getLaunchSpeed(): number {
    let speed = 1250;
    if (this.activeRelics.includes('HYPER_VELOCITY')) {
      speed *= 1.18;
    }
    return speed;
  }

  /**
   * Gravity-compensated aiming: calculates the launch angle from (CANNON_X, CANNON_Y + 25)
   * so that the parabolic trajectory under GRAVITY passes directly through (touchX, touchY).
   */
  public setAimAngle(touchX: number, touchY: number) {
    if (this.state !== 'AIMING') return;
    const launchX = CANNON_X;
    const launchY = CANNON_Y + 25;
    const dx = touchX - launchX;
    let dy = touchY - launchY;
    if (dy < 35) dy = 35;

    const speed = this.getLaunchSpeed();
    const dist = Math.sqrt(dx * dx + dy * dy);
    const flightTime = dist / speed;
    const gravityDrop = 0.5 * GRAVITY * flightTime * flightTime;
    const compensatedDy = dy - gravityDrop;

    this.aimAngle = Math.atan2(compensatedDy, dx);

    const safeMin = (6 * Math.PI) / 180;
    const safeMax = (174 * Math.PI) / 180;
    if (this.aimAngle < safeMin) this.aimAngle = safeMin;
    if (this.aimAngle > safeMax) this.aimAngle = safeMax;
  }

  public getEffectiveBaseDamage(): number {
    const metaDmg = (this.progression.getData().upgradeBaseDamage || 0) * 0.5;
    return 1 + metaDmg + this.runBonusDamage;
  }

  public steerBasketTo(targetCenterX: number) {
    const halfW = this.basket.width / 2;
    const minX = 35;
    const maxX = VIRTUAL_WIDTH - 35 - this.basket.width;
    const desiredX = Math.max(minX, Math.min(maxX, targetCenterX - halfW));
    const delta = desiredX - this.basket.x;
    if (Math.abs(delta) > 2) {
      this.basket.vx = (delta > 0 ? 1 : -1) * Math.abs(this.basket.vx);
    }
    this.basket.x = desiredX;
  }

  public shoot(): boolean {
    if (this.state !== 'AIMING' || this.ballsRemaining <= 0) return false;

    this.ballsRemaining--;
    this.currentCombo = 0;
    this.currentShotScore = 0;
    this.currentShotCubesHit = 0;
    this.ballsCaughtInCurrentShot = 0;
    this.nextFreeBallThreshold = 22000;

    const speed = this.getLaunchSpeed();
    const vx = Math.cos(this.aimAngle) * speed;
    const vy = Math.sin(this.aimAngle) * speed;

    let baseDamage = this.getEffectiveBaseDamage();
    let isElectrified = this.isNextBallElectrified;
    if (isElectrified) {
      baseDamage += 2;
      this.isNextBallElectrified = false;
    }

    // Option C: Overcharge Carry-Over on the first shot of the sector
    let overchargeMinis = 0;
    if (this.nextSectorOverchargeStacks > 0) {
      const stacks = this.nextSectorOverchargeStacks;
      this.nextSectorOverchargeStacks = 0;
      const bonusDmg = Math.max(1, Math.round(baseDamage * 0.25 * stacks * 10) / 10);
      baseDamage += bonusDmg;
      isElectrified = true;
      overchargeMinis = Math.min(3, Math.ceil(stacks / 2));
      this.addFloatingText(
        CANNON_X,
        CANNON_Y + 95,
        `⚡ OVERCHARGE +${bonusDmg} DMG & +${overchargeMinis} SFERE!`,
        '#d4b483'
      );
      this.spawnSparks(CANNON_X, CANNON_Y + 25, '#d4b483', 14);
    }

    const b: Ball = {
      x: CANNON_X,
      y: CANNON_Y + 25,
      vx,
      vy,
      radius: 18,
      isMini: false,
      isAlive: true,
      bounces: 0,
      baseDamage,
      trail: [],
      hasSavedOnce: false,
      isElectrified,
    };

    this.balls.push(b);

    // Spawn carry-over companion mini-balls in a tight fan around the aim angle
    if (overchargeMinis > 0) {
      const miniSpeed = speed * 0.92;
      const multiballTier = this.getResonanceTier('MULTIBALL');
      const metaDmg = (this.progression.getData().upgradeBaseDamage || 0) * 0.5;
      for (let i = 0; i < overchargeMinis; i++) {
        const offsetAngle = (i - (overchargeMinis - 1) / 2 || (i === 0 ? 0.14 : -0.14)) * 0.16;
        const ang = this.aimAngle + offsetAngle;
        this.balls.push({
          x: CANNON_X + Math.cos(ang) * 20,
          y: CANNON_Y + 25 + Math.sin(ang) * 20,
          vx: Math.cos(ang) * miniSpeed,
          vy: Math.sin(ang) * miniSpeed,
          radius: 12,
          isMini: true,
          isAlive: true,
          bounces: 0,
          baseDamage: (multiballTier >= 2 ? 2 : 1) + metaDmg + this.runBonusDamage * 0.5,
          trail: [],
          hasSavedOnce: false,
        });
      }
    }

    this.setState('BALL_IN_PLAY');
    soundEngine.playLaunch();
    soundEngine.triggerHaptic(20);
    return true;
  }

  public update(dt: number) {
    if (dt > 0.05) dt = 0.05;
    if (this.speedBoost && this.state === 'BALL_IN_PLAY') {
      dt *= 2.0;
    }

    if (this.screenShake > 0) {
      this.screenShake -= dt * 25;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    let basketSpeedMult = 1.0;
    if (
      this.activeRelics.includes('CHRONO_WARP') &&
      this.balls.some((b) => b.isAlive && !b.isMini && b.y > 1250 && b.vy > 0)
    ) {
      basketSpeedMult = 1.35;
    }
    this.basket.x += this.basket.vx * basketSpeedMult * dt;
    const minX = 35;
    const maxX = VIRTUAL_WIDTH - 35 - this.basket.width;
    if (this.basket.x < minX) {
      this.basket.x = minX;
      this.basket.vx = Math.abs(this.basket.vx);
    } else if (this.basket.x > maxX) {
      this.basket.x = maxX;
      this.basket.vx = -Math.abs(this.basket.vx);
    }

    if (this.activeBoss && this.activeBoss.isAlive) {
      this.updateBoss(dt);
    }

    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += GRAVITY * 0.35 * dt;
      s.rotation += s.rotSpeed * dt;
      s.life -= dt * 1.6;
      if (s.life <= 0) {
        this.shards.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt * 1.3;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    for (const c of this.cubes) {
      if (c.wobble > 0) {
        c.wobble -= dt * 6;
        if (c.wobble < 0) c.wobble = 0;
      }
      if (c.hitFlash > 0) {
        c.hitFlash -= dt * 8;
        if (c.hitFlash < 0) c.hitFlash = 0;
      }
      if (c.type === 'SHIELD' || c.isCore) {
        c.shieldPulse = (c.shieldPulse + dt * 3.5) % (Math.PI * 2);
      }
    }

    if (this.state === 'FEVER') {
      this.updateFever(dt);
      return;
    }

    if (this.state === 'BALL_IN_PLAY') {
      this.updateBalls(dt);
    }
  }

  private updateBoss(dt: number) {
    if (!this.activeBoss) return;
    const rotSpeed = this.bossPhase === 1 ? 1.35 : this.bossPhase === 2 ? 2.3 : 3.3;
    for (const sat of this.bossSatellites) {
      sat.angle += rotSpeed * dt;
    }

    const hpRatio = this.activeBoss.hp / this.activeBoss.maxHp;
    const newPhase = hpRatio > 0.66 ? 1 : hpRatio > 0.33 ? 2 : 3;
    if (newPhase !== this.bossPhase) {
      this.bossPhase = newPhase;
      this.screenShake = 16;
      this.addFloatingText(
        this.activeBoss.x + this.activeBoss.width / 2,
        this.activeBoss.y - 70,
        `FASE BOSS ${this.bossPhase}!`,
        '#c46d75'
      );
      soundEngine.playBossAlert();
      soundEngine.triggerHaptic(70);
      if (this.listener.onBossPhaseChange) this.listener.onBossPhaseChange(this.bossPhase);
    }

    this.bossPulseTimer += dt;
    if (this.bossPulseTimer >= (this.bossPhase === 3 ? 3.5 : 6.0)) {
      this.bossPulseTimer = 0;
      this.triggerBossShockwave();
    }

    if (this.bossPhase === 3) {
      this.activeBoss.y += 14 * dt;
      if (this.activeBoss.y > 1100) this.activeBoss.y = 1100;
    }
  }

  private triggerBossShockwave() {
    if (!this.activeBoss) return;
    this.screenShake = 12;
    const bx = this.activeBoss.x + this.activeBoss.width / 2;
    const by = this.activeBoss.y + this.activeBoss.height / 2;
    this.addFloatingText(bx, by, 'ONDA EMP!', '#c46d75');

    for (const b of this.balls) {
      if (b.isAlive) {
        const dx = b.x - bx;
        const dy = b.y - by;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          b.vx += (dx / dist) * 480;
          b.vy += (dy / dist) * 480;
        }
      }
    }
    this.spawnSparks(bx, by, '#c46d75', 24);
    soundEngine.playExplosion();
  }

  private spawnFeverCapsule(x: number, y: number, forcedType?: FeverCapsuleType) {
    const types: FeverCapsuleType[] = ['BALL', 'OVERCHARGE', 'SHARDS'];
    const type =
      forcedType || types[(this.nextCapsuleId + Math.floor(x)) % types.length];
    const archColor =
      (this.currentArchetype && ARCHETYPES_DATA[this.currentArchetype]?.color) || '#d4b483';

    let label = '+1 SFERA';
    let color = '#e4e4e7';
    if (type === 'OVERCHARGE') {
      label = '◇ CARICA';
      color = archColor;
    } else if (type === 'SHARDS') {
      label = '+8 ◆';
      color = '#7c9cb4';
    }

    this.feverCapsules.push({
      id: this.nextCapsuleId++,
      x: Math.max(90, Math.min(VIRTUAL_WIDTH - 90, x)),
      y: Math.max(220, Math.min(950, y)),
      vx: ((this.nextCapsuleId % 3) - 1) * 45,
      vy: 420 + (this.nextCapsuleId % 4) * 55,
      width: 118,
      height: 44,
      type,
      label,
      color,
      isAlive: true,
    });
  }

  private updateFever(dt: number) {
    this.feverTimer -= dt;
    this.feverExplosionTimer -= dt;

    if (this.feverExplosionTimer <= 0) {
      this.feverExplosionTimer = 0.07;
      for (const c of this.cubes) {
        if (c.isAlive) {
          c.isAlive = false;
          this.score += 500;
          this.addQuantumShards(1);
          const cx = c.x + c.width / 2;
          const cy = c.y + c.height / 2;
          this.spawnCubeShards(c);
          this.spawnSparks(cx, cy, '#d4b483', 14);
          this.addFloatingText(cx, cy, 'FEVER +500', '#d4b483');
          if (this.feverCapsules.length < 7 && this.feverTimer > 0.7) {
            this.spawnFeverCapsule(cx, cy);
          }
          this.screenShake = 6;
          soundEngine.playCubeShatter();
          break;
        }
      }
    }

    // Update falling Fever Supply Capsules & basket capture
    const basketCenterX = this.basket.x + this.basket.width / 2;
    const basketCenterY = this.basket.y + this.basket.height / 2;
    for (const cap of this.feverCapsules) {
      if (!cap.isAlive) continue;

      cap.vy += 260 * dt;
      cap.x += cap.vx * dt;
      cap.y += cap.vy * dt;

      if (cap.x < 70) {
        cap.x = 70;
        cap.vx = Math.abs(cap.vx);
      } else if (cap.x > VIRTUAL_WIDTH - 70) {
        cap.x = VIRTUAL_WIDTH - 70;
        cap.vx = -Math.abs(cap.vx);
      }

      // Strong magnetic pull into the basket when capsules approach the bottom
      if (cap.y >= this.basket.y - 320 && cap.y <= this.basket.y + 60) {
        const dx = basketCenterX - cap.x;
        if (Math.abs(dx) < this.basket.width * 1.15) {
          cap.x += dx * 4.2 * dt;
        }
      }

      // Check collision with basket
      const hitX =
        Math.abs(cap.x - basketCenterX) <= this.basket.width * 0.62 + cap.width * 0.4;
      const hitY = Math.abs(cap.y - basketCenterY) <= this.basket.height * 0.9 + cap.height * 0.5;
      if (hitX && hitY) {
        cap.isAlive = false;
        if (!this.lastFeverSummary) {
          this.lastFeverSummary = {
            ballsCaught: 0,
            overchargeCaught: 0,
            shardsCaught: 0,
            leftoverBallsConverted: 0,
            totalOverchargeStacks: 0,
          };
        }
        if (cap.type === 'BALL') {
          this.ballsRemaining++;
          this.lastFeverSummary.ballsCaught++;
          this.addFloatingText(cap.x, this.basket.y - 40, '★ CAPSULA: +1 SFERA!', '#e4e4e7');
          soundEngine.playFreeBall();
        } else if (cap.type === 'OVERCHARGE') {
          this.feverOverchargeCaught++;
          this.lastFeverSummary.overchargeCaught++;
          this.addFloatingText(cap.x, this.basket.y - 40, '◇ CAPSULA: +1 OVERCHARGE!', cap.color);
          soundEngine.playRelicSelect();
        } else {
          this.addQuantumShards(8);
          this.lastFeverSummary.shardsCaught += 8;
          this.addFloatingText(cap.x, this.basket.y - 40, '◆ CAPSULA: +8 SCHEGGE!', '#7c9cb4');
          soundEngine.playShardCollect();
        }
        this.spawnSparks(cap.x, this.basket.y, cap.color, 12);
        soundEngine.triggerHaptic(25);
      } else if (cap.y > VIRTUAL_HEIGHT + 60) {
        cap.isAlive = false;
      }
    }

    if (this.feverTimer <= 0) {
      const ballBonus = this.ballsRemaining * 2000;
      this.score += ballBonus;
      const isBossSector = this.currentLevel % 5 === 0;
      const shardReward = isBossSector ? 45 : this.currentNodeType === 'ELITE' ? 35 : 15;
      this.addQuantumShards(shardReward);

      // Option C: Convert remaining balls + caught overcharge capsules into First-Shot Overcharge for next sector
      const leftoverConverted = Math.min(4, Math.max(1, this.ballsRemaining));
      this.nextSectorOverchargeStacks = Math.min(
        6,
        leftoverConverted + this.feverOverchargeCaught
      );
      if (!this.lastFeverSummary) {
        this.lastFeverSummary = {
          ballsCaught: 0,
          overchargeCaught: this.feverOverchargeCaught,
          shardsCaught: 0,
          leftoverBallsConverted: leftoverConverted,
          totalOverchargeStacks: this.nextSectorOverchargeStacks,
        };
      } else {
        this.lastFeverSummary.leftoverBallsConverted = leftoverConverted;
        this.lastFeverSummary.totalOverchargeStacks = this.nextSectorOverchargeStacks;
      }

      // Option C: Generous ball recovery (+2 on Normal, +3 on Elite/Boss) & guaranteed minimum 4 balls
      const maxCap = 9 + this.progression.getData().upgradeExtraBalls;
      const recovered = isBossSector || this.currentNodeType === 'ELITE' ? 3 : 2;
      this.ballsRemaining = Math.max(4, Math.min(maxCap, this.ballsRemaining + recovered));

      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
      this.progression.recordScoreAndLevel(this.score, this.currentLevel);

      const maxLevel = this.gameMode === 'STORY' ? 25 : 10;
      if (this.currentLevel === maxLevel && !this.isEndless) {
        this.progression.recordVictory();
        if (this.gameMode === 'STORY') {
          this.progression.recordBossDefeated(25);
        }
        const unlocks = this.progression.checkAndTriggerUnlocks();
        if (unlocks.length > 0 && this.listener.onNewUnlock) {
          this.listener.onNewUnlock(unlocks[0]);
        }
        this.progression.clearActiveRun();
        this.setState('VICTORY');
      } else {
        const unlocks = this.progression.checkAndTriggerUnlocks();
        if (unlocks.length > 0 && this.listener.onNewUnlock) {
          this.listener.onNewUnlock(unlocks[0]);
        }
        // Option C: Draft Relic on EVERY sector in Chapter 1 (Sectors 1-5), plus even/Elite/Boss sectors afterwards
        const shouldDraft =
          this.currentLevel <= 5 ||
          this.currentLevel % 2 === 0 ||
          this.currentNodeType === 'ELITE' ||
          this.currentLevel % 5 === 0;
        if (shouldDraft) {
          this.prepareRelicDraft();
        } else {
          this.prepareSectorMap(this.currentLevel + 1);
        }
      }
    }
  }

  private updateBalls(dt: number) {
    const newBalls: Ball[] = [];
    const fusionCombos = this.getActiveFusionCombos();

    for (let i = this.balls.length - 1; i >= 0; i--) {
      const b = this.balls[i];
      if (!b.isAlive) {
        this.balls.splice(i, 1);
        continue;
      }

      b.trail.push([b.x, b.y]);
      if (b.trail.length > 10) {
        b.trail.shift();
      }

      if (
        (b.isMini && this.activeRelics.includes('GRAVITY_WELL')) ||
        this.currentArchetype === 'QUANTUM_SINGULARITY'
      ) {
        let closestCore: Cube | null = null;
        let bestDistSq = 360 * 360;
        for (const c of this.cubes) {
          if (c.isAlive && c.isCore) {
            const dx = c.x + c.width / 2 - b.x;
            const dy = c.y + c.height / 2 - b.y;
            const dSq = dx * dx + dy * dy;
            if (dSq < bestDistSq) {
              bestDistSq = dSq;
              closestCore = c;
            }
          }
        }
        if (closestCore) {
          const dx = closestCore.x + closestCore.width / 2 - b.x;
          const dy = closestCore.y + closestCore.height / 2 - b.y;
          b.vx += dx * 1.4 * dt;
          b.vy += dy * 0.8 * dt;
        }
      }

      const magnetLvl = this.progression.getData().upgradeBasketMagnet || 0;
      const magnetHeight = 120 + magnetLvl * 35;
      if (!b.isMini && b.y >= this.basket.y - magnetHeight && b.y <= this.basket.y + 30 && b.vy > 0) {
        const basketCenterX = this.basket.x + this.basket.width / 2;
        const distToCenter = basketCenterX - b.x;
        const reachRatio = 0.65 + magnetLvl * 0.18;
        if (Math.abs(distToCenter) < this.basket.width * reachRatio) {
          const basePull = this.activeRelics.includes('MAGNETIC_BASKET') ? 2.6 : 0.85;
          const pullFactor = basePull + magnetLvl * 0.55;
          b.vx += distToCenter * pullFactor * dt;
        }
      }

      b.vy += GRAVITY * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      const leftWall = 25;
      const rightWall = VIRTUAL_WIDTH - 25;
      if (b.x - b.radius < leftWall) {
        b.x = leftWall + b.radius;
        b.vx = -b.vx * 0.95;
      } else if (b.x + b.radius > rightWall) {
        b.x = rightWall - b.radius;
        b.vx = -b.vx * 0.95;
      }

      const ceiling = 70;
      if (b.y - b.radius < ceiling) {
        b.y = ceiling + b.radius;
        b.vy = Math.abs(b.vy) * 0.95;
      }

      if (!b.isMini && this.safetyNetAvailable && b.y + b.radius >= 1840) {
        this.safetyNetAvailable = false;
        const shieldLvl = this.progression.getData().upgradeEmergencyShield || 0;
        const relicSave = this.activeRelics.includes('SAFETY_NET') ? 0.5 : 0;
        const saveProb = Math.min(1.0, relicSave + shieldLvl * 0.25);
        if (Math.random() < saveProb) {
          b.y = 1840 - b.radius;
          b.vy = -Math.abs(b.vy) * 1.12;
          this.screenShake = 10;
          this.addFloatingText(b.x, b.y - 40, 'PARATIA DI EMERGENZA!', '#e4e4e7');
          soundEngine.playBounceHit(1);
        }
      }

      if (b.y + b.radius >= this.basket.y && b.y - b.radius <= this.basket.y + this.basket.height) {
        if (b.x >= this.basket.x - 10 && b.x <= this.basket.x + this.basket.width + 10) {
          if (b.isMini) {
            if (!b.hasSavedOnce) {
              b.hasSavedOnce = true;
              b.y = this.basket.y - b.radius;
              b.vy = -Math.abs(b.vy) * 0.92;
              this.addScore(250);
              this.addFloatingText(b.x, this.basket.y - 40, 'MINI RIMBALZO +250', '#9b95b8');
              soundEngine.playBounceHit(this.currentCombo);
              continue;
            } else {
              b.isAlive = false;
              this.balls.splice(i, 1);
              this.addScore(250);
              continue;
            }
          }

          b.isAlive = false;
          this.balls.splice(i, 1);
          this.ballsRemaining++;
          this.ballsCaughtInCurrentShot++;
          const catchPoints = 350 * Math.max(1, this.currentCombo);
          this.addScore(catchPoints);
          this.addFloatingText(b.x, this.basket.y - 50, '+1 SFERA! CATTURA!', '#7fa68e');

          if (this.activeRelics.includes('TESLA_COIL')) {
            this.triggerMicroSpark(this.basket.x + this.basket.width / 2, this.basket.y, 4);
          }

          if (fusionCombos.includes('MAGNETIC_SURGE')) {
            this.isNextBallElectrified = true;
            this.addFloatingText(b.x, this.basket.y - 80, '⚡ SCARICA MAGNETICA!', '#7c9cb4');
          }

          soundEngine.playCatch();
          soundEngine.triggerHaptic(40);
          continue;
        }
      }

      if (
        b.isMini &&
        this.currentArchetype === 'SWARM_MATRIX' &&
        !b.hasSavedOnce &&
        b.y + b.radius >= 1860
      ) {
        b.hasSavedOnce = true;
        b.vy = -Math.abs(b.vy) * 0.95;
        this.addFloatingText(b.x, b.y - 30, 'SWARM RESCUE!', '#9b95b8');
        continue;
      }

      if (b.y - b.radius > VIRTUAL_HEIGHT + 20) {
        b.isAlive = false;

        if (b.isMini && fusionCombos.includes('SWARM_DETONATOR')) {
          this.triggerExplosion(b.x, 1800, 140, 4);
          this.addFloatingText(b.x, 1780, 'SWARM BOOM!', '#c87d65');
        }

        this.balls.splice(i, 1);
        if (!b.isMini && this.activeRelics.includes('SUPERNOVA')) {
          this.triggerSupernova(b.x);
        }
        continue;
      }

      this.handleSatelliteCollisions(b);
      this.handleCubeCollisions(b, newBalls);
    }

    this.balls.push(...newBalls);

    if (this.balls.length === 0) {
      this.checkRoundEnd();
    }
  }

  private handleSatelliteCollisions(b: Ball) {
    if (!this.activeBoss || !this.activeBoss.isAlive) return;
    const bx = this.activeBoss.x + this.activeBoss.width / 2;
    const by = this.activeBoss.y + this.activeBoss.height / 2;

    for (const sat of this.bossSatellites) {
      if (!sat.isAlive) continue;
      const sx = bx + Math.cos(sat.angle) * sat.distance;
      const sy = by + Math.sin(sat.angle) * sat.distance;

      const dx = b.x - sx;
      const dy = b.y - sy;
      if (dx * dx + dy * dy <= (b.radius + sat.width / 2) * (b.radius + sat.width / 2)) {
        b.vx = -b.vx * 1.05;
        b.vy = -b.vy * 1.05;
        const armorPierce = this.progression.getData().upgradeArmorPierce || 0;
        sat.hp -= 1 + (armorPierce > 0 ? 1 : 0);
        this.addFloatingText(sx, sy, 'DEFLECT', '#c46d75');
        soundEngine.playBounceHit(this.currentCombo);
        soundEngine.triggerHaptic(12);

        if (sat.hp <= 0) {
          sat.isAlive = false;
          this.spawnSparks(sx, sy, '#c46d75', 16);
          this.addQuantumShards(3);
        }
        break;
      }
    }
  }

  private handleCubeCollisions(b: Ball, newBalls: Ball[]) {
    const hasPiercing = this.activeRelics.includes('PIERCING_RAIL');
    const electricTier = this.getResonanceTier('ELECTRIC');
    const explosiveTier = this.getResonanceTier('EXPLOSIVE');
    const multiballTier = this.getResonanceTier('MULTIBALL');
    const kineticTier = this.getResonanceTier('KINETIC');
    const fusionCombos = this.getActiveFusionCombos();

    for (let j = this.cubes.length - 1; j >= 0; j--) {
      const c = this.cubes[j];
      if (!c.isAlive) continue;

      const closestX = Math.max(c.x, Math.min(b.x, c.x + c.width));
      const closestY = Math.max(c.y, Math.min(b.y, c.y + c.height));
      const distX = b.x - closestX;
      const distY = b.y - closestY;
      const distSq = distX * distX + distY * distY;

      if (distSq <= b.radius * b.radius) {
        b.bounces++;
        this.currentCombo++;
        this.currentShotCubesHit++;

        const overlapLeft = b.x + b.radius - c.x;
        const overlapRight = c.x + c.width - (b.x - b.radius);
        const overlapTop = b.y + b.radius - c.y;
        const overlapBottom = c.y + c.height - (b.y - b.radius);

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        const pierceThrough =
          (hasPiercing && c.hp <= 1 && c.type !== 'BOSS') ||
          (b.isMini && fusionCombos.includes('HYPER_SWARM') && c.hp <= 2);

        if (!pierceThrough) {
          if (minOverlap === overlapLeft) {
            b.x = c.x - b.radius;
            b.vx = -Math.abs(b.vx);
          } else if (minOverlap === overlapRight) {
            b.x = c.x + c.width + b.radius;
            b.vx = Math.abs(b.vx);
          } else if (minOverlap === overlapTop) {
            b.y = c.y - b.radius;
            b.vy = -Math.abs(b.vy);
          } else {
            b.y = c.y + c.height + b.radius;
            b.vy = Math.abs(b.vy);
          }
          if (Math.abs(b.vx) < 25) {
            b.vx += b.x < VIRTUAL_WIDTH / 2 ? 45 : -45;
          }
        }

        let damage = b.baseDamage;

        if (this.activeRelics.includes('KINETIC_SURGE') && b.bounces >= 6) {
          damage += 1;
        }
        if (this.activeRelics.includes('HYPER_VELOCITY') && b.bounces >= 3) {
          damage += 1;
        }
        if (kineticTier >= 2 && b.bounces >= 4) {
          damage += 2;
        } else if (kineticTier >= 1 && b.bounces >= 5) {
          damage += 1;
        }

        if (c.type === 'KINETIC') {
          damage += 1;
          b.vx *= 1.22;
          b.vy *= 1.22;
          this.addFloatingText(c.x + c.width / 2, c.y - 30, 'KINETIC BOOST!', '#d4b483');
        }

        const armorPierceLvl = this.progression.getData().upgradeArmorPierce || 0;
        if (armorPierceLvl > 0 && (c.type === 'ARMOR' || c.type === 'SHIELD' || c.type === 'BOSS')) {
          damage += armorPierceLvl;
        }

        if (this.activeRelics.includes('HEAVY_MASS') && (c.type === 'ARMOR' || c.type === 'BOSS')) {
          damage += 2;
        }
        if (this.currentArchetype === 'KINETIC_TITAN' && c.type === 'BOSS') {
          damage += 1;
        }

        if (c.isFrozen) {
          damage = Math.round(damage * 1.5);
          if (fusionCombos.includes('CRYO_SHOCK')) {
            damage += 2;
            this.addFloatingText(c.x + c.width / 2, c.y - 50, 'CRYO SHOCK!', '#7c9cb4');
          }
        }

        let isCrit = false;
        const metaCritChance = (this.progression.getData().upgradeCritChance || 0) * 0.05;
        const relicCritChance = this.activeRelics.includes('CRITICAL_OVERDRIVE') ? 0.22 : 0;
        const totalCritChance = metaCritChance + relicCritChance;
        if (totalCritChance > 0 && Math.random() < totalCritChance) {
          damage *= 2;
          isCrit = true;
          this.screenShake = Math.max(this.screenShake, 12);
          this.addFloatingText(c.x + c.width / 2, c.y - 40, 'CRIT! x2', '#c46d75');
        }

        if (
          this.currentArchetype === 'CHRONO_PULSE' &&
          this.currentCombo >= 6 &&
          this.currentCombo % 4 === 0
        ) {
          this.screenShake = 8;
          this.addFloatingText(c.x + c.width / 2, c.y - 45, 'CHRONO PULSE!', '#7fa68e');
          damage += 2;
        }

        const isShielded = this.isCubeProtectedByShield(c);
        if (isShielded && !this.activeRelics.includes('EMP_BURST')) {
          damage = Math.max(1, damage * 0.5);
        }

        const finalDamage = Math.max(1, Math.round(damage));
        c.hp -= finalDamage;
        c.wobble = 1;
        c.hitFlash = 1;

        const hitPoints = (c.isCore ? 120 : 60) * this.currentCombo;
        this.addScore(hitPoints);
        this.addFloatingText(
          c.x + c.width / 2,
          c.y + c.height / 2,
          `-${finalDamage}`,
          isCrit ? '#c46d75' : c.isCore ? '#d4b483' : '#e4e4e7'
        );

        soundEngine.playBounceHit(this.currentCombo);
        soundEngine.triggerHaptic(12);

        if (this.activeRelics.includes('MICRO_CAPACITOR') && b.bounces % 5 === 0) {
          const sparkDmg = this.currentArchetype === 'VOLT_OVERCHARGE' ? 2 : 1;
          this.triggerMicroSpark(c.x + c.width / 2, c.y + c.height / 2, sparkDmg, c);
        }

        if (this.activeRelics.includes('BLAST_CAP') && b.bounces === 10) {
          this.triggerExplosion(b.x, b.y, 120, 2);
          this.addFloatingText(b.x, b.y - 40, 'INNESCO!', '#c87d65');
        }

        if (this.activeRelics.includes('CHAIN_LIGHTNING') && b.bounces % 4 === 0) {
          const extraZaps = electricTier >= 2 ? 2 : electricTier >= 1 ? 1 : 0;
          this.triggerChainLightning(c, extraZaps);
        }

        if (this.activeRelics.includes('VOLT_DISCHARGE') && this.currentShotCubesHit % 6 === 0) {
          this.triggerChainLightning(c, 1);
        }

        if (this.activeRelics.includes('BOUNCING_BOMB') && b.bounces === 9) {
          const blastRadius = 180 * (1.0 + explosiveTier * 0.2);
          this.triggerExplosion(b.x, b.y, blastRadius, 4);
          this.addFloatingText(b.x, b.y - 50, 'SFERA BOMBA!', '#c87d65');
        }

        if (!b.isMini && this.activeRelics.includes('QUANTUM_DUPLICATION') && b.bounces === 12) {
          this.spawnMiniBalls(b.x, b.y, newBalls, 1);
          this.addFloatingText(b.x, b.y - 40, 'DUPLICAZIONE!', '#9b95b8');
        }

        if (!b.isMini && this.activeRelics.includes('MICRO_SWARM') && b.bounces % 8 === 0) {
          this.spawnMiniBalls(b.x, b.y, newBalls, 1);
        }

        if (
          ((this.currentArchetype === 'CRYSTAL_SINGULARITY' && Math.random() < 0.25) ||
            (this.activeRelics.includes('POLAR_VORTEX') && Math.random() < 0.5)) &&
          !c.isFrozen
        ) {
          c.isFrozen = true;
          this.addFloatingText(c.x + c.width / 2, c.y - 30, 'FROZEN', '#7c9cb4');
        }

        if (c.type === 'CLASS_ABILITY' && c.hp > 0) {
          this.triggerClassAbilityBlock(c, b, newBalls, false);
        }

        if (c.hp <= 0) {
          c.isAlive = false;
          this.totalCubesDestroyed++;
          this.progression.addCubesDestroyed(1);
          this.addQuantumShards(c.isCore ? 4 : c.type === 'CLASS_ABILITY' ? 2 : 1);

          let killPoints = (c.isCore ? 500 : 250) * Math.min(this.currentCombo, 10);
          if (c.isCore && this.currentArchetype === 'PROTO_CORE') {
            killPoints = Math.round(killPoints * 1.2);
          }
          this.addScore(killPoints);
          this.spawnCubeShards(c);

          soundEngine.playCubeShatter();
          soundEngine.triggerHaptic(28);

          if (c.type === 'CLASS_ABILITY') {
            this.triggerClassAbilityBlock(c, b, newBalls, true);
          }

          if (c.type === 'EXPLOSIVE') {
            const rExp = 220 * (this.currentArchetype === 'PYRO_DETONATOR' ? 1.25 : 1.0);
            this.triggerExplosion(c.x + c.width / 2, c.y + c.height / 2, rExp, 5);
            this.screenShake = 14;
          }

          if (c.type === 'SPLITTER') {
            this.spawnMiniBalls(
              c.x + c.width / 2,
              c.y + c.height / 2,
              newBalls,
              this.activeRelics.includes('SPLIT_STORM') ? 3 : 2
            );
          }

          if (this.activeRelics.includes('SHRAPNEL_BURST')) {
            this.triggerShrapnel(c.x + c.width / 2, c.y + c.height / 2);
          }

          if (c.isCore && this.activeRelics.includes('ECHO_PEBBLE') && Math.random() < 0.15) {
            this.spawnMiniBalls(c.x + c.width / 2, c.y + c.height / 2, newBalls, 1);
            this.addFloatingText(c.x + c.width / 2, c.y - 35, 'SCHEGGIA ECO!', '#9b95b8');
          }

          if (
            this.activeRelics.includes('MULTIBALL_REACTOR') &&
            Math.random() < (multiballTier >= 2 ? 0.28 : 0.18)
          ) {
            this.spawnMiniBalls(c.x + c.width / 2, c.y + c.height / 2, newBalls, 1);
            this.addFloatingText(c.x + c.width / 2, c.y - 40, 'MULTIBALL!', '#9b95b8');
          }

          if (c.type === 'BOSS') {
            const shardReward =
              this.currentLevel === 25
                ? 150
                : this.currentLevel === 20
                ? 100
                : this.currentLevel >= 15
                ? 75
                : 50;
            this.addQuantumShards(shardReward);
            this.progression.recordBossDefeated(this.currentLevel);
            const newUnlocks = this.progression.checkAndTriggerUnlocks();
            if (newUnlocks.length > 0 && this.listener.onNewUnlock) {
              this.listener.onNewUnlock(newUnlocks[0]);
            }
          }

          if (this.getRemainingCoreCubes() === 0) {
            this.triggerFeverMode();
            return;
          }
        }
        break;
      }
    }
  }

  private triggerClassAbilityBlock(
    c: Cube,
    b: Ball,
    newBalls: Ball[],
    isShatter: boolean
  ) {
    const arch = this.currentArchetype || 'PROTO_CORE';
    const cx = c.x + c.width / 2;
    const cy = c.y + c.height / 2;
    const archColor = ARCHETYPES_DATA[arch]?.color || '#e4e4e7';

    switch (arch) {
      case 'PROTO_CORE': {
        if (!isShatter) {
          this.addScore(300);
          for (const other of this.cubes) {
            if (other.isAlive && other !== c) {
              const dx = other.x + other.width / 2 - cx;
              const dy = other.y + other.height / 2 - cy;
              if (dx * dx + dy * dy <= 190 * 190) {
                other.hp -= 1;
                other.hitFlash = 0.8;
                other.wobble = 0.7;
                if (other.hp <= 0) {
                  other.isAlive = false;
                  this.spawnCubeShards(other);
                }
              }
            }
          }
          this.addFloatingText(cx, cy - 34, '◇ ONDA ARMONICA', archColor);
          this.spawnSparks(cx, cy, archColor, 8);
        } else {
          this.spawnMiniBalls(cx, cy, newBalls, 1);
          this.addQuantumShards(2);
          this.addFloatingText(cx, cy - 42, '◇ IMPULSO ARMONICO! +2◆', archColor);
          this.spawnSparks(cx, cy, archColor, 14);
        }
        break;
      }

      case 'VOLT_OVERCHARGE': {
        if (!isShatter) {
          this.triggerChainLightning(c, 0);
          this.addFloatingText(cx, cy - 34, '◇ SCARICA VOLT!', archColor);
        } else {
          this.triggerChainLightning(c, 2);
          this.isNextBallElectrified = true;
          this.addFloatingText(cx, cy - 42, '◇ TEMPESTA VOLT!', archColor);
          this.screenShake = Math.max(this.screenShake, 10);
        }
        break;
      }

      case 'PYRO_DETONATOR': {
        if (!isShatter) {
          this.triggerExplosion(cx, cy, 150, 2);
          this.addFloatingText(cx, cy - 34, '◇ FIAMMATA SOLARE!', archColor);
        } else {
          this.triggerExplosion(cx, cy, 260, 6);
          this.addFloatingText(cx, cy - 42, '◇ DETONAZIONE SOLARE!', archColor);
          this.screenShake = Math.max(this.screenShake, 15);
        }
        break;
      }

      case 'KINETIC_TITAN': {
        if (!isShatter) {
          b.vx *= 1.25;
          b.vy *= 1.25;
          b.baseDamage += 1;
          this.addFloatingText(cx, cy - 34, '◇ URTO TITANICO +1 DMG!', archColor);
          this.spawnSparks(cx, cy, archColor, 10);
        } else {
          this.screenShake = Math.max(this.screenShake, 14);
          this.addFloatingText(cx, cy - 42, '◇ SISMA TITANICO!', archColor);
          for (const other of this.cubes) {
            if (other.isAlive && other !== c) {
              const isHeavy =
                other.type === 'ARMOR' || other.type === 'SHIELD' || other.type === 'BOSS';
              const dx = other.x + other.width / 2 - cx;
              const dy = other.y + other.height / 2 - cy;
              if (isHeavy || dx * dx + dy * dy <= 220 * 220) {
                const sismaDmg = isHeavy ? 3 : 2;
                other.hp -= sismaDmg;
                other.hitFlash = 1;
                other.wobble = 1.1;
                if (other.hp <= 0) {
                  other.isAlive = false;
                  this.spawnCubeShards(other);
                }
              }
            }
          }
          this.spawnSparks(cx, cy, archColor, 18);
        }
        break;
      }

      case 'SWARM_MATRIX': {
        if (!isShatter) {
          this.spawnMiniBalls(cx, cy, newBalls, 1);
          this.addFloatingText(cx, cy - 34, '◇ SCIAME +1 SFERA!', archColor);
          this.spawnSparks(cx, cy, archColor, 10);
        } else {
          this.spawnMiniBalls(cx, cy, newBalls, 3);
          this.addFloatingText(cx, cy - 42, '◇ ERUZIONE SCIAME +3!', archColor);
          this.spawnSparks(cx, cy, archColor, 18);
        }
        break;
      }

      case 'CRYSTAL_SINGULARITY': {
        if (!isShatter) {
          let frozenCount = 0;
          for (const other of this.cubes) {
            if (other.isAlive && other !== c && !other.isFrozen) {
              const dx = other.x + other.width / 2 - cx;
              const dy = other.y + other.height / 2 - cy;
              if (dx * dx + dy * dy <= 240 * 240) {
                other.isFrozen = true;
                other.hitFlash = 0.7;
                frozenCount++;
                if (frozenCount >= 2) break;
              }
            }
          }
          this.addFloatingText(cx, cy - 34, '◇ CRIO-ONDA!', archColor);
          this.spawnSparks(cx, cy, archColor, 10);
        } else {
          for (const other of this.cubes) {
            if (other.isAlive && other !== c) {
              const dx = other.x + other.width / 2 - cx;
              const dy = other.y + other.height / 2 - cy;
              if (dx * dx + dy * dy <= 280 * 280) {
                other.isFrozen = true;
                other.hp -= 3;
                other.hitFlash = 1;
                other.wobble = 1;
                if (other.hp <= 0) {
                  other.isAlive = false;
                  this.spawnCubeShards(other);
                }
              }
            }
          }
          this.addFloatingText(cx, cy - 42, '◇ ZERO ASSOLUTO!', archColor);
          this.spawnSparks(cx, cy, archColor, 18);
        }
        break;
      }

      case 'CHRONO_PULSE': {
        if (!isShatter) {
          this.currentCombo += 3;
          this.addScore(400);
          this.addFloatingText(cx, cy - 34, '◇ CRONO COMBO +3!', archColor);
          this.spawnSparks(cx, cy, archColor, 10);
        } else {
          for (const other of this.cubes) {
            if (other.isAlive && other !== c) {
              const sameRow = Math.abs(other.y - c.y) < 42;
              const sameCol = Math.abs(other.x - c.x) < 56;
              if (sameRow || sameCol) {
                other.hp -= 3;
                other.hitFlash = 1;
                other.wobble = 1;
                if (other.hp <= 0) {
                  other.isAlive = false;
                  this.spawnCubeShards(other);
                }
              }
            }
          }
          this.screenShake = Math.max(this.screenShake, 12);
          this.addFloatingText(cx, cy - 42, '◇ RAGGIO A CROCE!', archColor);
          this.spawnSparks(cx, cy, archColor, 18);
        }
        break;
      }

      case 'QUANTUM_SINGULARITY': {
        if (!isShatter) {
          let targetCore: Cube | null = null;
          let bestDist = Infinity;
          for (const other of this.cubes) {
            if (other.isAlive && other.isCore) {
              const dx = other.x + other.width / 2 - cx;
              const dy = other.y + other.height / 2 - cy;
              const d = dx * dx + dy * dy;
              if (d < bestDist) {
                bestDist = d;
                targetCore = other;
              }
            }
          }
          if (targetCore) {
            targetCore.hp -= 2;
            targetCore.hitFlash = 1;
            targetCore.wobble = 1;
            if (targetCore.hp <= 0) {
              targetCore.isAlive = false;
              this.spawnCubeShards(targetCore);
            }
          }
          this.addFloatingText(cx, cy - 34, '◇ IMPULSO SINGOLARITÀ!', archColor);
          this.spawnSparks(cx, cy, archColor, 10);
        } else {
          for (const other of this.cubes) {
            if (other.isAlive && other.isCore) {
              other.hp -= 2;
              other.hitFlash = 1;
              other.wobble = 1;
              if (other.hp <= 0) {
                other.isAlive = false;
                this.spawnCubeShards(other);
              }
            }
          }
          this.spawnMiniBalls(cx, cy, newBalls, 2);
          this.screenShake = Math.max(this.screenShake, 14);
          this.addFloatingText(cx, cy - 42, '◇ COLLASSO QUANTICO!', archColor);
          this.spawnSparks(cx, cy, archColor, 18);
        }
        break;
      }
    }
  }

  private triggerMicroSpark(ox: number, oy: number, dmg: number, exclude?: Cube) {
    let bestCube: Cube | null = null;
    let bestDistSq = 420 * 420;
    for (const c of this.cubes) {
      if (c.isAlive && c !== exclude) {
        const cx = c.x + c.width / 2;
        const cy = c.y + c.height / 2;
        const dSq = (cx - ox) * (cx - ox) + (cy - oy) * (cy - oy);
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          bestCube = c;
        }
      }
    }
    if (bestCube) {
      bestCube.hp -= dmg;
      bestCube.hitFlash = 1;
      bestCube.wobble = 0.8;
      const cx = bestCube.x + bestCube.width / 2;
      const cy = bestCube.y + bestCube.height / 2;
      this.addFloatingText(cx, cy, `⚡-${dmg}`, '#e4e4e7');
      this.spawnSparks(cx, cy, '#e4e4e7', 5);
      if (bestCube.hp <= 0) {
        bestCube.isAlive = false;
        this.spawnCubeShards(bestCube);
        if (this.getRemainingCoreCubes() === 0) {
          this.triggerFeverMode();
        }
      }
    }
  }

  private triggerFeverMode() {
    this.setState('FEVER');
    this.feverTimer = 2.6;
    this.feverExplosionTimer = 0.05;
    this.feverCapsules = [];
    this.feverOverchargeCaught = 0;
    this.lastFeverSummary = {
      ballsCaught: 0,
      overchargeCaught: 0,
      shardsCaught: 0,
      leftoverBallsConverted: this.ballsRemaining,
      totalOverchargeStacks: 0,
    };

    // Option B: Immediately drop 4 guaranteed Supply Capsules across the arena
    const presetColumns = [230, 430, 650, 850];
    const presetTypes: FeverCapsuleType[] = ['BALL', 'OVERCHARGE', 'BALL', 'SHARDS'];
    for (let i = 0; i < presetColumns.length; i++) {
      this.spawnFeverCapsule(presetColumns[i], 280 + i * 75, presetTypes[i]);
    }

    this.screenShake = 18;
    this.addFloatingText(CANNON_X, 350, '★ PIOGGIA DI CAPSULE FEVER! ★', '#d4b483');
    soundEngine.playFeverFanfare();
    soundEngine.triggerHaptic(80);
    if (this.listener.onFever) this.listener.onFever();
  }

  private isCubeProtectedByShield(target: Cube): boolean {
    if (target.type === 'SHIELD') return false;
    const tx = target.x + target.width / 2;
    const ty = target.y + target.height / 2;
    for (const c of this.cubes) {
      if (c.isAlive && c.type === 'SHIELD' && c !== target) {
        const dx = c.x + c.width / 2 - tx;
        const dy = c.y + c.height / 2 - ty;
        if (dx * dx + dy * dy < 280 * 280) {
          return true;
        }
      }
    }
    return false;
  }

  private triggerChainLightning(origin: Cube, extraTargets: number) {
    let zaps = 0;
    const maxZaps = 2 + extraTargets;
    const dmg = this.currentArchetype === 'VOLT_OVERCHARGE' ? 3 : 2;
    const ox = origin.x + origin.width / 2;
    const oy = origin.y + origin.height / 2;

    for (const c of this.cubes) {
      if (c.isAlive && c !== origin) {
        const cx = c.x + c.width / 2;
        const cy = c.y + c.height / 2;
        const dx = cx - ox;
        const dy = cy - oy;
        if (dx * dx + dy * dy < 420 * 420) {
          let zapDmg = dmg;
          if (this.activeRelics.includes('PLASMA_CONDUIT') && c.hp < c.maxHp) {
            zapDmg += 2;
          }
          c.hp -= zapDmg;
          c.hitFlash = 1;
          c.wobble = 1;
          this.addFloatingText(cx, cy, `ZAP -${zapDmg}`, '#e4e4e7');
          this.spawnSparks(cx, cy, '#e4e4e7', 6);
          zaps++;
          if (c.hp <= 0) {
            c.isAlive = false;
            this.spawnCubeShards(c);
            if (this.getRemainingCoreCubes() === 0) {
              this.triggerFeverMode();
              return;
            }
          }
          if (zaps >= maxZaps) break;
        }
      }
    }
    if (zaps > 0) {
      soundEngine.playChainZap();
      soundEngine.triggerHaptic(20);
    }
  }

  private triggerExplosion(ex: number, ey: number, radius: number, damage: number) {
    const fusionCombos = this.getActiveFusionCombos();
    let finalRadius = radius;
    let finalDamage = damage;
    if (this.activeRelics.includes('SUPERNOVA_CATALYST')) {
      finalRadius *= 1.35;
      finalDamage += 2;
    }

    for (const c of this.cubes) {
      if (c.isAlive) {
        const cx = c.x + c.width / 2;
        const cy = c.y + c.height / 2;
        const dx = cx - ex;
        const dy = cy - ey;
        if (dx * dx + dy * dy <= finalRadius * finalRadius) {
          c.hp -= finalDamage;
          c.hitFlash = 1;
          c.wobble = 1.2;
          this.addFloatingText(cx, cy, `BOOM -${finalDamage}`, '#c87d65');
          if (c.hp <= 0) {
            c.isAlive = false;
            this.spawnCubeShards(c);
            if (this.getRemainingCoreCubes() === 0) {
              this.triggerFeverMode();
              return;
            }
          }
        }
      }
    }

    if (this.activeRelics.includes('CLUSTER_CHARGE')) {
      this.triggerMicroSpark(ex - 80, ey, 3);
      this.triggerMicroSpark(ex + 80, ey, 3);
    }

    if (fusionCombos.includes('PLASMA_OVERLOAD')) {
      this.triggerChainLightning(
        {
          id: -1,
          x: ex - 20,
          y: ey - 20,
          width: 40,
          height: 40,
          hp: 1,
          maxHp: 1,
          type: 'NORMAL',
          isCore: false,
          wobble: 0,
          hitFlash: 0,
          isAlive: true,
          shieldPulse: 0,
          isFrozen: false,
        },
        1
      );
    }

    this.spawnSparks(ex, ey, '#c87d65', 18);
    soundEngine.playExplosion();
    soundEngine.triggerHaptic(60);
  }

  private triggerShrapnel(sx: number, sy: number) {
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const d of dirs) {
      for (const c of this.cubes) {
        if (c.isAlive) {
          const cx = c.x + c.width / 2;
          const cy = c.y + c.height / 2;
          const dx = cx - sx;
          const dy = cy - sy;
          const dot = dx * d[0] + dy * d[1];
          if (dot > 0 && Math.abs(dx * d[1] - dy * d[0]) < 60 && dot < 350) {
            c.hp -= 2;
            c.hitFlash = 0.8;
            this.addFloatingText(cx, cy, 'SHRAPNEL -2', '#c87d65');
            if (c.hp <= 0) {
              c.isAlive = false;
              this.spawnCubeShards(c);
              if (this.getRemainingCoreCubes() === 0) {
                this.triggerFeverMode();
                return;
              }
            }
            break;
          }
        }
      }
    }
  }

  private triggerSupernova(x: number) {
    this.screenShake = 14;
    for (const c of this.cubes) {
      if (c.isAlive && Math.abs(c.x + c.width / 2 - x) < 95) {
        c.hp -= 5;
        c.hitFlash = 1;
        c.wobble = 1.2;
        this.addFloatingText(c.x + c.width / 2, c.y + c.height / 2, 'SUPERNOVA -5', '#7fa68e');
        if (c.hp <= 0) {
          c.isAlive = false;
          this.spawnCubeShards(c);
          if (this.getRemainingCoreCubes() === 0) {
            this.triggerFeverMode();
            return;
          }
        }
      }
    }
    this.spawnSparks(x, 1750, '#7fa68e', 20);
    soundEngine.playExplosion();
  }

  private spawnMiniBalls(x: number, y: number, outList: Ball[], count: number) {
    const speed = 900;
    const multiballTier = this.getResonanceTier('MULTIBALL');
    const metaDmg = (this.progression.getData().upgradeBaseDamage || 0) * 0.5;
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (i - (count - 1) / 2) * 0.6;
      const b: Ball = {
        x,
        y: y - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 12,
        isMini: true,
        isAlive: true,
        bounces: 0,
        baseDamage: (multiballTier >= 2 ? 2 : 1) + metaDmg,
        trail: [],
        hasSavedOnce: false,
      };
      outList.push(b);
    }
  }

  private spawnCubeShards(c: Cube) {
    let color = '#94a3b8';
    if (c.isCore) {
      color = '#d4b483';
    } else {
      switch (c.type) {
        case 'EXPLOSIVE':
          color = '#c87d65';
          break;
        case 'SPLITTER':
          color = '#9b95b8';
          break;
        case 'KINETIC':
          color = '#d4b483';
          break;
        case 'SHIELD':
          color = '#7fa68e';
          break;
        case 'ARMOR':
          color = '#7c9cb4';
          break;
        case 'CLASS_ABILITY':
          color =
            (this.currentArchetype && ARCHETYPES_DATA[this.currentArchetype]?.color) || '#e4e4e7';
          break;
        case 'BOSS':
          color = '#c46d75';
          break;
      }
    }

    const count = c.type === 'BOSS' ? 36 : 14;
    const cx = c.x + c.width / 2;
    const cy = c.y + c.height / 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 450;
      this.shards.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 10,
        life: 1.0,
        color,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 720,
      });
    }
  }

  public spawnSparks(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 300;
      this.shards.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6,
        life: 1.0,
        color,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 720,
      });
    }
  }

  private addScore(points: number) {
    this.score += points;
    this.currentShotScore += points;

    if (this.currentShotScore >= this.nextFreeBallThreshold) {
      this.ballsRemaining++;
      this.addFloatingText(CANNON_X, 220, '★ SFERA EXTRA! ★', '#d4b483');
      this.nextFreeBallThreshold += 32000;
      soundEngine.playFreeBall();
      soundEngine.triggerHaptic(50);
      if (this.listener.onFreeBall) this.listener.onFreeBall();
    }
  }

  public addQuantumShards(count: number) {
    const multLvl = this.progression.getData().upgradeShardMultiplier || 0;
    const bonusMult = 1 + multLvl * 0.2;
    const finalCount = count > 1 ? Math.round(count * bonusMult) : count;
    this.quantumShardsRun += finalCount;
    this.progression.addQuantumShards(finalCount);
    soundEngine.playShardCollect();
    if (this.listener.onShardCollect) this.listener.onShardCollect();
  }

  public addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      id: this.nextTextId++,
      x,
      y,
      text,
      color,
      life: 1.1,
      vy: -70,
    });
  }

  private checkRoundEnd() {
    if (this.state === 'FEVER') return;

    if (this.getRemainingCoreCubes() === 0) {
      this.triggerFeverMode();
      return;
    }

    if (
      this.currentShotCubesHit === 0 &&
      this.ballsCaughtInCurrentShot === 0 &&
      !this.mercyUsedThisSector
    ) {
      this.mercyUsedThisSector = true;
      this.ballsRemaining++;
      this.addFloatingText(CANNON_X, 260, 'TIRO A VUOTO: +1 SFERA (1/SETT.)', '#7fa68e');
      soundEngine.playMercyRefund();
      soundEngine.triggerHaptic(25);
      if (this.listener.onMercyRefund) this.listener.onMercyRefund();
    }

    if (this.ballsRemaining <= 0) {
      if (this.score > this.highScore) this.highScore = this.score;
      this.progression.recordScoreAndLevel(this.score, this.currentLevel);
      this.progression.recordRunEnd();
      const newUnlocks = this.progression.checkAndTriggerUnlocks();
      if (newUnlocks.length > 0 && this.listener.onNewUnlock) {
        this.listener.onNewUnlock(newUnlocks[0]);
      }
      this.progression.clearActiveRun();
      this.setState('GAME_OVER');
    } else {
      this.setState('AIMING');
    }
  }

  public prepareRelicDraft(isStarter: boolean = false) {
    this.isStarterDraft = isStarter;
    this.draftChoices = [];
    const unlockedPool = this.progression.getData().unlockedRelics;
    const available = unlockedPool.filter((r) => !this.activeRelics.includes(r));
    if (available.length === 0) {
      if (this.isStarterDraft) {
        this.isStarterDraft = false;
        this.setState('AIMING');
      } else {
        this.prepareSectorMap(this.currentLevel + 1);
      }
      return;
    }

    const pool = [...available];
    const isHighReward = this.currentNodeType === 'ELITE' || this.currentLevel % 5 === 0;
    const preferredFamily = this.currentArchetype
      ? ARCHETYPES_DATA[this.currentArchetype]?.family
      : null;

    while (this.draftChoices.length < 3 && pool.length > 0) {
      const weights = pool.map((id) => {
        const info = RELICS_DATA[id];
        if (!info) return 10;
        let w = RELIC_RARITIES[info.rarity]?.weight || 20;
        if (isHighReward && info.rarity !== 'COMMON') {
          w = Math.round(w * 1.6);
        }
        if (this.isStarterDraft && preferredFamily && info.family === preferredFamily) {
          w = Math.round(w * 2.5);
        }
        return w;
      });
      const totalWeight = weights.reduce((acc, v) => acc + v, 0);
      let roll = Math.random() * totalWeight;
      let pickedIdx = 0;
      for (let i = 0; i < pool.length; i++) {
        roll -= weights[i];
        if (roll <= 0) {
          pickedIdx = i;
          break;
        }
      }
      this.draftChoices.push(pool[pickedIdx]);
      pool.splice(pickedIdx, 1);
    }

    this.setState('RELIC_DRAFT');
  }

  public rerollDraft(): boolean {
    if (this.state !== 'RELIC_DRAFT' || this.rerollsAvailable <= 0) return false;
    this.rerollsAvailable--;
    this.prepareRelicDraft(this.isStarterDraft);
    soundEngine.playReroll();
    soundEngine.triggerHaptic(30);
    if (this.listener.onReroll) this.listener.onReroll();
    return true;
  }

  public selectRelic(relic: RelicId) {
    if (this.state !== 'RELIC_DRAFT') return;
    this.activeRelics.push(relic);

    if (relic === 'MAGNETIC_BASKET') {
      this.basket.width += 25;
      this.basket.x = Math.max(35, Math.min(VIRTUAL_WIDTH - 35 - this.basket.width, this.basket.x));
    } else if (relic === 'SAFETY_NET') {
      this.safetyNetAvailable = true;
    }

    const info = RELICS_DATA[relic];
    if (info) {
      const tier = this.getResonanceTier(info.family);
      if (tier > 0) {
        soundEngine.playResonanceFanfare();
        soundEngine.triggerHaptic(60);
        if (this.listener.onResonanceUnlocked) {
          this.listener.onResonanceUnlocked(info.family, tier);
        }
      } else {
        soundEngine.playRelicSelect();
        soundEngine.triggerHaptic(35);
      }
    }

    if (this.isStarterDraft) {
      this.isStarterDraft = false;
      this.nextSectorOverchargeStacks = Math.max(1, this.nextSectorOverchargeStacks);
      this.setState('AIMING');
      return;
    }

    this.prepareSectorMap(this.currentLevel + 1);
  }

  public skipRelicDraft() {
    if (this.state !== 'RELIC_DRAFT') return;
    if (this.isStarterDraft) {
      this.isStarterDraft = false;
      this.ballsRemaining += 1;
      this.addQuantumShards(15);
      this.nextSectorOverchargeStacks = Math.max(1, this.nextSectorOverchargeStacks);
      soundEngine.playShardCollect();
      this.setState('AIMING');
      return;
    }
    this.addQuantumShards(15);
    soundEngine.playShardCollect();
    this.prepareSectorMap(this.currentLevel + 1);
  }

  public prepareSectorMap(targetSector: number) {
    this.pendingNextSector = targetSector;
    const chapter = getChapterForSector(targetSector);
    const nodes: SectorMapNode[] = [];

    if (targetSector % 5 === 0) {
      nodes.push({
        id: `node_boss_${targetSector}`,
        type: 'BOSS',
        targetSector,
        title: `GUARDIANO: ${chapter.bossName.toUpperCase()}`,
        subtitle: `Settore ${targetSector} · Boss di Fine Capitolo ${chapter.id}`,
        description: `${chapter.bossTitle}. ${chapter.hazardNote}`,
        rewardText: 'Sblocca Nuovo Grado Rarità Reliquie + Capitolo + +2 Sfere',
        riskText: `Corazza Boss ${chapter.bossHp} HP · ${chapter.satelliteCount} Satelliti Orbitali`,
        color: '#c46d75',
        patternName: chapter.bossName,
      });

      nodes.push({
        id: `node_merchant_preboss_${targetSector}`,
        type: 'MERCHANT',
        targetSector,
        title: 'OFFICINA ORBITALE PRE-BOSS',
        subtitle: `Sosta Tattica prima del Settore ${targetSector}`,
        description:
          'Visita il Mercante Orbitale per acquistare Sfere extra, potenziare il cannone o comprare una Reliquia prima di affrontare il Guardiano.',
        rewardText: 'Acquista +2 Sfere, +1 Danno o Reliquia prima del Boss',
        riskText: 'Richiede Schegge Quantiche ◆',
        color: '#d4b483',
      });
    } else {
      const patternNames = [
        'Cittadella Simmetrica',
        'Vortice a Diamante',
        'Bastione Spezzato',
        'Esagono Orbitale',
        'Corridoio Quantico',
        'Bunker Piramidale',
      ];
      const normalPattern = patternNames[targetSector % patternNames.length];
      const elitePattern = patternNames[(targetSector + 2) % patternNames.length];

      nodes.push({
        id: `node_normal_${targetSector}`,
        type: 'NORMAL',
        targetSector,
        title: `SETTORE STANDARD ${targetSector}`,
        subtitle: `Formazione: ${normalPattern}`,
        description: `Rotta bilanciata attraverso ${chapter.title}. Cubi: ${chapter.unlockedCubesLabel}.`,
        rewardText:
          targetSector % 2 === 0
            ? '+1 Sfera + 15 ◆ + Draft Reliquia'
            : '+1 Sfera + 15 ◆ Schegge Quantiche',
        riskText: 'Difficoltà Standard · Presidio Regolare',
        color: '#94a3b8',
        patternName: normalPattern,
      });

      nodes.push({
        id: `node_elite_${targetSector}`,
        type: 'ELITE',
        targetSector,
        title: `ROTTA ELITE · SETTORE ${targetSector}`,
        subtitle: `Formazione Fortificata: ${elitePattern}`,
        description:
          'Presidio ad alta densità con cubi potenziati (+45% HP) e più nuclei Core da distruggere.',
        rewardText: 'PREMIO ELITE: +2 Sfere + 35 ◆ + DRAFT RELIQUIA GARANTITO',
        riskText: 'Rischio Alto · Cubi +45% HP e +3 Core',
        color: '#c87d65',
        patternName: elitePattern,
      });

      if (targetSector % 2 === 0) {
        nodes.push({
          id: `node_event_${targetSector}`,
          type: 'EVENT',
          targetSector,
          title: `ANOMALIA QUANTICA · SETT. ${targetSector}`,
          subtitle: 'Incontro Narrativo & Scelta Tattica',
          description:
            'Esplora un segnale anomalo prima di entrare nel settore: scegli tra potenziamenti rischiosi, estrazione di schegge o riparazione sfere.',
          rewardText: 'Bonus Evento Immediato + Accesso al Settore',
          riskText: 'Scelta a Rischio / Ricompensa',
          color: '#9b95b8',
        });
      } else {
        nodes.push({
          id: `node_merchant_${targetSector}`,
          type: 'MERCHANT',
          targetSector,
          title: `MERCANTE ORBITALE · SETT. ${targetSector}`,
          subtitle: 'Stazione di Rifornimento In-Run',
          description:
            'Fermati alla stazione commerciale per convertire le tue Schegge Quantiche in Sfere extra, Danno base o Reliquie prima del combattimento.',
          rewardText: 'Mercato Tattico + Accesso al Settore',
          riskText: 'Nessun rischio aggiuntivo',
          color: '#d4b483',
        });
      }
    }

    this.nextMapNodes = nodes;
    this.setState('SECTOR_MAP');
  }

  public selectSectorMapNode(nodeId: string) {
    if (this.state !== 'SECTOR_MAP') return;
    const node = this.nextMapNodes.find((n) => n.id === nodeId) || this.nextMapNodes[0];
    if (!node) return;

    soundEngine.playRelicSelect();
    soundEngine.triggerHaptic(25);

    if (node.type === 'EVENT') {
      this.prepareSectorEvent(node.targetSector);
    } else if (node.type === 'MERCHANT') {
      this.prepareRunMerchant(node.targetSector);
    } else {
      const showIntro = (node.targetSector - 1) % 5 === 0 && node.targetSector <= 25;
      this.initLevel(node.targetSector, node.type, showIntro);
    }
  }

  public prepareSectorEvent(targetSector: number) {
    this.pendingNextSector = targetSector;
    this.lastAnomalyOutcomeText = null;
    const idx = (targetSector + this.score) % ANOMALY_EVENTS_POOL.length;
    this.currentAnomalyEvent = ANOMALY_EVENTS_POOL[idx];
    this.setState('SECTOR_EVENT');
  }

  public resolveAnomalyChoice(choiceId: string): string {
    if (this.state !== 'SECTOR_EVENT' || !this.currentAnomalyEvent) return '';

    let outcome = '';
    switch (choiceId) {
      case 'FORGE_OVERCLOCK':
        if (this.ballsRemaining > 1) {
          this.ballsRemaining -= 1;
          this.runBonusDamage += 1;
          outcome = 'Cannone Sovraccaricato: -1 Sfera, +1 Danno Base per tutta la Run!';
        } else {
          this.runBonusDamage += 1;
          outcome = 'Protocollo Emergenza: +1 Danno Base per tutta la Run!';
        }
        break;
      case 'FORGE_EXTRACT':
        this.addQuantumShards(40);
        outcome = 'Cristalli Estratti: +40 ◆ Schegge Quantiche aggiunte!';
        break;
      case 'FORGE_REPAIR':
        this.ballsRemaining += 2;
        outcome = 'Munizioni Sintetizzate: +2 Sfere aggiunte al caricatore!';
        break;
      case 'NEBULA_BASKET':
        this.runBonusBasketWidth += 30;
        outcome = 'Bobine Espanse: +30px Larghezza Cestello per tutta la Run!';
        break;
      case 'NEBULA_RELIC': {
        if (this.ballsRemaining > 2) {
          this.ballsRemaining -= 2;
        }
        const unlocked = this.progression
          .getData()
          .unlockedRelics.filter((r) => !this.activeRelics.includes(r));
        if (unlocked.length > 0) {
          const picked = unlocked[Math.floor(Math.random() * unlocked.length)];
          this.activeRelics.push(picked);
          outcome = `Reliquia Condensata: ottenuta [${RELICS_DATA[picked].title}]!`;
        } else {
          this.addQuantumShards(35);
          outcome = 'Tutte le reliquie attive: ottenute +35 ◆ Schegge Quantiche!';
        }
        break;
      }
      case 'NEBULA_ELECTRIFY':
        this.ballsRemaining += 1;
        this.isNextBallElectrified = true;
        outcome = 'Condensatori Carichi: +1 Sfera e prossimo tiro Elettrificato!';
        break;
      case 'SHRINE_BLESSING':
        this.ballsRemaining += 2;
        this.score += 5000;
        outcome = 'Energia Assorbita: +2 Sfere e +5.000 Punti!';
        break;
      case 'SHRINE_GAMBLE':
        this.runBonusDamage += 1;
        this.addQuantumShards(30);
        outcome = 'Patto Stipulato: +1 Danno Base Run e +30 ◆ Schegge Quantiche!';
        break;
      case 'SHRINE_REROLL':
      default:
        this.rerollsAvailable += 2;
        this.ballsRemaining += 1;
        outcome = 'Sensori Calibrati: +2 Dadi Reroll e +1 Sfera!';
        break;
    }

    this.lastAnomalyOutcomeText = outcome;
    soundEngine.playFreeBall();
    soundEngine.triggerHaptic(35);
    return outcome;
  }

  public continueFromSectorEvent() {
    if (this.state !== 'SECTOR_EVENT') return;
    const showIntro = (this.pendingNextSector - 1) % 5 === 0 && this.pendingNextSector <= 25;
    this.initLevel(this.pendingNextSector, 'NORMAL', showIntro);
  }

  public prepareRunMerchant(targetSector: number) {
    this.pendingNextSector = targetSector;
    this.merchantBoughtIds = [];
    const availableRelics = this.progression
      .getData()
      .unlockedRelics.filter((r) => !this.activeRelics.includes(r));
    this.merchantRelicOffer =
      availableRelics.length > 0
        ? availableRelics[Math.floor(Math.random() * availableRelics.length)]
        : null;
    this.setState('RUN_MERCHANT');
  }

  public getMerchantItemCost(itemType: 'BALLS' | 'DAMAGE' | 'BASKET' | 'RELIC'): number {
    const baseCosts: Record<string, number> = {
      BALLS: 20,
      DAMAGE: 35,
      BASKET: 25,
      RELIC: 45,
    };
    const base = baseCosts[itemType] || 25;
    const discountLvl = this.progression.getData().upgradeMerchantDiscount || 0;
    const discountFactor = 1 - discountLvl * 0.12;
    return Math.max(5, Math.round(base * discountFactor));
  }

  public buyRunMerchantItem(itemType: 'BALLS' | 'DAMAGE' | 'BASKET' | 'RELIC'): boolean {
    if (this.state !== 'RUN_MERCHANT') return false;
    if (this.merchantBoughtIds.includes(itemType)) return false;

    const cost = this.getMerchantItemCost(itemType);
    if (!this.progression.spendQuantumShards(cost)) {
      return false;
    }

    this.merchantBoughtIds.push(itemType);
    if (itemType === 'BALLS') {
      this.ballsRemaining += 2;
    } else if (itemType === 'DAMAGE') {
      this.runBonusDamage += 1;
    } else if (itemType === 'BASKET') {
      this.runBonusBasketWidth += 40;
    } else if (itemType === 'RELIC' && this.merchantRelicOffer) {
      this.activeRelics.push(this.merchantRelicOffer);
    }

    soundEngine.playRelicSelect();
    soundEngine.triggerHaptic(30);
    return true;
  }

  public leaveRunMerchant() {
    if (this.state !== 'RUN_MERCHANT') return;
    const isBoss = this.pendingNextSector % 5 === 0;
    const showIntro = (this.pendingNextSector - 1) % 5 === 0 && this.pendingNextSector <= 25;
    this.initLevel(this.pendingNextSector, isBoss ? 'BOSS' : 'NORMAL', showIntro);
  }

  public startEndlessLoop() {
    this.isEndless = true;
    this.progression.recordVictory();
    const newUnlocks = this.progression.checkAndTriggerUnlocks();
    if (newUnlocks.length > 0 && this.listener.onNewUnlock) {
      this.listener.onNewUnlock(newUnlocks[0]);
    }
    const nextLevel = this.gameMode === 'STORY' ? 26 : 11;
    this.initLevel(nextLevel, 'NORMAL', false);
  }

  public openShop() {
    this.setState('SHOP');
  }

  public closeShop() {
    this.setState('ARCHETYPE_SELECT');
  }

  public openCodex() {
    this.setState('CODEX');
  }
}
