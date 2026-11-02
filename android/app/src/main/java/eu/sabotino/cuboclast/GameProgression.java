package eu.sabotino.cuboclast;

public class GameProgression {
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

    public GameProgression() {}

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
