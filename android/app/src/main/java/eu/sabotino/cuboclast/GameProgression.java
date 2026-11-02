package eu.sabotino.cuboclast;

public class GameProgression {
    // Statistiche Permanenti
    public int quantumShards = 0;
    public int runsPlayed = 0;
    public int victories = 0;
    public int bestSector = 1;
    public int highestScore = 0;
    public int totalCubesDestroyed = 0;

    // Livelli di potenziamento permanente (Meta-Upgrade)
    public int upgradeExtraBalls = 0;      // max 3 (+1 sfera iniziale per livello)
    public int upgradeBasketWidth = 0;     // max 3 (+15px larghezza cestello)
    public int upgradeRerolls = 0;         // max 2 (+1 reroll per partita)
    public int upgradeDamageBoost = 0;     // max 2 (+1 danno base ogni 2 livelli)

    // Archetipi sbloccati
    public boolean unlockedCryo = false;       // Sbloccabile con 100 ◆
    public boolean unlockedSingularity = false; // Sbloccabile con 250 ◆

    // Stato Run Attiva (Salvataggio Ripresa Automatica)
    public boolean hasActiveRun = false;
    public int savedLevel = 1;
    public int savedScore = 0;
    public int savedBalls = 8;
    public String savedArchetype = "";
    public String savedRelics = "";
    public int savedShardsRun = 0;
    public boolean savedIsEndless = false;

    public GameProgression() {}

    public void saveActiveRunState(int level, int score, int balls, String archetype, String relics, int shardsRun, boolean isEndless) {
        this.hasActiveRun = true;
        this.savedLevel = level;
        this.savedScore = score;
        this.savedBalls = balls;
        this.savedArchetype = archetype;
        this.savedRelics = relics;
        this.savedShardsRun = shardsRun;
        this.savedIsEndless = isEndless;

        if (level > bestSector) {
            bestSector = level;
        }
        if (score > highestScore) {
            highestScore = score;
        }
    }

    public void clearActiveRunState() {
        this.hasActiveRun = false;
        this.savedLevel = 1;
        this.savedScore = 0;
        this.savedBalls = 8;
        this.savedArchetype = "";
        this.savedRelics = "";
        this.savedShardsRun = 0;
        this.savedIsEndless = false;
    }

    // Costi degli upgrade permanenti
    public int getCostExtraBalls() {
        return (upgradeExtraBalls + 1) * 75;
    }

    public int getCostBasketWidth() {
        return (upgradeBasketWidth + 1) * 50;
    }

    public int getCostRerolls() {
        return (upgradeRerolls + 1) * 100;
    }

    public boolean buyExtraBalls() {
        int cost = getCostExtraBalls();
        if (upgradeExtraBalls < 3 && quantumShards >= cost) {
            quantumShards -= cost;
            upgradeExtraBalls++;
            return true;
        }
        return false;
    }

    public boolean buyBasketWidth() {
        int cost = getCostBasketWidth();
        if (upgradeBasketWidth < 3 && quantumShards >= cost) {
            quantumShards -= cost;
            upgradeBasketWidth++;
            return true;
        }
        return false;
    }

    public boolean buyReroll() {
        int cost = getCostRerolls();
        if (upgradeRerolls < 2 && quantumShards >= cost) {
            quantumShards -= cost;
            upgradeRerolls++;
            return true;
        }
        return false;
    }

    public boolean unlockCryo() {
        if (!unlockedCryo && quantumShards >= 100) {
            quantumShards -= 100;
            unlockedCryo = true;
            return true;
        }
        return false;
    }

    public boolean unlockSingularity() {
        if (!unlockedSingularity && quantumShards >= 250) {
            quantumShards -= 250;
            unlockedSingularity = true;
            return true;
        }
        return false;
    }
}
