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
  getChapterForSector,
} from '../types/game';
import { ProgressionManager, progressionManager } from './progression';
import { soundEngine } from '../audio/soundEngine';

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
  public ballsRemaining: number = 8;
  public totalCubesDestroyed: number = 0;
  public currentCombo: number = 0;
  public aimAngle: number = Math.PI / 2;
  public speedBoost: boolean = false;

  public currentShotScore: number = 0;
  public currentShotCubesHit: number = 0;
  public ballsCaughtInCurrentShot: number = 0;
  private nextFreeBallThreshold: number = 6000;
  public rerollsAvailable: number = 1;

  public isNextBallElectrified: boolean = false;

  public activeBoss: Cube | null = null;
  public bossPhase: number = 1;
  public bossPulseTimer: number = 0;
  public bossDescentY: number = 0;
  public bossSatellites: BossSatellite[] = [];

  public feverTimer: number = 0;
  public feverExplosionTimer: number = 0;

  public balls: Ball[] = [];
  public cubes: Cube[] = [];
  public basket: Basket;
  public shards: Shard[] = [];
  public floatingTexts: FloatingText[] = [];
  public activeRelics: RelicId[] = [];
  public draftChoices: RelicId[] = [];

  private safetyNetAvailable: boolean = true;
  public screenShake: number = 0;
  private nextTextId: number = 1;
  private nextCubeId: number = 1;
  private nextSatId: number = 1;

  public listener: GameEngineListener = {};

  constructor(progression: ProgressionManager = progressionManager) {
    this.progression = progression;
    this.basket = {
      x: VIRTUAL_WIDTH / 2 - 110,
      y: 1780,
      width: 220,
      height: 34,
      vx: 230,
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
    this.rerollsAvailable = 1 + this.progression.getData().upgradeRerolls;
    this.setState('ARCHETYPE_SELECT');
  }

  public setState(newState: GameState) {
    this.state = newState;
    if (this.listener.onStateChange) {
      this.listener.onStateChange(newState);
    }
  }

  public selectArchetype(archetype: ArchetypeId, mode?: GameMode) {
    if (!this.progression.isArchetypeUnlocked(archetype)) {
      // If locked, cannot select unless unlocked
      return;
    }

    if (mode) this.gameMode = mode;
    this.currentArchetype = archetype;
    this.progression.recordRunStart();

    const archInfo = ARCHETYPES_DATA[archetype];
    if (archInfo) {
      this.activeRelics.push(archInfo.initialRelic);
    }

    soundEngine.playRelicSelect();
    soundEngine.triggerHaptic(30);
    this.initLevel(1);
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

      if (data.savedRun.savedArchetype) {
        this.currentArchetype = data.savedRun.savedArchetype;
      } else {
        this.currentArchetype = 'VOLT_OVERCHARGE';
      }

      this.activeRelics = [...data.savedRun.savedRelics];
      this.isEndless = restoredEndless;

      this.initLevel(this.currentLevel);

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
        this.gameMode
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

  public initLevel(level: number) {
    this.currentLevel = level;
    this.progression.recordScoreAndLevel(this.score, this.currentLevel);

    if (this.currentArchetype) {
      this.progression.saveActiveRun(
        this.currentLevel,
        this.score,
        this.ballsRemaining,
        this.currentArchetype,
        this.activeRelics,
        this.quantumShardsRun,
        this.isEndless,
        this.gameMode
      );
    }

    this.cubes = [];
    this.balls = [];
    this.shards = [];
    this.floatingTexts = [];
    this.bossSatellites = [];
    this.activeBoss = null;
    this.bossPhase = 1;
    this.bossDescentY = 0;
    this.bossPulseTimer = 0;
    this.currentCombo = 0;
    this.safetyNetAvailable = this.activeRelics.includes('SAFETY_NET');

    const metaExtra = this.progression.getData().upgradeExtraBalls;
    const baseBalls = 8 + metaExtra;
    if (this.ballsRemaining < baseBalls) {
      this.ballsRemaining = baseBalls;
    }

    let basketWidth = 220 + this.progression.getData().upgradeBasketWidth * 15;
    if (this.currentArchetype === 'KINETIC_TITAN') basketWidth += 40;
    if (this.activeRelics.includes('MAGNETIC_BASKET')) basketWidth += 50;
    this.basket.width = basketWidth;
    this.basket.x = (VIRTUAL_WIDTH - basketWidth) / 2;

    this.generateLevelGrid(level);
    this.setState('AIMING');
  }

  public getActiveResonances(): Record<RelicFamilyId, number> {
    const counts: Record<RelicFamilyId, number> = {
      ELECTRIC: 0,
      EXPLOSIVE: 0,
      MULTIBALL: 0,
      KINETIC: 0,
    };
    for (const rId of this.activeRelics) {
      const info = RELICS_DATA[rId];
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

  // Check active Dual-Element Fusion Combos
  public getActiveFusionCombos(): FusionComboId[] {
    const counts = this.getActiveResonances();
    const active: FusionComboId[] = [];

    // Plasma Overload: Electric 2+ and Explosive 2+
    if (counts.ELECTRIC >= 2 && counts.EXPLOSIVE >= 2 && this.progression.isFusionComboUnlocked('PLASMA_OVERLOAD')) {
      active.push('PLASMA_OVERLOAD');
    }
    // Magnetic Surge: Kinetic 2+ and Electric 2+
    if (counts.KINETIC >= 2 && counts.ELECTRIC >= 2 && this.progression.isFusionComboUnlocked('MAGNETIC_SURGE')) {
      active.push('MAGNETIC_SURGE');
    }
    // Swarm Detonator: Multiball 2+ and Explosive 2+
    if (counts.MULTIBALL >= 2 && counts.EXPLOSIVE >= 2 && this.progression.isFusionComboUnlocked('SWARM_DETONATOR')) {
      active.push('SWARM_DETONATOR');
    }
    // Hyper Swarm: Multiball 2+ and Kinetic 2+
    if (counts.MULTIBALL >= 2 && counts.KINETIC >= 2 && this.progression.isFusionComboUnlocked('HYPER_SWARM')) {
      active.push('HYPER_SWARM');
    }
    // Cryo Shock: Electric 2+ and Kinetic 2+
    if (counts.ELECTRIC >= 2 && counts.KINETIC >= 2 && this.progression.isFusionComboUnlocked('CRYO_SHOCK')) {
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
    const rows = Math.min(3 + (level > 10 ? 6 : level), 7);
    const cols = 9;
    const cubeWidth = 84;
    const cubeHeight = 56;
    const paddingX = 26;
    const paddingY = 24;
    const totalGridW = cols * cubeWidth + (cols - 1) * paddingX;
    const startX = (VIRTUAL_WIDTH - totalGridW) / 2;

    let baseHp = Math.max(1, level <= 1 ? 1 : 1 + (level - 2));
    if (level > 10) {
      baseHp += (level - 10) * 2;
    }

    // Boss fight on sectors 5, 10, 15...
    if (level % 5 === 0) {
      this.generateBossLevel(level, startX, startY, cols, cubeWidth, cubeHeight, paddingX);
      return;
    }

    const coreBudget = Math.min(6 + level * 2, 14);
    let coresAssigned = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let placeCube = false;
        if (level === 1) {
          placeCube =
            (r === 0 && c >= 2 && c <= 6) ||
            (r === 1 && (c === 1 || c === 3 || c === 5 || c === 7)) ||
            (r === 2 && c >= 2 && c <= 6) ||
            (r === 3 && (c === 3 || c === 4 || c === 5));
        } else if (level % 2 === 0) {
          placeCube = (r + c) % 2 === 0;
        } else {
          placeCube = c >= 1 && c <= 7 && !(r === 1 && c === 4);
        }

        if (!placeCube) continue;

        const cx = startX + c * (cubeWidth + paddingX);
        const cy = startY + r * (cubeHeight + paddingY);

        let type: CubeType = 'NORMAL';
        const roll = Math.random();
        let cubeHp = level === 1 ? 1 : Math.max(1, baseHp + Math.floor(Math.random() * 2));

        if (roll < 0.15) {
          type = 'EXPLOSIVE';
          cubeHp = Math.max(1, cubeHp - 1);
        } else if (roll < 0.28) {
          type = 'SPLITTER';
          cubeHp = 1;
        } else if (roll < 0.4) {
          type = 'KINETIC';
          cubeHp = 1;
        } else if (roll < 0.5 && level >= 3) {
          type = 'ARMOR';
          cubeHp = baseHp + 2;
        } else if (roll < 0.58 && level >= 4) {
          type = 'SHIELD';
          cubeHp = baseHp + 1;
        }

        let isCore = false;
        if (coresAssigned < coreBudget && (type === 'NORMAL' || Math.random() < 0.5)) {
          isCore = true;
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

    if (coresAssigned < 6) {
      for (const c of this.cubes) {
        if (!c.isCore) {
          c.isCore = true;
          coresAssigned++;
          if (coresAssigned >= 6) break;
        }
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
    const bossY = startY + 120;

    const chapter = getChapterForSector(level);
    let bossHp = chapter ? chapter.bossHp : 80;
    let satelliteCount = chapter ? chapter.satelliteCount : 6;
    if (level > 25) {
      bossHp = 520 + (level - 25) * 35;
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

    const satHp = level <= 5 ? 6 : level <= 10 ? 8 : level <= 15 ? 12 : level <= 20 ? 15 : 20;

    if (satelliteCount === 12) {
      // Double ring orbit for final boss & deep endless
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

    // Kinetic top cubes for rebounds
    for (let c = 1; c < cols - 1; c += 2) {
      const cx = startX + c * (cubeWidth + paddingX);
      const cy = startY;
      this.cubes.push({
        id: this.nextCubeId++,
        x: cx,
        y: cy,
        width: cubeWidth,
        height: cubeHeight,
        hp: 1,
        maxHp: 1,
        type: 'KINETIC',
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

  public setAimAngle(touchX: number, touchY: number) {
    if (this.state !== 'AIMING') return;
    const dx = touchX - CANNON_X;
    let dy = touchY - CANNON_Y;
    if (dy < 40) dy = 40;
    this.aimAngle = Math.atan2(dy, dx);

    const minAngle = (15 * Math.PI) / 180;
    const maxAngle = (165 * Math.PI) / 180;
    if (this.aimAngle < minAngle) this.aimAngle = minAngle;
    if (this.aimAngle > maxAngle) this.aimAngle = maxAngle;
  }

  public shoot(): boolean {
    if (this.state !== 'AIMING' || this.ballsRemaining <= 0) return false;

    this.ballsRemaining--;
    this.currentCombo = 0;
    this.currentShotScore = 0;
    this.currentShotCubesHit = 0;
    this.ballsCaughtInCurrentShot = 0;
    this.nextFreeBallThreshold = 6000;

    let speed = 1250;
    if (this.activeRelics.includes('HYPER_VELOCITY')) {
      speed *= 1.25;
    }

    const vx = Math.cos(this.aimAngle) * speed;
    const vy = Math.sin(this.aimAngle) * speed;

    let baseDamage = 1;
    if (this.activeRelics.includes('HYPER_VELOCITY')) baseDamage += 1;
    if (this.currentArchetype === 'KINETIC_TITAN') baseDamage += 1;

    const isElectrified = this.isNextBallElectrified;
    if (isElectrified) {
      baseDamage += 2;
      this.isNextBallElectrified = false;
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

    // Basket movement
    this.basket.x += this.basket.vx * dt;
    const minX = 35;
    const maxX = VIRTUAL_WIDTH - 35 - this.basket.width;
    if (this.basket.x < minX) {
      this.basket.x = minX;
      this.basket.vx = Math.abs(this.basket.vx);
    } else if (this.basket.x > maxX) {
      this.basket.x = maxX;
      this.basket.vx = -Math.abs(this.basket.vx);
    }

    // Boss AI
    if (this.activeBoss && this.activeBoss.isAlive) {
      this.updateBoss(dt);
    }

    // Shards
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

    // Floating text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt * 1.3;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Cubes wobble & shield pulses
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
    const rotSpeed = this.bossPhase === 1 ? 1.2 : this.bossPhase === 2 ? 2.2 : 3.2;
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
        '#ff007f'
      );
      soundEngine.playBossAlert();
      soundEngine.triggerHaptic(70);
      if (this.listener.onBossPhaseChange) this.listener.onBossPhaseChange(this.bossPhase);
    }

    this.bossPulseTimer += dt;
    if (this.bossPulseTimer >= (this.bossPhase === 3 ? 4 : 7)) {
      this.bossPulseTimer = 0;
      this.triggerBossShockwave();
    }

    if (this.bossPhase === 3) {
      this.activeBoss.y += 12 * dt;
      if (this.activeBoss.y > 1100) this.activeBoss.y = 1100;
    }
  }

  private triggerBossShockwave() {
    if (!this.activeBoss) return;
    this.screenShake = 12;
    const bx = this.activeBoss.x + this.activeBoss.width / 2;
    const by = this.activeBoss.y + this.activeBoss.height / 2;
    this.addFloatingText(bx, by, 'EMP REPULSION!', '#ff007f');

    for (const b of this.balls) {
      if (b.isAlive) {
        const dx = b.x - bx;
        const dy = b.y - by;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          b.vx += (dx / dist) * 450;
          b.vy += (dy / dist) * 450;
        }
      }
    }
    this.spawnSparks(bx, by, '#ff007f', 24);
    soundEngine.playExplosion();
  }

  private updateFever(dt: number) {
    this.feverTimer -= dt;
    this.feverExplosionTimer -= dt;

    if (this.feverExplosionTimer <= 0) {
      this.feverExplosionTimer = 0.08;
      for (const c of this.cubes) {
        if (c.isAlive) {
          c.isAlive = false;
          this.score += 500;
          this.addQuantumShards(1);
          this.spawnCubeShards(c);
          this.spawnSparks(c.x + c.width / 2, c.y + c.height / 2, '#ffe600', 14);
          this.addFloatingText(c.x + c.width / 2, c.y + c.height / 2, 'FEVER +500', '#ffe600');
          this.screenShake = 6;
          soundEngine.playCubeShatter();
          break;
        }
      }
    }

    if (this.feverTimer <= 0) {
      const ballBonus = this.ballsRemaining * 2000;
      this.score += ballBonus;
      this.addQuantumShards(25);

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
        this.prepareRelicDraft();
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

      // Magnetic attraction to basket
      if (b.y >= this.basket.y - 180 && b.y <= this.basket.y + 40) {
        const basketCenterX = this.basket.x + this.basket.width / 2;
        const distToCenter = basketCenterX - b.x;
        if (Math.abs(distToCenter) < this.basket.width * 0.75) {
          const pullFactor =
            this.activeRelics.includes('MAGNETIC_BASKET') || this.currentArchetype === 'KINETIC_TITAN'
              ? 8.5
              : 3.5;
          b.vx += distToCenter * pullFactor * dt;
        }
      }

      b.vy += GRAVITY * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Side walls
      const leftWall = 25;
      const rightWall = VIRTUAL_WIDTH - 25;
      if (b.x - b.radius < leftWall) {
        b.x = leftWall + b.radius;
        b.vx = -b.vx * 0.95;
      } else if (b.x + b.radius > rightWall) {
        b.x = rightWall - b.radius;
        b.vx = -b.vx * 0.95;
      }

      // Ceiling
      const ceiling = 70;
      if (b.y - b.radius < ceiling) {
        b.y = ceiling + b.radius;
        b.vy = Math.abs(b.vy) * 0.95;
      }

      // Safety Net
      if (this.safetyNetAvailable && b.y + b.radius >= 1840) {
        b.y = 1840 - b.radius;
        b.vy = -Math.abs(b.vy) * 1.15;
        this.safetyNetAvailable = false;
        this.screenShake = 12;
        this.addFloatingText(b.x, b.y - 40, 'RETE DI SICUREZZA!', '#00e5ff');
        soundEngine.playBounceHit(1);
      }

      // Catch in Basket
      if (b.y + b.radius >= this.basket.y && b.y - b.radius <= this.basket.y + this.basket.height) {
        if (b.x >= this.basket.x - 15 && b.x <= this.basket.x + this.basket.width + 15) {
          b.isAlive = false;
          this.balls.splice(i, 1);
          this.ballsRemaining++;
          this.ballsCaughtInCurrentShot++;
          const catchPoints = 350 * Math.max(1, this.currentCombo);
          this.addScore(catchPoints);
          this.addFloatingText(b.x, this.basket.y - 50, '+1 SFERA! CATTURA!', '#00ff88');

          // Fusion Combo: Magnetic Surge electrifies next ball
          if (fusionCombos.includes('MAGNETIC_SURGE')) {
            this.isNextBallElectrified = true;
            this.addFloatingText(b.x, this.basket.y - 80, '⚡ SCARICA MAGNETICA!', '#06b6d4');
          }

          soundEngine.playCatch();
          soundEngine.triggerHaptic(40);

          if (this.activeRelics.includes('SUPERNOVA')) {
            this.triggerSupernova(b.x);
          }
          continue;
        }
      }

      // Swarm Matrix rescue
      if (
        b.isMini &&
        this.currentArchetype === 'SWARM_MATRIX' &&
        !b.hasSavedOnce &&
        b.y + b.radius >= 1860
      ) {
        b.hasSavedOnce = true;
        b.vy = -Math.abs(b.vy) * 0.95;
        this.addFloatingText(b.x, b.y - 30, 'SWARM RESCUE!', '#a855f7');
        continue;
      }

      // Out of bounds bottom
      if (b.y - b.radius > VIRTUAL_HEIGHT + 20) {
        b.isAlive = false;

        // Fusion Combo: Swarm Detonator explodes on fall
        if (b.isMini && fusionCombos.includes('SWARM_DETONATOR')) {
          this.triggerExplosion(b.x, 1800, 150, 6);
          this.addFloatingText(b.x, 1780, 'SWARM BOOM!', '#ec4899');
        }

        this.balls.splice(i, 1);
        if (this.activeRelics.includes('SUPERNOVA')) {
          this.triggerSupernova(b.x);
        }
        continue;
      }

      // Boss satellites
      this.handleSatelliteCollisions(b);

      // Cube collisions
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
        b.vx = -b.vx * 1.1;
        b.vy = -b.vy * 1.1;
        sat.hp--;
        this.addFloatingText(sx, sy, 'DEFLECT', '#ff007f');
        soundEngine.playBounceHit(this.currentCombo);
        soundEngine.triggerHaptic(12);

        if (sat.hp <= 0) {
          sat.isAlive = false;
          this.spawnSparks(sx, sy, '#ff007f', 16);
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
          (hasPiercing && c.hp <= 2 && c.type !== 'BOSS') ||
          (b.isMini && fusionCombos.includes('HYPER_SWARM') && c.hp <= 3);

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
          b.vx += (Math.random() - 0.5) * 35;
        }

        let damage = b.baseDamage + Math.floor(b.bounces / 3);

        if (this.activeRelics.includes('KINETIC_SURGE')) {
          damage += b.bounces - 1;
        }

        if (c.type === 'KINETIC') {
          damage += 2;
          b.vx *= 1.35;
          b.vy *= 1.35;
          this.addFloatingText(c.x + c.width / 2, c.y - 30, 'KINETIC BOOST!', '#ffe600');
        }

        if (this.activeRelics.includes('HEAVY_MASS') && (c.type === 'ARMOR' || c.type === 'BOSS')) {
          damage += 4;
        }

        if (c.isFrozen) {
          damage *= 2;
          if (fusionCombos.includes('CRYO_SHOCK')) {
            damage += 3;
            this.addFloatingText(c.x + c.width / 2, c.y - 50, 'CRYO SHOCK!', '#38bdf8');
          }
        }

        let isCrit = false;
        if (this.activeRelics.includes('CRITICAL_OVERDRIVE') && Math.random() < 0.3) {
          damage *= 3;
          isCrit = true;
          this.screenShake = Math.max(this.screenShake, 14);
          this.addFloatingText(c.x + c.width / 2, c.y - 40, 'CRIT! x3', '#ff007f');
        }

        // Chrono Pulse archetype passive
        if (this.currentArchetype === 'CHRONO_PULSE' && this.currentCombo >= 5 && this.currentCombo % 3 === 0) {
          this.screenShake = 10;
          this.addFloatingText(c.x + c.width / 2, c.y - 45, 'CHRONO PULSE!', '#10b981');
          damage += 4;
        }

        const isShielded = this.isCubeProtectedByShield(c);
        if (isShielded) {
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
          isCrit ? '#ff007f' : c.isCore ? '#ffe600' : '#00e5ff'
        );

        soundEngine.playBounceHit(this.currentCombo);
        soundEngine.triggerHaptic(12);

        // Chain lightning
        if (this.activeRelics.includes('CHAIN_LIGHTNING') && b.bounces % 2 === 0) {
          const extraZaps = electricTier >= 2 ? 2 : electricTier >= 1 ? 1 : 0;
          this.triggerChainLightning(c, extraZaps);
        }

        // Bouncing bomb
        if (this.activeRelics.includes('BOUNCING_BOMB') && b.bounces === 8) {
          const blastRadius = 230 * (1.0 + explosiveTier * 0.25);
          this.triggerExplosion(b.x, b.y, blastRadius, 10);
          this.addFloatingText(b.x, b.y - 50, 'BOUNCING BOMB!', '#ff6b00');
        }

        // Cryo archetype freeze
        if (
          (this.currentArchetype === 'CRYSTAL_SINGULARITY' || this.activeRelics.includes('POLAR_VORTEX')) &&
          !c.isFrozen
        ) {
          c.isFrozen = true;
          this.addFloatingText(c.x + c.width / 2, c.y - 30, 'FROZEN', '#38bdf8');
        }

        if (c.hp <= 0) {
          c.isAlive = false;
          this.totalCubesDestroyed++;
          this.progression.addCubesDestroyed(1);
          this.addQuantumShards(c.isCore ? 5 : 1);

          const killPoints = (c.isCore ? 500 : 250) * Math.min(this.currentCombo, 10);
          this.addScore(killPoints);
          this.spawnCubeShards(c);

          soundEngine.playCubeShatter();
          soundEngine.triggerHaptic(28);

          if (c.type === 'EXPLOSIVE') {
            const rExp = 250 * (this.currentArchetype === 'PYRO_DETONATOR' ? 1.4 : 1.0);
            this.triggerExplosion(c.x + c.width / 2, c.y + c.height / 2, rExp, 6);
            this.screenShake = 16;
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

          if (
            this.activeRelics.includes('MULTIBALL_REACTOR') &&
            Math.random() < (multiballTier >= 2 ? 0.5 : 0.3)
          ) {
            this.spawnMiniBalls(c.x + c.width / 2, c.y + c.height / 2, newBalls, 2);
            this.addFloatingText(c.x + c.width / 2, c.y - 40, 'MULTIBALL!', '#a855f7');
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

  private triggerFeverMode() {
    this.setState('FEVER');
    this.feverTimer = 1.6;
    this.feverExplosionTimer = 0.05;
    this.screenShake = 18;
    this.addFloatingText(CANNON_X, 350, '★ CUBOCLAST FEVER! ★', '#ffe600');
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
    const dmg = this.currentArchetype === 'VOLT_OVERCHARGE' ? 5 : 3;
    const ox = origin.x + origin.width / 2;
    const oy = origin.y + origin.height / 2;

    for (const c of this.cubes) {
      if (c.isAlive && c !== origin) {
        const cx = c.x + c.width / 2;
        const cy = c.y + c.height / 2;
        const dx = cx - ox;
        const dy = cy - oy;
        if (dx * dx + dy * dy < 460 * 460) {
          let zapDmg = dmg;
          if (this.activeRelics.includes('PLASMA_CONDUIT') && c.hp < c.maxHp) {
            zapDmg *= 2;
          }
          c.hp -= zapDmg;
          c.hitFlash = 1;
          c.wobble = 1;
          this.addFloatingText(cx, cy, `ZAP -${zapDmg}`, '#00e5ff');
          this.spawnSparks(cx, cy, '#00e5ff', 6);
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
    if (this.activeRelics.includes('SUPERNOVA_CATALYST')) {
      finalRadius *= 1.5;
    }

    for (const c of this.cubes) {
      if (c.isAlive) {
        const cx = c.x + c.width / 2;
        const cy = c.y + c.height / 2;
        const dx = cx - ex;
        const dy = cy - ey;
        if (dx * dx + dy * dy <= finalRadius * finalRadius) {
          c.hp -= damage;
          c.hitFlash = 1;
          c.wobble = 1.2;
          this.addFloatingText(cx, cy, `BOOM -${damage}`, '#ff6b00');
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

    // Fusion Combo: Plasma Overload fires chain lightning from explosion
    if (fusionCombos.includes('PLASMA_OVERLOAD')) {
      this.triggerChainLightning(
        { id: -1, x: ex - 20, y: ey - 20, width: 40, height: 40, hp: 1, maxHp: 1, type: 'NORMAL', isCore: false, wobble: 0, hitFlash: 0, isAlive: true, shieldPulse: 0, isFrozen: false },
        2
      );
    }

    this.spawnSparks(ex, ey, '#ff6b00', 18);
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
            this.addFloatingText(cx, cy, 'SHRAPNEL -2', '#ff007f');
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
      if (c.isAlive && Math.abs(c.x + c.width / 2 - x) < 100) {
        c.hp -= 8;
        c.hitFlash = 1;
        c.wobble = 1.2;
        this.addFloatingText(c.x + c.width / 2, c.y + c.height / 2, 'SUPERNOVA -8', '#00ff88');
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
    this.spawnSparks(x, 1750, '#00ff88', 20);
    soundEngine.playExplosion();
  }

  private spawnMiniBalls(x: number, y: number, outList: Ball[], count: number) {
    const speed = 900;
    const multiballTier = this.getResonanceTier('MULTIBALL');
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
        baseDamage: multiballTier >= 2 ? 2 : 1,
        trail: [],
        hasSavedOnce: false,
      };
      outList.push(b);
    }
  }

  private spawnCubeShards(c: Cube) {
    let color = '#00e5ff';
    if (c.isCore) {
      color = '#ffe600';
    } else {
      switch (c.type) {
        case 'EXPLOSIVE':
          color = '#ff6b00';
          break;
        case 'SPLITTER':
          color = '#a855f7';
          break;
        case 'KINETIC':
          color = '#ffe600';
          break;
        case 'SHIELD':
          color = '#00ff88';
          break;
        case 'ARMOR':
          color = '#3b82f6';
          break;
        case 'BOSS':
          color = '#ff007f';
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
      this.addFloatingText(CANNON_X, 220, '★ SFERA EXTRA! ★', '#ffe600');
      this.nextFreeBallThreshold += 12000;
      soundEngine.playFreeBall();
      soundEngine.triggerHaptic(50);
      if (this.listener.onFreeBall) this.listener.onFreeBall();
    }
  }

  public addQuantumShards(count: number) {
    this.quantumShardsRun += count;
    this.progression.addQuantumShards(count);
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

    if (this.currentShotCubesHit <= 1 && this.ballsCaughtInCurrentShot === 0) {
      this.ballsRemaining++;
      this.addFloatingText(CANNON_X, 260, 'MERCY REFUND! +1 SFERA', '#00ff88');
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

  public prepareRelicDraft() {
    this.draftChoices = [];
    const unlockedPool = this.progression.getData().unlockedRelics;
    const available = unlockedPool.filter((r) => !this.activeRelics.includes(r));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    this.draftChoices = shuffled.slice(0, Math.min(3, shuffled.length));
    this.setState('RELIC_DRAFT');
  }

  public rerollDraft(): boolean {
    if (this.state !== 'RELIC_DRAFT' || this.rerollsAvailable <= 0) return false;
    this.rerollsAvailable--;
    this.prepareRelicDraft();
    soundEngine.playReroll();
    soundEngine.triggerHaptic(30);
    if (this.listener.onReroll) this.listener.onReroll();
    return true;
  }

  public selectRelic(relic: RelicId) {
    if (this.state !== 'RELIC_DRAFT') return;
    this.activeRelics.push(relic);

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

    this.initLevel(this.currentLevel + 1);
  }

  public startEndlessLoop() {
    this.isEndless = true;
    this.progression.recordVictory();
    const newUnlocks = this.progression.checkAndTriggerUnlocks();
    if (newUnlocks.length > 0 && this.listener.onNewUnlock) {
      this.listener.onNewUnlock(newUnlocks[0]);
    }
    const nextLevel = this.gameMode === 'STORY' ? 26 : 11;
    this.initLevel(nextLevel);
  }

  public openShop() {
    this.setState('SHOP');
  }

  public closeShop() {
    this.setState('GAME_OVER');
  }

  public openCodex() {
    this.setState('CODEX');
  }
}
