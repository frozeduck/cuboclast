import { GameProgressionData, ArchetypeId, RelicId } from '../types/game';

const STORAGE_KEY = 'cuboclast_meta_progression';

const defaultProgression: GameProgressionData = {
  quantumShards: 0,
  runsPlayed: 0,
  victories: 0,
  bestSector: 1,
  highestScore: 0,
  totalCubesDestroyed: 0,
  upgradeExtraBalls: 0,
  upgradeBasketWidth: 0,
  upgradeRerolls: 0,
  unlockedCryo: false,
  unlockedSingularity: false,
  savedRun: {
    hasActiveRun: false,
    savedLevel: 1,
    savedScore: 0,
    savedBalls: 8,
    savedArchetype: '',
    savedRelics: [],
    savedShardsRun: 0,
    savedIsEndless: false,
  },
};

export class ProgressionManager {
  private data: GameProgressionData;

  constructor() {
    this.data = this.load();
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
          savedRun: {
            ...defaultProgression.savedRun,
            ...(parsed.savedRun || {}),
          },
        };
      }
    } catch {
      // fallback
    }
    return { ...defaultProgression, savedRun: { ...defaultProgression.savedRun } };
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

  public recordVictory() {
    this.data.victories++;
    this.save();
  }

  public saveActiveRun(
    level: number,
    score: number,
    balls: number,
    archetype: ArchetypeId,
    relics: RelicId[],
    shardsRun: number,
    isEndless: boolean
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

  public unlockCryo(): boolean {
    if (!this.data.unlockedCryo && this.data.quantumShards >= 100) {
      this.data.quantumShards -= 100;
      this.data.unlockedCryo = true;
      this.save();
      return true;
    }
    return false;
  }

  public unlockSingularity(): boolean {
    if (!this.data.unlockedSingularity && this.data.quantumShards >= 250) {
      this.data.quantumShards -= 250;
      this.data.unlockedSingularity = true;
      this.save();
      return true;
    }
    return false;
  }
}

export const progressionManager = new ProgressionManager();
