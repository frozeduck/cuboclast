package eu.sabotino.cuboclast;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class Game {
    public static final float VIRTUAL_WIDTH = 1080f;
    public static final float VIRTUAL_HEIGHT = 1920f;
    public static final float CANNON_X = VIRTUAL_WIDTH / 2f;
    public static final float CANNON_Y = 120f;
    public static final float GRAVITY = 980f;

    public enum State {
        ARCHETYPE_SELECT,
        AIMING,
        BALL_IN_PLAY,
        FEVER,
        RELIC_DRAFT,
        SHOP,
        GAME_OVER,
        VICTORY
    }

    public enum CubeType {
        NORMAL,
        ARMOR,
        EXPLOSIVE,
        SPLITTER,
        KINETIC,
        SHIELD,
        BOSS
    }

    public enum RelicFamily {
        ELECTRIC("Elettrico", 0xFF00E5FF),
        EXPLOSIVE("Esplosivo", 0xFFFF6B00),
        MULTIBALL("Multiball", 0xFFA855F7),
        KINETIC("Cinetico", 0xFFFFE600);

        public final String label;
        public final int color;

        RelicFamily(String label, int color) {
            this.label = label;
            this.color = color;
        }
    }

    public enum Archetype {
        VOLT_OVERCHARGE(
                "Volt Overcharge",
                "I fulmini infliggono +50% danno e si propagano a +1 bersaglio extra. Rilascia scariche elettrostatiche.",
                RelicFamily.ELECTRIC,
                0xFF00E5FF
        ),
        PYRO_DETONATOR(
                "Pyro Detonator",
                "Raggio di tutte le esplosioni aumentato del +40%. I cubi esplosivi infliggono +3 danni extra.",
                RelicFamily.EXPLOSIVE,
                0xFFFF6B00
        ),
        SWARM_MATRIX(
                "Swarm Matrix",
                "Le mini-sfere rimbalzano 1 volta se cadono nel vuoto e hanno il +25% di probabilita di replicarsi.",
                RelicFamily.MULTIBALL,
                0xFFA855F7
        ),
        KINETIC_TITAN(
                "Kinetic Titan",
                "Inizia con cestello maggiorato (260px), forte imbuto magnetico e +1 danno base naturale.",
                RelicFamily.KINETIC,
                0xFFFFE600
        ),
        CRYSTAL_SINGULARITY(
                "Crystal Singularity",
                "Ogni impatto applica congelamento; i cubi congelati subiscono il doppio del danno e rilasciano schegge.",
                RelicFamily.ELECTRIC,
                0xFF38BDF8
        );

        public final String title;
        public final String description;
        public final RelicFamily family;
        public final int color;

        Archetype(String title, String description, RelicFamily family, int color) {
            this.title = title;
            this.description = description;
            this.family = family;
            this.color = color;
        }
    }

    public enum RelicType {
        // --- ELETTRICO ---
        CHAIN_LIGHTNING(RelicFamily.ELECTRIC, "Fulmine a Catena", "Ogni 2 rimbalzi scaglia un fulmine su 2 cubi per 3 danni."),
        VOLT_DISCHARGE(RelicFamily.ELECTRIC, "Scarica di Tensione", "Ogni 4 cubi colpiti rilascia un arco voltaico circolare."),
        TESLA_COIL(RelicFamily.ELECTRIC, "Bobina Tesla", "Il cestello emette scariche verso i cubi più vicini quando si muove."),
        EMP_BURST(RelicFamily.ELECTRIC, "Impulso EMP", "All'inizio del settore disattiva gli scudi nemici per 10 secondi."),

        // --- ESPLOSIVO ---
        BOUNCING_BOMB(RelicFamily.EXPLOSIVE, "Sfera Bomba", "All'8° rimbalzo la sfera genera una massiccia detonazione ad area."),
        SHRAPNEL_BURST(RelicFamily.EXPLOSIVE, "Schegge Taglienti", "I cubi distrutti proiettano 4 schegge geometriche perforanti."),
        CLUSTER_CHARGE(RelicFamily.EXPLOSIVE, "Carica a Grappolo", "Le esplosioni rilasciano 3 micro-bombe ad impatto."),
        SUPERNOVA(RelicFamily.EXPLOSIVE, "Supernova", "Quando una sfera cade sul fondo, scatena un fascio d'energia verso l'alto."),

        // --- MULTIBALL ---
        MULTIBALL_REACTOR(RelicFamily.MULTIBALL, "Reattore Multiball", "Distruggere un cubo ha il 30% di probabilita di generare una mini-sfera."),
        QUANTUM_DUPLICATION(RelicFamily.MULTIBALL, "Duplicazione Quantica", "Al 10° rimbalzo duplica la sfera in campo."),
        SPLIT_STORM(RelicFamily.MULTIBALL, "Tempesta di Scissione", "I cubi Splitter generano 3 mini-sfere invece di 2."),
        MICRO_SWARM(RelicFamily.MULTIBALL, "Micro-Sciame", "La sfera e accompagnata da 2 micro-orbi orbitanti protettivi."),

        // --- CINETICO ---
        KINETIC_SURGE(RelicFamily.KINETIC, "Kinetic Surge", "Ogni rimbalzo aumenta il danno della sfera di +1 per quel tiro."),
        CRITICAL_OVERDRIVE(RelicFamily.KINETIC, "Sovraccarico Critico", "30% di probabilita di colpo critico (danno x3 e onda d'urto)."),
        MAGNETIC_BASKET(RelicFamily.KINETIC, "Cestello Magnetico", "Il cestello e piu largo (290px) e cattura le sfere con forte attrazione."),
        HEAVY_MASS(RelicFamily.KINETIC, "Massa Inerziale", "Infligge +4 danni extra contro i cubi corazzati e i boss."),
        SAFETY_NET(RelicFamily.KINETIC, "Rete di Sicurezza", "Un campo di forza respinge la prima sfera caduta in ogni settore."),
        PIERCING_RAIL(RelicFamily.KINETIC, "Sfera Perforante", "La sfera disintegra i cubi con 2 o meno HP senza rimbalzare."),
        HYPER_VELOCITY(RelicFamily.KINETIC, "Iper-Velocita", "Le sfere viaggiano il 25% piu veloci e infliggono +1 danno base.");

        public final RelicFamily family;
        public final String title;
        public final String description;

        RelicType(RelicFamily family, String title, String description) {
            this.family = family;
            this.title = title;
            this.description = description;
        }
    }

    // --- Entità di Gioco ---

    public static class Ball {
        public float x, y;
        public float vx, vy;
        public float radius = 18f;
        public boolean isMini = false;
        public boolean isAlive = true;
        public int bounces = 0;
        public float baseDamage = 1f;
        public final List<float[]> trail = new ArrayList<>();
        public boolean hasSavedOnce = false; // Per abilità Swarm Matrix

        public Ball(float x, float y, float vx, float vy) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
        }
    }

    public static class Cube {
        public float x, y, width, height;
        public int hp;
        public int maxHp;
        public CubeType type;
        public boolean isCore = false;
        public float wobble = 0f;
        public float hitFlash = 0f;
        public boolean isAlive = true;
        public float shieldPulse = 0f;
        public boolean isFrozen = false;

        public Cube(float x, float y, float w, float h, int hp, CubeType type, boolean isCore) {
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;
            this.hp = hp;
            this.maxHp = hp;
            this.type = type;
            this.isCore = isCore;
        }

        public float centerX() { return x + width / 2f; }
        public float centerY() { return y + height / 2f; }
    }

    public static class BossSatellite {
        public float angle;
        public float distance = 250f;
        public boolean isAlive = true;
        public int hp = 8;
        public float width = 50f;
        public float height = 50f;

        public BossSatellite(float angle) {
            this.angle = angle;
        }
    }

    public static class Basket {
        public float x;
        public float y = 1780f;
        public float width = 220f;
        public float height = 34f;
        public float vx = 230f;

        public Basket() {
            this.x = VIRTUAL_WIDTH / 2f - width / 2f;
        }

        public void update(float dt) {
            x += vx * dt;
            float minX = 35f;
            float maxX = VIRTUAL_WIDTH - 35f - width;
            if (x < minX) {
                x = minX;
                vx = Math.abs(vx);
            } else if (x > maxX) {
                x = maxX;
                vx = -Math.abs(vx);
            }
        }

        public float centerX() {
            return x + width / 2f;
        }
    }

    public static class Shard {
        public float x, y;
        public float vx, vy;
        public float size;
        public float life = 1f;
        public int color;
        public float rotation = 0f;
        public float rotSpeed;

        public Shard(float x, float y, float vx, float vy, float size, int color) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.size = size;
            this.color = color;
            this.rotSpeed = (new Random().nextFloat() - 0.5f) * 720f;
        }
    }

    public static class FloatingText {
        public float x, y;
        public String text;
        public int color;
        public float life = 1.1f;
        public float vy = -70f;

        public FloatingText(float x, float y, String text, int color) {
            this.x = x;
            this.y = y;
            this.text = text;
            this.color = color;
        }
    }

    // --- Stato Globale del Gioco ---
    public State state = State.ARCHETYPE_SELECT;
    public Archetype currentArchetype = null;
    public final GameProgression progression;

    public int currentLevel = 1;
    public int maxLevel = 10;
    public boolean isEndless = false;
    public int score = 0;
    public int highScore = 0;
    public int quantumShardsRun = 0; // Schegge quantiche accumulate nella run
    public int ballsRemaining = 8;
    public int totalCubesDestroyed = 0;
    public int currentCombo = 0;
    public float aimAngle = (float) Math.PI / 2f;
    public boolean speedBoost = false;

    // Statistiche tiro corrente
    public int currentShotScore = 0;
    public int currentShotCubesHit = 0;
    public int ballsCaughtInCurrentShot = 0;
    private int nextFreeBallThreshold = 6000;
    public int rerollsAvailable = 1;

    // Boss fight stato & fasi
    public Cube activeBoss = null;
    public int bossPhase = 1; // 1: Normale con satelliti, 2: Sovraccarico impulsi, 3: Enrage discesa
    public float bossPulseTimer = 0f;
    public float bossDescentY = 0f;
    public final List<BossSatellite> bossSatellites = new ArrayList<>();

    // Timer FEVER
    public float feverTimer = 0f;
    public float feverExplosionTimer = 0f;

    public final List<Ball> balls = new ArrayList<>();
    public final List<Cube> cubes = new ArrayList<>();
    public final Basket basket = new Basket();
    public final List<Shard> shards = new ArrayList<>();
    public final List<FloatingText> floatingTexts = new ArrayList<>();
    public final List<RelicType> activeRelics = new ArrayList<>();
    public final List<RelicType> draftChoices = new ArrayList<>();

    private boolean safetyNetAvailable = true;
    public float screenShake = 0f;
    public final Random random = new Random();

    // Event listener per riproduzione audio e haptic
    public interface GameEventListener {
        void onBounceHit(int combo);
        void onCubeShattered();
        void onBallCaught();
        void onExplosion();
        void onChainLightning();
        void onRelicChosen();
        void onFreeBall();
        void onFever();
        void onMercyRefund();
        void onBossPhaseChange(int newPhase);
        void onShardCollect();
        void onResonanceUnlocked(RelicFamily family, int tier);
        void onReroll();
    }
    public GameEventListener listener = null;

    public Game() {
        this(new GameProgression());
    }

    public Game(GameProgression progression) {
        this.progression = progression;
        initGame();
    }

    public void initGame() {
        currentLevel = 1;
        isEndless = false;
        score = 0;
        quantumShardsRun = 0;
        activeRelics.clear();
        totalCubesDestroyed = 0;
        rerollsAvailable = 1 + progression.upgradeRerolls;

        // Inizia dalla selezione dell'Archetipo Core della run!
        state = State.ARCHETYPE_SELECT;
    }

    public void selectArchetype(Archetype archetype) {
        currentArchetype = archetype;
        progression.runsPlayed++; // Incrementa subito il contatore run giocate!

        // Equipaggia subito la reliquia iniziale corrispondente
        switch (archetype) {
            case VOLT_OVERCHARGE:
                activeRelics.add(RelicType.CHAIN_LIGHTNING);
                break;
            case PYRO_DETONATOR:
                activeRelics.add(RelicType.BOUNCING_BOMB);
                break;
            case SWARM_MATRIX:
                activeRelics.add(RelicType.MULTIBALL_REACTOR);
                break;
            case KINETIC_TITAN:
                activeRelics.add(RelicType.KINETIC_SURGE);
                break;
            case CRYSTAL_SINGULARITY:
                activeRelics.add(RelicType.PIERCING_RAIL);
                break;
        }

        if (listener != null) listener.onRelicChosen();
        initLevel(1);
    }

    public String serializeRelics() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < activeRelics.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(activeRelics.get(i).name());
        }
        return sb.toString();
    }

    public boolean resumeSavedRun() {
        if (!progression.hasActiveRun) return false;
        try {
            currentLevel = progression.savedLevel;
            int restoredScore = progression.savedScore;
            int restoredBalls = progression.savedBalls;
            int restoredShards = progression.savedShardsRun;
            boolean restoredEndless = progression.savedIsEndless;

            if (progression.savedArchetype != null && !progression.savedArchetype.isEmpty()) {
                currentArchetype = Archetype.valueOf(progression.savedArchetype);
            } else {
                currentArchetype = Archetype.VOLT_OVERCHARGE;
            }

            activeRelics.clear();
            if (progression.savedRelics != null && !progression.savedRelics.isEmpty()) {
                String[] parts = progression.savedRelics.split(",");
                for (String p : parts) {
                    try {
                        activeRelics.add(RelicType.valueOf(p.trim()));
                    } catch (Exception ignored) {}
                }
            }

            isEndless = restoredEndless;
            initLevel(currentLevel);

            // Ripristina lo stato esatto salvato della run
            score = restoredScore;
            ballsRemaining = restoredBalls;
            quantumShardsRun = restoredShards;

            progression.saveActiveRunState(
                    currentLevel,
                    score,
                    ballsRemaining,
                    currentArchetype.name(),
                    serializeRelics(),
                    quantumShardsRun,
                    isEndless
            );

            state = State.AIMING;
            return true;
        } catch (Exception e) {
            initGame();
            return false;
        }
    }

    public void initLevel(int level) {
        currentLevel = level;
        if (currentLevel > progression.bestSector) {
            progression.bestSector = currentLevel;
        }
        if (score > progression.highestScore) {
            progression.highestScore = score;
        }

        // Salva lo stato della run attiva ad ogni livello raggiunto!
        if (currentArchetype != null) {
            progression.saveActiveRunState(
                    currentLevel,
                    score,
                    ballsRemaining,
                    currentArchetype.name(),
                    serializeRelics(),
                    quantumShardsRun,
                    isEndless
            );
        }

        cubes.clear();
        balls.clear();
        shards.clear();
        floatingTexts.clear();
        bossSatellites.clear();
        activeBoss = null;
        bossPhase = 1;
        bossDescentY = 0f;
        bossPulseTimer = 0f;
        currentCombo = 0;
        safetyNetAvailable = activeRelics.contains(RelicType.SAFETY_NET);

        // Calcolo sfere garantite con meta-upgrade
        int baseBalls = 8 + progression.upgradeExtraBalls;
        if (ballsRemaining < baseBalls) {
            ballsRemaining = baseBalls;
        }

        // Calcolo larghezza cestello con archetipo e reliquie
        float baseWidth = 220f + (progression.upgradeBasketWidth * 15f);
        if (currentArchetype == Archetype.KINETIC_TITAN) baseWidth += 30f;
        if (activeRelics.contains(RelicType.MAGNETIC_BASKET)) baseWidth += 50f;
        basket.width = baseWidth;

        generateLevelGrid(level);
        state = State.AIMING;
    }

    // Calcolo delle Risonanze di Set (Combo attive)
    public Map<RelicFamily, Integer> getActiveResonances() {
        Map<RelicFamily, Integer> counts = new HashMap<>();
        for (RelicFamily f : RelicFamily.values()) {
            counts.put(f, 0);
        }
        for (int i = 0; i < activeRelics.size(); i++) {
            RelicType r = activeRelics.get(i);
            counts.put(r.family, counts.get(r.family) + 1);
        }
        return counts;
    }

    public int getResonanceTier(RelicFamily family) {
        int count = getActiveResonances().get(family);
        if (count >= 3) return 2; // MAESTRIA
        if (count >= 2) return 1; // Sinergia Tier 1
        return 0;
    }

    public int getRemainingCoreCubes() {
        int count = 0;
        for (int i = 0; i < cubes.size(); i++) {
            Cube c = cubes.get(i);
            if (c.isAlive && c.isCore) {
                count++;
            }
        }
        return count;
    }

    public int getTotalCoreCubes() {
        int count = 0;
        for (int i = 0; i < cubes.size(); i++) {
            Cube c = cubes.get(i);
            if (c.isCore) {
                count++;
            }
        }
        return count;
    }

    private void generateLevelGrid(int level) {
        float startY = 320f;
        int rows = Math.min(3 + (level > 10 ? 6 : level), 7);
        int cols = 9;
        float cubeWidth = 84f;
        float cubeHeight = 56f;
        float paddingX = 26f;
        float paddingY = 24f;
        float totalGridW = cols * cubeWidth + (cols - 1) * paddingX;
        float startX = (VIRTUAL_WIDTH - totalGridW) / 2f;

        int baseHp = Math.max(1, (level <= 1) ? 1 : (1 + (level - 2)));
        if (level > 10) {
            // Endless scaling
            baseHp += (level - 10) * 2;
        }

        // Livelli Boss: Settore 5, 10, 15, 20...
        if (level % 5 == 0) {
            generateBossLevel(level, startX, startY, cols, cubeWidth, cubeHeight, paddingX, paddingY);
            return;
        }

        int coreBudget = Math.min(6 + level * 2, 14);
        int coresAssigned = 0;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                boolean placeCube = false;
                if (level == 1) {
                    placeCube = (r == 0 && (c >= 2 && c <= 6))
                            || (r == 1 && (c == 1 || c == 3 || c == 5 || c == 7))
                            || (r == 2 && (c >= 2 && c <= 6))
                            || (r == 3 && (c == 3 || c == 4 || c == 5));
                } else if (level % 2 == 0) {
                    placeCube = (r + c) % 2 == 0;
                } else {
                    placeCube = (c >= 1 && c <= 7) && !(r == 1 && c == 4);
                }

                if (!placeCube) continue;

                float cx = startX + c * (cubeWidth + paddingX);
                float cy = startY + r * (cubeHeight + paddingY);

                CubeType type = CubeType.NORMAL;
                float roll = random.nextFloat();
                int cubeHp = (level == 1) ? 1 : Math.max(1, baseHp + random.nextInt(2));

                if (roll < 0.15f) {
                    type = CubeType.EXPLOSIVE;
                    cubeHp = Math.max(1, cubeHp - 1);
                } else if (roll < 0.28f) {
                    type = CubeType.SPLITTER;
                    cubeHp = 1;
                } else if (roll < 0.40f) {
                    type = CubeType.KINETIC;
                    cubeHp = 1;
                } else if (roll < 0.50f && level >= 3) {
                    type = CubeType.ARMOR;
                    cubeHp = baseHp + 2;
                } else if (roll < 0.58f && level >= 4) {
                    type = CubeType.SHIELD;
                    cubeHp = baseHp + 1;
                }

                boolean isCore = false;
                if (coresAssigned < coreBudget && (type == CubeType.NORMAL || random.nextFloat() < 0.5f)) {
                    isCore = true;
                    coresAssigned++;
                }

                cubes.add(new Cube(cx, cy, cubeWidth, cubeHeight, cubeHp, type, isCore));
            }
        }

        if (coresAssigned < 6) {
            for (Cube c : cubes) {
                if (!c.isCore) {
                    c.isCore = true;
                    coresAssigned++;
                    if (coresAssigned >= 6) break;
                }
            }
        }
    }

    private void generateBossLevel(int level, float startX, float startY, int cols, float cubeWidth, float cubeHeight, float paddingX, float paddingY) {
        float bossW = 260f;
        float bossH = 180f;
        float bossX = (VIRTUAL_WIDTH - bossW) / 2f;
        float bossY = startY + 120f;
        int bossHp = (level == 5) ? 65 : (level == 10 ? 140 : 180 + (level - 10) * 20);

        activeBoss = new Cube(bossX, bossY, bossW, bossH, bossHp, CubeType.BOSS, true);
        cubes.add(activeBoss);

        int satelliteCount = (level == 5) ? 6 : 8;
        for (int i = 0; i < satelliteCount; i++) {
            float ang = (float) (2 * Math.PI / satelliteCount) * i;
            bossSatellites.add(new BossSatellite(ang));
        }

        // Cubi cinetici superiori per rimbalzi
        for (int c = 1; c < cols - 1; c += 2) {
            float cx = startX + c * (cubeWidth + paddingX);
            float cy = startY;
            cubes.add(new Cube(cx, cy, cubeWidth, cubeHeight, 1, CubeType.KINETIC, false));
        }

        if (listener != null) listener.onBossPhaseChange(1);
    }

    public void setAimAngle(float touchX, float touchY) {
        if (state != State.AIMING) return;
        float dx = touchX - CANNON_X;
        float dy = touchY - CANNON_Y;
        if (dy < 40f) dy = 40f;
        aimAngle = (float) Math.atan2(dy, dx);

        float minAngle = (float) Math.toRadians(15);
        float maxAngle = (float) Math.toRadians(165);
        if (aimAngle < minAngle) aimAngle = minAngle;
        if (aimAngle > maxAngle) aimAngle = maxAngle;
    }

    public boolean shoot() {
        if (state != State.AIMING || ballsRemaining <= 0) return false;

        ballsRemaining--;
        currentCombo = 0;
        currentShotScore = 0;
        currentShotCubesHit = 0;
        ballsCaughtInCurrentShot = 0;
        nextFreeBallThreshold = 6000;

        float speed = 1250f;
        if (activeRelics.contains(RelicType.HYPER_VELOCITY)) {
            speed *= 1.25f;
        }

        float vx = (float) Math.cos(aimAngle) * speed;
        float vy = (float) Math.sin(aimAngle) * speed;

        Ball b = new Ball(CANNON_X, CANNON_Y + 25f, vx, vy);
        if (activeRelics.contains(RelicType.HYPER_VELOCITY)) {
            b.baseDamage += 1f;
        }
        if (currentArchetype == Archetype.KINETIC_TITAN) {
            b.baseDamage += 1f;
        }
        balls.add(b);
        state = State.BALL_IN_PLAY;
        return true;
    }

    public void update(float dt) {
        if (dt > 0.05f) dt = 0.05f;
        if (speedBoost && state == State.BALL_IN_PLAY) {
            dt *= 2.0f;
        }

        if (screenShake > 0f) {
            screenShake -= dt * 25f;
            if (screenShake < 0f) screenShake = 0f;
        }

        basket.update(dt);

        // Aggiorna Boss AI se presente
        if (activeBoss != null && activeBoss.isAlive) {
            updateBoss(dt);
        }

        // Aggiorna particelle schegge
        for (int i = shards.size() - 1; i >= 0; i--) {
            Shard s = shards.get(i);
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.vy += GRAVITY * 0.35f * dt;
            s.rotation += s.rotSpeed * dt;
            s.life -= dt * 1.6f;
            if (s.life <= 0f) {
                shards.remove(i);
            }
        }

        // Aggiorna testi fluttuanti
        for (int i = floatingTexts.size() - 1; i >= 0; i--) {
            FloatingText ft = floatingTexts.get(i);
            ft.y += ft.vy * dt;
            ft.life -= dt * 1.3f;
            if (ft.life <= 0f) {
                floatingTexts.remove(i);
            }
        }

        // Aggiorna cubi in modo sicuro
        for (int i = 0; i < cubes.size(); i++) {
            Cube c = cubes.get(i);
            if (c.wobble > 0f) {
                c.wobble -= dt * 6f;
                if (c.wobble < 0f) c.wobble = 0f;
            }
            if (c.hitFlash > 0f) {
                c.hitFlash -= dt * 8f;
                if (c.hitFlash < 0f) c.hitFlash = 0f;
            }
            if (c.type == CubeType.SHIELD || c.isCore) {
                c.shieldPulse = (c.shieldPulse + dt * 3.5f) % ((float) Math.PI * 2f);
            }
        }

        if (state == State.FEVER) {
            updateFever(dt);
            return;
        }

        if (state == State.BALL_IN_PLAY) {
            updateBalls(dt);
        }
    }

    private void updateBoss(float dt) {
        // Rotazione satelliti
        float rotSpeed = (bossPhase == 1) ? 1.2f : (bossPhase == 2 ? 2.2f : 3.2f);
        for (int i = 0; i < bossSatellites.size(); i++) {
            BossSatellite sat = bossSatellites.get(i);
            sat.angle += rotSpeed * dt;
        }

        // Calcolo fase in base a HP rimanenti
        float hpRatio = (float) activeBoss.hp / activeBoss.maxHp;
        int newPhase = (hpRatio > 0.66f) ? 1 : ((hpRatio > 0.33f) ? 2 : 3);
        if (newPhase != bossPhase) {
            bossPhase = newPhase;
            screenShake = 16f;
            floatingTexts.add(new FloatingText(activeBoss.centerX(), activeBoss.centerY() - 70f, "FASE BOSS " + bossPhase + "!", 0xFFFF007F));
            if (listener != null) listener.onBossPhaseChange(bossPhase);
        }

        // Meccanica Attiva Fase 2 e 3: Impulsi repulsivi e discesa lenta
        bossPulseTimer += dt;
        if (bossPulseTimer >= ((bossPhase == 3) ? 4f : 7f)) {
            bossPulseTimer = 0f;
            triggerBossShockwave();
        }

        if (bossPhase == 3) {
            activeBoss.y += 12f * dt;
            if (activeBoss.y > 1100f) activeBoss.y = 1100f;
        }
    }

    private void triggerBossShockwave() {
        screenShake = 12f;
        floatingTexts.add(new FloatingText(activeBoss.centerX(), activeBoss.centerY(), "EMP REPULSION!", 0xFFFF007F));
        for (int i = 0; i < balls.size(); i++) {
            Ball b = balls.get(i);
            if (b.isAlive) {
                float dx = b.x - activeBoss.centerX();
                float dy = b.y - activeBoss.centerY();
                float dist = (float) Math.sqrt(dx * dx + dy * dy);
                if (dist > 1f) {
                    b.vx += (dx / dist) * 450f;
                    b.vy += (dy / dist) * 450f;
                }
            }
        }
        spawnSparks(activeBoss.centerX(), activeBoss.centerY(), 0xFFFF007F, 24);
        if (listener != null) listener.onExplosion();
    }

    private void updateFever(float dt) {
        feverTimer -= dt;
        feverExplosionTimer -= dt;

        if (feverExplosionTimer <= 0f) {
            feverExplosionTimer = 0.08f;
            for (int i = 0; i < cubes.size(); i++) {
                Cube c = cubes.get(i);
                if (c.isAlive) {
                    c.isAlive = false;
                    score += 500;
                    addQuantumShards(1);
                    spawnCubeShards(c);
                    spawnSparks(c.centerX(), c.centerY(), 0xFFFFE600, 14);
                    floatingTexts.add(new FloatingText(c.centerX(), c.centerY(), "FEVER +500", 0xFFFFE600));
                    screenShake = 6f;
                    if (listener != null) listener.onCubeShattered();
                    break;
                }
            }
        }

        if (feverTimer <= 0f) {
            int ballBonus = ballsRemaining * 2000;
            score += ballBonus;
            addQuantumShards(25); // +25 schegge per settore superato

            if (score > highScore) highScore = score;

            // Se abbiamo battuto il settore 10
            if (currentLevel == 10 && !isEndless) {
                progression.clearActiveRunState();
                state = State.VICTORY;
            } else {
                prepareRelicDraft();
            }
        }
    }

    private void updateBalls(float dt) {
        List<Ball> newBalls = new ArrayList<>();

        for (int i = balls.size() - 1; i >= 0; i--) {
            Ball b = balls.get(i);
            if (!b.isAlive) {
                balls.remove(i);
                continue;
            }

            b.trail.add(new float[]{b.x, b.y});
            if (b.trail.size() > 10) {
                b.trail.remove(0);
            }

            // Attrazione magnetica del Cestello
            if (b.y >= basket.y - 180f && b.y <= basket.y + 40f) {
                float basketCenterX = basket.centerX();
                float distToCenter = basketCenterX - b.x;
                if (Math.abs(distToCenter) < (basket.width * 0.75f)) {
                    float pullFactor = (activeRelics.contains(RelicType.MAGNETIC_BASKET) || currentArchetype == Archetype.KINETIC_TITAN) ? 8.5f : 3.5f;
                    b.vx += distToCenter * pullFactor * dt;
                }
            }

            b.vy += GRAVITY * dt;
            b.x += b.vx * dt;
            b.y += b.vy * dt;

            // Pareti laterali
            float leftWall = 25f;
            float rightWall = VIRTUAL_WIDTH - 25f;
            if (b.x - b.radius < leftWall) {
                b.x = leftWall + b.radius;
                b.vx = -b.vx * 0.95f;
            } else if (b.x + b.radius > rightWall) {
                b.x = rightWall - b.radius;
                b.vx = -b.vx * 0.95f;
            }

            // Soffitto
            float ceiling = 70f;
            if (b.y - b.radius < ceiling) {
                b.y = ceiling + b.radius;
                b.vy = Math.abs(b.vy) * 0.95f;
            }

            // Rete di Sicurezza
            if (safetyNetAvailable && b.y + b.radius >= 1840f) {
                b.y = 1840f - b.radius;
                b.vy = -Math.abs(b.vy) * 1.15f;
                safetyNetAvailable = false;
                screenShake = 12f;
                floatingTexts.add(new FloatingText(b.x, b.y - 40, "RETE DI SICUREZZA!", 0xFF00E5FF));
                if (listener != null) listener.onBounceHit(1);
            }

            // Cattura nel Cestello
            if (b.y + b.radius >= basket.y && b.y - b.radius <= basket.y + basket.height) {
                if (b.x >= basket.x - 15f && b.x <= basket.x + basket.width + 15f) {
                    b.isAlive = false;
                    balls.remove(i);
                    ballsRemaining++;
                    ballsCaughtInCurrentShot++;
                    int catchPoints = 350 * Math.max(1, currentCombo);
                    addScore(catchPoints);
                    floatingTexts.add(new FloatingText(b.x, basket.y - 50, "+1 SFERA! CATTURA!", 0xFF00FF88));
                    if (listener != null) listener.onBallCaught();

                    if (activeRelics.contains(RelicType.SUPERNOVA)) {
                        triggerSupernova(b.x);
                    }
                    continue;
                }
            }

            // Abilità Swarm Matrix: le mini-sfere rimbalzano 1 volta prima di cadere!
            if (b.isMini && currentArchetype == Archetype.SWARM_MATRIX && !b.hasSavedOnce && b.y + b.radius >= 1860f) {
                b.hasSavedOnce = true;
                b.vy = -Math.abs(b.vy) * 0.95f;
                floatingTexts.add(new FloatingText(b.x, b.y - 30, "SWARM RESCUE!", 0xFFA855F7));
                continue;
            }

            // Sfera caduta fuori dallo schermo
            if (b.y - b.radius > VIRTUAL_HEIGHT + 20f) {
                b.isAlive = false;
                balls.remove(i);
                if (activeRelics.contains(RelicType.SUPERNOVA)) {
                    triggerSupernova(b.x);
                }
                continue;
            }

            // Collisione con i satelliti del boss
            handleSatelliteCollisions(b);

            // Collisione con i cubi
            handleCubeCollisions(b, newBalls);
        }

        balls.addAll(newBalls);

        if (balls.isEmpty()) {
            checkRoundEnd();
        }
    }

    private void handleSatelliteCollisions(Ball b) {
        if (activeBoss == null || !activeBoss.isAlive) return;

        for (int i = 0; i < bossSatellites.size(); i++) {
            BossSatellite sat = bossSatellites.get(i);
            if (!sat.isAlive) continue;
            float sx = activeBoss.centerX() + (float) Math.cos(sat.angle) * sat.distance;
            float sy = activeBoss.centerY() + (float) Math.sin(sat.angle) * sat.distance;

            float dx = b.x - sx;
            float dy = b.y - sy;
            if (dx * dx + dy * dy <= (b.radius + sat.width / 2f) * (b.radius + sat.width / 2f)) {
                b.vx = -b.vx * 1.1f;
                b.vy = -b.vy * 1.1f;
                sat.hp--;
                floatingTexts.add(new FloatingText(sx, sy, "DEFLECT", 0xFFFF007F));
                if (listener != null) listener.onBounceHit(currentCombo);
                if (sat.hp <= 0) {
                    sat.isAlive = false;
                    spawnSparks(sx, sy, 0xFFFF007F, 16);
                    addQuantumShards(3);
                }
                break;
            }
        }
    }

    private void addScore(int points) {
        score += points;
        currentShotScore += points;

        if (currentShotScore >= nextFreeBallThreshold) {
            ballsRemaining++;
            floatingTexts.add(new FloatingText(CANNON_X, 220f, "★ SFERA EXTRA! ★", 0xFFFFE600));
            nextFreeBallThreshold += 12000;
            if (listener != null) listener.onFreeBall();
        }
    }

    public void addQuantumShards(int count) {
        quantumShardsRun += count;
        progression.quantumShards += count;
        if (listener != null) listener.onShardCollect();
    }

    private void handleCubeCollisions(Ball b, List<Ball> newBalls) {
        boolean hasPiercing = activeRelics.contains(RelicType.PIERCING_RAIL);
        int electricTier = getResonanceTier(RelicFamily.ELECTRIC);
        int explosiveTier = getResonanceTier(RelicFamily.EXPLOSIVE);
        int multiballTier = getResonanceTier(RelicFamily.MULTIBALL);

        for (int j = cubes.size() - 1; j >= 0; j--) {
            Cube c = cubes.get(j);
            if (!c.isAlive) continue;

            float closestX = Math.max(c.x, Math.min(b.x, c.x + c.width));
            float closestY = Math.max(c.y, Math.min(b.y, c.y + c.height));
            float distX = b.x - closestX;
            float distY = b.y - closestY;
            float distSq = distX * distX + distY * distY;

            if (distSq <= b.radius * b.radius) {
                b.bounces++;
                currentCombo++;
                currentShotCubesHit++;

                float overlapLeft = (b.x + b.radius) - c.x;
                float overlapRight = (c.x + c.width) - (b.x - b.radius);
                float overlapTop = (b.y + b.radius) - c.y;
                float overlapBottom = (c.y + c.height) - (b.y - b.radius);

                float minOverlap = Math.min(Math.min(overlapLeft, overlapRight), Math.min(overlapTop, overlapBottom));

                boolean pierceThrough = hasPiercing && c.hp <= 2 && c.type != CubeType.BOSS;

                if (!pierceThrough) {
                    if (minOverlap == overlapLeft) {
                        b.x = c.x - b.radius;
                        b.vx = -Math.abs(b.vx);
                    } else if (minOverlap == overlapRight) {
                        b.x = c.x + c.width + b.radius;
                        b.vx = Math.abs(b.vx);
                    } else if (minOverlap == overlapTop) {
                        b.y = c.y - b.radius;
                        b.vy = -Math.abs(b.vy);
                    } else {
                        b.y = c.y + c.height + b.radius;
                        b.vy = Math.abs(b.vy);
                    }
                    b.vx += (random.nextFloat() - 0.5f) * 35f;
                }

                float damage = b.baseDamage + (b.bounces / 3);

                if (activeRelics.contains(RelicType.KINETIC_SURGE)) {
                    damage += (b.bounces - 1);
                }

                if (c.type == CubeType.KINETIC) {
                    damage += 2f;
                    b.vx *= 1.35f;
                    b.vy *= 1.35f;
                    floatingTexts.add(new FloatingText(c.centerX(), c.centerY() - 30, "KINETIC BOOST!", 0xFFFFE600));
                }

                if (activeRelics.contains(RelicType.HEAVY_MASS) && (c.type == CubeType.ARMOR || c.type == CubeType.BOSS)) {
                    damage += 4f;
                }

                if (c.isFrozen) {
                    damage *= 2f;
                }

                boolean isCrit = false;
                if (activeRelics.contains(RelicType.CRITICAL_OVERDRIVE) && random.nextFloat() < 0.30f) {
                    damage *= 3f;
                    isCrit = true;
                    screenShake = Math.max(screenShake, 14f);
                    floatingTexts.add(new FloatingText(c.centerX(), c.centerY() - 40, "CRIT! x3", 0xFFFF007F));
                }

                boolean isShielded = isCubeProtectedByShield(c);
                if (isShielded) {
                    damage = Math.max(1f, damage * 0.5f);
                }

                int finalDamage = Math.max(1, Math.round(damage));
                c.hp -= finalDamage;
                c.wobble = 1f;
                c.hitFlash = 1f;

                int hitPoints = (c.isCore ? 120 : 60) * currentCombo;
                addScore(hitPoints);
                floatingTexts.add(new FloatingText(c.centerX(), c.centerY(), "-" + finalDamage, isCrit ? 0xFFFF007F : (c.isCore ? 0xFFFFE600 : 0xFF00E5FF)));

                if (listener != null) {
                    listener.onBounceHit(currentCombo);
                }

                // Sinergia Elettrica & Fulmini
                if (activeRelics.contains(RelicType.CHAIN_LIGHTNING) && (b.bounces % 2 == 0)) {
                    int extraZaps = (electricTier >= 2) ? 2 : ((electricTier >= 1) ? 1 : 0);
                    triggerChainLightning(c, extraZaps);
                }

                // Sinergia Esplosiva
                if (activeRelics.contains(RelicType.BOUNCING_BOMB) && b.bounces == 8) {
                    float blastRadius = 230f * (1.0f + (explosiveTier * 0.25f));
                    triggerExplosion(b.x, b.y, blastRadius, 10);
                    floatingTexts.add(new FloatingText(b.x, b.y - 50, "BOUNCING BOMB!", 0xFFFF6B00));
                }

                // Archetipo Cryo: congela bersagli
                if (currentArchetype == Archetype.CRYSTAL_SINGULARITY && !c.isFrozen) {
                    c.isFrozen = true;
                    floatingTexts.add(new FloatingText(c.centerX(), c.centerY() - 30, "FROZEN", 0xFF38BDF8));
                }

                if (c.hp <= 0) {
                    c.isAlive = false;
                    totalCubesDestroyed++;
                    progression.totalCubesDestroyed++;
                    addQuantumShards(c.isCore ? 5 : 1);

                    int killPoints = (c.isCore ? 500 : 250) * Math.min(currentCombo, 10);
                    addScore(killPoints);
                    spawnCubeShards(c);

                    if (listener != null) {
                        listener.onCubeShattered();
                    }

                    if (c.type == CubeType.EXPLOSIVE) {
                        float rExp = 250f * (currentArchetype == Archetype.PYRO_DETONATOR ? 1.4f : 1.0f);
                        triggerExplosion(c.centerX(), c.centerY(), rExp, 6);
                        screenShake = 16f;
                    }

                    if (c.type == CubeType.SPLITTER) {
                        spawnMiniBalls(c.centerX(), c.centerY(), newBalls, activeRelics.contains(RelicType.SPLIT_STORM) ? 3 : 2);
                    }

                    if (activeRelics.contains(RelicType.SHRAPNEL_BURST)) {
                        triggerShrapnel(c.centerX(), c.centerY());
                    }

                    if (activeRelics.contains(RelicType.MULTIBALL_REACTOR) && random.nextFloat() < (multiballTier >= 2 ? 0.50f : 0.30f)) {
                        spawnMiniBalls(c.centerX(), c.centerY(), newBalls, 2);
                        floatingTexts.add(new FloatingText(c.centerX(), c.centerY() - 40, "MULTIBALL!", 0xFFA855F7));
                    }

                    if (c.type == CubeType.BOSS) {
                        addQuantumShards(50);
                    }

                    if (getRemainingCoreCubes() == 0) {
                        triggerFeverMode();
                        return;
                    }
                }
                break;
            }
        }
    }

    private void triggerFeverMode() {
        state = State.FEVER;
        feverTimer = 1.6f;
        feverExplosionTimer = 0.05f;
        screenShake = 18f;
        floatingTexts.add(new FloatingText(CANNON_X, 350f, "★ CUBOCLAST FEVER! ★", 0xFFFFE600));
        if (listener != null) listener.onFever();
    }

    private boolean isCubeProtectedByShield(Cube target) {
        if (target.type == CubeType.SHIELD) return false;
        for (int i = 0; i < cubes.size(); i++) {
            Cube c = cubes.get(i);
            if (c.isAlive && c.type == CubeType.SHIELD && c != target) {
                float dx = c.centerX() - target.centerX();
                float dy = c.centerY() - target.centerY();
                if (dx * dx + dy * dy < 280f * 280f) {
                    return true;
                }
            }
        }
        return false;
    }

    private void triggerChainLightning(Cube origin, int extraTargets) {
        int zaps = 0;
        int maxZaps = 2 + extraTargets;
        int dmg = (currentArchetype == Archetype.VOLT_OVERCHARGE) ? 5 : 3;

        for (int i = 0; i < cubes.size(); i++) {
            Cube c = cubes.get(i);
            if (c.isAlive && c != origin) {
                float dx = c.centerX() - origin.centerX();
                float dy = c.centerY() - origin.centerY();
                if (dx * dx + dy * dy < 460f * 460f) {
                    c.hp -= dmg;
                    c.hitFlash = 1f;
                    c.wobble = 1f;
                    floatingTexts.add(new FloatingText(c.centerX(), c.centerY(), "ZAP -" + dmg, 0xFF00E5FF));
                    spawnSparks(c.centerX(), c.centerY(), 0xFF00E5FF, 6);
                    zaps++;
                    if (c.hp <= 0) {
                        c.isAlive = false;
                        spawnCubeShards(c);
                        if (getRemainingCoreCubes() == 0) {
                            triggerFeverMode();
                            return;
                        }
                    }
                    if (zaps >= maxZaps) break;
                }
            }
        }
        if (listener != null && zaps > 0) {
            listener.onChainLightning();
        }
    }

    private void triggerExplosion(float ex, float ey, float radius, int damage) {
        for (int i = 0; i < cubes.size(); i++) {
            Cube c = cubes.get(i);
            if (c.isAlive) {
                float dx = c.centerX() - ex;
                float dy = c.centerY() - ey;
                if (dx * dx + dy * dy <= radius * radius) {
                    c.hp -= damage;
                    c.hitFlash = 1f;
                    c.wobble = 1.2f;
                    floatingTexts.add(new FloatingText(c.centerX(), c.centerY(), "BOOM -" + damage, 0xFFFF6B00));
                    if (c.hp <= 0) {
                        c.isAlive = false;
                        spawnCubeShards(c);
                        if (getRemainingCoreCubes() == 0) {
                            triggerFeverMode();
                            return;
                        }
                    }
                }
            }
        }
        spawnSparks(ex, ey, 0xFFFF6B00, 18);
        if (listener != null) {
            listener.onExplosion();
        }
    }

    private void triggerShrapnel(float sx, float sy) {
        float[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (float[] d : dirs) {
            for (int i = 0; i < cubes.size(); i++) {
                Cube c = cubes.get(i);
                if (c.isAlive) {
                    float dx = c.centerX() - sx;
                    float dy = c.centerY() - sy;
                    float dot = dx * d[0] + dy * d[1];
                    if (dot > 0 && Math.abs(dx * d[1] - dy * d[0]) < 60f && dot < 350f) {
                        c.hp -= 2;
                        c.hitFlash = 0.8f;
                        floatingTexts.add(new FloatingText(c.centerX(), c.centerY(), "SHRAPNEL -2", 0xFFFF007F));
                        if (c.hp <= 0) {
                            c.isAlive = false;
                            spawnCubeShards(c);
                            if (getRemainingCoreCubes() == 0) {
                                triggerFeverMode();
                                return;
                            }
                        }
                        break;
                    }
                }
            }
        }
    }

    private void triggerSupernova(float x) {
        screenShake = 14f;
        for (int i = 0; i < cubes.size(); i++) {
            Cube c = cubes.get(i);
            if (c.isAlive && Math.abs(c.centerX() - x) < 100f) {
                c.hp -= 8;
                c.hitFlash = 1f;
                c.wobble = 1.2f;
                floatingTexts.add(new FloatingText(c.centerX(), c.centerY(), "SUPERNOVA -8", 0xFF00FF88));
                if (c.hp <= 0) {
                    c.isAlive = false;
                    spawnCubeShards(c);
                    if (getRemainingCoreCubes() == 0) {
                        triggerFeverMode();
                        return;
                    }
                }
            }
        }
        spawnSparks(x, 1750f, 0xFF00FF88, 20);
        if (listener != null) listener.onExplosion();
    }

    private void spawnMiniBalls(float x, float y, List<Ball> outList, int count) {
        float speed = 900f;
        for (int i = 0; i < count; i++) {
            float angle = (float) (-Math.PI / 2f + (i - (count - 1) / 2f) * 0.6f);
            Ball b = new Ball(x, y - 10f, (float) Math.cos(angle) * speed, (float) Math.sin(angle) * speed);
            b.radius = 12f;
            b.isMini = true;
            b.baseDamage = (getResonanceTier(RelicFamily.MULTIBALL) >= 2) ? 2f : 1f;
            outList.add(b);
        }
    }

    private void spawnCubeShards(Cube c) {
        int color;
        if (c.isCore) {
            color = 0xFFFFE600;
        } else {
            switch (c.type) {
                case EXPLOSIVE: color = 0xFFFF6B00; break;
                case SPLITTER:  color = 0xFFA855F7; break;
                case KINETIC:   color = 0xFFFFE600; break;
                case SHIELD:    color = 0xFF00FF88; break;
                case ARMOR:     color = 0xFF3B82F6; break;
                case BOSS:      color = 0xFFFF007F; break;
                default:        color = 0xFF00E5FF; break;
            }
        }

        int count = (c.type == CubeType.BOSS) ? 36 : 14;
        for (int i = 0; i < count; i++) {
            float angle = random.nextFloat() * (float) Math.PI * 2f;
            float speed = 150f + random.nextFloat() * 450f;
            shards.add(new Shard(c.centerX(), c.centerY(), (float) Math.cos(angle) * speed, (float) Math.sin(angle) * speed, 10f, color));
        }
    }

    private void spawnSparks(float x, float y, int color, int count) {
        for (int i = 0; i < count; i++) {
            float angle = random.nextFloat() * (float) Math.PI * 2f;
            float speed = 100f + random.nextFloat() * 300f;
            shards.add(new Shard(x, y, (float) Math.cos(angle) * speed, (float) Math.sin(angle) * speed, 6f, color));
        }
    }

    private void checkRoundEnd() {
        if (state == State.FEVER) return;

        if (getRemainingCoreCubes() == 0) {
            triggerFeverMode();
            return;
        }

        if (currentShotCubesHit <= 1 && ballsCaughtInCurrentShot == 0) {
            ballsRemaining++;
            floatingTexts.add(new FloatingText(CANNON_X, 260f, "MERCY REFUND! +1 SFERA", 0xFF00FF88));
            if (listener != null) listener.onMercyRefund();
        }

        if (ballsRemaining <= 0) {
            if (score > highScore) highScore = score;
            progression.runsPlayed++;
            if (currentLevel > progression.bestSector) progression.bestSector = currentLevel;
            if (score > progression.highestScore) progression.highestScore = score;
            progression.clearActiveRunState();
            state = State.GAME_OVER;
        } else {
            state = State.AIMING;
        }
    }

    public void prepareRelicDraft() {
        draftChoices.clear();
        List<RelicType> available = new ArrayList<>();
        for (RelicType r : RelicType.values()) {
            if (!activeRelics.contains(r)) {
                available.add(r);
            }
        }
        Collections.shuffle(available, random);
        for (int i = 0; i < Math.min(3, available.size()); i++) {
            draftChoices.add(available.get(i));
        }
        state = State.RELIC_DRAFT;
    }

    public boolean rerollDraft() {
        if (state != State.RELIC_DRAFT || rerollsAvailable <= 0) return false;
        rerollsAvailable--;
        prepareRelicDraft();
        if (listener != null) listener.onReroll();
        return true;
    }

    public void selectRelic(RelicType relic) {
        if (state != State.RELIC_DRAFT) return;
        activeRelics.add(relic);

        // Controlla se abbiamo sbloccato una risonanza
        int tier = getResonanceTier(relic.family);
        if (tier > 0 && listener != null) {
            listener.onResonanceUnlocked(relic.family, tier);
        } else if (listener != null) {
            listener.onRelicChosen();
        }

        initLevel(currentLevel + 1);
    }

    public void startEndlessLoop() {
        isEndless = true;
        progression.victories++;
        initLevel(11); // Settori Infiniti 11+
    }
}
