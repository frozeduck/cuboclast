package eu.sabotino.cuboclast;

public class GameTest {
    public static void main(String[] args) {
        System.out.println("=== Inizio Test Unitari Modello CuboClast v0.3.0 ===");

        testArchetypeSelection();
        testRelicFamiliesAndResonances();
        testBossPhasesAndSatellites();
        testQuantumShardsAndShop();
        testEndlessMode();
        testDraftReroll();
        testCoreCubesAndFever();
        testMercyRefund();
        testFreeBallByScore();

        System.out.println(">>> TUTTI I TEST UNITARI HANNO AVUTO SUCCESSO! (100% OK)");
    }

    private static void testArchetypeSelection() {
        Game game = new Game();
        assert game.state == Game.State.ARCHETYPE_SELECT : "Lo stato iniziale deve essere ARCHETYPE_SELECT";

        game.selectArchetype(Game.Archetype.VOLT_OVERCHARGE);
        assert game.currentArchetype == Game.Archetype.VOLT_OVERCHARGE : "L'archetipo selezionato deve essere memorizzato";
        assert game.activeRelics.contains(Game.RelicType.CHAIN_LIGHTNING) : "Volt Overcharge deve iniziare con Fulmine a Catena";
        assert game.state == Game.State.AIMING : "Dopo la scelta dell'archetipo lo stato deve passare a AIMING";
        System.out.println("✓ Selezione Archetipo Core e perk iniziale verificati.");
    }

    private static void testRelicFamiliesAndResonances() {
        Game game = new Game();
        game.selectArchetype(Game.Archetype.PYRO_DETONATOR); // include BOUNCING_BOMB (EXPLOSIVE)

        assert game.getResonanceTier(Game.RelicFamily.EXPLOSIVE) == 0 : "Con 1 sola reliquia la risonanza deve essere Tier 0";

        // Aggiungi una seconda reliquia esplosiva
        game.activeRelics.add(Game.RelicType.SHRAPNEL_BURST);
        assert game.getResonanceTier(Game.RelicFamily.EXPLOSIVE) == 1 : "Con 2 reliquie della stessa famiglia deve attivarsi Risonanza Tier 1";

        // Aggiungi una terza reliquia esplosiva
        game.activeRelics.add(Game.RelicType.CLUSTER_CHARGE);
        assert game.getResonanceTier(Game.RelicFamily.EXPLOSIVE) == 2 : "Con 3 reliquie deve attivarsi Risonanza Tier 2 (MAESTRIA)";
        System.out.println("✓ Famiglie reliquie e Risonanze di Set (Combo) verificate.");
    }

    private static void testBossPhasesAndSatellites() {
        Game game = new Game();
        game.selectArchetype(Game.Archetype.KINETIC_TITAN);
        game.initLevel(5); // Livello Boss

        assert game.activeBoss != null : "Nel settore 5 deve esserci un'entità Boss attiva";
        assert !game.bossSatellites.isEmpty() : "Il boss deve avere satelliti difensivi orbitanti";
        assert game.bossPhase == 1 : "Il boss deve iniziare in Fase 1";

        // Simula danno al boss fino a < 66% HP (Fase 2)
        game.activeBoss.hp = (int) (game.activeBoss.maxHp * 0.50f);
        game.update(0.016f);
        assert game.bossPhase == 2 : "Sotto il 66% di HP il boss deve passare in Fase 2";

        // Simula danno al boss fino a < 33% HP (Fase 3 Enrage)
        game.activeBoss.hp = (int) (game.activeBoss.maxHp * 0.20f);
        game.update(0.016f);
        assert game.bossPhase == 3 : "Sotto il 33% di HP il boss deve passare in Fase 3 (Enrage)";
        System.out.println("✓ Boss fight a fasi dinamiche e satelliti orbitanti verificati.");
    }

