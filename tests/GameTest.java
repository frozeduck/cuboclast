package eu.sabotino.cuboclast;

public class GameTest {
    public static void main(String[] args) {
        System.out.println("=== Inizio Test Unitari Modello CuboClast v0.2.0 ===");

        testInitializationAndStarterDraft();
        testAimAndShoot();
        testCoreCubesAndFever();
        testMercyRefund();
        testFreeBallByScore();
        testKineticSurgeRelic();
        testExplosionCube();
        testSplitterCube();
        testSafetyNet();
        testBossLevel();

        System.out.println(">>> TUTTI I TEST UNITARI HANNO AVUTO SUCCESSO! (100% OK)");
    }

    private static void testInitializationAndStarterDraft() {
        Game game = new Game();
        assert game.state == Game.State.RELIC_DRAFT : "All'avvio deve proporre la scelta della reliquia iniziale";
        assert game.draftChoices.size() == 3 : "Devono esserci 3 scelte iniziali";
        assert game.ballsRemaining == 8 : "Le sfere iniziali devono essere 8";

        game.selectRelic(game.draftChoices.get(0));
        assert game.state == Game.State.AIMING : "Dopo la scelta iniziale lo stato deve essere AIMING";
        assert game.currentLevel == 1 : "Il livello iniziale deve essere 1";
        assert !game.cubes.isEmpty() : "I cubi devono essere generati";
        assert game.getRemainingCoreCubes() > 0 : "Devono esserci cubi Core bersaglio";
        System.out.println("✓ Inizializzazione e Draft Reliquia Iniziale verificati.");
    }

    private static void testAimAndShoot() {
        Game game = new Game();
        game.selectRelic(game.draftChoices.get(0));

        game.setAimAngle(540f, 600f);
        assert game.aimAngle > 0 : "L'angolo deve essere calcolato";

        boolean shot = game.shoot();
        assert shot : "Lo sparo deve avere successo";
        assert game.state == Game.State.BALL_IN_PLAY : "Lo stato deve diventare BALL_IN_PLAY";
        assert game.ballsRemaining == 7 : "Le sfere rimanenti devono essere 7";
        assert game.balls.size() == 1 : "Ci deve essere 1 sfera in gioco";
        System.out.println("✓ Meccanica di mira e sparo verificata.");
    }

    private static void testCoreCubesAndFever() {
        Game game = new Game();
        game.selectRelic(game.draftChoices.get(0));
        game.cubes.clear();
        game.balls.clear();

        // Posiziona solo 1 cubo Core con 1 HP e 1 cubo non-core con 5 HP
        Game.Cube coreCube = new Game.Cube(500f, 400f, 80f, 50f, 1, Game.CubeType.NORMAL, true);
        Game.Cube bonusCube = new Game.Cube(650f, 400f, 80f, 50f, 5, Game.CubeType.NORMAL, false);
        game.cubes.add(coreCube);
        game.cubes.add(bonusCube);

        Game.Ball ball = new Game.Ball(540f, 380f, 0f, 200f);
        game.balls.add(ball);
        game.state = Game.State.BALL_IN_PLAY;

        game.update(0.016f);
        assert !coreCube.isAlive : "Il cubo Core deve essere distrutto";
        assert game.state == Game.State.FEVER : "La distruzione di tutti i Core cubes deve attivare CUBOCLAST FEVER";
        System.out.println("✓ Meccanica Cubi Core e attivazione FEVER verificate.");
    }

    private static void testMercyRefund() {
        Game game = new Game();
        game.selectRelic(game.draftChoices.get(0));
        game.cubes.clear();
        // Aggiungi un cubo Core lontano che non viene colpito
        game.cubes.add(new Game.Cube(100f, 100f, 80f, 50f, 10, Game.CubeType.NORMAL, true));
        game.balls.clear();

        int ballsBefore = game.ballsRemaining;
        game.shoot(); // Spara e consuma 1 sfera
        assert game.ballsRemaining == ballsBefore - 1;

        // Fai cadere la sfera fuori dallo schermo senza aver toccato cubi
        Game.Ball ball = game.balls.get(0);
        ball.y = Game.VIRTUAL_HEIGHT + 50f;
        game.update(0.016f);

        // Deve essere scattato il Mercy Refund
        assert game.ballsRemaining == ballsBefore : "La sfera deve essere rimborsata con Mercy Refund se non colpisce bersagli";
        System.out.println("✓ Meccanica di soccorso Mercy Refund verificata.");
    }

