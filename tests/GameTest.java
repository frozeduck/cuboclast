package eu.sabotino.cuboclast;

public class GameTest {
    public static void main(String[] args) {
        System.out.println("=== Inizio Test Unitari Modello CuboClast ===");

        testInitialization();
        testAimAndShoot();
        testCubeCollisionsAndDamage();
        testKineticSurgeRelic();
        testExplosionCube();
        testSplitterCube();
        testRelicDraftAndEquip();
        testSafetyNet();
        testBossLevel();

        System.out.println(">>> TUTTI I TEST UNITARI HANNO AVUTO SUCCESSO! (100% OK)");
    }

    private static void testInitialization() {
        Game game = new Game();
        assert game.state == Game.State.AIMING : "Lo stato iniziale deve essere AIMING";
        assert game.currentLevel == 1 : "Il livello iniziale deve essere 1";
        assert game.ballsRemaining == 5 : "Le sfere iniziali devono essere 5";
        assert !game.cubes.isEmpty() : "I cubi devono essere generati";
        assert game.basket != null : "Il cestello deve essere presente";
        System.out.println("✓ Inizializzazione e griglia Livello 1 verificate.");
    }

    private static void testAimAndShoot() {
        Game game = new Game();
        game.setAimAngle(540f, 600f);
        assert game.aimAngle > 0 : "L'angolo deve essere calcolato";

        boolean shot = game.shoot();
        assert shot : "Lo sparo deve avere successo";
        assert game.state == Game.State.BALL_IN_PLAY : "Lo stato deve diventare BALL_IN_PLAY";
        assert game.ballsRemaining == 4 : "Le sfere rimanenti devono diminuire di 1";
        assert game.balls.size() == 1 : "Ci deve essere 1 sfera in gioco";
        System.out.println("✓ Meccanica di mira e sparo verificata.");
    }

    private static void testCubeCollisionsAndDamage() {
        Game game = new Game();
        game.cubes.clear();
        game.balls.clear();

        // Posiziona un cubo bersaglio
        Game.Cube cube = new Game.Cube(500f, 400f, 80f, 50f, 5, Game.CubeType.NORMAL);
        game.cubes.add(cube);

        // Posiziona una sfera che sta per colpirlo
        Game.Ball ball = new Game.Ball(540f, 380f, 0f, 200f);
        game.balls.add(ball);
        game.state = Game.State.BALL_IN_PLAY;

        game.update(0.016f); // 1 frame
        assert cube.hp < 5 : "Il cubo deve aver subito danno";
        assert ball.bounces > 0 : "I rimbalzi devono incrementare";
        assert game.currentCombo > 0 : "La combo deve salire";
        System.out.println("✓ Rilevamento collisione e inflizione danno verificati.");
    }

    private static void testKineticSurgeRelic() {
        Game game = new Game();
        game.activeRelics.add(Game.RelicType.KINETIC_SURGE);
        game.cubes.clear();
        game.balls.clear();

        Game.Cube cube = new Game.Cube(500f, 400f, 80f, 50f, 50, Game.CubeType.NORMAL);
        game.cubes.add(cube);

        Game.Ball ball = new Game.Ball(540f, 380f, 0f, 200f);
        ball.bounces = 4; // Gia 4 rimbalzi accumulati
        game.balls.add(ball);
        game.state = Game.State.BALL_IN_PLAY;

        game.update(0.016f);
        // Con Kinetic Surge: base (1) + (bounces - 1) = 1 + 4 = 5 danni
        assert cube.hp <= 45 : "Kinetic Surge deve incrementare il danno proporzionalmente ai rimbalzi (" + cube.hp + ")";
        System.out.println("✓ Sinergia Reliquia Kinetic Surge verificata.");
    }

    private static void testExplosionCube() {
        Game game = new Game();
        game.cubes.clear();
        game.balls.clear();

        Game.Cube expCube = new Game.Cube(500f, 500f, 80f, 50f, 1, Game.CubeType.EXPLOSIVE);
        Game.Cube neighbor = new Game.Cube(520f, 580f, 80f, 50f, 10, Game.CubeType.NORMAL);
        game.cubes.add(expCube);
        game.cubes.add(neighbor);

        Game.Ball ball = new Game.Ball(540f, 480f, 0f, 200f);
        game.balls.add(ball);
        game.state = Game.State.BALL_IN_PLAY;

        game.update(0.016f);
        assert !expCube.isAlive : "Il cubo esplosivo con 1 HP deve essere distrutto";
        assert neighbor.hp < 10 : "I cubi vicini devono subire danno da detonazione ad area";
        assert !game.shards.isEmpty() : "Devono essere generate schegge di esplosione";
        System.out.println("✓ Distruzione Cubo Esplosivo ed effetto AoE verificati.");
    }

    private static void testSplitterCube() {
        Game game = new Game();
        game.cubes.clear();
        game.balls.clear();

        Game.Cube splitCube = new Game.Cube(500f, 500f, 80f, 50f, 1, Game.CubeType.SPLITTER);
        game.cubes.add(splitCube);

        Game.Ball ball = new Game.Ball(540f, 480f, 0f, 200f);
        game.balls.add(ball);
        game.state = Game.State.BALL_IN_PLAY;

        game.update(0.016f);
        assert !splitCube.isAlive : "Il cubo splitter deve essere distrutto";
        assert game.balls.size() >= 2 : "La distruzione dello splitter deve generare mini-sfere extra";
        System.out.println("✓ Gimmick Cubo Splitter e generazione multiball verificati.");
    }

    private static void testRelicDraftAndEquip() {
        Game game = new Game();
        game.prepareRelicDraft();
        assert game.state == Game.State.RELIC_DRAFT : "Lo stato deve essere RELIC_DRAFT";
        assert game.draftChoices.size() == 3 : "Devono essere offerte 3 scelte di reliquie";

        Game.RelicType chosen = game.draftChoices.get(0);
        game.selectRelic(chosen);

        assert game.activeRelics.contains(chosen) : "La reliquia selezionata deve essere attiva";
        assert game.currentLevel == 2 : "La scelta della reliquia deve avanzare al livello successivo";
        System.out.println("✓ Draft e selezione reliquie Roguelike verificati.");
    }

    private static void testSafetyNet() {
        Game game = new Game();
        game.activeRelics.add(Game.RelicType.SAFETY_NET);
        game.initLevel(1);
        game.balls.clear();

        // Sfera che sta precipitando sul fondo
        Game.Ball ball = new Game.Ball(300f, 1835f, 0f, 300f);
        game.balls.add(ball);
        game.state = Game.State.BALL_IN_PLAY;

        game.update(0.016f);
        assert ball.vy < 0 : "La rete di sicurezza deve far rimbalzare la sfera verso l'alto";
        System.out.println("✓ Reliquia Rete di Sicurezza (Safety Net) verificata.");
    }

    private static void testBossLevel() {
        Game game = new Game();
        game.initLevel(5); // Livello Boss 1 (The Monolith)
        boolean hasBoss = false;
        for (Game.Cube c : game.cubes) {
            if (c.type == Game.CubeType.BOSS) {
                hasBoss = true;
                assert c.hp >= 90 : "Il boss deve avere almeno 90 HP";
                break;
            }
        }
        assert hasBoss : "Il livello 5 deve contenere un'entità BOSS";
        System.out.println("✓ Generazione Settore Boss (Livello 5) verificata.");
    }
}