    private static void testQuantumShardsAndShop() {
        GameProgression prog = new GameProgression();
        prog.quantumShards = 300;

        assert prog.buyExtraBalls() : "Deve essere possibile acquistare Extra Balls con 300 schegge";
        assert prog.upgradeExtraBalls == 1 : "Il livello Extra Balls deve essere 1";
        assert prog.quantumShards == 225 : "Le schegge devono essere detratte (300 - 75 = 225)";

        assert prog.buyBasketWidth() : "Deve essere possibile acquistare Basket Width";
        assert prog.upgradeBasketWidth == 1;

        assert prog.unlockCryo() : "Deve essere possibile sbloccare l'archetipo Cryo con 100 schegge";
        assert prog.unlockedCryo : "Cryo deve risultare sbloccato";
        System.out.println("✓ Meta-progressione permanente, Schegge Quantiche e Negozio verificati.");
    }

    private static void testEndlessMode() {
        Game game = new Game();
        game.selectArchetype(Game.Archetype.SWARM_MATRIX);
        game.startEndlessLoop();

        assert game.isEndless : "La modalità deve essere contrassegnata come Endless";
        assert game.currentLevel == 11 : "L'Endless loop deve iniziare dal settore 11";
        assert game.state == Game.State.AIMING;
        System.out.println("✓ Transizione e avvio Loop Endless Roguelike verificati.");
    }

    private static void testDraftReroll() {
        Game game = new Game();
        game.selectArchetype(Game.Archetype.VOLT_OVERCHARGE);
        game.prepareRelicDraft();

        int rerollsBefore = game.rerollsAvailable;
        boolean rerolled = game.rerollDraft();

        assert rerolled : "Il reroll deve avere successo se disponibile";
        assert game.rerollsAvailable == rerollsBefore - 1 : "I reroll disponibili devono scalare di 1";
        assert game.draftChoices.size() == 3 : "Devono essere generate 3 nuove scelte";
        System.out.println("✓ Meccanica di Reroll del draft verificata.");
    }

    private static void testCoreCubesAndFever() {
        Game game = new Game();
        game.selectArchetype(Game.Archetype.VOLT_OVERCHARGE);
        game.cubes.clear();
        game.balls.clear();

        Game.Cube coreCube = new Game.Cube(500f, 400f, 80f, 50f, 1, Game.CubeType.NORMAL, true);
        game.cubes.add(coreCube);

        Game.Ball ball = new Game.Ball(540f, 380f, 0f, 200f);
        game.balls.add(ball);
        game.state = Game.State.BALL_IN_PLAY;

        game.update(0.016f);
        assert !coreCube.isAlive;
        assert game.state == Game.State.FEVER;
        System.out.println("✓ Obiettivi Cubi Core e attivazione FEVER verificati.");
    }

    private static void testMercyRefund() {
        Game game = new Game();
        game.selectArchetype(Game.Archetype.VOLT_OVERCHARGE);
        game.cubes.clear();
        game.cubes.add(new Game.Cube(100f, 100f, 80f, 50f, 10, Game.CubeType.NORMAL, true));
        game.balls.clear();

        int ballsBefore = game.ballsRemaining;
        game.shoot();
        assert game.ballsRemaining == ballsBefore - 1;

        Game.Ball ball = game.balls.get(0);
        ball.y = Game.VIRTUAL_HEIGHT + 50f;
        game.update(0.016f);

        assert game.ballsRemaining == ballsBefore;
        System.out.println("✓ Meccanica Mercy Refund verificata.");
    }

    private static void testFreeBallByScore() {
        Game game = new Game();
        game.selectArchetype(Game.Archetype.VOLT_OVERCHARGE);
        game.cubes.clear();
        game.balls.clear();

        int ballsBefore = game.ballsRemaining;
        game.shoot();

        Game.Cube highValueCore = new Game.Cube(500f, 400f, 80f, 50f, 1, Game.CubeType.NORMAL, true);
        game.cubes.add(highValueCore);
        Game.Ball ball = game.balls.get(0);
        ball.x = 540f;
        ball.y = 390f;
        game.currentCombo = 20;

        game.update(0.016f);
        assert game.ballsRemaining >= ballsBefore;
        System.out.println("✓ Sfera Extra per soglia punteggio verificata.");
    }
}