    private static void testFreeBallByScore() {
        Game game = new Game();
        game.selectRelic(game.draftChoices.get(0));
        game.cubes.clear();
        game.balls.clear();

        int ballsBefore = game.ballsRemaining;
        game.shoot();

        // Simula colpo ad alto punteggio sopra i 6.000 punti
        Game.Cube highValueCore = new Game.Cube(500f, 400f, 80f, 50f, 1, Game.CubeType.NORMAL, true);
        game.cubes.add(highValueCore);
        Game.Ball ball = game.balls.get(0);
        ball.x = 540f;
        ball.y = 390f;
        game.currentCombo = 20; // Alta combo -> alto punteggio

        game.update(0.016f);
        assert game.ballsRemaining >= ballsBefore : "Raggiunta la soglia punteggio deve essere concessa una Sfera Extra!";
        System.out.println("✓ Meccanica Sfera Extra per punteggio (Fever Ball) verificata.");
    }

    private static void testKineticSurgeRelic() {
        Game game = new Game();
        game.activeRelics.clear();
        game.activeRelics.add(Game.RelicType.KINETIC_SURGE);
        game.cubes.clear();
        game.balls.clear();

        Game.Cube cube = new Game.Cube(500f, 400f, 80f, 50f, 50, Game.CubeType.NORMAL, false);
        game.cubes.add(cube);

        Game.Ball ball = new Game.Ball(540f, 380f, 0f, 200f);
        ball.bounces = 6;
        game.balls.add(ball);
        game.state = Game.State.BALL_IN_PLAY;

        game.update(0.016f);
        assert cube.hp <= 43 : "Kinetic Surge deve incrementare il danno proporzionalmente ai rimbalzi (" + cube.hp + ")";
        System.out.println("✓ Sinergia Reliquia Kinetic Surge verificata.");
    }

    private static void testExplosionCube() {
        Game game = new Game();
        game.cubes.clear();
        game.balls.clear();

        Game.Cube expCube = new Game.Cube(500f, 500f, 80f, 50f, 1, Game.CubeType.EXPLOSIVE, false);
        Game.Cube neighbor = new Game.Cube(520f, 580f, 80f, 50f, 10, Game.CubeType.NORMAL, false);
        game.cubes.add(expCube);
        game.cubes.add(neighbor);

        Game.Ball ball = new Game.Ball(540f, 480f, 0f, 200f);
        game.balls.add(ball);
        game.state = Game.State.BALL_IN_PLAY;

        game.update(0.016f);
        assert !expCube.isAlive : "Il cubo esplosivo deve essere distrutto";
        assert neighbor.hp < 10 : "I cubi vicini devono subire danno da detonazione ad area";
        System.out.println("✓ Distruzione Cubo Esplosivo ed effetto AoE verificati.");
    }

    private static void testSplitterCube() {
        Game game = new Game();
        game.cubes.clear();
        game.balls.clear();

        Game.Cube splitCube = new Game.Cube(500f, 500f, 80f, 50f, 1, Game.CubeType.SPLITTER, false);
        game.cubes.add(splitCube);

        Game.Ball ball = new Game.Ball(540f, 480f, 0f, 200f);
        game.balls.add(ball);
        game.state = Game.State.BALL_IN_PLAY;

        game.update(0.016f);
        assert !splitCube.isAlive : "Il cubo splitter deve essere distrutto";
        assert game.balls.size() >= 2 : "La distruzione dello splitter deve generare mini-sfere extra";
        System.out.println("✓ Gimmick Cubo Splitter e generazione multiball verificati.");
    }

    private static void testSafetyNet() {
        Game game = new Game();
        game.activeRelics.clear();
        game.activeRelics.add(Game.RelicType.SAFETY_NET);
        game.initLevel(1);
        game.balls.clear();

        Game.Ball ball = new Game.Ball(300f, 1835f, 0f, 300f);
        game.balls.add(ball);
        game.state = Game.State.BALL_IN_PLAY;

        game.update(0.016f);
        assert ball.vy < 0 : "La rete di sicurezza deve far rimbalzare la sfera verso l'alto";
        System.out.println("✓ Reliquia Rete di Sicurezza (Safety Net) verificata.");
    }

    private static void testBossLevel() {
        Game game = new Game();
        game.initLevel(5);
        boolean hasBoss = false;
        for (Game.Cube c : game.cubes) {
            if (c.type == Game.CubeType.BOSS) {
                hasBoss = true;
                assert c.isCore : "Il boss deve essere un cubo Core";
                assert c.hp <= 60 : "Gli HP del boss del livello 5 devono essere ben bilanciati";
                break;
            }
        }
        assert hasBoss : "Il livello 5 deve contenere un'entità BOSS";
        System.out.println("✓ Generazione Settore Boss bilanciata (Livello 5) verificata.");
    }
}
